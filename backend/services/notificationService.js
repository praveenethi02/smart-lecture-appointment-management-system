import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipientId,
  title,
  message,
  type = 'system',
  relatedAppointmentId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type,
      relatedAppointmentId,
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]', error.message);
    return null;
  }
};
