"use client";

import { useNotificationStore, Notification } from "@/store/notificationStore";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle size={16} className="notification-icon success" />,
  error: <XCircle size={16} className="notification-icon error" />,
  warning: <AlertTriangle size={16} className="notification-icon warning" />,
  info: <Info size={16} className="notification-icon info" />,
};

function NotificationItem({ notif }: { notif: Notification }) {
  const remove = useNotificationStore((s) => s.remove);
  return (
    <div className={`notification notification-${notif.type}`}>
      {icons[notif.type]}
      <div className="notification-content">
        <div className="notification-title">{notif.title}</div>
        {notif.message && <div className="notification-message">{notif.message}</div>}
      </div>
      <button className="notification-close" onClick={() => remove(notif.id)}>
        <X size={14} />
      </button>
    </div>
  );
}

export function NotificationContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notif={n} />
      ))}
    </div>
  );
}
