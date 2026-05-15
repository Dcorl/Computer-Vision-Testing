import Layout from "./components/layout/Layout.tsx";
import CameraFeed from "./components/camerafeed/CameraFeed.tsx";
import DebuggingArea from "./components/debuggingarea/DebuggingArea.tsx";
import "./App.css"

const App = () => {
  return (
      <Layout>
          <CameraFeed/>
          <DebuggingArea/>
      </Layout>
  );
};

export default App;
