import {
  useMyPresence,
  useOthers,
  useList,
  RoomProvider,
  LiveblocksProvider,
} from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ColorPicker from "./ColorPicker";
import Ellipse from "./Ellipse";
import IconButton from "./IconButton";
import Rectangle from "./Rectangle";
import Path from "./Path";
import {
  Color,
  Layer,
  LayerType,
  CanvasState,
  CanvasMode,
  Presence,
  PathLayer,
  Camera,
  Point,
  RectangleLayer,
  Side,
  XYWH,
} from "./types";
import styles from "./index.module.css";
import getStroke from "perfect-freehand";
import {
  boundingBox,
  colorToCss,
  findIntersectingLayersWithRectangle,
  getLayers,
  getSvgPathFromStroke,
  resizeBounds,
} from "./utils";
import SelectionBox from "./SelectionBox";
import { nanoid } from "nanoid";
import LayerComponent from "./LayerComponent";

const MAX_LAYERS = 100;

export default function Room() {
  return (
    <RoomProvider
      id={"multiplayer-canvas"}
      defaultPresence={() => ({
        selection: [],
        penPoints: null,
        penColor: null,
      })}
    >
      <div className={styles.container}>
        <WhiteboardTool />
      </div>
    </RoomProvider>
  );
}

function WhiteboardTool() {
  const layers = useList<LiveObject<Layer>>("layers");

  if (layers == null) {
    return (
      <span className={styles.loading_container}>
        <svg
          className={styles.loading_svg}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M16 8C16 9.58225 15.5308 11.129 14.6518 12.4446C13.7727 13.7602 12.5233 14.7855 11.0615 15.391C9.59966 15.9965 7.99113 16.155 6.43928 15.8463C4.88743 15.5376 3.46197 14.7757 2.34315 13.6569C1.22433 12.538 0.4624 11.1126 0.153718 9.56072C-0.154964 8.00887 0.00346269 6.40034 0.608964 4.93853C1.21446 3.47672 2.23984 2.22729 3.55544 1.34824C4.87103 0.469192 6.41775 -1.88681e-08 8 0L8 1.52681C6.71972 1.52681 5.4682 1.90645 4.40369 2.61774C3.33917 3.32902 2.50949 4.33999 2.01955 5.52282C1.52961 6.70564 1.40142 8.00718 1.65119 9.26286C1.90096 10.5185 2.51747 11.6719 3.42276 12.5772C4.32805 13.4825 5.48147 14.099 6.73714 14.3488C7.99282 14.5986 9.29436 14.4704 10.4772 13.9805C11.66 13.4905 12.671 12.6608 13.3823 11.5963C14.0935 10.5318 14.4732 9.28028 14.4732 8H16Z" />
        </svg>
      </span>
    );
  }

  return <Canvas list={layers} />;
}

function Canvas({ list }: { list: LiveList<LiveObject<Layer>> }) {
  const [{ selection, penPoints }, setPresence] = useMyPresence<Presence>();
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 252,
    g: 142,
    b: 42,
  });

  useEffect(() => {
    // Disable scroll bounce on window to make the panning work properly
    document.body.classList.add(styles.no_scroll);
    return () => {
      document.body.classList.remove(styles.no_scroll);
    };
  }, []);

  const layers = list.toArray();

  const bBox = boundingBox(layers, selection);

  const deleteItems = useCallback(() => {
    for (const id of selection) {
      const index = list.toArray().findIndex((layer) => layer.get("id") === id);
      if (index !== -1) {
        list.delete(index);
      }
    }
  }, [list, selection]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Backspace": {
          deleteItems();
          break;
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selection, deleteItems]);

  const setFill = useCallback(
    (fill: Color) => {
      setLastUsedColor(fill);
      const selectedLayers = getLayers(layers, selection);
      for (const layer of selectedLayers) {
        layer.set("fill", fill);
      }
    },
    [layers, selection, setLastUsedColor]
  );

  const onLayerPointerDown = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      e.stopPropagation();
      const point = pointerEventToCanvasPoint(e, camera);
      if (!selection.includes(layerId)) {
        setPresence({ selection: [layerId] });
      }
      setState({ mode: CanvasMode.Translating, current: point });
    },
    [setPresence, setState, selection, camera]
  );

  const moveToFront = useCallback(() => {
    const indices: number[] = [];

    for (let i = 0; i < layers.length; i++) {
      if (selection.includes(layers[i].get("id"))) {
        indices.push(i);
      }
    }

    for (let i = indices.length - 1; i >= 0; i--) {
      list.move(indices[i], layers.length - 1 - (indices.length - 1 - i));
    }
  }, [list, selection]);

  const moveToBack = useCallback(() => {
    const indices: number[] = [];

    for (let i = 0; i < layers.length; i++) {
      if (selection.includes(layers[i].get("id"))) {
        indices.push(i);
      }
    }

    for (let i = 0; i < indices.length; i++) {
      list.move(indices[i], i);
    }
  }, [list, selection]);

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    []
  );

  return (
    <>
      <div className={styles.canvas}>
        {bBox && (
          <SelectionInspector
            x={bBox.width / 2 + bBox.x + camera.x}
            y={bBox.y + camera.y}
            setFill={setFill}
            moveToFront={moveToFront}
            moveToBack={moveToBack}
            deleteItems={deleteItems}
          />
        )}
        <svg
          className={styles.renderer_svg}
          onWheel={(e) => {
            setCamera((camera) => ({
              x: camera.x - e.deltaX,
              y: camera.y - e.deltaY,
            }));
          }}
          onPointerDown={(e) => {
            const point = pointerEventToCanvasPoint(e, camera);
            if (
              canvasState.mode === CanvasMode.Drawing &&
              list.toArray().length < MAX_LAYERS
            ) {
              if (list.toArray().length >= MAX_LAYERS) {
                setPresence({ selection: [] });
                setState({ mode: CanvasMode.None });
                return;
              }
              const layerId = nanoid();
              const layer = new LiveObject({
                id: layerId,
                type: canvasState.layerType,
                x: point.x,
                y: point.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
              });
              list.push(layer);
              setPresence({ selection: [layerId] });
              setState({ mode: CanvasMode.None });
              return;
            } else if (canvasState.mode === CanvasMode.Pencil) {
              setPresence({
                penPoints: [[point.x, point.y, e.pressure]],
                penColor: lastUsedColor,
              });
              return;
            }

            setState({ origin: point, mode: CanvasMode.Pressing });
          }}
          onPointerLeave={(e) => {
            setPresence({ cursor: null });
          }}
          onPointerMove={(e) => {
            e.preventDefault();
            const current = pointerEventToCanvasPoint(e, camera);
            if (canvasState.mode === CanvasMode.Pressing) {
              if (
                Math.abs(current.x - canvasState.origin.x) +
                  Math.abs(current.y - canvasState.origin.y) >
                5
              ) {
                setState({
                  mode: CanvasMode.SelectionNet,
                  origin: canvasState.origin,
                  current,
                });
              }
              setPresence({ cursor: current });
            } else if (canvasState.mode === CanvasMode.SelectionNet) {
              setState({
                mode: CanvasMode.SelectionNet,
                origin: canvasState.origin,
                current,
              });
              const ids = findIntersectingLayersWithRectangle(
                layers,
                canvasState.origin,
                current
              );
              setPresence({ selection: ids, cursor: current });
            } else if (canvasState.mode === CanvasMode.Translating) {
              const offset = {
                x: current.x - canvasState.current.x,
                y: current.y - canvasState.current.y,
              };

              for (const id of selection) {
                for (const layer of layers) {
                  if (layer.get("id") === id && layer) {
                    layer.update({
                      x: layer.get("x") + offset.x,
                      y: layer.get("y") + offset.y,
                    });
                  }
                }
              }

              setState({ mode: CanvasMode.Translating, current });
              setPresence({ cursor: current });
            } else if (canvasState.mode === CanvasMode.Resizing) {
              const bounds = resizeBounds(
                canvasState.initialBounds,
                canvasState.corner,
                current
              );
              for (const layer of layers) {
                if (layer.get("id") === selection[0]) {
                  layer.update(bounds);
                }
              }
            } else if (
              canvasState.mode === CanvasMode.Pencil &&
              e.buttons === 1 &&
              penPoints != null
            ) {
              setPresence({
                cursor: current,
                penPoints:
                  penPoints.length === 1 &&
                  penPoints[0][0] === current.x &&
                  penPoints[0][1] === current.y
                    ? penPoints
                    : [...penPoints, [current.x, current.y, e.pressure]],
              });
            } else {
              setPresence({ cursor: current });
            }
          }}
          onPointerUp={(e) => {
            if (
              canvasState.mode === CanvasMode.None ||
              canvasState.mode === CanvasMode.Pressing
            ) {
              setPresence({ selection: [] });
            }
            if (canvasState.mode === CanvasMode.Pencil && penPoints != null) {
              if (penPoints.length > 2 && list.toArray().length < MAX_LAYERS) {
                const path = penPointsToPathLayer(penPoints, lastUsedColor);
                const record = new LiveObject(path);
                list.push(record);
                setPresence({ penPoints: null });
                setState({ mode: CanvasMode.Pencil });
                return;
              } else {
                setPresence({ penPoints: null });
              }
            }
            setState({
              mode: CanvasMode.None,
            });
          }}
        >
          <g
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px)`,
            }}
          >
            {layers.map((layerObj) => (
              <LayerComponent
                key={layerObj.get("id")}
                mode={canvasState.mode}
                onLayerPointerDown={onLayerPointerDown}
                layer={layerObj}
              />
            ))}
            {bBox && (
              <SelectionBox
                selection={selection}
                layers={list}
                onResizeHandlePointerDown={onResizeHandlePointerDown}
              />
            )}
            {canvasState.mode === CanvasMode.SelectionNet &&
              canvasState.current != null && (
                <rect
                  className={styles.selection_net}
                  x={Math.min(canvasState.origin.x, canvasState.current.x)}
                  y={Math.min(canvasState.origin.y, canvasState.current.y)}
                  width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                  height={Math.abs(
                    canvasState.origin.y - canvasState.current.y
                  )}
                />
              )}
            <MultiplayerGuides layers={layers} />
            {penPoints != null && penPoints.length > 0 && (
              <path
                fill={colorToCss(lastUsedColor)}
                d={getSvgPathFromStroke(
                  getStroke(penPoints, {
                    size: 16,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                  })
                )}
              />
            )}
          </g>
        </svg>
      </div>
      <div className={styles.tools_panel_container}>
        <div className={styles.tools_panel}>
          <IconButton
            isActive={
              canvasState.mode === CanvasMode.None ||
              canvasState.mode === CanvasMode.Translating ||
              canvasState.mode === CanvasMode.SelectionNet ||
              canvasState.mode === CanvasMode.Pressing ||
              canvasState.mode === CanvasMode.Resizing
            }
            onClick={() =>
              setState({
                mode: CanvasMode.None,
              })
            }
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M13 26V9L25 21.1428H18.2189L13 26Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
          <IconButton
            isActive={canvasState.mode === CanvasMode.Pencil}
            onClick={() =>
              setState({
                mode: CanvasMode.Pencil,
              })
            }
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M22.8538 10.1464C22.76 10.0527 22.6329 10 22.5003 10C22.3677 10 22.2406 10.0527 22.1468 10.1464L20.4998 11.7934L24.2068 15.5004L25.8538 13.8544C25.9004 13.8079 25.9373 13.7528 25.9625 13.692C25.9877 13.6313 26.0007 13.5662 26.0007 13.5004C26.0007 13.4346 25.9877 13.3695 25.9625 13.3088C25.9373 13.248 25.9004 13.1928 25.8538 13.1464L22.8538 10.1464ZM23.4998 16.2074L19.7928 12.5004L13.2928 19.0004H13.4998C13.6324 19.0004 13.7596 19.0531 13.8534 19.1468C13.9471 19.2406 13.9998 19.3678 13.9998 19.5004V20.0004H14.4998C14.6324 20.0004 14.7596 20.0531 14.8534 20.1468C14.9471 20.2406 14.9998 20.3678 14.9998 20.5004V21.0004H15.4998C15.6324 21.0004 15.7596 21.0531 15.8534 21.1468C15.9471 21.2406 15.9998 21.3678 15.9998 21.5004V22.0004H16.4998C16.6324 22.0004 16.7596 22.0531 16.8534 22.1468C16.9471 22.2406 16.9998 22.3678 16.9998 22.5004V22.7074L23.4998 16.2074ZM16.0318 23.6754C16.0108 23.6194 15.9999 23.5602 15.9998 23.5004V23.0004H15.4998C15.3672 23.0004 15.24 22.9477 15.1463 22.8539C15.0525 22.7602 14.9998 22.633 14.9998 22.5004V22.0004H14.4998C14.3672 22.0004 14.24 21.9477 14.1463 21.8539C14.0525 21.7602 13.9998 21.633 13.9998 21.5004V21.0004H13.4998C13.3672 21.0004 13.24 20.9477 13.1463 20.8539C13.0525 20.7602 12.9998 20.633 12.9998 20.5004V20.0004H12.4998C12.44 20.0003 12.3808 19.9895 12.3248 19.9684L12.1458 20.1464C12.0982 20.1944 12.0607 20.2515 12.0358 20.3144L10.0358 25.3144C9.99944 25.4053 9.99053 25.5048 10.0102 25.6007C10.0299 25.6966 10.0772 25.7845 10.1464 25.8538C10.2157 25.923 10.3036 25.9703 10.3995 25.99C10.4954 26.0097 10.5949 26.0008 10.6858 25.9644L15.6858 23.9644C15.7487 23.9395 15.8058 23.902 15.8538 23.8544L16.0318 23.6764V23.6754Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
          <IconButton
            isActive={
              canvasState.mode === CanvasMode.Drawing &&
              canvasState.layerType === LayerType.Rectangle
            }
            onClick={() =>
              setState({
                mode: CanvasMode.Drawing,
                layerType: LayerType.Rectangle,
              })
            }
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 12H12V24H24V12ZM10 10V26H26V10H10Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
          <IconButton
            isActive={
              canvasState.mode === CanvasMode.Drawing &&
              canvasState.layerType === LayerType.Ellipse
            }
            onClick={() =>
              setState({
                mode: CanvasMode.Drawing,
                layerType: LayerType.Ellipse,
              })
            }
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 18C11 21.866 14.134 25 18 25C21.866 25 25 21.866 25 18C25 14.134 21.866 11 18 11C14.134 11 11 14.134 11 18ZM18 9C13.0294 9 9 13.0294 9 18C9 22.9706 13.0294 27 18 27C22.9706 27 27 22.9706 27 18C27 13.0294 22.9706 9 18 9Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        </div>
      </div>
    </>
  );
}

type ToolsProps = {
  x: number;
  y: number;
  setFill: (color: Color) => void;
  moveToFront: () => void;
  moveToBack: () => void;
  deleteItems: () => void;
};

function SelectionInspector({
  x,
  y,
  setFill,
  moveToFront,
  moveToBack,
  deleteItems,
}: ToolsProps) {
  return (
    <div
      className={styles.selection_inspector}
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
      }}
    >
      <ColorPicker onChange={setFill} />

      <div>
        <IconButton onClick={moveToFront}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 6.5L12 2L15 6.5H12.75V9.71429L19.976 11.7789C20.7013 11.9861 20.7013 13.0139 19.976 13.2211L12.8242 15.2645C12.2855 15.4184 11.7145 15.4184 11.1758 15.2645L4.024 13.2211C3.29872 13.0139 3.29872 11.9861 4.024 11.7789L11.25 9.71429V6.5H9ZM6.7493 15.5L4.02345 16.2788C3.29817 16.486 3.29817 17.5139 4.02345 17.7211L11.1753 19.7645C11.714 19.9184 12.285 19.9184 12.8236 19.7645L19.9755 17.7211C20.7007 17.5139 20.7007 16.486 19.9755 16.2788L17.2493 15.4999L12.8233 16.7645C12.2847 16.9184 11.7137 16.9184 11.175 16.7645L6.7493 15.5Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
        <IconButton onClick={moveToBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.1758 4.23547L4.024 6.27885C3.29872 6.48607 3.29872 7.51391 4.024 7.72114L11.1758 9.76452C11.7145 9.91842 12.2855 9.91842 12.8242 9.76452L19.976 7.72114C20.7013 7.51391 20.7013 6.48607 19.976 6.27885L12.8242 4.23547C12.2855 4.08156 11.7145 4.08156 11.1758 4.23547ZM4.02345 10.7788L6.7493 10L11.9992 11.5L17.2493 9.99992L19.9755 10.7788C20.7007 10.986 20.7007 12.0139 19.9755 12.2211L12.8236 14.2645C12.7991 14.2715 12.7746 14.2782 12.75 14.2845V17.5H15L12 22L9 17.5H11.25V14.2848C11.225 14.2783 11.2001 14.2716 11.1753 14.2645L4.02345 12.2211C3.29817 12.0139 3.29817 10.986 4.02345 10.7788Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
      </div>
      <div className={styles.selection_inspector_delete}>
        <IconButton onClick={deleteItems}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M7.5 9H16.5V18C16.5 18.8284 15.8284 19.5 15 19.5H9C8.17157 19.5 7.5 18.8284 7.5 18V9Z"
              fill="currentColor"
            />
            <path
              d="M6 6.75C6 6.33579 6.33579 6 6.75 6H8.37868C8.7765 6 9.15804 5.84196 9.43934 5.56066L10.0607 4.93934C10.342 4.65804 10.7235 4.5 11.1213 4.5H12.8787C13.2765 4.5 13.658 4.65804 13.9393 4.93934L14.5607 5.56066C14.842 5.84196 15.2235 6 15.6213 6H17.25C17.6642 6 18 6.33579 18 6.75V7.5H6V6.75Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

const MultiplayerGuides = React.memo(
  ({ layers }: { layers: Array<LiveObject<Layer>> }) => {
    const others = useOthers<Presence>();

    return (
      <>
        {others.map((user) => {
          if (user.presence?.cursor) {
            return (
              <path
                key={`cursor-${user.connectionId}`}
                style={{
                  transition: "transform 0.5s cubic-bezier(.17,.93,.38,1)",
                  transform: `translateX(${user.presence.cursor.x}px) translateY(${user.presence.cursor.y}px)`,
                }}
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={COLORS[user.connectionId % COLORS.length]}
              />
            );
          }
          return null;
        })}
        {others.map((user) => {
          if (user.presence?.selection) {
            const bBox = boundingBox(layers, user.presence.selection);
            if (bBox) {
              return (
                <rect
                  key={`selection-${user.connectionId}`}
                  style={{
                    transform: `translate(${bBox.x}px, ${bBox.y}px)`,
                  }}
                  x={0}
                  y={0}
                  width={bBox.width}
                  height={bBox.height}
                  fill="transparent"
                  stroke={COLORS[user.connectionId % COLORS.length]}
                  strokeWidth="1"
                />
              );
            }
          }
          return null;
        })}
        {others.map((user) => {
          if (user.presence?.penPoints) {
            return (
              <path
                key={`pencil-${user.connectionId}`}
                d={getSvgPathFromStroke(
                  getStroke(user.presence.penPoints, {
                    size: 16,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                  })
                )}
                fill={
                  user.presence.penColor
                    ? colorToCss(user.presence.penColor)
                    : undefined
                }
              />
            );
          }
          return null;
        })}
      </>
    );
  }
);

function penPointsToPathLayer(points: number[][], color: Color): PathLayer {
  if (points.length < 2) {
    throw new Error("Can't transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;
    if (left > x) {
      left = x;
    }
    if (top > y) {
      top = y;
    }
    if (right < x) {
      right = x;
    }
    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    id: nanoid(),
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}

function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera
): Point {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}
