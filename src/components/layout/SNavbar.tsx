import { Dispatch, SetStateAction, useState } from 'react';
import { css } from '@linaria/core';
import RBContainer from 'react-bootstrap/Container';
import RBNavbar from 'react-bootstrap/Navbar';
import { SIconButton, SVerticalSeparator } from '../shared';
import ImportFloorPlanImageDialog from '../ImportFloorPlanImageDialog';
import { Rect } from '../../types';
import { swapContainerAndCanvas } from '../../utils';
import { RiSettings2Line } from 'react-icons/ri';
import { RiFileUploadLine } from 'react-icons/ri';
import { RiEraserLine } from 'react-icons/ri';
import { RiSave3Line } from 'react-icons/ri';
import { RiFileDownloadLine } from 'react-icons/ri';
import { RiEditLine } from 'react-icons/ri';

const rb_navbar = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
`;

const rb_container = css`
  display: flex;
  flex-basis: fit-content;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(5, 0, 56, 0.08);
  background: #fff;
`;

const title = css`
  margin-bottom: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

interface ComponentProps {
  setLoaded: Dispatch<SetStateAction<boolean>>;
  elements: Rect[];
  setElements: Dispatch<SetStateAction<Rect[]>>;
  editable: boolean;
  setEditable: Dispatch<SetStateAction<boolean>>;
  collision: boolean;
}

function SNavbar({
  setLoaded,
  elements,
  setElements,
  editable,
  setEditable,
  collision
}: ComponentProps) {
  const [showImportFloorPlanImageDialog, setShowImportFloorPlanImageDialog] =
    useState(false);

  return (
    <RBNavbar fixed='top' className={rb_navbar}>
      <RBContainer className={rb_container}>
        <h1 className={title}>好想空間</h1>
        <SVerticalSeparator />
        <h1 className={title}>Untitled</h1>
        <SVerticalSeparator />
        <SIconButton
          variant='light'
          iconName={<RiSettings2Line />}
          iconSize='1.5rem'
          onClick={() => console.log('設定')}
        />
      </RBContainer>
      {editable ? (
        <RBContainer className={rb_container}>
          <SIconButton
            variant='light'
            iconName={<RiFileUploadLine />}
            iconSize='1.5rem'
            onClick={() => {
              setShowImportFloorPlanImageDialog(true);
            }}
          />
          <SVerticalSeparator />
          <SIconButton
            variant='light'
            iconName={<RiEraserLine />}
            iconSize='1.5rem'
            onClick={() => {
              console.log('清除');
              setElements([]);
              localStorage.removeItem('space_mgmt_temp_areas');
              localStorage.removeItem('space_mgmt_areas');
              localStorage.removeItem('space_mgmt_temp_file');
              localStorage.removeItem('space_mgmt_file');

              setLoaded(false);

              const canvas = document.getElementById(
                'canvas'
              ) as HTMLCanvasElement;
              canvas.width = 0;
              canvas.height = 0;
            }}
          />
          <SIconButton
            variant='light'
            iconName={<RiSave3Line />}
            iconSize='1.5rem'
            disabled={collision || !elements.length}
            onClick={() => {
              console.log('儲存');
              setEditable(false);
              swapContainerAndCanvas(false);
              const tempFile = localStorage.getItem('space_mgmt_temp_file');
              localStorage.setItem('space_mgmt_file', tempFile as string);
              const tempAreaData = localStorage.getItem(
                'space_mgmt_temp_areas'
              );
              localStorage.setItem('space_mgmt_areas', tempAreaData as string);
            }}
          />
        </RBContainer>
      ) : (
        <RBContainer className={rb_container}>
          <SIconButton
            variant='light'
            iconName={<RiFileDownloadLine />}
            iconSize='1.5rem'
            onClick={() => console.log('下載')}
          />
          <SVerticalSeparator />
          <SIconButton
            variant='light'
            iconName={<RiEditLine />}
            iconSize='1.5rem'
            onClick={() => {
              console.log('編輯');
              setEditable(true);
              swapContainerAndCanvas(true);
            }}
          />
        </RBContainer>
      )}
      <ImportFloorPlanImageDialog
        show={showImportFloorPlanImageDialog}
        onClose={() => setShowImportFloorPlanImageDialog(false)}
      />
    </RBNavbar>
  );
}

export default SNavbar;
