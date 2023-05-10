import {
  useState,
  useLayoutEffect,
  MouseEvent,
  Dispatch,
  SetStateAction
} from 'react';
import rough from 'roughjs';
import { css } from '@linaria/core';
import { v4 as uuid } from 'uuid';
import {
  createRect,
  getTopOffset,
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
import defaultConfig, { color } from '../config';
import Rectangle from './Rectangle';

const positionAbsolute = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const size = {
  width: window.innerWidth,
  height: window.innerHeight
};

interface ComponentProps {
  elements: Rect[];
  setElements: Dispatch<SetStateAction<Rect[]>>;
  editable: boolean;
  setCollision: Dispatch<SetStateAction<boolean>>;
}

function EditingArea({
  elements,
  setElements,
  editable,
  setCollision
}: ComponentProps) {
  const [topOffset, setTopOffset] = useState<number | null>(null);

  const localData: RectData[] = JSON.parse(
    localStorage.getItem('space_mgmt_areas') as string
  );

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

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas as HTMLCanvasElement, {
      options: defaultConfig
    });

    elements.forEach((el: Rect) => {
      rc.draw(el.rect);
    });
  }, [elements]);

  useLayoutEffect(() => {
    const offset = getTopOffset();
    setTopOffset(offset);
  }, [topOffset]);

  function handleMouseDown(event: MouseEvent) {
    const { pageX, pageY } = event;
    const isHoverOnRect = !!getRectByCoordinate(
      pageX,
      pageY - Number(topOffset)
    )?.id;

    if (isHoverOnRect) {
      startDragging(event);
      return;
    }
    startDrawing(event);
  }

  function startDragging(event: MouseEvent) {
    const { pageX, pageY } = event;
    const rectData = getRectByCoordinate(pageX, pageY - Number(topOffset));

    if (rectData == null) return;

    setGrabbedCoordinates({
      ...grabbedCoordinates,
      initialX: pageX,
      initialY: pageY
    });
    setOriginalCoordinate({ x: rectData.x, y: rectData.y });
    setInitialRectData(rectData);

    const direction = getDirectionByCoordinate(
      rectData,
      pageX,
      pageY - Number(topOffset)
    );
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
      x: event.pageX,
      y: event.pageY,
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
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.style.cursor = 'grabbing';

    const { pageX, pageY } = event;
    if (pageX < 0 || pageY < 0) return;

    setGrabbedCoordinates({
      ...grabbedCoordinates,
      finalX: pageX,
      finalY: pageY
    });

    const copyEls: Rect[] = [...elements];
    const rectIndex = localData.findIndex((i: RectData) => i.id === rectId);
    const rect = localData.find((i: RectData) => i.id === rectId);
    const updatedCoordinate = {
      x: originalCoordinate.x + pageX - grabbedCoordinates.initialX,
      y: originalCoordinate.y + pageY - grabbedCoordinates.initialY
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
        config: { ...defaultConfig, fill: color.error, stroke: color.error }
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
    const { pageX, pageY } = event;
    if (pageX < 0 || pageY < 0 || direction == null || initialRectData == null)
      return;

    const modifiedGrabbedCoordinates = {
      ...grabbedCoordinates,
      finalX: pageX,
      finalY: pageY
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
        config: { ...defaultConfig, fill: color.error, stroke: color.error }
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
    const { pageX, pageY } = event;

    let updatedRectData: RectData = {
      id: copyEls[index].id,
      x,
      y,
      width: pageX - x,
      height: pageY - y
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
        config: { ...defaultConfig, fill: color.error, stroke: color.error }
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

    const { pageX, pageY } = event;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const rectData = getRectByCoordinate(pageX, pageY - Number(topOffset));
    setRectId(rectData?.id ?? null);

    const direction = getDirectionByCoordinate(
      rectData,
      pageX,
      pageY - Number(topOffset)
    );
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
      style={{ width: size.width, height: size.height, position: 'relative' }}
    >
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
      <div
        id='container'
        className={positionAbsolute}
        style={{ width: '100%', height: '100%' }}
      >
        <div
          style={{
            width: size.width,
            height: size.height
          }}
        >
          <img
            id='imported-floor-plan-image'
            src=''
            alt='floor-plan-image'
            style={{
              height: '80%',
              padding: '2rem',
              border: '1px solid #333',
              borderRadius: '1rem',
              background: 'white',
              display: 'none',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
        {elements.map((el: Rect) => (
          <Rectangle rect={el} editable={editable} key={el.id} />
        ))}
      </div>
    </div>
  );
}

export default EditingArea;
