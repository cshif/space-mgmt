import gen from './rough';
import type { Drawable } from 'roughjs/bin/core';
import type {
  Rect,
  RectData,
  GrabbedOrdinates,
  Direction,
  Coordinate,
  Offset
} from './types';
import { defaultConfig } from './config';

export function createRect({
  id,
  x,
  y,
  width,
  height,
  info,
  config = defaultConfig
}: RectData): Rect {
  const rect: Drawable = gen.rectangle(x, y, width, height, config);
  return { id, x, y, width, height, info, config, rect };
}

export function getEditingAreaOffset(): Offset {
  const editingArea = document.getElementById('editing_area'),
    bodyRect = document.body.getBoundingClientRect(),
    editingAreaRect = editingArea?.getBoundingClientRect() ?? null;
  if (editingAreaRect == null) return { top: 0, left: 0 };
  return {
    top: editingAreaRect.top - bodyRect.top,
    left: editingAreaRect.left - bodyRect.left
  };
}

export function formatRawRectData(rectData: RectData): RectData {
  return {
    ...rectData,
    x: rectData.width > 0 ? rectData.x : rectData.x + rectData.width,
    y: rectData.height > 0 ? rectData.y : rectData.y + rectData.height,
    width: Math.abs(rectData.width),
    height: Math.abs(rectData.height)
  };
}

export function mapToRectData(arr: Rect[] | RectData[]): RectData[] {
  return arr?.map?.(formatRawRectData);
}

export function getRectByCoordinate(
  coordX: number,
  coordY: number
): RectData | null {
  const localData = JSON.parse(
    localStorage.getItem('space_mgmt_temp_areas') as string
  );
  return (
    localData?.find((el: RectData) => {
      const xRange = coordX > el.x && coordX < el.x + Math.abs(el.width);
      const yRange = coordY > el.y && coordY < el.y + Math.abs(el.height);
      return xRange && yRange;
    }) ?? null
  );
}

export function getDirectionByCoordinate(
  rectData: RectData | null,
  pageX: number,
  pageY: number
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
  //   (pageX >= topLeft.x) && (pageX <= topLeft.x + offset) &&
  //   (pageY >= topLeft.y) && (pageY <= topLeft.y + offset)
  // const aroundTopRightCorner =
  //   (pageX >= topRight.x - offset) && (pageX <= topRight.x) &&
  //   (pageY >= topRight.y) && (pageY <= topRight.y + offset)
  const aroundBottomRightCorner =
    pageX >= bottomRight.x - offset &&
    pageX <= bottomRight.x &&
    pageY >= bottomRight.y - offset &&
    pageY <= bottomRight.y;
  // const aroundBottomLeftCorner =
  //   (pageX >= bottomLeft.x) && (pageX <= bottomLeft.x + offset) &&
  //   (pageY >= bottomLeft.y - offset) && (pageY <= bottomLeft.y)
  // const aroundTopHorizontalBorder =
  //   (pageX >= topLeft.x) && (pageX <= topLeft.x + width) &&
  //   (pageY >= topLeft.y) && (pageY <= topLeft.y + offset)
  // const aroundBottomHorizontalBorder =
  //   (pageX >= bottomLeft.x) && (pageX <= bottomLeft.x + width) &&
  //   (pageY >= bottomLeft.y - offset) && (pageY <= bottomLeft.y)
  // const aroundLeftVerticalBorder =
  //   (pageX >= topLeft.x) && (pageX <= topLeft.x + offset) &&
  //   (pageY >= topLeft.y) && (pageY <= topLeft.y + height)
  // const aroundRightVerticalBorder =
  //   (pageX >= topRight.x - offset) && (pageX <= topRight.x) &&
  //   (pageY >= topRight.y) && (pageY <= topRight.y + height)

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
  const { x: initialX, y: initialY } = originalCoordinate;
  const { finalX, finalY } = grabbedOrdinates;

  const diffX = finalX - initialX;
  const diffY = finalY - initialY;
  return {
    ...rectData,
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
export function overlappingRectId(
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

export function swapContainerAndCanvas(editable: boolean): void {
  const editingAreaNode = document.getElementById(
    'editing_area'
  ) as HTMLElement;
  const containerNode = document.getElementById('container') as HTMLElement;
  const canvasNode = document.getElementById('canvas') as HTMLElement;

  if (editable) {
    editingAreaNode.insertBefore(containerNode, canvasNode);
  } else {
    editingAreaNode.insertBefore(canvasNode, containerNode);
  }
}
