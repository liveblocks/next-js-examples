import { RoomProvider, useMap } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import React, { useState } from "react";
import { nanoid } from "nanoid";

type Todo = {
  text: string;
};

export default function Room() {
  return (
    <RoomProvider
      id="example-storage"
      defaultPresence={() => ({
        cursor: null,
        selectedElement: null
      })}
      defaultStorageRoot={{
        todos: new LiveMap<string, Todo>(),
      }}
    >
      <StorageDemo />
    </RoomProvider>
  );
}

function StorageDemo() {
  const todos = useMap<string, Todo>("todos");
  const [text, setText] = useState("");

  if (todos == null) {
    return (
      <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

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
            todos.set(nanoid(), { text });
            setText("");
          }
        }}
      ></input>
      {Array.from(todos).map(([id, todo]) => {
        return (
          <div
            className="px-3.5 py-2 flex justify-between items-center"
            key={id}
          >
            <div style={{ flexGrow: 1 }}>{todo.text}</div>
            <button
              className="focus:outline-none"
              onClick={() => {
                todos.delete(id);
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
