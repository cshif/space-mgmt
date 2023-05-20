import { style } from '@vanilla-extract/css';

export const editingAreaRoot = style({
  padding: '2rem',
  border: '1px solid #333',
  borderRadius: '1rem',
  background: 'white'
});

export const editingArea = style({
  position: 'relative',
  width: 'fit-content',
  height: 'fit-content'
});

export const imgContainer = style({ maxWidth: '90vw', maxHeight: '90vh' });

export const importedFloorPlanImage = style({
  maxWidth: '80vw',
  maxHeight: '80vh'
});

export const canvas = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'block'
});

export const container = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
});

export const addIconContainer = style({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});
