import "./App.css"
import Layout from "./components/ui/layout/Layout.tsx";
import CameraFeed from "./components/container/camerafeed/CameraFeed.tsx";
import DebuggingArea from "./components/container/debuggingarea/DebuggingArea.tsx";

const App = () => {
  return (
      <Layout>
          <CameraFeed/>
          <DebuggingArea/>
      </Layout>
  );
};

export default App;
