import React from "react";

type Props = {
  color: string;
  x: number;
  y: number;
  name?: string;
  picture?: string;
};

export default function Cursor({ color, x, y, name, picture }: Props) {
  return (
    <div
      className="absolute pointer-events-none top-0 left-0"
      style={{
        transition: "transform 0.5s cubic-bezier(.17,.93,.38,1)",
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <svg
        className="relative"
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        stroke="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
        />
      </svg>

      {name && picture && (
        <div
          className="absolute top-5 left-2 rounded-full flex flex-row"
          style={{ backgroundColor: color }}
        >
          <img
            src={picture}
            height="32"
            width="32"
            className="ml-0.5"
            style={{ minWidth: "32px" }}
          />

          <div className="text-white whitespace-nowrap text-sm px-4 py-2">
            {name}
          </div>
        </div>
      )}
    </div>
  );
}
