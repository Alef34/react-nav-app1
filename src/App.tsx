import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Akordy1 from "./pages/Akordy1";
import ProjectorView from "./pages/ProjectorView";
import { Modal } from "./pages/Settings";
import AdminImport from "./pages/AdminImport";
import AdminCRUD from "./pages/AdminCRUD";
import AdminExport from "./pages/AdminExport";

function App() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
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
        <Route path={"/admin-crud"} element={<AdminCRUD />} />
        <Route path={"/admin-export"} element={<AdminExport />} />
      </Routes>
      {background && (
        <Routes>
          <Route path="modal" element={<Modal />} />
          <Route path="akordy/modal" element={<Modal />} />
        </Routes>
      )}
    </>
  );
}

export default App;
