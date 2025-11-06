import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Add typing to allow attaching Pusher to the Window object
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

// Add typing for import.meta.env so TypeScript recognizes environment variables
interface ImportMetaEnv {
  VITE_PUSHER_APP_KEY: string;
  VITE_PUSHER_APP_CLUSTER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const echo = new Echo({
  broadcaster: 'pusher',
  key: (import.meta as unknown as ImportMeta).env.VITE_PUSHER_APP_KEY,
  cluster: (import.meta as unknown as ImportMeta).env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  encrypted: true,
  authorizer: (channel: any, options: any) => {
    return {
      authorize: (socketId: string, callback: any) => {
        axios.post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then(response => {
          callback(false, response.data);
        })
        .catch(error => {
          callback(true, error);
        });
      },
    };
  },
});

export default echo;
