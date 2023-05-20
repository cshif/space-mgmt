import { Dispatch, SetStateAction, useState } from 'react';
import { css } from '@linaria/core';
import RBContainer from 'react-bootstrap/Container';
import RBNavbar from 'react-bootstrap/Navbar';
import RBForm from 'react-bootstrap/Form';
import { SIconButton, SVerticalSeparator } from '../shared';
import ImportFloorPlanImageDialog from '../ImportFloorPlanImageDialog';
import { RectData } from '../../types';
import { resetData, swapContainerAndCanvas } from '../../utils';
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
  min-width: fit-content;
  margin-bottom: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

interface ComponentProps {
  setLoaded: Dispatch<SetStateAction<boolean>>;
  elements: RectData[];
  setElements: Dispatch<SetStateAction<RectData[]>>;
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

  const defaultDocTitle = 'Untitled';
  const localTempDocTitle = localStorage.getItem('space_mgmt_temp_title');
  const [docTitle, setDocTitle] = useState(
    localTempDocTitle || defaultDocTitle
  );

  return (
    <RBNavbar fixed='top' className={rb_navbar}>
      <RBContainer className={rb_container}>
        <h1 className={title}>好想空間</h1>
        <SVerticalSeparator />
        {editable ? (
          <RBForm.Control
            type='text'
            value={docTitle}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue == null || !newValue.length) {
                setDocTitle(defaultDocTitle);
                localStorage.setItem('space_mgmt_temp_title', defaultDocTitle);
              } else {
                setDocTitle(newValue);
                localStorage.setItem('space_mgmt_temp_title', newValue);
              }
            }}
            style={{ minWidth: '160px', padding: '.3rem .75rem' }}
          />
        ) : (
          <h1 className={title}>{docTitle}</h1>
        )}
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
            disabled={collision || !elements?.length}
            onClick={() => {
              setEditable(false);
              swapContainerAndCanvas(false);
              const tempDocTitle = localStorage.getItem(
                'space_mgmt_temp_title'
              );
              localStorage.setItem(
                'space_mgmt_title',
                tempDocTitle || defaultDocTitle
              );
              const tempFile = localStorage.getItem('space_mgmt_temp_file');
              localStorage.setItem('space_mgmt_file', tempFile as string);
              const tempAreaData = localStorage.getItem(
                'space_mgmt_temp_areas'
              );
              localStorage.setItem('space_mgmt_areas', tempAreaData as string);

              const canvas = document.getElementById(
                'canvas'
              ) as HTMLCanvasElement;
              const ctx = canvas.getContext('2d');
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
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
              setEditable(true);
              swapContainerAndCanvas(true);
              resetData();
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
