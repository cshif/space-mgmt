import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import SNavbar from './components/layout/SNavbar';
import EditingArea from './components/EditingArea';
import { createRect, mapToRectData } from './utils';
import { Rect, RectData } from './types';

function App() {
  const [loaded, setLoaded] = useState(false);

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
        setLoaded={setLoaded}
        elements={elements}
        setElements={setElements}
        editable={editable}
        setEditable={setEditable}
        collision={collision}
      />
      <EditingArea
        loaded={loaded}
        setLoaded={setLoaded}
        elements={elements}
        setElements={setElements}
        editable={editable}
        setEditable={setEditable}
        setCollision={setCollision}
      />
    </>
  );
}

export default App;
