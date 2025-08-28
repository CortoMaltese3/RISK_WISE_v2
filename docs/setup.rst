Setup and Running
=================

For Developers
--------------

1. **Clone the Repository**:

   .. code-block:: sh

      git clone 
      cd 
      git checkout main

2. **Set Up a Virtual Environment** (optional but recommended):
   Setting up a local environment is only required to test different parts of the application, for example using Jupyter notebooks to run custom climate scenarios. The application itself does not require a local environment to work, it comes bundled with the frozen climada_env conda environment which includes everything needed for the application to work.

   .. code-block:: sh

      # Using venv
      python -m venv venv
      source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

      # Or using Conda
      conda env create -f requirements/environment.yml
      conda activate riskwise

3. **Install Dependencies** (if not using conda) :

   .. code-block:: sh

      pip install -r requirements/requirements.txt

4. **Install dependencies for the frontend**
   Before running the app locally, make sure Node.js is installed. Download and install Node.js from the official Node.js website. After installing Node.js, navigate to the root directory of the app where the package.json file exists using your terminal or command prompt. Then, run the following command to install the dependencies:

   .. code-block:: sh

      npm install

5. **Start the React frontend locally**:
   The project uses Vite instead of Create React App.
   To start the frontend with hot module reloading:

   .. code-block:: sh

      npm run dev

6. **Start the RISK WISE v2 application locally**:

   .. code-block:: sh

      npm run start:electron

   To start Electron without rebuilding (when already built):

   .. code-block:: sh

      npm run quickstart

7. **Build a new executable**:
   To create a new executable for the application, run:

   .. code-block:: sh

      npm run build

   This runs the Vite build process and generates output in the ``build/`` directory, which is then packaged by Electron.

8. **Build a new Microsoft Windows Installer**:
   To create a new Microsoft Windows Installer for the application, run:

   .. code-block:: sh

      npm run dist

   This will create a new Microsoft Windows Installer at ``dist/[version]``
