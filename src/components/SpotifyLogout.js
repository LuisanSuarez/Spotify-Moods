import { devUrl, prodUrl } from "../services/variables";

export default function SpotifyLogout() {
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  return (
    <div id="login">
      <a href={url + "auth/login"} className="btn btn-primary">
        Log out with Spotify
      </a>
    </div>
  );
}
