import React from "react";
import { useOthers, useMyPresence, RoomProvider } from "@liveblocks/react";
import Cursor from "../components/Cursor";
import GithubLink from "../components/GithubLink";

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

type Presence = {
  cursor: {
    x: number;
    y: number;
  } | null;
};

function PresenceDemo() {
  const [{ cursor }, updateMyPresence] = useMyPresence<Presence>();
  const others = useOthers<Presence>();

  return (
    <div
      className="relative bg-gray-100 h-screen w-full flex items-center justify-center"
      onPointerMove={(event) =>
        updateMyPresence({
          cursor: {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
          },
        })
      }
      onPointerLeave={() =>
        updateMyPresence({
          cursor: null,
        })
      }
    >
      <div className="max-w-sm text-center">
        {cursor
          ? `${cursor.x},${cursor.y}`
          : "Move your cursor to broadcast its position to other people in the room."}
      </div>

      {others.map(({ connectionId, presence }) => {
        if (presence == null || presence.cursor == null) {
          return null;
        }

        return (
          <Cursor
            key={`cursor-${connectionId}`}
            color={COLORS[connectionId % COLORS.length]}
            x={presence.cursor.x}
            y={presence.cursor.y}
          />
        );
      })}
      <GithubLink
        className="fixed top-8 right-8"
        href="https://github.com/liveblocks/next-js-examples/blob/main/pages/presence.tsx"
      />
    </div>
  );
}

export default function Room() {
  return (
    <RoomProvider
      id={"example-presence"}
      defaultPresence={() => ({
        cursor: null,
      })}
    >
      <PresenceDemo />
    </RoomProvider>
  );
}
