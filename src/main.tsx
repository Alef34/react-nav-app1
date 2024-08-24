import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsContextProvider } from "./context/SettingsContext.tsx";

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <SettingsContextProvider>
        <App />
      </SettingsContextProvider>
    </Router>
  </QueryClientProvider>
);

//ReactDOM.createRoot(document.getElementById("root")!).render(
//  <React.StrictMode>
//    <App />
//  </React.StrictMode>
//);
