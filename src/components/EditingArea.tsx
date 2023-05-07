import { useState, useLayoutEffect, MouseEvent } from 'react';
import rough from 'roughjs';
import { css } from '@linaria/core';
import type { Drawable } from 'roughjs/bin/core';
import { v4 as uuid } from 'uuid';
import {
  mapToRectData,
  getRectByCoordinate,
  getDirectionByCoordinate,
  getUpdatedRectData,
  editingRectOverlapWithOthers
} from '../utils';
import {
  Rect,
  RectData,
  GrabbedOrdinates,
  CursorStyles,
  Direction,
  Coordinate
} from '../types';
import defaultConfig, { errorColor } from '../config';

const positionAbsolute = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const size = {
  width: window.innerWidth,
  height: window.innerHeight
};

const gen = rough.generator();

function createRect({
  id,
  x,
  y,
  width,
  height,
  config = defaultConfig
}: RectData): Rect {
  const rect: Drawable = gen.rectangle(x, y, width, height, config);
  return { id, x, y, width, height, rect };
}

function EditingArea() {
  const localData: RectData[] = JSON.parse(
    localStorage.getItem('space_mgmt_areas') as string
  );
  const initElements: Rect[] =
    mapToRectData(localData)?.map?.((i: RectData) => createRect(i)) ?? [];

  const [elements, setElements] = useState<Rect[]>(initElements);

  const [drawing, setDrawing] = useState(false);
  const [rectId, setRectId] = useState<string | null>(null);

  const [grabbing, setGrabbing] = useState(false);
  const [originalCoordinate, setOriginalCoordinate] = useState<Coordinate>({
    x: 0,
    y: 0
  });
  const [grabbedCoordinates, setGrabbedCoordinates] =
    useState<GrabbedOrdinates>({
      initialX: 0,
      initialY: 0,
      finalX: 0,
      finalY: 0
    });

  const [resizing, setResizing] = useState(false);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [initialRectData, setInitialRectData] = useState<RectData | null>(null);

  const [collision, setCollision] = useState(false);

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas as HTMLCanvasElement, {
      options: defaultConfig
    });
    const rootContainer = document.getElementById(
      'container'
    ) as HTMLDivElement;
    rootContainer.innerHTML = '';

    elements.forEach((el: Rect) => {
      rc.draw(el.rect);

      const div = document.createElement('div');
      div.setAttribute('ref', el.id);
      div.setAttribute('draggable', 'true');
      div.style.position = 'absolute';
      div.style.top = `${el.height > 0 ? el.y : el.y + el.height}px`;
      div.style.left = `${el.width > 0 ? el.x : el.x + el.width}px`;
      div.style.width = `${Math.abs(el.width)}px`;
      div.style.height = `${Math.abs(el.height)}px`;
      div.style.cursor = 'grab';
      rootContainer.append(div);
    });
  }, [elements]);

  function handleMouseDown(event: MouseEvent) {
    const { clientX, clientY } = event;
    const isHoverOnRect = !!getRectByCoordinate(clientX, clientY)?.id;

    if (isHoverOnRect) {
      startDragging(event);
      return;
    }
    startDrawing(event);
  }

  function startDragging(event: MouseEvent) {
    const { clientX, clientY } = event;
    const rectData = getRectByCoordinate(clientX, clientY);

    if (rectData == null) return;

    setGrabbedCoordinates({
      ...grabbedCoordinates,
      initialX: clientX,
      initialY: clientY
    });
    setOriginalCoordinate({ x: rectData.x, y: rectData.y });
    setInitialRectData(rectData);

    const direction = getDirectionByCoordinate(rectData, clientX, clientY);
    if (direction) {
      setResizing(true);
    } else {
      setGrabbing(true);
    }
  }

  function startDrawing(event: MouseEvent) {
    setDrawing(true);

    const newEl = createRect({
      id: `ref_${uuid()}`,
      x: event.clientX,
      y: event.clientY,
      width: 0,
      height: 0
    });
    const newEls: Rect[] = [...elements, newEl];
    setElements(newEls);
    localStorage.setItem(
      'space_mgmt_areas',
      JSON.stringify(mapToRectData(newEls))
    );
  }

  function handleMouseUp() {
    if (drawing) {
      setDrawing(false);
    }
    if (grabbing) {
      setGrabbing(false);
    }
    if (resizing) {
      setResizing(false);
      setDirection(null);
    }
    setOriginalCoordinate({ x: 0, y: 0 });
    setGrabbedCoordinates({
      initialX: 0,
      initialY: 0,
      finalX: 0,
      finalY: 0
    });

    const filteredEls = [...elements].filter((i: Rect) => {
      return i.width && i.height;
    });
    setElements(filteredEls);
    localStorage.setItem(
      'space_mgmt_areas',
      JSON.stringify(mapToRectData(filteredEls))
    );
  }

  function handleMouseMove(event: MouseEvent) {
    if (drawing) {
      draw(event);
      return;
    }
    if (grabbing) {
      grab(event);
      return;
    }
    if (resizing) {
      resize(event);
      return;
    }
  }

  function grab(event: MouseEvent) {
    const { clientX, clientY } = event;
    if (clientX < 0 || clientY < 0) return;

    setGrabbedCoordinates({
      ...grabbedCoordinates,
      finalX: clientX,
      finalY: clientY
    });

    const copyEls: Rect[] = [...elements];
    const rectIndex = localData.findIndex((i: RectData) => i.id === rectId);
    const rect = localData.find((i: RectData) => i.id === rectId);
    const updatedCoordinate = {
      x: originalCoordinate.x + clientX - grabbedCoordinates.initialX,
      y: originalCoordinate.y + clientY - grabbedCoordinates.initialY
    };

    let updatedRectData = { ...(rect as RectData), ...updatedCoordinate };
    const overlapRectIds = copyEls
      .filter(
        (el) =>
          el.id !== rectId && editingRectOverlapWithOthers(el, rect as RectData)
      )
      .map((el) => el.id);
    if (overlapRectIds.length) {
      setCollision(true);
      updatedRectData = {
        ...updatedRectData,
        config: { ...defaultConfig, fill: errorColor, stroke: errorColor }
      };
    } else {
      setCollision(false);
    }

    copyEls[rectIndex] = createRect(updatedRectData);
    setElements(copyEls);
    localStorage.setItem(
      'space_mgmt_areas',
      JSON.stringify(mapToRectData(copyEls))
    );
  }

  function resize(event: MouseEvent) {
    const { clientX, clientY } = event;
    if (
      clientX < 0 ||
      clientY < 0 ||
      direction == null ||
      initialRectData == null
    )
      return;

    const modifiedGrabbedCoordinates = {
      ...grabbedCoordinates,
      finalX: clientX,
      finalY: clientY
    };

    setGrabbedCoordinates(modifiedGrabbedCoordinates);

    const copyEls: Rect[] = [...elements];
    const rectIndex = localData.findIndex((i: RectData) => i.id === rectId);
    const rect = localData.find((i: RectData) => i.id === rectId);

    let newRectData = getUpdatedRectData(
      initialRectData as RectData,
      originalCoordinate,
      modifiedGrabbedCoordinates
    );
    const overlapRectIds = copyEls
      .filter(
        (el) =>
          el.id !== rectId && editingRectOverlapWithOthers(el, rect as RectData)
      )
      .map((el) => el.id);
    if (overlapRectIds.length) {
      setCollision(true);
      newRectData = {
        ...newRectData,
        config: { ...defaultConfig, fill: errorColor, stroke: errorColor }
      };
    } else {
      setCollision(false);
    }

    copyEls[rectIndex] = createRect(newRectData);
    setElements(copyEls);
    localStorage.setItem(
      'space_mgmt_areas',
      JSON.stringify(mapToRectData(copyEls))
    );
  }

  function draw(event: MouseEvent) {
    if (!drawing || rectId) return;

    const copyEls: Rect[] = [...elements];
    const index = elements.length - 1;
    const { x, y } = elements[index];
    const { clientX, clientY } = event;

    let updatedRectData: RectData = {
      id: copyEls[index].id,
      x,
      y,
      width: clientX - x,
      height: clientY - y
    };
    const overlapRectIds = copyEls
      .filter((el) => {
        const rect = localData.find(
          (i: RectData) => i.id === elements[index].id
        ) as RectData;
        return el.id !== rect.id && editingRectOverlapWithOthers(el, rect);
      })
      .map((el) => el.id);
    if (overlapRectIds.length) {
      setCollision(true);
      updatedRectData = {
        ...updatedRectData,
        config: { ...defaultConfig, fill: errorColor, stroke: errorColor }
      };
    } else {
      setCollision(false);
    }

    copyEls[index] = createRect(updatedRectData);
    setElements(copyEls);
    localStorage.setItem(
      'space_mgmt_areas',
      JSON.stringify(mapToRectData(copyEls))
    );
  }

  function handlePointerMove(event: MouseEvent) {
    if (drawing || grabbing || resizing) return;

    const { clientX, clientY } = event;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const rectData = getRectByCoordinate(clientX, clientY);
    setRectId(rectData?.id ?? null);

    const direction = getDirectionByCoordinate(rectData, clientX, clientY);
    if (direction) {
      setDirection(direction);
      canvas.style.cursor = CursorStyles[direction];
      return;
    }
    setDirection(null);
    canvas.style.cursor = rectId ? 'grab' : 'crosshair';
  }

  return (
    <div
      id='editing_area'
      style={{
        width: size.width,
        height: size.height,
        position: 'relative'
      }}
    >
      <div
        id='container'
        className={positionAbsolute}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      <canvas
        id='canvas'
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onPointerMove={handlePointerMove}
        className={positionAbsolute}
      />
    </div>
  );
}

export default EditingArea;
