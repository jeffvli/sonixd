import { Notification } from 'rsuite';

export const notifyToast = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: any
) => {
  Notification[type]({
    title: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
    description: message,
  });
};
