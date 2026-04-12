/**
 * useSignLanguagePrediction Hook
 * Custom React hook for WebSocket-based sign language prediction
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import wsClient from './wsClient';

export const useSignLanguagePrediction = (enabled = true) => {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [connected, setConnected] = useState(false);
    const wsClientRef = useRef(null);

    // Open the websocket connection and begin receiving predictions.
    const startPrediction = useCallback(() => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        wsClientRef.current = wsClient;

        wsClientRef.current.connect('/ws/predict', {
            onOpen: () => {
                setConnected(true);
                setLoading(false);
            },
            onMessage: (data) => {
                setPredictions(data);
            },
            onError: (error) => {
                setError(error.message || 'WebSocket error occurred');
                setConnected(false);
            },
            onClose: () => {
                setConnected(false);
            },
            onMaxReconnectFailed: () => {
                setError('Failed to reconnect to backend');
            },
        }).catch(err => {
            setError(`Connection failed: ${err.message}`);
            setLoading(false);
        });
    }, [enabled]);

    // Send a single captured frame to the backend stream.
    const sendFrame = useCallback((base64Frame) => {
        if (wsClientRef.current?.isConnected()) {
            wsClientRef.current.sendFrame(base64Frame);
        } else {
            setError('WebSocket not connected');
        }
    }, []);

    // Shut down the websocket when live prediction stops.
    const stopPrediction = useCallback(() => {
        if (wsClientRef.current) {
            wsClientRef.current.close();
            setConnected(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            stopPrediction();
        };
    }, [stopPrediction]);

    return {
        predictions,
        loading,
        error,
        connected,
        startPrediction,
        sendFrame,
        stopPrediction,
    };
};

export default useSignLanguagePrediction;