import {
  useState,
  useLayoutEffect,
  useRef,
  MouseEvent,
  Dispatch,
  SetStateAction
} from 'react';
import rough from 'roughjs';
import { v4 as uuid } from 'uuid';
import {
  createRect,
  getEditingAreaOffset,
  formatRawRectData,
  mapToRectData,
  getRectByCoordinate,
  getDirectionByCoordinate,
  getUpdatedRectData,
  overlappingRectId,
  swapContainerAndCanvas,
  resetData
} from '../utils';
import type { Drawable } from 'roughjs/bin/core';
import {
  RectData,
  GrabbedOrdinates,
  CursorStyles,
  Direction,
  Coordinate,
  Offset
} from '../types';
import { defaultConfig, color, defaultInfo } from '../config';
import Rectangle from './Rectangle';
import { SIconButton } from './shared';
import { IoAddCircleOutline } from 'react-icons/io5';
import ImportFloorPlanImageDialog from './ImportFloorPlanImageDialog';

interface ComponentProps {
  loaded: boolean;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  elements: RectData[];
  setElements: Dispatch<SetStateAction<RectData[]>>;
  editable: boolean;
  setEditable: Dispatch<SetStateAction<boolean>>;
  setCollision: Dispatch<SetStateAction<boolean>>;
}

function EditingArea({
  loaded,
  setLoaded,
  elements,
  setElements,
  editable,
  setEditable,
  setCollision
}: ComponentProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const offset = useRef<Offset>({ top: 0, left: 0 });
  const coord = useRef<Coordinate>({ x: 0, y: 0 });

  const tempLocalData: RectData[] =
    JSON.parse(localStorage.getItem('space_mgmt_temp_areas') as string) ?? [];

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

  const [showImportFloorPlanImageDialog, setShowImportFloorPlanImageDialog] =
    useState(false);

  useLayoutEffect(() => {
    const img = document.getElementById(
      'imported-floor-plan-image'
    ) as HTMLImageElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const rc = rough.canvas(canvas as HTMLCanvasElement, {
      options: defaultConfig
    });

    const storedFile = localStorage.getItem('space_mgmt_file');
    if (storedFile) {
      img.src = storedFile;
      setLoaded(true);
    }
    if (!loaded) return;
    else {
      const imgRect = img.getBoundingClientRect();
      canvas.width = imgRect.width;
      canvas.height = imgRect.height;
      setSize({ width: imgRect.width, height: imgRect.height });

      const { top, left } = getEditingAreaOffset();
      offset.current = { top, left };
      coord.current = { x: left, y: top };
    }

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    elements?.forEach?.((el: RectData) => {
      const rect: Drawable = createRect(el).rect;
      rc.draw(rect);
    });
  }, [loaded, setLoaded, elements]);

  function setTempLocalData(newEls: RectData[]) {
    setElements(newEls);
    localStorage.setItem(
      'space_mgmt_temp_areas',
      JSON.stringify(mapToRectData(newEls))
    );
  }

  function handleEditingRectOverlapping(editingRectData: RectData): RectData {
    const copyEls: RectData[] = [...elements];
    const rectData = tempLocalData.find((i: RectData) => i.id === rectId);
    const overlapRectIds = copyEls
      .filter((el) => el.id !== rectId)
      .filter((el) => overlappingRectId(el, rectData as RectData))
      .map((el) => el.id);
    setCollision(!!overlapRectIds.length);
    return {
      ...editingRectData,
      config: {
        ...(initialRectData as RectData).config,
        ...(overlapRectIds.length
          ? { fill: color.error, stroke: color.error }
          : {
              fill: initialRectData?.config?.fill || defaultConfig.fill,
              stroke: initialRectData?.config?.stroke || defaultConfig.stroke
            })
      }
    };
  }

  function handleOverlapping(rectsData: RectData[]): RectData[] {
    const fixedRectsData = rectsData.filter((el) => el.id !== rectId);
    const editingRectData = rectsData.find((el) => el.id === rectId);
    const overlapRectIds = fixedRectsData
      .filter((el) =>
        overlappingRectId(el, formatRawRectData(editingRectData as RectData))
      )
      .map((el) => el.id);
    setCollision(!!overlapRectIds.length);
    return rectsData.map((el) => {
      const rectDivColor = document
        .getElementById(el.id)
        ?.style?.background.replace(/[^,]+(?=\))/, '1');
      return el.id === rectId
        ? handleEditingRectOverlapping(el)
        : {
            ...el,
            config: {
              ...el.config,
              ...(overlapRectIds.includes(el.id)
                ? { fill: color.error, stroke: color.error }
                : { fill: rectDivColor, stroke: rectDivColor })
            }
          };
    });
  }

  function handleMouseDown(event: MouseEvent) {
    const isHoverOnRect = !!getRectByCoordinate(
      coord.current.x,
      coord.current.y
    )?.id;

    if (isHoverOnRect) {
      startDragging(event);
      return;
    }
    startDrawing();
  }

  function startDragging(event: MouseEvent) {
    const { pageX, pageY } = event;
    const rectData = getRectByCoordinate(coord.current.x, coord.current.y);

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
      coord.current.x,
      coord.current.y
    );
    if (direction) {
      setResizing(true);
    } else {
      setGrabbing(true);
    }
  }

  function startDrawing() {
    setDrawing(true);

    const newEl = {
      id: `ref_${uuid()}`,
      x: coord.current.x,
      y: coord.current.y,
      width: 0,
      height: 0,
      info: defaultInfo,
      config: defaultConfig
    };
    setRectId(newEl.id);
    setInitialRectData(newEl);
    const newEls: RectData[] = [...elements, newEl];
    setTempLocalData(newEls);
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

    const filteredEls = [...elements].filter((i: RectData) => {
      return i.width && i.height;
    });
    setTempLocalData(filteredEls);
  }

  function handleMouseMove(event: MouseEvent) {
    coord.current = {
      x: event.pageX - offset.current.left,
      y: event.pageY - offset.current.top
    };

    if (drawing) {
      paint();
      return;
    }
    if (grabbing) {
      grab(event);
      return;
    }
    if (resizing) {
      resize();
      return;
    }
  }

  function grab(event: MouseEvent) {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.style.cursor = 'grabbing';

    const { pageX, pageY } = event;
    if (coord.current.x < 0 || coord.current.y < 0) return;

    setGrabbedCoordinates({
      ...grabbedCoordinates,
      finalX: coord.current.x,
      finalY: coord.current.y
    });

    let copyEls: RectData[] = [...elements];
    const rectIndex = tempLocalData.findIndex((i: RectData) => i.id === rectId);
    const rectData = tempLocalData.find((i: RectData) => i.id === rectId);
    const updatedCoordinate = {
      x: originalCoordinate.x + pageX - grabbedCoordinates.initialX,
      y: originalCoordinate.y + pageY - grabbedCoordinates.initialY
    };

    copyEls[rectIndex] = { ...(rectData as RectData), ...updatedCoordinate };
    copyEls = handleOverlapping(copyEls);
    setTempLocalData(copyEls);
  }

  function resize() {
    if (
      coord.current.x < 0 ||
      coord.current.y < 0 ||
      direction == null ||
      initialRectData == null
    )
      return;

    const modifiedGrabbedCoordinates = {
      ...grabbedCoordinates,
      finalX: coord.current.x,
      finalY: coord.current.y
    };

    setGrabbedCoordinates(modifiedGrabbedCoordinates);

    let copyEls: RectData[] = [...elements];
    const rectIndex = tempLocalData.findIndex((i: RectData) => i.id === rectId);

    copyEls[rectIndex] = getUpdatedRectData(
      initialRectData as RectData,
      originalCoordinate,
      modifiedGrabbedCoordinates
    );
    copyEls = handleOverlapping(copyEls);
    setTempLocalData(copyEls);
  }

  function paint() {
    if (!drawing) return;

    let copyEls: RectData[] = [...elements];
    const index = elements?.length - 1 ?? 0;
    const { x, y } = elements[index];

    copyEls[index] = {
      ...copyEls[index],
      x,
      y,
      width: coord.current.x - x,
      height: coord.current.y - y
    };
    copyEls = handleOverlapping(copyEls);
    setTempLocalData(copyEls);
  }

  function handlePointerMove() {
    if (drawing || grabbing || resizing) return;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const rectData = getRectByCoordinate(coord.current.x, coord.current.y);
    setRectId(rectData?.id ?? null);

    const direction = getDirectionByCoordinate(
      rectData,
      coord.current.x,
      coord.current.y
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
      style={
        loaded
          ? {
              padding: '2rem',
              border: '1px solid #333',
              borderRadius: '1rem',
              background: 'white'
            }
          : {}
      }
    >
      <div
        id='editing_area'
        style={{
          position: 'relative',
          width: 'fit-content',
          height: 'fit-content'
        }}
      >
        <div id='img-container' style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
          <img
            id='imported-floor-plan-image'
            src=''
            alt='floor-plan-image'
            onLoad={() => setLoaded(true)}
            style={{
              display: loaded ? 'block' : 'none',
              maxWidth: '80vw',
              maxHeight: '80vh'
            }}
          />
        </div>
        <canvas
          id='canvas'
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onPointerMove={handlePointerMove}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
        <div
          id='container'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          {(loaded &&
            elements?.map((el: RectData) => (
              <Rectangle
                rect={el}
                editable={editable}
                key={el.id}
                elements={elements}
                setElements={setElements}
              />
            ))) ??
            []}
        </div>
      </div>
      {!loaded && (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <SIconButton
            iconName={<IoAddCircleOutline />}
            iconSize='4rem'
            variant='light'
            style={{ borderRadius: '50%' }}
            onClick={() => {
              setEditable(true);
              swapContainerAndCanvas(true);
              setShowImportFloorPlanImageDialog(true);
              resetData();
            }}
          />
          <ImportFloorPlanImageDialog
            show={showImportFloorPlanImageDialog}
            onClose={() => setShowImportFloorPlanImageDialog(false)}
          />
        </div>
      )}
    </div>
  );
}

export default EditingArea;
