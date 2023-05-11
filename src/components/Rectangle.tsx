import { MouseEvent, useState, useEffect } from 'react';
import RBListGroup from 'react-bootstrap/ListGroup';
import { SIconButton } from './shared';
import { FiMoreVertical } from 'react-icons/fi';
import type { Rect } from '../types';
import { color } from '../config';

interface ComponentProps {
  rect: Rect;
  editable: boolean;
}

function Rectangle(props: ComponentProps) {
  const {
    rect: { id, x, y, width, height },
    editable
  } = props;

  const [showMoreList, setShowMoreList] = useState(false);

  function hideMoreList() {
    setShowMoreList(false);
  }

  useEffect(() => {
    window.addEventListener('click', hideMoreList);
    return () => {
      window.removeEventListener('click', hideMoreList);
    };
  }, []);

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
        background: `${color.blueprint}1A`,
        cursor: `${editable ? 'grab' : 'pointer'}`
      }}
      onMouseOver={(e: MouseEvent) => {
        if (!editable) {
          (
            e.target as HTMLDivElement
          ).style.outline = `1px solid ${color.blueprint}`;
        }
      }}
      onMouseOut={(e: MouseEvent) => {
        if (!editable) {
          (e.target as HTMLDivElement).style.outline = '';
        }
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {editable && (
          <>
            <SIconButton
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreList(true);
              }}
              iconName={<FiMoreVertical />}
              variant='secondary'
              iconColor='white'
              style={{
                borderRadius: '50%',
                position: 'absolute',
                bottom: '.5rem',
                right: '.5rem',
                zIndex: 1
              }}
            />
            {showMoreList && (
              <RBListGroup
                style={{
                  minWidth: '144px',
                  padding: '2rem',
                  position: 'absolute',
                  top: `${height - 42}px`,
                  left: `${width - 42}px`,
                  cursor: 'pointer',
                  zIndex: 1
                }}
              >
                <RBListGroup.Item action onClick={() => console.log('編輯')}>
                  編輯
                </RBListGroup.Item>
                <RBListGroup.Item
                  action
                  onClick={() => console.log('刪除')}
                  style={{ color: color.error }}
                >
                  刪除
                </RBListGroup.Item>
              </RBListGroup>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Rectangle;