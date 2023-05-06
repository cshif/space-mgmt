import type { Drawable } from 'roughjs/bin/core';

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

export type RectData = Omit<Rect, 'rect'>;

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
