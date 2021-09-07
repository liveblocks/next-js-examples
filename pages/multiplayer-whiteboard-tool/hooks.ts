import { LiveMap, LiveObject } from "@liveblocks/client";
import { useState, useEffect } from "react";
import { Layer, XYWH } from "./types";
import { boundingBox } from "./utils";

export function useSelectionBounds(
  layers: LiveMap<string, LiveObject<Layer>>,
  selection: string[]
): XYWH | null {
  const [bounds, setBounds] = useState(boundingBox(layers, selection));

  useEffect(() => {
    onChange();

    function onChange() {
      setBounds(boundingBox(layers, selection));
    }

    layers.subscribeDeep(onChange);

    return () => {
      layers.unsubscribeDeep(onChange);
    };
  }, [layers, selection]);

  return bounds;
}
