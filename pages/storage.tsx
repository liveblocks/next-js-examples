import { RoomProvider, useList } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import React, { useState } from "react";

type Todo = {
  text: string;
};

export default function Room() {
  return (
    <RoomProvider
      id="example-storage"
      defaultStorageRoot={{
        // storage keys can be initialized here
        todos: new LiveList<Todo>(),
      }}
    >
      <StorageDemo />
    </RoomProvider>
  );
}

function StorageDemo() {
  const todos = useList<Todo>("todos");
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
            todos.push({ text });
            setText("");
          }
        }}
      ></input>
      {todos.toArray().map((todo, index) => {
        return (
          <div
            className="px-3.5 py-2 flex justify-between items-center"
            key={index}
          >
            <div style={{ flexGrow: 1 }}>{todo.text}</div>
            <button
              className="focus:outline-none"
              onClick={() => {
                todos.delete(index);
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
