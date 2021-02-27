import { devUrl, prodUrl } from "../services/variables";

export default function SpotifyLogin() {
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  return (
    <div>
      <div id="login">
        <a href={url + "auth/login"} className="btn btn-primary">
          Log in with Spotify
        </a>
      </div>
    </div>
  );
}
