import { style } from '@vanilla-extract/css';

export const description = style({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 4,
  whiteSpace: 'pre-wrap'
});

export const showMoreListContainer = style({
  width: '100%',
  height: '100%',
  position: 'relative'
});

export const moreIcon = style({
  borderRadius: '50%',
  position: 'absolute',
  bottom: '.5rem',
  right: '.5rem',
  zIndex: 1
});
