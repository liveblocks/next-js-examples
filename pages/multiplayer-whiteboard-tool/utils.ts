import {
  Color,
  Side,
  EllipseLayer,
  Layer,
  LayerType,
  Point,
  RectangleLayer,
  XYWH,
} from "./types";
import { LiveList, LiveObject } from "@liveblocks/client";

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g
    .toString(16)
    .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function findIntersectingLayerWithPoint(
  layers: Array<LiveObject<Layer>>,
  point: Point
) {
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (isHittingLayer(layer.toObject(), point)) {
      return layer.get("id");
    }
  }

  return null;
}

export function isHittingLayer(layer: Layer, point: Point) {
  switch (layer.type) {
    case LayerType.Ellipse:
      return isHittingEllipse(layer, point);
    case LayerType.Rectangle:
    case LayerType.Path:
      return isHittingRectangle(layer, point);
    default:
      return false;
  }
}

export function isHittingRectangle(layer: XYWH, point: Point) {
  return (
    point.x > layer.x &&
    point.x < layer.x + layer.width &&
    point.y > layer.y &&
    point.y < layer.y + layer.height
  );
}

export function isHittingEllipse(layer: EllipseLayer, point: Point) {
  const rx = layer.width / 2;
  const ry = layer.height / 2;
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;

  const result =
    Math.pow(point.x - cx, 2) / Math.pow(rx, 2) +
    Math.pow(point.y - cy, 2) / Math.pow(ry, 2);

  return result <= 1;
}

/**
 * TODO: Implement ellipse and path / selection net collision
 */
export function findIntersectingLayersWithRectangle(
  layers: Array<LiveObject<Layer>>,
  a: Point,
  b: Point
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const layerIds = [];

  for (const layer of layers) {
    const { x, y, height, width, id } = layer.toObject();
    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      layerIds.push(id);
    }
  }

  return layerIds;
}

// TODO Complexity is 0(n2). Make it O(n) with get layer by id from list
export function getLayers(
  layers: Array<LiveObject<Layer>>,
  selection: string[]
): LiveObject<Layer>[] {
  const result = [];
  for (const id of selection) {
    const layer = layers.find((l) => l.get("id") == id);
    if (layer) {
      result.push(layer);
    }
  }
  return result;
}

export function boundingBox(
  allLayers: Array<LiveObject<Layer>>,
  selection: string[]
): XYWH | null {
  if (selection.length === 0) {
    return null;
  }

  const layers = getLayers(allLayers, selection);

  if (layers.length === 0) {
    return null;
  }

  let left = layers[0].get("x");
  let right = layers[0].get("x") + layers[0].get("width");
  let top = layers[0].get("y");
  let bottom = layers[0].get("y") + layers[0].get("height");

  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i].toObject();
    if (left > x) {
      left = x;
    }
    if (right < x + width) {
      right = x + width;
    }
    if (top > y) {
      top = y;
    }
    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}
