import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";
import { devUrl, prodUrl } from "../services/variables";

function Login() {
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;
  const { user, isAuthenticated, isLoading } = useAuth0();

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
      <LoginButton />
      <h1>LOGIN SCREEN</h1>
    </div>
  );
}

export default Login;
