import { createContext, useContext, useState, useRef, useCallback } from "react";

export interface DetectionEntry {
    label: string;
    firstSeen: number;
    lastSeen: number;
}

interface DetectionContextValue {
    log: DetectionEntry[];
    updateDetections: (labels: string[]) => void;
    clearLog: () => void;
}

const DetectionContext = createContext<DetectionContextValue | null>(null);

export const DetectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [log, setLog] = useState<DetectionEntry[]>([]);
    const logRef = useRef<DetectionEntry[]>([]);

    const updateDetections = useCallback((labels: string[]) => {
        const now = Date.now();
        const current = logRef.current;
        const updated = [...current];

        for (const label of labels) {
            const existing = updated.find((e) => e.label === label);
            if (existing) {
                existing.lastSeen = now;
            } else {
                updated.push({ label, firstSeen: now, lastSeen: now });
            }
        }

        // remove stale entries not seen in the last 2 seconds
        const alive = updated.filter((e) => now - e.lastSeen < 2000);
        logRef.current = alive;
        setLog([...alive]);
    }, []);

    const clearLog = useCallback(() => {
        logRef.current = [];
        setLog([]);
    }, []);

    return (
        <DetectionContext.Provider value={{ log, updateDetections, clearLog }}>
            {children}
        </DetectionContext.Provider>
    );
};

export const useDetections = () => {
    const ctx = useContext(DetectionContext);
    if (!ctx) throw new Error("useDetections must be used inside DetectionProvider");
    return ctx;
};
