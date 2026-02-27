import React, { createContext, useEffect, useState } from "react";

export const WSContext = createContext();

export function WSProvider({ children }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/session/123");
        ws.onopen = () => console.log("WebSocket connected");
        ws.onmessage = (msg) => setMessages(prev => [...prev, msg.data]);
        ws.onclose = () => console.log("WebSocket closed");
        return () => ws.close();
    }, []);

    return (
        <WSContext.Provider value={{ messages }}>
            {children}
        </WSContext.Provider>
    );
}
