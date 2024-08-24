import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Akordy1 from "./pages/Akordy1";
import { Modal } from "./pages/Settings";

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
