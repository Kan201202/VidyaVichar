import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const IO_URL = import.meta.env.VITE_IO_URL || "http://localhost:5000";

export default function useSocket(authToken) {
  const sockRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Close existing connection if token changes
    if (sockRef.current) {
      sockRef.current.close();
    }

    if (!authToken) {
      setConnected(false);
      return;
    }

    const s = io(IO_URL, {
      autoConnect: true,
      transports: ["websocket"],
      auth: { token: authToken }, // Add token to handshake
      withCredentials: true,
    });
    
    sockRef.current = s;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    
    return () => { 
      s.off("connect", onConnect); 
      s.off("disconnect", onDisconnect); 
      s.close(); 
    };
  }, [authToken]); // Reconnect when authToken changes

  const on = useCallback((event, handler) => {
    sockRef.current?.on(event, handler);
    return () => sockRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event, ...args) => {
    sockRef.current?.emit(event, ...args);
  }, []);

  const joinCourse = useCallback((courseId) => { emit("join-course", courseId); }, [emit]);
  const joinSession = useCallback((sessionId) => { emit("join-session", sessionId); }, [emit]);

  return { socket: sockRef.current, connected, on, emit, joinCourse, joinSession };
}