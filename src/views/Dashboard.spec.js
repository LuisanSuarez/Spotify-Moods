import React from "react";
import MusicPlayer from "../components/MusicPlayer";
import { shallow } from "../enzyme";
import Dashboard from "./Dashboard";
import GetMusic from "./GetMusic";
import PlayMusic from "./PlayMusic";
import SpotifyAuth from "./SpotifyAuth";

test("sholud render Dashboard", () => {
  const wrapper = shallow(<Dashboard />);
  expect(
    wrapper.containsAllMatchingElements([
      <PlayMusic />,
      <GetMusic />,
      <SpotifyAuth />,
      <MusicPlayer />,
    ])
  ).toBe(true);
});
