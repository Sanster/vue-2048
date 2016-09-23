
// why prefer-default-export?
export const gameStorage = {
  fetch(STORAGE_KEY) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },
  save(STORAGE_KEY, data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
};
