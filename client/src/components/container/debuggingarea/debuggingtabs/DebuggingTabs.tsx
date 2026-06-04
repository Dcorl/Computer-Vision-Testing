import { useState, useEffect } from "react";
import "./debuggingtabs.css";
import { useDetections } from "../../detectioncontext/DetectionContext.tsx";

type TabName = 'log' | 'segments' | 'fps';

const DebuggingTabs = () => {
    const [activeTab, setActiveTab] = useState<TabName>('log');
    const { log } = useDetections();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="panel-tabs">
                {(['log', 'segments', 'fps'] as TabName[]).map((tab) => (
                    <button
                        key={tab}
                        className={`tab${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="panel-content">
                <div className={`tab-pane log-pane${activeTab === 'log' ? ' active' : ''}`}>
                    {log.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">◎</div>
                            <div>Awaiting events...</div>
                        </div>
                    ) : (
                        <div className="detection-log">
                            {log.map((entry) => (
                                <div key={entry.label} className="detection-log-row">
                                    <span className="detection-label">{entry.label}</span>
                                    <span className="detection-duration">
                                        {((now - entry.firstSeen) / 1000).toFixed(1)}s
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={`tab-pane segments-pane${activeTab === 'segments' ? ' active' : ''}`}>
                    <div className="empty-state">
                        <div className="empty-icon">⬡</div>
                        <div>No segments detected</div>
                    </div>
                </div>
                <div className={`tab-pane fps-pane${activeTab === 'fps' ? ' active' : ''}`}>
                    <div className="fps-grid">
                        <div className="metric-card">
                            <div className="metric-label">Current FPS</div>
                            <div className="metric-value green">--<span> fps</span></div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Avg FPS</div>
                            <div className="metric-value accent">--<span> fps</span></div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Min FPS</div>
                            <div className="metric-value">--<span> fps</span></div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Frames</div>
                            <div className="metric-value">0</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DebuggingTabs;
