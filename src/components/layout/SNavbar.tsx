import { Dispatch, SetStateAction, useState } from 'react';
import { css } from '@linaria/core';
import RBContainer from 'react-bootstrap/Container';
import RBNavbar from 'react-bootstrap/Navbar';
import { SIconButton, SVerticalSeparator } from '../shared';
import { Rect } from '../../types.ts';

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
  elements: Rect[];
  setElements: Dispatch<SetStateAction<Rect[]>>;
  collision: boolean;
}

function SNavbar({ elements, setElements, collision }: ComponentProps) {
  const [editable, setEditable] = useState(false);

  return (
    <RBNavbar fixed='top' className={rb_navbar}>
      <RBContainer className={rb_container}>
        <h1 className={title}>好想空間</h1>
        <SVerticalSeparator />
        <h1 className={title}>Untitled</h1>
        <SVerticalSeparator />
        <SIconButton
          variant='light'
          iconName='gear'
          iconSize='1.5rem'
          onClick={() => console.log('設定')}
        />
      </RBContainer>
      {editable ? (
        <RBContainer className={rb_container}>
          <SIconButton
            variant='light'
            iconName='file-earmark-plus'
            iconSize='1.5rem'
            onClick={() => console.log('上傳圖片')}
          />
          <SVerticalSeparator />
          <SIconButton
            variant='light'
            iconName='eraser'
            iconSize='1.5rem'
            onClick={() => {
              console.log('清除');
              setElements([]);
              localStorage.removeItem('space_mgmt_areas');
            }}
          />
          <SIconButton
            variant='light'
            iconName='save'
            iconSize='1.5rem'
            disabled={collision || !elements.length}
            onClick={() => {
              console.log('儲存');
              setEditable(false);
            }}
          />
        </RBContainer>
      ) : (
        <RBContainer className={rb_container}>
          <SIconButton
            variant='light'
            iconName='download'
            iconSize='1.5rem'
            onClick={() => console.log('下載')}
          />
          <SVerticalSeparator />
          <SIconButton
            variant='light'
            iconName='pen'
            iconSize='1.5rem'
            onClick={() => {
              console.log('編輯');
              setEditable(true);
            }}
          />
        </RBContainer>
      )}
    </RBNavbar>
  );
}

export default SNavbar;
