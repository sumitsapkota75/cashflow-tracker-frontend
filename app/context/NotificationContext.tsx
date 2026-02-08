"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  NotificationPayload,
  NotificationType,
  registerNotificationListener,
} from "@/app/lib/notificationBus";

type NotificationState = NotificationPayload & { id: number };

type NotificationContextValue = {
  notify: (payload: NotificationPayload) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const AUTO_CLOSE_MS = 4000;

const titleByType: Record<NotificationType, string> = {
  success: "Success",
  error: "Something went wrong",
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );

  useEffect(() => {
    return registerNotificationListener((payload) => {
      setNotification({
        ...payload,
        title: payload.title || titleByType[payload.type],
        id: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => {
      setNotification(null);
    }, AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [notification?.id]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify: (payload) =>
        setNotification({
          ...payload,
          title: payload.title || titleByType[payload.type],
          id: Date.now(),
        }),
    }),
    []
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className="fixed inset-x-0 top-3 z-[60] flex justify-center px-3">
          <div
            className={`w-full max-w-md overflow-hidden rounded-xl border shadow-lg backdrop-blur ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : "border-rose-200 bg-rose-50/95 text-rose-900"
            }`}
            role="status"
          >
            <div className="flex items-start gap-2.5 p-3">
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  notification.type === "success"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">
                  {notification.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                  {notification.description}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:bg-white"
                onClick={() => setNotification(null)}
                aria-label="Close notification"
              >
                Close
              </button>
            </div>
            <div
              className={`h-1 w-full ${
                notification.type === "success"
                  ? "bg-emerald-200"
                  : "bg-rose-200"
              }`}
            >
              <div
                className={`h-full animate-[shrink_4s_linear_forwards] ${
                  notification.type === "success"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
};
