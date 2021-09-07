import { EllipseLayer } from "./types";
import { colorToCss } from "./utils";

type Props = {
  id: string;
  layer: EllipseLayer;
  isAnimated: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
};

export default function Ellipse({
  layer,
  isAnimated,
  onPointerDown,
  id,
}: Props) {
  return (
    <ellipse
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transition: isAnimated ? "all 0.1s ease" : "",
        transform: `translate(${layer.x}px, ${layer.y}px)`,
      }}
      cx={layer.width / 2}
      cy={layer.height / 2}
      rx={layer.width / 2}
      ry={layer.height / 2}
      fill={layer.fill ? colorToCss(layer.fill) : "#CCC"}
    />
  );
}
