const RadarStorage = (() => {
  const keyFor = (name) => `${APP_CONFIG.storagePrefix}:${name}`;

  function read(name, fallback) {
    try {
      const raw = localStorage.getItem(keyFor(name));
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("localStorage read failed", error);
      return fallback;
    }
  }

  function write(name, value) {
    localStorage.setItem(keyFor(name), JSON.stringify(value));
  }

  function readPlatform(platformKey) {
    return read(`platform:${platformKey}`, { runs: [], latest: null });
  }

  function saveRun(platformKey, run) {
    const current = readPlatform(platformKey);
    const nextRuns = [run, ...current.runs].slice(0, 20);
    write(`platform:${platformKey}`, { runs: nextRuns, latest: run });
  }

  function clearPlatform(platformKey) {
    localStorage.removeItem(keyFor(`platform:${platformKey}`));
  }

  function getAllLatest() {
    return Object.keys(APP_CONFIG.platforms)
      .map((key) => readPlatform(key).latest)
      .filter(Boolean);
  }

  return {
    readPlatform,
    saveRun,
    clearPlatform,
    getAllLatest
  };
})();
