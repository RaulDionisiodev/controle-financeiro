import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import './index.css';
import App from './App';
import Lancamentos from './pages/Lancamentos';
import Resumo from './pages/Resumo';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/lancamentos" replace />} />
          <Route path="lancamentos" element={<Lancamentos />} />
          <Route path="resumo" element={<Resumo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);