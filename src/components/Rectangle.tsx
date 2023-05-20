import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction
} from 'react';
import RBOverlayTrigger from 'react-bootstrap/OverlayTrigger';
import RBTooltip from 'react-bootstrap/Tooltip';
import RBListGroup from 'react-bootstrap/ListGroup';
import { SIconButton } from './shared';
import { FiMoreVertical } from 'react-icons/fi';
import { OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger';
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

  const handleMouseEnter = useCallback(() => {
    const rect = document.getElementById(id) as HTMLDivElement;
    if (!editable) {
      rect.style.outline = `5px dotted ${rectData?.info?.color}`;
    }
    setShowTooltip(true);
  }, [id, editable, rectData?.info?.color]);

  const handleMouseLeave = useCallback(() => {
    const rect = document.getElementById(id) as HTMLDivElement;
    if (!editable) {
      rect.style.outline = '';
    }
    setShowTooltip(false);
  }, [id, editable]);

  useEffect(() => {
    window.addEventListener('click', hideMoreList);
    return () => {
      window.removeEventListener('click', hideMoreList);
    };
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);

  const renderTooltip = (props: OverlayTriggerRenderProps) => (
    <RBTooltip
      {...props}
      /* the workable solution came from https://github.com/react-bootstrap/react-bootstrap/issues/1622#issuecomment-1046807514 */
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ textAlign: 'left' }}>
        <p className='my-0'>
          [名稱] <br /> {rectData?.info?.name ?? ''}
        </p>
        <p
          className='my-0'
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 4,
            whiteSpace: 'pre-wrap'
          }}
        >
          [描述] <br /> {rectData?.info?.description ?? ''}
        </p>
      </div>
    </RBTooltip>
  );

  return (
    <RBOverlayTrigger
      show={showTooltip}
      placement='auto'
      overlay={editable ? <></> : renderTooltip}
    >
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          setOpenEditDialog(true);
          setShowTooltip(false);
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
                onMouseEnter={() => setShowTooltip(false)}
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
                    top: `${Math.abs(height) - 42}px`,
                    left: `${Math.abs(width) - 42}px`,
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                >
                  <RBListGroup.Item
                    action
                    onClick={() => {
                      setOpenEditDialog(true);
                    }}
                  >
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
          show={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          elements={elements}
          setElements={setElements}
        />
      </div>
    </RBOverlayTrigger>
  );
}

export default Rectangle;
