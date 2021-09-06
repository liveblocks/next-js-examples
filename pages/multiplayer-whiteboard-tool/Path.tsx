import { PathLayer } from "./types";
import { colorToCss, getSvgPathFromStroke } from "./utils";
import getStroke from "perfect-freehand";

type Props = {
  layer: PathLayer;
  isAnimated: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
};

export default function Path({ layer, isAnimated, onPointerDown }: Props) {
  return (
    <path
      key={layer.id}
      onPointerDown={(e) => onPointerDown(e, layer.id)}
      d={getSvgPathFromStroke(
        getStroke(layer.points, {
          size: 16,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        })
      )}
      style={{
        transition: isAnimated ? "all 0.1s ease" : "",
        transform: `translate(${layer.x}px, ${layer.y}px)`,
      }}
      x={0}
      y={0}
      fill={layer.fill ? colorToCss(layer.fill) : "#CCC"}
    />
  );
}
