import axios from "axios";
import React from "react";

// class Login extends React.Component () {
//   constructor(){
//     super(){

//     }
//   }
function Login() {
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";
  console.log({ url });
  function doLogin() {
    console.log(0);
    axios
      .get(url + "auth/login")
      .then(res => {
        console.log({ res });
      })
      .catch(err => {
        console.log({ err });
      });
    console.log(1);
  }

  return (
    <div className="container">
      <div>
        <h2> `if (logged in)` </h2>
        <h3> Hey, you're logged in as username </h3>
        <h4> Go to my music</h4>
        <h4> Not username? Log out</h4>
        <h2> ` else ` </h2>
      </div>
      <div id="login">
        <a href={url + "auth/login"} className="btn btn-primary">
          Log in with Spotify
        </a>
      </div>
      <div id="loggedin">
        <div id="user-profile"></div>
        <div id="oauth"></div>
        <button className="btn btn-default" id="obtain-new-token">
          Obtain new token using the refresh token
        </button>
      </div>

      <h1>LOGIN SCREEN</h1>
    </div>
  );
}

export default Login;
