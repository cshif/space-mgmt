import { useState } from 'react';
import RBButton from 'react-bootstrap/Button';
import RBModal from 'react-bootstrap/Modal';
import RBForm from 'react-bootstrap/Form';

interface ComponentProps {
  show: boolean;
  onClose: () => void;
}

function ImportFloorPlanImageDialog(props: ComponentProps) {
  const [file, setFile] = useState<File | null>(null);

  function handleImport() {
    const img = document.getElementById(
      'imported-floor-plan-image'
    ) as HTMLImageElement;
    if (file != null) {
      img.src = URL.createObjectURL(file);
      img.style.display = 'block';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      img.onload?.(() => {
        URL.revokeObjectURL(img.src);
      });
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
            onChange={() => {
              const input = document.getElementById(
                'floor-plan-image'
              ) as HTMLInputElement | null;
              if (input && input.files) setFile(input.files[0]);
            }}
          />
        </RBForm.Group>
      </RBModal.Body>
      <RBModal.Footer>
        <RBButton onClick={handleImport}>匯入</RBButton>
      </RBModal.Footer>
    </RBModal>
  );
}

export default ImportFloorPlanImageDialog;
