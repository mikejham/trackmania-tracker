import { create } from "zustand";
import type { Notification } from "../types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  setLoading: (loading: boolean) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, _get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Actions
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead
        ? state.unreadCount
        : state.unreadCount + 1,
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const unreadDecrement = notification && !notification.isRead ? 1 : 0;

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - unreadDecrement),
      };
    });
  },

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

// Selectors
export const useNotifications = () =>
  useNotificationStore((state) => ({
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
  }));

export const useNotificationActions = () =>
  useNotificationStore((state) => ({
    addNotification: state.addNotification,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    removeNotification: state.removeNotification,
    setNotifications: state.setNotifications,
    setLoading: state.setLoading,
  }));
