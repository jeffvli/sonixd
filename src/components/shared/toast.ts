import { Notification } from 'rsuite';

export const notifyToast = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: any,
  description?: any
) => {
  Notification[type]({
    title: message,
    description,
    duration: type === 'info' ? 2000 : type === 'success' ? 2500 : 3000,
  });
};
