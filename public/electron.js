// electron.js
const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const log = require("electron-log/main");

global.pythonProcess = null;

const basePath = app.getAppPath();
let mainWindow;
let loaderWindow;
let userLogDir;

const isDevelopmentEnv = () => {
  return !app.isPackaged;
};

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Removed: avoid forcing GPU flags unless strictly needed.
// app.commandLine.appendSwitch("in-process-gpu");
if (app.getGPUFeatureStatus().gpu_compositing.includes("disabled")) {
  app.disableHardwareAcceleration();
}

app.whenReady().then(async () => {
  // Configure unified logging under per-user writable dir
  userLogDir = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(userLogDir, { recursive: true });
  log.transports.file.resolvePathFn = () => path.join(userLogDir, "app.log");
  log.transports.file.maxSize = 1024 * 1024; // 1MB rotation similar to Python
  log.initialize();
  autoUpdater.logger = log;
  log.info("[electron] app start, version:", app.getVersion());
  log.info("[electron] userData:", app.getPath("userData"));
  log.info("[electron] appPath:", app.getAppPath());

  createLoaderWindow();

  global.pythonProcess = createPythonProcess();
  await waitForPythonProcessReady(global.pythonProcess);
  try {
    const result = await runPythonScript(mainWindow, "run_clear_temp_dir.py", {});
    log.info("[electron] cleared temp directory:", result);
  } catch (error) {
    log.error("[electron] error clearing temp directory:", error);
  }

  loaderWindow.close();
  loaderWindow = null;

  if (!isDevelopmentEnv()) autoUpdater.checkForUpdatesAndNotify();
  createMainWindow();
});

const createLoaderWindow = () => {
  const iconPath = path.join(basePath, "build", "favicon.ico");

  loaderWindow = new BrowserWindow({
    height: 200,
    width: 300,
    center: true,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  const loaderPath = path.join(basePath, "build", "loader.html");
  loaderWindow.loadFile(loaderPath);
};

const waitForPythonProcessReady = (pythonProcess) => {
  return new Promise((resolve) => {
    const handleData = (data) => {
      const message = data.toString().trim();
      try {
        const event = JSON.parse(message);
        if (event.type === "event" && event.name === "ready") {
          pythonProcess.stdout.off("data", handleData);
          resolve();
        }
      } catch (error) {
        // ignore non-JSON lines here, Python may print other output
      }
    };
    pythonProcess.stdout.on("data", handleData);
  });
};

const createMainWindow = () => {
  const iconPath = path.join(basePath, "build", "favicon.ico");

  mainWindow = new BrowserWindow({
    minHeight: 720,
    minWidth: 1280,
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    thickFrame: true,
    icon: iconPath,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false,
      preload: path.join(basePath, "build", "preload.js"),
      webSecurity: true,
      // Disable Node integration in the renderer process for security and compatibility.
      // With nodeIntegration: true, libraries like use-sync-external-store may try to
      // resolve React via CommonJS require(), which breaks in a Vite/ESM build.
      // Setting this to false ensures React (and other frontend libs) run in a proper
      // browser-like environment and forces all backend access through preload.js.
      nodeIntegration: false,
    },
  });

  mainWindow.show();
  mainWindow.maximize();
  mainWindow.loadFile(path.join(basePath, "build", "index.html"));
  if (isDevelopmentEnv()) {
    mainWindow.webContents.openDevTools();
  }

  // Pipe renderer console messages into unified log
  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    const lvl = level === 2 ? "warn" : level === 3 ? "error" : "info";
    const text = `[renderer] ${message} (${sourceId}:${line})`;
    if (lvl === "warn") log.warn(text);
    else if (lvl === "error") log.error(text);
    else log.info(text);
  });
};

const runPythonScript = (mainWindow, scriptName, data) => {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const message = { scriptName, data };
    global.pythonProcess.stdin.write(JSON.stringify(message) + "\n");

    const handleData = (data) => {
      buffer += data.toString();
      let boundary = buffer.indexOf("\n");

      while (boundary !== -1) {
        const rawData = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 1);

        if (rawData.trim().startsWith("{") || rawData.trim().startsWith("[")) {
          try {
            const response = JSON.parse(rawData);
            if (response.type === "progress") {
              mainWindow.webContents.send("progress", response);
            } else {
              global.pythonProcess.stdout.off("data", handleData);
              if (response.success) {
                resolve(response.result);
              } else {
                reject(new Error(response.error));
              }
            }
          } catch (error) {
            log.error("[electron] error parsing Python stdout:", error);
            reject(error);
          }
        }

        boundary = buffer.indexOf("\n");
      }
    };

    global.pythonProcess.stdout.on("data", handleData);
  });
};

// Create a long-running Python process
const createPythonProcess = () => {
  const scriptPath = path.join(basePath, "backend", "app.py");
  const pythonExecutable = path.join(basePath, "climada_env", "python.exe");

  try {
    const py = spawn(pythonExecutable, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      env: { ...process.env, LOG_DIR: userLogDir },
    });

    py.on("error", (error) => {
      log.error("[electron] python spawn error:", error);
    });

    py.stderr.on("data", (data) => {
      log.error(`[python] ${data.toString().trim()}`);
    });

    py.stderr.on("data", (data) => {
      log.error(`[python] ${data.toString().trim()}`);
    });

    return py;
  } catch (error) {
    log.error("[electron] error during Python process creation:", error);
    throw error;
  }
};

ipcMain.handle("runPythonScript", async (_evt, { scriptName, data }) => {
  try {
    const result = await runPythonScript(mainWindow, scriptName, data);
    return { success: true, result };
  } catch (error) {
    log.error("[electron] runPythonScript error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("is-development-env", () => {
  return !app.isPackaged;
});

ipcMain.handle("fetch-temp-dir", () => {
  const tempFolderPath = path.join(app.getAppPath(), "data", "temp");
  return tempFolderPath;
});

ipcMain.handle("fetch-report-dir", () => {
  const reportFolderPath = path.join(app.getAppPath(), "data", "reports");
  return reportFolderPath;
});

// Handle clear temporary directory request
ipcMain.handle("clear-temp-dir", async () => {
  try {
    const scriptName = "run_clear_temp_dir.py";
    const data = {};
    const result = await runPythonScript(mainWindow, scriptName, data);
    log.info("[electron] temporary directory cleared:", result);
    return { success: true, result };
  } catch (error) {
    log.error("[electron] failed to clear temporary directory:", error);
    return { success: false, error: error.message };
  }
});

// Handle save screenshot request
ipcMain.handle("save-screenshot", async (event, { blob, filePath }) => {
  const buffer = Buffer.from(blob, "base64");

  const dir = path.dirname(filePath);
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
      event.sender.send("save-screenshot-reply", { success: false, error: err.message });
      return;
    }

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        event.sender.send("save-screenshot-reply", { success: false, error: err.message });
      } else {
        event.sender.send("save-screenshot-reply", { success: true, filePath });
      }
    });
  });
});

// Handle folder copy request
ipcMain.handle("copy-folder", async (event, { sourceFolder, destinationFolder }) => {
  try {
    fs.mkdirSync(destinationFolder, { recursive: true });
    const files = fs.readdirSync(sourceFolder);
    for (const file of files) {
      const sourcePath = path.join(sourceFolder, file);
      const destinationPath = path.join(destinationFolder, file);
      fs.copyFileSync(sourcePath, destinationPath);
    }
    event.sender.send("copy-folder-reply", { success: true, destinationFolder });
  } catch (error) {
    event.sender.send("copy-folder-reply", { success: false, error: error.message });
  }
});

// Handle copy file from temp folder request
ipcMain.handle("copy-file", async (event, { sourcePath, destinationPath }) => {
  try {
    const dir = path.dirname(destinationPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
    event.sender.send("copy-file-reply", { success: true, destinationPath });
  } catch (error) {
    event.sender.send("copy-file-reply", { success: false, error: error.message });
  }
});

ipcMain.handle("open-report", async (_event, reportPath) => {
  try {
    await shell.openPath(reportPath);
  } catch (error) {
    log.error("[electron] failed to open report:", error);
  }
});

ipcMain.on("minimize", () => {
  mainWindow.minimize();
});

ipcMain.on("shutdown", () => {
  log.info("[electron] shutting down application...");

  if (global.pythonProcess && !global.pythonProcess.killed) {
    global.pythonProcess.kill();
  }

  app.quit();
});

ipcMain.on("reload", async () => {
  log.info("[electron] reload CLIMADA App...");

  try {
    const result = await runPythonScript(mainWindow, "run_clear_temp_dir.py", {});
    log.info("[electron] temporary directory cleared:", result);
  } catch (error) {
    log.error("[electron] failed to clear temporary directory:", error);
  }

  mainWindow.webContents.reloadIgnoringCache();
});

// Auto-update diagnostics (useful in prod logs)
autoUpdater.on("update-not-available", () => {
  log.info("[electron] no update available");
});

autoUpdater.on("download-progress", (p) => {
  log.info(`[electron] downloading ${p.percent.toFixed(1)}% (${p.transferred}/${p.total})`);
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update available",
    message: "A new version is available and will be downloaded in the background.",
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Update ready",
      message: "Update downloaded. Restart now to apply?",
      buttons: ["Restart", "Later"],
      defaultId: 0,
      cancelId: 1,
    })
    .then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on("error", (err) => {
  log.error("[electron] AutoUpdater error:", err);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", () => {
  log.info("[electron] terminating Python process before app quits...");

  if (global.pythonProcess && !global.pythonProcess.killed) {
    global.pythonProcess.kill();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
