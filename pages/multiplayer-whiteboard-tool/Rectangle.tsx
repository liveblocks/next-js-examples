import { RectangleLayer } from "./types";
import { colorToCss } from "./utils";

type Props = {
  id: string;
  layer: RectangleLayer;
  isAnimated: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
};

export default function Rectangle({
  layer,
  isAnimated,
  onPointerDown,
  id,
}: Props) {
  const { x, y, width, height, fill } = layer;

  return (
    <rect
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transition: isAnimated ? "all 0.1s ease" : "",
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      width={width}
      height={height}
      fill={fill ? colorToCss(fill) : "#CCC"}
    />
  );
}
