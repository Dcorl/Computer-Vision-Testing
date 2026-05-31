import "./debuggingarea.css"
import DebuggingTabs from "./debuggingtabs/DebuggingTabs.tsx";

const DebuggingArea = () => {
    return (
        <div className="debugging-area-container">
            <DebuggingTabs className="debugging-area-tabs-container" />
        </div>
    );
};

export default DebuggingArea;