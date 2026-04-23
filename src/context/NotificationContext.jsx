import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'https://admission-hub-render.onrender.com';

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('access_token');
    const newSocket = io(API_URL.replace('/api', ''), {
      transports: ['websocket'],
      query: { token }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('authenticate', { token });
    });

    newSocket.on('authenticated', (data) => {
      if (data.status === 'success') {
        console.log('Socket authenticated');
      }
    });

    newSocket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const markAsRead = (id) => {
    fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    }).then(() => {
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    setNotifications,
    setUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};