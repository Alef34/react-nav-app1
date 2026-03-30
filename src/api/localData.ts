

  export const localData = {
    set(key: string, value: any) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    get(key: string) {
      const stored = localStorage.getItem(key);
      if (stored == null) {
        return undefined;
      }

      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(key);
        return undefined;
      }
    },
    remove(key: string) {
      localStorage.removeItem(key);
    },
  };
  