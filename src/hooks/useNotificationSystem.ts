import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function useNotificationSystem() {
  const settings = useSelector((state: RootState) => state.settings.notifications);

  const showNotification = (title: string, message: string, type: string) => {
    // Se as notificações estiverem desativadas, não faz nada
    if (!settings.enabled) {
      return;
    }

    // Notificação na área de trabalho
    if (settings.desktop) {
      // Verifica se o navegador suporta notificações
      if ('Notification' in window) {
        // Verifica a permissão atual
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/notification-icon.png' // Adicione um ícone apropriado
          });
        } else if (Notification.permission !== 'denied') {
          // Solicita permissão
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(title, {
                body: message,
                icon: '/notification-icon.png'
              });
            }
          });
        }
      }
    }

    // Som de notificação
    if (settings.sound) {
      const audio = new Audio('/notification-sound.mp3'); // Adicione um som apropriado
      audio.play().catch(error => {
        console.log('Erro ao tocar som de notificação:', error);
      });
    }
  };

  return { showNotification };
}
