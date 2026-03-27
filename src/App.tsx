import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";

import Akordy1 from "./pages/Akordy1";
import ProjectorView from "./pages/ProjectorView.tsx";
import { Modal } from "./pages/Settings";
import AdminImport from "./pages/AdminImport";

function App() {
  //const queryClient = new QueryClient();
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    //<QueryClientProvider client={queryClient}>
    // <Router>
    <>
      <Routes>
        <Route path={"/"} element={<Home />}>
          <Route path="modal" element={<Modal />} />
        </Route>
        <Route path={"/akordy"} element={<Akordy1 />}>
          <Route path="modal" element={<Modal />} />
        </Route>
        <Route path={"/projector"} element={<ProjectorView />} />
        <Route path={"/admin-import"} element={<AdminImport />} />
       
      </Routes>
      {background && (
        <Routes>
          <Route path="modal" element={<Modal />} />
          <Route path="akordy/modal" element={<Modal />} />
        </Routes>
      )}
    </>
    // </Router>
    //</QueryClientProvider>
  );
}

export default App;
