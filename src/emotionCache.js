import createCache from "@emotion/cache";

export default function createEmotionCache() {
  // Put Emotion styles at the start of <head> to keep order stable with Vite chunking
  return createCache({ key: "mui", prepend: true });
}
