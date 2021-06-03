import { RoomProvider, useOthers } from "@liveblocks/react";
import React from "react";
import GithubLink from "../components/GithubLink";
import styles from "./avatars.module.css";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];
const IMAGE_SIZE = 48;

function Demo() {
  return (
    <>
      <main className="flex justify-center items-center h-screen select-none">
        <Avatars />
      </main>

      <GithubLink
        className="fixed top-8 right-8"
        href="https://github.com/liveblocks/next-js-examples/blob/main/pages/avatars.tsx"
      />
    </>
  );
}

function Avatars() {
  const users = useOthers().toArray();
  const hasMoreUsers = users.length > 4;

  return (
    <div className="flex flex-row pl-3">
      {users.slice(0, 3).map(({ connectionId, info }, index) => {
        return (
          <Avatar
            picture={info?.picture}
            name={info?.name}
            background={COLORS[connectionId % COLORS.length]}
          />
        );
      })}

      {hasMoreUsers && (
        <div
          className={`border-4 rounded-full border-white bg-gray-400 flex justify-center items-center text-white -ml-3`}
          style={{
            minWidth: `${IMAGE_SIZE + 8}px`,
            width: `${IMAGE_SIZE + 8}px`,
            height: `${IMAGE_SIZE + 8}px`,
          }}
        >
          +{users.length - 3}
        </div>
      )}
    </div>
  );
}

function Avatar({
  picture,
  name,
  background,
}: {
  picture?: string;
  name?: string;
  background: string;
}) {
  return (
    <div
      className={`border-4 rounded-full border-white -ml-3 ${styles.avatar}`}
      style={{
        minWidth: `${IMAGE_SIZE + 8}px`,
        width: `${IMAGE_SIZE + 8}px`,
        height: `${IMAGE_SIZE + 8}px`,
        background,
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
    </RoomProvider>
  );
}
