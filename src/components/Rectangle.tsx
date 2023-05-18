import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction
} from 'react';
import RBListGroup from 'react-bootstrap/ListGroup';
import { SIconButton } from './shared';
import { FiMoreVertical } from 'react-icons/fi';
import type { RectData } from '../types';
import { color } from '../config';
import { mapToRectData } from '../utils';
import SpaceInfoDialog from './SpaceInfoDialog';

interface ComponentProps {
  rect: RectData;
  editable: boolean;
  elements: RectData[];
  setElements: Dispatch<SetStateAction<RectData[]>>;
}

function Rectangle(props: ComponentProps) {
  const {
    rect: { id, x, y, width, height },
    editable,
    elements,
    setElements
  } = props;

  const tempLocalData: RectData[] =
    JSON.parse(localStorage.getItem('space_mgmt_temp_areas') as string) ?? [];
  const localData: RectData[] =
    JSON.parse(localStorage.getItem('space_mgmt_areas') as string) ?? [];

  const rectData: RectData | undefined = (
    editable ? tempLocalData : localData
  ).find((el) => el.id === id);

  const [showMoreList, setShowMoreList] = useState(false);

  function hideMoreList() {
    setShowMoreList(false);
  }

  const handleMouseOver = useCallback(() => {
    const rect = document.getElementById(id) as HTMLDivElement;
    if (!editable) {
      rect.style.outline = `5px dotted ${rectData?.info?.color}`;
    }
  }, [id, editable, rectData?.info?.color]);

  const handleMouseOut = useCallback(() => {
    const rect = document.getElementById(id) as HTMLDivElement;
    if (!editable) {
      rect.style.outline = '';
    }
  }, [id, editable]);

  useEffect(() => {
    window.addEventListener('click', hideMoreList);
    return () => {
      window.removeEventListener('click', hideMoreList);
    };
  });

  const [open, setOpen] = useState(false);

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
        background: `${rectData?.info?.color}33`,
        cursor: `${editable ? 'grab' : 'pointer'}`
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={() => setOpen(true)}
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
                <RBListGroup.Item action onClick={() => setOpen(true)}>
                  編輯
                </RBListGroup.Item>
                <RBListGroup.Item
                  action
                  onClick={() => {
                    const newEls: RectData[] = [...elements].filter(
                      (el) => el.id !== id
                    );
                    setElements(newEls);
                    localStorage.setItem(
                      'space_mgmt_temp_areas',
                      JSON.stringify(mapToRectData(newEls))
                    );
                  }}
                  style={{ color: color.error }}
                >
                  刪除
                </RBListGroup.Item>
              </RBListGroup>
            )}
          </>
        )}
      </div>
      <SpaceInfoDialog
        id={id}
        editable={editable}
        show={open}
        onClose={() => setOpen(false)}
        elements={elements}
        setElements={setElements}
      />
    </div>
  );
}

export default Rectangle;
