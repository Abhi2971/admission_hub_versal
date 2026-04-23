import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'https://admission-hub-render.onrender.com';

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = React.useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('access_token');
    const socketUrl = API_URL.replace('/api', '');
    
    try {
      const newSocket = io(socketUrl, {
        transports: ['polling', 'websocket'],
        timeout: 5000,
        reconnection: false,
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
        newSocket.emit('authenticate', { token });
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection failed - continuing without real-time notifications');
        setSocketConnected(false);
      });

      newSocket.on('authenticated', (data) => {
        if (data.status === 'success') {
          console.log('Socket authenticated');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      console.log('Socket initialization failed - continuing without real-time notifications');
    }

    return () => {
      if (socketRef.current) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const value = {
    socket,
    socketConnected,
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