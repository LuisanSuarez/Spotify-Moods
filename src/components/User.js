import React from "react";

export default function User({ user }) {
  return (
    <div>
      <h1>Hi, {user.display_name}</h1>
      <h3>
        {" "}
        You're logged in as <span>{user.email}</span>
      </h3>
      <p>Not you?</p>
    </div>
  );
}
