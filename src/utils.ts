import type {
  Rect,
  RectData,
  GrabbedOrdinates,
  Direction,
  Coordinate
} from './types';

export function mapToRectData(arr: Rect[] | RectData[]) {
  return arr?.map?.((i: RectData) => ({
    id: i.id,
    x: i.width > 0 ? i.x : i.x + i.width,
    y: i.height > 0 ? i.y : i.y + i.height,
    width: Math.abs(i.width),
    height: Math.abs(i.height)
  }));
}

export function getRectByCoordinate(
  clientX: number,
  clientY: number
): RectData | null {
  const localData = JSON.parse(
    localStorage.getItem('space_mgmt_areas') as string
  );
  return (
    localData?.find((el: RectData) => {
      const xRange = clientX > el.x && clientX < el.x + Math.abs(el.width);
      const yRange = clientY > el.y && clientY < el.y + Math.abs(el.height);
      return xRange && yRange;
    }) ?? null
  );
}

export function getDirectionByCoordinate(
  rectData: RectData | null,
  clientX: number,
  clientY: number
): Direction | false {
  if (rectData == null) return false;
  const { x, y, width, height } = rectData;
  const offset = 16;
  const { /* topLeft, topRight, */ bottomRight /*, bottomLeft */ } = {
    // topLeft: { x, y },
    // topRight: { x: x + width, y },
    bottomRight: { x: x + width, y: y + height }
    // bottomLeft: { x, y: y + height }
  };

  // const aroundTopLeftCorner =
  //   (clientX >= topLeft.x) && (clientX <= topLeft.x + offset) &&
  //   (clientY >= topLeft.y) && (clientY <= topLeft.y + offset)
  // const aroundTopRightCorner =
  //   (clientX >= topRight.x - offset) && (clientX <= topRight.x) &&
  //   (clientY >= topRight.y) && (clientY <= topRight.y + offset)
  const aroundBottomRightCorner =
    clientX >= bottomRight.x - offset &&
    clientX <= bottomRight.x &&
    clientY >= bottomRight.y - offset &&
    clientY <= bottomRight.y;
  // const aroundBottomLeftCorner =
  //   (clientX >= bottomLeft.x) && (clientX <= bottomLeft.x + offset) &&
  //   (clientY >= bottomLeft.y - offset) && (clientY <= bottomLeft.y)
  // const aroundTopHorizontalBorder =
  //   (clientX >= topLeft.x) && (clientX <= topLeft.x + width) &&
  //   (clientY >= topLeft.y) && (clientY <= topLeft.y + offset)
  // const aroundBottomHorizontalBorder =
  //   (clientX >= bottomLeft.x) && (clientX <= bottomLeft.x + width) &&
  //   (clientY >= bottomLeft.y - offset) && (clientY <= bottomLeft.y)
  // const aroundLeftVerticalBorder =
  //   (clientX >= topLeft.x) && (clientX <= topLeft.x + offset) &&
  //   (clientY >= topLeft.y) && (clientY <= topLeft.y + height)
  // const aroundRightVerticalBorder =
  //   (clientX >= topRight.x - offset) && (clientX <= topRight.x) &&
  //   (clientY >= topRight.y) && (clientY <= topRight.y + height)

  // if (aroundTopLeftCorner) return 'TL'
  // if (aroundTopRightCorner) return 'TR'
  if (aroundBottomRightCorner) return 'BR';
  // if (aroundBottomLeftCorner) return 'BL'
  // if (aroundTopHorizontalBorder) return 'TH'
  // if (aroundBottomHorizontalBorder) return 'BH'
  // if (aroundLeftVerticalBorder) return 'LV'
  // if (aroundRightVerticalBorder) return 'RV'
  return false;
}

export function getUpdatedRectData(
  rectData: RectData,
  originalCoordinate: Coordinate,
  grabbedOrdinates: GrabbedOrdinates
): RectData {
  const { id } = rectData;
  const { x: initialX, y: initialY } = originalCoordinate;
  const { finalX, finalY } = grabbedOrdinates;

  const diffX = finalX - initialX;
  const diffY = finalY - initialY;
  return {
    id,
    x: diffX > 0 ? initialX : finalX,
    y: diffY > 0 ? initialY : finalY,
    width: Math.abs(diffX),
    height: Math.abs(diffY)
  };
}

export function getReferenceCoordinateByDirection(
  rectData: RectData,
  direction: Direction
): Coordinate {
  const { x, y, width, height } = rectData;
  switch (direction) {
    case 'BR':
    case 'BH':
    case 'RV':
      return { x, y };
    case 'BL':
    case 'LV':
      return { x: x + width, y };
    case 'TL':
      return { x: x + width, y: y + height };
    case 'TH':
    case 'TR':
      return { x, y: y + height };
  }
}

// ref. https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
export function editingRectOverlapWithOthers(
  fixedRect: RectData,
  movingRect: RectData
): string | boolean {
  return fixedRect.x < movingRect.x + movingRect.width &&
    fixedRect.x + fixedRect.width > movingRect.x &&
    fixedRect.y < movingRect.y + movingRect.height &&
    fixedRect.height + fixedRect.y > movingRect.y
    ? fixedRect.id
    : false;
}