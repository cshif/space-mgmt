import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import SNavbar from './components/layout/SNavbar';
import EditingArea from './components/EditingArea';
import { mapToRectData } from './utils';
import { RectData } from './types';

function App() {
  const [loaded, setLoaded] = useState(false);

  const localData: RectData[] = JSON.parse(
    localStorage.getItem('space_mgmt_areas') as string
  );
  const initElements: RectData[] = mapToRectData(localData);
  const [elements, setElements] = useState<RectData[]>(initElements ?? []);

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
