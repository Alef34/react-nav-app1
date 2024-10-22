

  export const localData = {
    set(key: string, value: any) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    get(key: string) {
      const stored = localStorage.getItem(key);
      return stored == null ? undefined : JSON.parse(stored);
    },
    remove(key: string) {
      localStorage.removeItem(key);
    },
  };
  