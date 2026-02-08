"use client";

export type NotificationType = "success" | "error";

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  description: string;
};

let listener: ((payload: NotificationPayload) => void) | null = null;

export const registerNotificationListener = (
  next: (payload: NotificationPayload) => void
) => {
  listener = next;
  return () => {
    if (listener === next) listener = null;
  };
};

export const notify = (payload: NotificationPayload) => {
  if (listener) listener(payload);
};
