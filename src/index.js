import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const GlobalStyle = createGlobalStyle`
body {
  height: 100%;
  width: 100%;
  display: flex;
  overflow: hidden;
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
  position: fixed;
  flex-direction: column;
}
`;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="luisan-suarez.auth0.com"
        clientId="uMRixSiSINmL1VfdPMTUMFiMJ8QMlPOo"
        redirectUri={window.location.origin + "/dashboard/play"}
      >
        <GlobalStyle></GlobalStyle>
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
