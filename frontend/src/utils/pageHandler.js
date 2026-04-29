export async function lockEsc () {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
          if ('keyboard' in navigator && 'lock' in navigator.keyboard) {
            await navigator.keyboard.lock(['Escape']);
          }
        } catch (err) {
          console.warn(err);
        }
      };