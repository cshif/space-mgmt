import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import SNavbar from './components/layout/SNavbar';
import EditingArea from './components/EditingArea';
import { createRect, mapToRectData } from './utils.ts';
import { Rect, RectData } from './types.ts';

function App() {
  const localData: RectData[] = JSON.parse(
    localStorage.getItem('space_mgmt_areas') as string
  );
  const initElements: Rect[] =
    mapToRectData(localData)?.map?.((i: RectData) => createRect(i)) ?? [];
  const [elements, setElements] = useState<Rect[]>(initElements);

  const [editable, setEditable] = useState(false);

  const [collision, setCollision] = useState(false);

  return (
    <>
      <SNavbar
        elements={elements}
        setElements={setElements}
        editable={editable}
        setEditable={setEditable}
        collision={collision}
      />
      <EditingArea
        elements={elements}
        setElements={setElements}
        editable={editable}
        setCollision={setCollision}
      />
    </>
  );
}

export default App;
