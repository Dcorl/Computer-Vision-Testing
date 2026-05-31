import "./debuggingtabs.css"

interface DebuggingAreaProps {
    className?: string;
}

const DebuggingTabs = ({className}: DebuggingAreaProps) => {
    /* Keep this as a container component as it will have state changes to toggle
    * the dubugging tabs and also consider the states of the child contents in the tabs
    * as they will rely on the camera feed to report debugging
    */

    return (
        <div className={`${className}`}>
            <p>Log</p>
            <p>Segments</p>
            <p>FPS</p>
        </div>
    );
};

export default DebuggingTabs;