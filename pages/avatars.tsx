import { RoomProvider, useOthers, useSelf } from "@liveblocks/react";
import React from "react";
import ExampleInfo from "../components/ExampleInfo";
import styles from "./avatars.module.css";

const IMAGE_SIZE = 48;

function Demo() {
  const users = useOthers().toArray();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  return (
    <main className="flex justify-center items-center h-screen select-none">
      <div className="flex flex-row pl-3">
        {users.slice(0, 3).map(({ connectionId, info }) => {
          return (
            <Avatar
              key={connectionId}
              picture={info?.picture}
              name={info?.name}
            />
          );
        })}

        {hasMoreUsers && (
          <div
            className="border-4 rounded-full border-white bg-gray-400 flex justify-center items-center text-white -ml-3"
            style={{
              minWidth: `${IMAGE_SIZE + 8}px`,
              width: `${IMAGE_SIZE + 8}px`,
              height: `${IMAGE_SIZE + 8}px`,
            }}
          >
            +{users.length - 3}
          </div>
        )}

        {currentUser && (
          <div className="relative ml-8">
            <Avatar picture={currentUser.info?.picture} name="You" />
          </div>
        )}
      </div>
    </main>
  );
}

function Avatar({ picture, name }: { picture?: string; name?: string }) {
  return (
    <div
      className={`border-4 rounded-full border-white -ml-3 bg-gray-400 ${styles.avatar}`}
      style={{
        minWidth: `${IMAGE_SIZE + 8}px`,
        width: `${IMAGE_SIZE + 8}px`,
        height: `${IMAGE_SIZE + 8}px`,
      }}
      data-tooltip={name}
    >
      <img
        src={picture}
        height={IMAGE_SIZE}
        width={IMAGE_SIZE}
        className={`rounded-full`}
      />
    </div>
  );
}

export default function Root() {
  return (
    <RoomProvider id="example-live-cursors-avatars">
      <Demo />
      <ExampleInfo
        title="Live Avatars"
        description="Open this page in multiple windows to see the live avatars."
        githubHref="https://github.com/liveblocks/next-js-examples/blob/main/pages/avatars.tsx"
        codeSandboxHref="https://codesandbox.io/s/github/liveblocks/next-js-examples?file=/pages/avatars.tsx"
      />
    </RoomProvider>
  );
}
