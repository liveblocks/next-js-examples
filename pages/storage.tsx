import { useStorage, RoomProvider, useRecord } from "@liveblocks/react";
import { LiveRecord } from "@liveblocks/client";
import React, { useState } from "react";
import { nanoid } from "nanoid";

export default function Room() {
  return (
    <RoomProvider
      id="example-storage-tmp-1"
      defaultPresence={() => ({
        cursor: null,
      })}
      /**
       * Initialize your storage here.
       * As opposed to RoomService, you don't get the maps and lists by name.
       * The storage is a object that contains all the nested records (similar to RS maps) and lists.
       * Nested types are supported.
       */
      defaultStorageRoot={{
        todos: new LiveRecord(),
      }}
    >
      <StorageDemo />
    </RoomProvider>
  );
}

function StorageDemo() {
  const [root] = useStorage();

  if (root == null) {
    return (
      <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return <Example map={root.get("todos")} />;
}

// Here we're using a record like a map. It's confusing so I'll create a new CRDT in the following days to make the code clearer
function Example({ map }: { map: LiveRecord }) {
  const [text, setText] = useState("");
  const items = useRecord(map);

  return (
    <div className="container max-w-md mx-auto">
      <input
        className="w-full bg-white px-3.5 py-2 shadow-sm hover:shadow focus:shadow focus:outline-none rounded-lg mt-12 mb-2"
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            map.set(nanoid(), { text });
            setText("");
          }
        }}
      ></input>
      {Object.entries(items).map(([id, todo]) => {
        return (
          <div
            className="px-3.5 py-2 flex justify-between items-center"
            key={id}
          >
            <div style={{ flexGrow: 1 }}>{todo.text}</div>
            <button
              className="focus:outline-none"
              onClick={() => {
                map.delete(id);
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
