import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getHostIp = () => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const hostIp = getHostIp();
let SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';
SOCKET_URL = SOCKET_URL.replace('localhost', hostIp).replace('127.0.0.1', hostIp);

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to HealthyFood Socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from HealthyFood Socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinOrderRoom(orderId: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('joinOrder', orderId);
  }

  leaveOrderRoom(orderId: string) {
    this.socket?.emit('leaveOrder', orderId);
  }

  onOrderStatusUpdate(callback: (data: { orderId: string; status: string; timeline: any }) => void) {
    this.socket?.on('orderStatusUpdate', callback);
  }

  onDriverLocationUpdate(callback: (data: { lat: number; lng: number }) => void) {
    this.socket?.on('driverLocationUpdate', callback);
  }

  offOrderStatusUpdate() {
    this.socket?.off('orderStatusUpdate');
  }

  offDriverLocationUpdate() {
    this.socket?.off('driverLocationUpdate');
  }

  updateDriverLocation(orderId: string, lat: number, lng: number) {
    if (!this.socket) this.connect();
    this.socket?.emit('updateLocation', { orderId, lat, lng });
  }
}

export const socketService = new SocketService();
export default socketService;
