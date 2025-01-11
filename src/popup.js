// src/popup.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import ServerConfigForm from './components/ServerConfigForm';
import './styles/index.css';

const Popup = () => {
  return (
    <div className="w-[600px] min-h-[500px] bg-slate-50 p-4">
      <header className="bg-gray-900 text-white py-6 px-4 rounded-lg mb-6">
        <div>
          <h1 className="text-3xl font-bold">ARSCFG</h1>
          <h2 className="text-sm">Arma Reforger Server Config Generator</h2>
        </div>
      </header>
      <main>
        <ServerConfigForm />
      </main>
    </div>
  );
};

// Wait for DOM to be ready before rendering
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
});