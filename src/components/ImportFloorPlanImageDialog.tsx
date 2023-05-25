import { useState } from 'react';
import RBAlert from 'react-bootstrap/Alert';
import { floorPlanImg } from '../assets/style';
import RBButton from 'react-bootstrap/Button';
import RBModal from 'react-bootstrap/Modal';
import RBForm from 'react-bootstrap/Form';

interface ComponentProps {
  show: boolean;
  onClose: () => void;
}

function ImportFloorPlanImageDialog(props: ComponentProps) {
  const [file, setFile] = useState<File | null>(null);

  const [showAlert, setShowAlert] = useState(false);

  function importImg() {
    const input = document.getElementById(
      'floor-plan-image'
    ) as HTMLInputElement | null;
    const fileSizeConstraintByBytes = 3 * 1024 * 1024;
    if (input && input.files) {
      if (input.files[0]?.size > fileSizeConstraintByBytes) {
        setShowAlert(true);
        input.value = '';
        return;
      }
      setFile(input.files[0]);
      const previewImg = document.getElementById(
        'imported-image-preview'
      ) as HTMLImageElement;
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        previewImg.src = fileReader.result as string;
      });
      fileReader.readAsDataURL(input.files[0]);
      previewImg.style.display = 'block';
    }
  }

  function handleImport() {
    const img = document.getElementById(
      'imported-floor-plan-image'
    ) as HTMLImageElement;
    if (file) {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        img.src = fileReader.result as string;
        localStorage.setItem(
          'space_mgmt_temp_file',
          fileReader.result as string
        );
        localStorage.setItem('space_mgmt_file', fileReader.result as string);
      });
      fileReader.readAsDataURL(file);
      img.style.display = 'block';
    }
    props.onClose();
  }

  return (
    <RBModal show={props.show} onHide={props.onClose} centered>
      <RBModal.Header closeButton>
        <RBModal.Title>匯入平面圖</RBModal.Title>
      </RBModal.Header>
      <RBModal.Body>
        <RBForm.Group controlId='floor-plan-image'>
          <RBForm.Control
            type='file'
            accept='image/*'
            onChange={importImg}
            onClick={() => setShowAlert(false)}
          />
          {showAlert && (
            <RBAlert variant='danger' style={{ marginTop: '.5rem' }}>
              檔案大小超過 3MB
            </RBAlert>
          )}
        </RBForm.Group>
        <div>
          <img
            src=''
            id='imported-image-preview'
            alt='floor-plan-image'
            className={floorPlanImg}
          />
        </div>
      </RBModal.Body>
      <RBModal.Footer>
        <RBButton onClick={handleImport} disabled={showAlert}>
          匯入
        </RBButton>
      </RBModal.Footer>
    </RBModal>
  );
}

export default ImportFloorPlanImageDialog;
