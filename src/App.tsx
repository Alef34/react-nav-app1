import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Page1 from "./pages/Page1";
import Page2 from "./pages/Page2";

function App() {
  const queryClient = new QueryClient();
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path={"/"} element={<Home />} />
            <Route path={"/about"} element={<About />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
