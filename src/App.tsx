import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Akordy from "./pages/Akordy";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/about"} element={<About />} />
          <Route path={"/akordy"} element={<Akordy />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
