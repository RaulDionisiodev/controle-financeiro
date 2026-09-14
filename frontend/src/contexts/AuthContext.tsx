import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { buscarUsuarioLogado, loginComGoogle, logout as logoutService, type Usuario } from '../services/authService';

interface AuthContextValor {
  usuario: Usuario | null;
  carregando: boolean;
  entrarComGoogle: (credential: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  async function entrarComGoogle(credential: string) {
    const dados = await loginComGoogle(credential);
    setUsuario(dados);
  }

  async function sair() {
    await logoutService();
    setUsuario(null);
    window.google?.accounts.id.disableAutoSelect();
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrarComGoogle, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}