import {
  Dispatch,
  SetStateAction,
  useState,
  ChangeEvent,
  MouseEvent
} from 'react';
import { closeIcon, fieldName } from '../assets/style';
import RBModal from 'react-bootstrap/Modal';
import RBForm from 'react-bootstrap/Form';
import RBButton from 'react-bootstrap/Button';
import { SIconButton } from './shared';
import { FiX } from 'react-icons/fi';
import { defaultInfo } from '../config';
import type { RectData, SpaceInfoForm } from '../types';
import { mapToRectData } from '../utils';

interface ComponentProps {
  id: RectData['id'];
  editable: boolean;
  show: boolean;
  onClose: () => void;
  elements: RectData[];
  setElements: Dispatch<SetStateAction<RectData[]>>;
}

function SpaceInfoDialog(props: ComponentProps) {
  const { id, editable, show, onClose, elements, setElements } = props;

  const localData: RectData[] = JSON.parse(
    localStorage.getItem('space_mgmt_temp_areas') as string
  );
  const rectIndex = localData.findIndex((i: RectData) => i.id === id);

  // TODO set default values from localStorage
  const [form, setForm] = useState<SpaceInfoForm>({
    name: localData[rectIndex]?.info?.name ?? defaultInfo.name,
    description:
      localData[rectIndex]?.info?.description ?? defaultInfo.description,
    color: localData[rectIndex]?.info?.color ?? defaultInfo.color
  });

  function setField(
    event: ChangeEvent<HTMLInputElement>,
    fieldName: keyof SpaceInfoForm
  ) {
    setForm({ ...form, [fieldName]: event.target.value });
  }

  function save(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const updatedRectData = {
      ...localData[rectIndex],
      config: {
        ...localData[rectIndex]?.config,
        fill: form.color,
        stroke: form.color
      },
      info: { ...localData[rectIndex]?.info, ...form }
    };
    const copyEls = [...elements];
    copyEls[rectIndex] = updatedRectData;
    setElements(copyEls);
    localStorage.setItem(
      'space_mgmt_temp_areas',
      JSON.stringify(mapToRectData(copyEls))
    );
    onClose();
  }

  return (
    <RBModal show={show} onHide={onClose} centered>
      <RBModal.Header>
        {editable ? (
          <RBModal.Title>編輯空間</RBModal.Title>
        ) : (
          <RBModal.Title>空間資訊</RBModal.Title>
        )}
        <SIconButton
          iconName={<FiX />}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          iconSize='1.5rem'
          className={closeIcon}
        />
      </RBModal.Header>
      <RBModal.Body>
        <RBForm>
          <RBForm.Group controlId='edit_name' style={{ marginBottom: '.5rem' }}>
            <RBForm.Label className={fieldName}>名稱</RBForm.Label>
            {editable ? (
              <RBForm.Control
                defaultValue={localData[rectIndex]?.info?.name ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setField(e, 'name')
                }
              />
            ) : (
              <p>{form.name}</p>
            )}
          </RBForm.Group>
          <RBForm.Group
            controlId='edit_description'
            style={{ marginBottom: '.5rem' }}
          >
            <RBForm.Label className={fieldName}>描述</RBForm.Label>
            {editable ? (
              <RBForm.Control
                as='textarea'
                rows={9}
                defaultValue={localData[rectIndex]?.info?.description ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setField(e, 'description')
                }
              />
            ) : (
              <p style={{ whiteSpace: 'pre-wrap' }}>{form.description}</p>
            )}
          </RBForm.Group>
          <RBForm.Group
            controlId='edit_color'
            style={{ marginBottom: '.5rem' }}
          >
            <RBForm.Label className={fieldName}>顏色</RBForm.Label>
            <RBForm.Control
              type='color'
              defaultValue={localData[rectIndex]?.info?.color ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField(e, 'color')
              }
              disabled={!editable}
              size='lg'
            />
          </RBForm.Group>
        </RBForm>
      </RBModal.Body>
      {editable && (
        <RBModal.Footer>
          <RBButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            variant='outline-secondary'
          >
            取消
          </RBButton>
          <RBButton onClick={save} variant='success'>
            儲存
          </RBButton>
        </RBModal.Footer>
      )}
    </RBModal>
  );
}

export default SpaceInfoDialog;
