import type { Rect } from '../types';

interface ComponentProps {
  rect: Rect;
  editable: boolean;
}

function Rectangle(props: ComponentProps) {
  const {
    rect: { id, x, y, width, height },
    editable
  } = props;

  return (
    <div
      id={id}
      draggable={editable}
      style={{
        position: 'absolute',
        top: `${height > 0 ? y : y + height}px`,
        left: `${width > 0 ? x : x + width}px`,
        width: `${Math.abs(width)}px`,
        height: `${Math.abs(height)}px`,
        cursor: `${editable ? 'grab' : 'pointer'}`
      }}
    />
  );
}

export default Rectangle;
