import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css'; // <--- ADICIONE ESTA LINHA IMPORTANTE

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}