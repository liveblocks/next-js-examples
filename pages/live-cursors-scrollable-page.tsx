import { RoomProvider } from "@liveblocks/react";
import React from "react";
import Cursor from "../components/Cursor";
import ExampleInfo from "../components/ExampleInfo";
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
        <div
          style={{ fontFamily: "Merriweather, serif" }}
          className="font-mono text-lg max-w-lg mx-auto leading-loose py-32"
        >
          <h2 className="text-4xl">Hello world</h2>
          <p className="mt-10">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non odio
            at sapien sollicitudin molestie. Interdum et malesuada fames ac ante
            ipsum primis in faucibus. Integer suscipit dolor eget odio interdum,
            a ultrices elit feugiat. Suspendisse nec mauris pharetra, auctor
            ante vel, auctor leo.
          </p>
          <p className="mt-6">
            Donec eu lectus tristique, semper dolor at, laoreet urna. Nullam at
            pulvinar ligula. Sed luctus eu enim quis sagittis. Quisque justo
            sem, finibus eu mauris sit amet, venenatis egestas velit. Donec
            consequat porta gravida. Nunc egestas, ipsum a rhoncus semper, magna
            nulla accumsan odio, et rutrum neque diam id erat. Nulla sit amet
            sodales est.
          </p>
          <p className="mt-6">
            Fusce venenatis arcu a dolor dapibus, non placerat leo egestas.
            Fusce ultrices ligula vel nunc sodales, a condimentum arcu placerat.
            Nulla pretium nunc a nunc egestas egestas. Duis vel hendrerit elit,
            vel malesuada tellus. Integer posuere, metus quis blandit suscipit,
            lacus purus gravida neque, faucibus condimentum arcu magna in quam.
            Donec a augue nec neque sagittis luctus. Nunc lobortis nunc sit amet
            ligula sollicitudin, non euismod augue vestibulum. Sed ut mollis
            mauris, nec vestibulum libero.
          </p>
          <p className="mt-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non odio
            at sapien sollicitudin molestie. Interdum et malesuada fames ac ante
            ipsum primis in faucibus. Integer suscipit dolor eget odio interdum,
            a ultrices elit feugiat. Suspendisse nec mauris pharetra, auctor
            ante vel, auctor leo.
          </p>
          <p className="mt-6">
            Donec eu lectus tristique, semper dolor at, laoreet urna. Nullam at
            pulvinar ligula. Sed luctus eu enim quis sagittis. Quisque justo
            sem, finibus eu mauris sit amet, venenatis egestas velit. Donec
            consequat porta gravida. Nunc egestas, ipsum a rhoncus semper, magna
            nulla accumsan odio, et rutrum neque diam id erat. Nulla sit amet
            sodales est.
          </p>
          <p className="mt-6">
            Fusce venenatis arcu a dolor dapibus, non placerat leo egestas.
            Fusce ultrices ligula vel nunc sodales, a condimentum arcu placerat.
            Nulla pretium nunc a nunc egestas egestas. Duis vel hendrerit elit,
            vel malesuada tellus. Integer posuere, metus quis blandit suscipit,
            lacus purus gravida neque, faucibus condimentum arcu magna in quam.
            Donec a augue nec neque sagittis luctus. Nunc lobortis nunc sit amet
            ligula sollicitudin, non euismod augue vestibulum. Sed ut mollis
            mauris, nec vestibulum libero.
          </p>
        </div>
      </main>
      {cursors.map(({ x, y, connectionId }) => (
        <Cursor
          key={connectionId}
          color={COLORS[connectionId % COLORS.length]}
          x={x}
          y={y}
        />
      ))}
    </>
  );
}

export default function Root() {
  return (
    <RoomProvider id="example-window-live-cursors">
      <Demo />
      <ExampleInfo
        title="Live Cursors Scrollable Page"
        description="Open this page in multiple windows to see the live cursors."
        githubHref="https://github.com/liveblocks/next-js-examples/blob/main/pages/live-cursors-scrollable-page.tsx"
        codeSandboxHref="https://codesandbox.io/s/github/liveblocks/next-js-examples?file=/pages/live-cursors-scrollable-page.tsx"
      />
    </RoomProvider>
  );
}
