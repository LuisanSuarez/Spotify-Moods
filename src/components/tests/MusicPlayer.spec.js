import React from "react";
import SpotifyWebPlayer from "react-spotify-web-playback/lib";
import { shallow } from "../enzyme";
import MusicPlayer from "../MusicPlayer";
import Track from "../Track";

test("sholud render Dashboard", () => {
  const wrapper = shallow(<MusicPlayer />);
  expect(
    wrapper.containsAllMatchingElements([
      <Track />,
      <SpotifyWebPlayer />
    ])
  ).toBe(true);
});