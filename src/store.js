const gameStorage = {
  fetch(STORAGE_KEY) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },
  save(STORAGE_KEY, data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
};

// why prefer-default-export?
export { gameStorage as default };
