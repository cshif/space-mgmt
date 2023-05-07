import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './assets/App.css';
import { invoke } from '@tauri-apps/api';

invoke('greet', { name: 'World' }).then((response) => console.log(response));

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
