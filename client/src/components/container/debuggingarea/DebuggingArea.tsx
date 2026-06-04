import "./debuggingarea.css"
import DebuggingTabs from "./debuggingtabs/DebuggingTabs.tsx";

const DebuggingArea = () => {
    return (
        <aside className="right-panel">
            <DebuggingTabs />
        </aside>
    );
};

export default DebuggingArea;
