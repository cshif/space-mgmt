import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction
} from 'react';
import { description, moreIcon, showMoreListContainer } from '../assets/style';
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

  const rectDiv = document.getElementById(id) as HTMLDivElement;
  const rectData: RectData | undefined = (
    editable ? tempLocalData : localData
  ).find((el) => el.id === id);

  const [showMoreList, setShowMoreList] = useState(false);

  function hideMoreList() {
    setShowMoreList(false);
  }

  function addOutline() {
    rectDiv.style.outline = `5px dotted ${rectData?.info?.color}`;
  }

  function removeOutline() {
    rectDiv.style.outline = '';
  }

  const handleMouseEnter = useCallback(() => {
    if (!editable) addOutline();
    setShowTooltip(true);
  }, [addOutline, editable]);

  const handleMouseLeave = useCallback(() => {
    if (!editable) removeOutline();
    setShowTooltip(false);
  }, [removeOutline, editable]);

  useEffect(() => {
    window.addEventListener('click', hideMoreList);
    return () => {
      window.removeEventListener('click', hideMoreList);
    };
  });

  const [openSpaceInfoDialog, setOpenSpaceInfoDialog] = useState(false);

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
        <p className={`${description} my-0`}>
          [描述] {rectData?.info?.description && <br />}{' '}
          {rectData?.info?.description ?? ''}
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
          setOpenSpaceInfoDialog(true);
          setShowTooltip(false);
          removeOutline();
        }}
      >
        <div className={showMoreListContainer}>
          {editable && (
            <>
              <SIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreList(true);
                  removeOutline();
                }}
                onMouseEnter={() => setShowTooltip(false)}
                iconName={<FiMoreVertical />}
                variant='secondary'
                iconColor='white'
                className={moreIcon}
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
                      setOpenSpaceInfoDialog(true);
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
          show={openSpaceInfoDialog}
          onClose={() => setOpenSpaceInfoDialog(false)}
          elements={elements}
          setElements={setElements}
        />
      </div>
    </RBOverlayTrigger>
  );
}

export default Rectangle;
