import api from "./defaultApi";
import { Notification } from "../types/notifikacija";

// Dohvata sve neprocitane notifikacije
export async function apiFetchAllNotifications(): Promise<Notification[]> {
    try {
        const response = await api.get("/Notifications");
        console.log(response);
    
        const notifications = response.data;
        return notifications;
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return []; 
      }
}

// Postavlja da je notifikacija procitana
export async function apiSetNotificationsAsRead(notificationId: number): Promise<void> {
    try {
        const response = await api.post(`/Notifications/${notificationId}/mark-read`);
    } catch (error: any) {
        console.error("Error marking notification as read:", error);
    }
}

// Cita broj neprocitanih za ikonu zvona
export async function apiFetchUnreadCount(): Promise<number> {
    try {
      const response = await api.get("/Notifications/unread-count");
      return response.data; 
    } catch (error: any) {
      console.error("Error fetching unread notification count:", error);
      return 0; 
    }
  }
  