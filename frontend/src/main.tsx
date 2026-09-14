import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import App from './App';
import Login from './pages/Login';
import Lancamentos from './pages/Lancamentos';
import Resumo from './pages/Resumo';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <RotaProtegida>
                <App />
              </RotaProtegida>
            }
          >
            <Route index element={<Navigate to="/lancamentos" replace />} />
            <Route path="lancamentos" element={<Lancamentos />} />
            <Route path="resumo" element={<Resumo />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);