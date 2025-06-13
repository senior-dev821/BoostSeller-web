'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckIcon, Trash2Icon } from 'lucide-react';
import clsx from 'clsx';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;

}

export default function NotificationFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
   const socketRef = useRef<Socket | null>(null);
   const router = useRouter();
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        const data: Notification[] = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    }
    fetchNotifications();
  }, []);

  useEffect(() => {
      if (!socketRef.current) {
        socketRef.current = io(); // connect to current origin
      }
  
      const socket = socketRef.current;
  
      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });
  
  
      socket.on("user_register", (data) => {
        console.log("Received new notification:", data);
        
        setNotifications((prev) => [data, ...prev]);
     
      });
  
      return () => {
        socket.disconnect();
      };
    }, []);
  function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const timestamp = typeof date === 'string' ? new Date(date) : date;
    const diff = (now.getTime() - timestamp.getTime()) / 1000; // in seconds

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;

    return `${Math.floor(diff / 31536000)}y ago`;
  }


 
  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications/read', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      });

      if (res.ok) {
        setNotifications(n =>
          n.map(noti => (noti.id === id ? { ...noti, isRead: true } : noti))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications/delete', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      });
      if (res.ok) {
        setNotifications(n => n.filter(noti => noti.id !== id));
      }

    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleClick = (title: string, id: string) => {
    markAsRead(id);
    if (title.includes('Hostess')) {
      router.push('/hostess');
    } else if (title.includes('Performer')) {
      router.push('/performer');
    }
  }

  return (
    <div className="space-y-4 p-6 max-w-3xl mx-auto">
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications found.</p>
      ) : (
        notifications.map(noti => (
          <div
            key={noti.id}
            onClick={() => {handleClick(noti.title, noti.id)}}
            className={clsx(
              'w-[90%] mx-auto flex justify-between gap-4 rounded-xl border p-4 shadow-sm transition hover:shadow-md',
              noti.isRead
                ? 'bg-white dark:bg-gray-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500'
            )}
          >
            {/* Icon + content */}
            <div className="flex gap-3 items-start flex-1">
              <div className="text-blue-500 dark:text-blue-400 mt-1">
                👤
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{noti.title}</h4>
                <p className="text-gray-700 dark:text-gray-300">{noti.message}</p>
              </div>
            </div>

            {/* Actions + date */}
            <div className="flex flex-col items-end justify-between min-w-[90px] text-sm">
              <div className="flex gap-2">
                {!noti.isRead && (
                  <button
                    onClick={() => markAsRead(noti.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Mark as read"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(noti.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {formatTimeAgo(noti.createdAt)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
