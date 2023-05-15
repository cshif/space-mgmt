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
  mapToRectData,
  getRectByCoordinate,
  getDirectionByCoordinate,
  getUpdatedRectData,
  editingRectOverlapWithOthers,
  swapContainerAndCanvas
} from '../utils';
import {
  Rect,
  RectData,
  GrabbedOrdinates,
  CursorStyles,
  Direction,
  Coordinate,
  Offset
} from '../types';
import defaultConfig, { color } from '../config';
import Rectangle from './Rectangle';
import { SIconButton } from './shared';
import { IoAddCircleOutline } from 'react-icons/io5';
import ImportFloorPlanImageDialog from './ImportFloorPlanImageDialog';

interface ComponentProps {
  loaded: boolean;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  elements: Rect[];
  setElements: Dispatch<SetStateAction<Rect[]>>;
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
    elements.forEach((el: Rect) => {
      rc.draw(el.rect);
    });
  }, [loaded, setLoaded, elements]);

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

    const newEl = createRect({
      id: `ref_${uuid()}`,
      x: coord.current.x,
      y: coord.current.y,
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
    coord.current = {
      x: event.pageX - offset.current.left,
      y: event.pageY - offset.current.top
    };

    if (drawing) {
      draw();
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

  function draw() {
    if (!drawing || rectId) return;

    const copyEls: Rect[] = [...elements];
    const index = elements.length - 1;
    const { x, y } = elements[index];

    let updatedRectData: RectData = {
      id: copyEls[index].id,
      x,
      y,
      width: coord.current.x - x,
      height: coord.current.y - y
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
          {loaded &&
            elements.map((el: Rect) => (
              <Rectangle
                rect={el}
                editable={editable}
                key={el.id}
                elements={elements}
                setElements={setElements}
              />
            ))}
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
