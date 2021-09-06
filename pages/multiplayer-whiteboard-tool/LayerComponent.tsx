import { LiveObject } from "@liveblocks/client";
import React, { memo, useEffect, useState } from "react";
import Ellipse from "./Ellipse";
import Path from "./Path";
import Rectangle from "./Rectangle";
import { CanvasMode, Layer, LayerType, RectangleLayer } from "./types";

type Props = {
  layer: LiveObject<Layer>;
  mode: CanvasMode;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
};

const LayerComponent = memo(({ layer, mode, onLayerPointerDown }: Props) => {
  console.log("render layer", layer.toObject());

  const [, setCounter] = useState(0);
  useEffect(() => {
    function onChange() {
      setCounter((x) => x + 1);
    }

    layer.subscribe(onChange);

    return () => layer.unsubscribe(onChange);
  }, [layer]);

  const isAnimated =
    mode !== CanvasMode.Translating && mode !== CanvasMode.Resizing;

  const obj = layer.toObject();

  switch (obj.type) {
    case LayerType.Ellipse:
      return (
        <Ellipse
          key={layer.id}
          layer={obj}
          onPointerDown={onLayerPointerDown}
          isAnimated={isAnimated}
        />
      );
    case LayerType.Path:
      return (
        <Path
          key={layer.id}
          layer={obj}
          onPointerDown={onLayerPointerDown}
          isAnimated={isAnimated}
        />
      );
    case LayerType.Rectangle:
      return (
        <Rectangle
          key={layer.id}
          layer={obj}
          onPointerDown={onLayerPointerDown}
          isAnimated={isAnimated}
        />
      );
    default:
      console.warn("Unknown layer type");
      return null;
  }
});

export default LayerComponent;
