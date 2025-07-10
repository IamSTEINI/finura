"use client";
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
    useRef,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

type Notification = {
    id: string;
    title?: string;
    message: string;
};

interface NotificationContextType {
    addNotification: (message: string, title?: string) => void;
    dismissNotification: (id: string) => void;
    activeNotifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotification must be used within NotificationProvider"
        );
    }
    return context;
};

interface Props {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: Props) => {
    const [queue, setQueue] = useState<Notification[]>([]);
    const [active, setActive] = useState<Notification[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const addNotification = useCallback((message: string, title?: string) => {
        const newNotification: Notification = {
            id: crypto.randomUUID(),
            message,
            title,
        };

        setQueue((prev) => [...prev, newNotification]);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        if (timeoutsRef.current.has(id)) {
            clearTimeout(timeoutsRef.current.get(id));
            timeoutsRef.current.delete(id);
        }
        setActive((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const setupNotificationTimeout = useCallback((notification: Notification) => {
        if (timeoutsRef.current.has(notification.id)) {
            clearTimeout(timeoutsRef.current.get(notification.id));
        }

        const timeout = setTimeout(() => {
            dismissNotification(notification.id);
        }, 5000);

        timeoutsRef.current.set(notification.id, timeout);
    }, [dismissNotification]);

    useEffect(() => {
        if (active.length < 5 && queue.length > 0) {
            const next = queue[0];
            setQueue((prev) => prev.slice(1));
            setActive((prev) => [...prev, next]);

            setupNotificationTimeout(next);
        }
    }, [queue, active, dismissNotification, setupNotificationTimeout]);

    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
        };
    }, []);

    useEffect(() => {
        active.forEach((notification) => {
            const isHovered = hoveredId === notification.id;
            
            if (isHovered && timeoutsRef.current.has(notification.id)) {
                clearTimeout(timeoutsRef.current.get(notification.id));
                timeoutsRef.current.delete(notification.id);
            } else if (!isHovered && !timeoutsRef.current.has(notification.id)) {
                setupNotificationTimeout(notification);
            }
        });
    }, [hoveredId, active, setupNotificationTimeout]);

    return (
        <NotificationContext.Provider
            value={{
                addNotification,
                dismissNotification,
                activeNotifications: active,
            }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-[999999]">
                <AnimatePresence>
                    {active.map((n) => (
                        <motion.div
                            key={n.id}
                            onClick={() => dismissNotification(n.id)}
                            onMouseEnter={() => setHoveredId(n.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="card cursor-pointer min-w-[300px] overflow-hidden"
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            layout>
                            {n.title && (
                                <div className="font-semibold">{n.title}</div>
                            )}
                            <div>{n.message}</div>
                            <div className="relative w-full h-fit pt-1 flex justify-center items-center">
                                <motion.div
                                    className="absolute left-0 mt-3 h-1 bg-purple-500 rounded-full"
                                    initial={{ width: "100%" }}
                                    animate={{ width: hoveredId === n.id ? "100%" : "0%" }}
                                    transition={{ 
                                        duration: hoveredId === n.id ? 0 : 5, 
                                        ease: "linear"
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
