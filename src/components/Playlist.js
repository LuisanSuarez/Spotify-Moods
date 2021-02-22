export default function Playlist({ playlist }) {
  return (
    <div>
      <h4>{playlist.name}</h4>
      <img src={playlist.images[playlist.images.length - 1]} />
      <input type="checkbox" checked={playlist.selected}></input>
    </div>
  );
}
