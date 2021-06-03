import { RoomProvider } from "@liveblocks/react";
import React from "react";
import CursorWithAvatar from "../components/CursorWithAvatar";
import GithubLink from "../components/GithubLink";
import useWindowLiveCursors from "../components/useWindowLiveCursors";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

type Presence = {
  cursor: { x: number; y: number };
};

function Demo() {
  const cursors = useWindowLiveCursors<Presence>();

  return (
    <>
      <main>
        <div className="flex justify-center items-center h-screen select-none">
          <div className="text-center max-w-sm">
            <h1 className="text-xl">Live Cursors + Avatar</h1>
            <p className="text-sm mt-1 text-gray-600">
              Open this page in multiple browsers to see the live cursors
            </p>
          </div>
          <div className="absolute bottom-8">
            Icons made by{" "}
            <a href="https://www.freepik.com" title="Freepik">
              Freepik
            </a>{" "}
            from{" "}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </div>
        </div>
      </main>
      {cursors.map(({ x, y, connectionId, id, info }) => (
        <CursorWithAvatar
          key={connectionId}
          color={COLORS[connectionId % COLORS.length]}
          x={x}
          y={y}
          // Name and picture come from the backend. It's possible to set user information from the authentication endpoint to avoid identity spoofing
          name={info?.name}
          picture={info?.picture}
        />
      ))}
      <GithubLink
        className="fixed top-8 right-8"
        href="https://github.com/liveblocks/next-js-examples/blob/main/pages/live-cursors-avatars.tsx"
      />
    </>
  );
}

export default function Root() {
  return (
    <RoomProvider id="example-live-cursors-avatars">
      <Demo />
    </RoomProvider>
  );
}
