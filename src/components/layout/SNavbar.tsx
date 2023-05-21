import { useState, ChangeEvent, useContext } from 'react';
import Context from '../../ctx';
import { navbar, rbNavbar, rbContainer, navbarTitle } from '../../assets/style';
import RBContainer from 'react-bootstrap/Container';
import RBNavbar from 'react-bootstrap/Navbar';
import RBForm from 'react-bootstrap/Form';
import { SIconButton, SVerticalSeparator } from '../shared';
import ImportFloorPlanImageDialog from '../ImportFloorPlanImageDialog';
import { resetData, swapContainerAndCanvas } from '../../utils';
import { RiSettings2Line } from 'react-icons/ri';
import { RiFileUploadLine } from 'react-icons/ri';
import { RiEraserLine } from 'react-icons/ri';
import { RiSave3Line } from 'react-icons/ri';
import { RiFileDownloadLine } from 'react-icons/ri';
import { RiEditLine } from 'react-icons/ri';

function SNavbar() {
  const { setLoaded, elements, setElements, editable, setEditable, collision } =
    useContext(Context);

  const [showImportFloorPlanImageDialog, setShowImportFloorPlanImageDialog] =
    useState(false);

  const defaultDocTitle = 'Untitled';
  const localTempDocTitle = localStorage.getItem('space_mgmt_temp_title');
  const [docTitle, setDocTitle] = useState(
    localTempDocTitle || defaultDocTitle
  );

  function editDocTitle(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    if (newValue == null || !newValue.length) {
      setDocTitle(defaultDocTitle);
      localStorage.setItem('space_mgmt_temp_title', defaultDocTitle);
    } else {
      setDocTitle(newValue);
      localStorage.setItem('space_mgmt_temp_title', newValue);
    }
  }

  function eraseDoc() {
    setElements([]);
    resetData();

    setLoaded(false);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = 0;
    canvas.height = 0;
  }

  function saveDoc() {
    setEditable(false);
    swapContainerAndCanvas(false);
    const tempDocTitle = localStorage.getItem('space_mgmt_temp_title');
    localStorage.setItem('space_mgmt_title', tempDocTitle || defaultDocTitle);
    const localTempImgFile = localStorage.getItem('space_mgmt_temp_file');
    localStorage.setItem('space_mgmt_file', localTempImgFile as string);
    const tempAreaData = localStorage.getItem('space_mgmt_temp_areas');
    localStorage.setItem('space_mgmt_areas', tempAreaData as string);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function editDoc() {
    setEditable(true);
    swapContainerAndCanvas(true);
    const localData = localStorage.getItem('space_mgmt_areas');
    const localImgFile = localStorage.getItem('space_mgmt_file');
    if (!localData || !localImgFile) resetData();
    else {
      localStorage.setItem('space_mgmt_temp_areas', localData);
      localStorage.setItem('space_mgmt_temp_file', localImgFile);
    }
  }

  return (
    <RBNavbar fixed='top' className={rbNavbar}>
      <RBContainer className={rbContainer}>
        <h1 className={navbarTitle}>好想空間</h1>
        <SVerticalSeparator />
        {editable ? (
          <RBForm.Control
            type='text'
            value={docTitle}
            onChange={editDocTitle}
            className={navbar}
          />
        ) : (
          <h1 className={navbarTitle}>{docTitle}</h1>
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
        <RBContainer className={rbContainer}>
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
            onClick={eraseDoc}
          />
          <SIconButton
            variant='light'
            iconName={<RiSave3Line />}
            iconSize='1.5rem'
            disabled={collision || !elements?.length}
            onClick={saveDoc}
          />
        </RBContainer>
      ) : (
        <RBContainer className={rbContainer}>
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
            onClick={editDoc}
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
