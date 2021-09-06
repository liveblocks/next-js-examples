import { EllipseLayer } from "./types";
import { colorToCss } from "./utils";

type Props = {
  layer: EllipseLayer;
  isAnimated: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
};

export default function Ellipse({ layer, isAnimated, onPointerDown }: Props) {
  return (
    <ellipse
      key={layer.id}
      onPointerDown={(e) => onPointerDown(e, layer.id)}
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
