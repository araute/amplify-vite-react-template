import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from "@aws-amplify/ui-react";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { BrowserRouter } from "react-router-dom";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Authenticator>
  </React.StrictMode>,
);
