export async function checkInternetConnection(): Promise<boolean> {
    try {
      await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log("Internetové pripojenie je dostupné.");
      return true;
    } catch (error) {
      console.log("Internetové pripojenie nie je dostupné.");
      return false;
    }
  }