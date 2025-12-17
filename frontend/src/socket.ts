// src/socket.ts
import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token') || '', // or however you store JWT
  },
  withCredentials: true,
});
