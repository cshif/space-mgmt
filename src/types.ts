import type { Drawable, Options } from 'roughjs/bin/core';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Coordinate, Size {
  id: string;
  rect: Drawable;
}

export interface RectData extends Omit<Rect, 'rect'> {
  config?: Options;
}

export interface GrabbedOrdinates {
  initialX: number;
  initialY: number;
  finalX: number;
  finalY: number;
}

export enum CursorStyles {
  TH = 'ns-resize',
  BH = 'ns-resize',
  LV = 'ew-resize',
  RV = 'ew-resize',
  TR = 'nesw-resize',
  BL = 'nesw-resize',
  TL = 'nwse-resize',
  BR = 'nwse-resize'
}

export type Direction = keyof typeof CursorStyles;
export type CursorValue = `${CursorStyles}`;
export type CursorStyle = CursorValue | 'crosshair' | 'grab';

export interface Offset {
  top: number;
  left: number;
}
