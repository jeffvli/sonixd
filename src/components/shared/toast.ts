import { Notification } from 'rsuite';

export const notifyToast = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: string
) => {
  Notification[type]({
    title: type.toUpperCase(),
    description: message,
  });
};
