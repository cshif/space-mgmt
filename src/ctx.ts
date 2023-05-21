import { createContext, Dispatch, SetStateAction } from 'react';
import { RectData } from './types';

interface CtxValue {
  loaded: boolean;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  elements: RectData[];
  setElements: Dispatch<SetStateAction<RectData[]>>;
  editable: boolean;
  setEditable: Dispatch<SetStateAction<boolean>>;
  collision: boolean;
  setCollision: Dispatch<SetStateAction<boolean>>;
}

const Ctx = createContext<CtxValue>({
  loaded: false,
  setLoaded: () => ({}),
  elements: [],
  setElements: () => ({}),
  editable: false,
  setEditable: () => ({}),
  collision: false,
  setCollision: () => ({})
});

export default Ctx;
