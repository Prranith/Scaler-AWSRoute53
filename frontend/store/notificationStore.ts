import { create } from "zustand";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationStore {
  notifications: Notification[];
  add: (notif: Omit<Notification, "id">) => void;
  remove: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

let _id = 0;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  add: (notif) => {
    const id = `notif-${++_id}`;
    set((s) => ({ notifications: [...s.notifications, { ...notif, id }] }));
    setTimeout(() => get().remove(id), 5000);
  },
  remove: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  success: (title, message) => {
    get().add({ type: "success", title, message });
    console.log("[NotificationStore] success toast triggered:", { title, message });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("console-notification", {
        detail: { type: "success", title, message }
      }));
    }
  },
  error: (title, message) => {
    get().add({ type: "error", title, message });
    console.log("[NotificationStore] error toast triggered:", { title, message });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("console-notification", {
        detail: { type: "error", title, message }
      }));
    }
  },
  warning: (title, message) => {
    get().add({ type: "warning", title, message });
    console.log("[NotificationStore] warning toast triggered:", { title, message });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("console-notification", {
        detail: { type: "warning", title, message }
      }));
    }
  },
  info: (title, message) => {
    get().add({ type: "info", title, message });
    console.log("[NotificationStore] info toast triggered:", { title, message });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("console-notification", {
        detail: { type: "info", title, message }
      }));
    }
  },
}));
