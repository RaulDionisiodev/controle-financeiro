import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resposta: { credential: string }) => void }) => void;
          renderButton: (elemento: HTMLElement, opcoes: { theme: string; size: string; width?: number }) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

function Login() {
  const { entrarComGoogle, usuario } = useAuth();
  const navigate = useNavigate();
  const botaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (usuario) {
      navigate('/lancamentos', { replace: true });
    }
  }, [usuario, navigate]);


  useEffect(() => {
    function renderizarBotao() {
      if (!window.google || !botaoRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (resposta) => {
          try {
            await entrarComGoogle(resposta.credential);
          } catch(erro) {
            alert('Não foi possível entrar. Confirme se seu e-mail tem acesso liberado.');
          }
        },
      });

      window.google.accounts.id.renderButton(botaoRef.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
      });
    }

    if (window.google) {
      renderizarBotao();
    } else {
      const intervalo = setInterval(() => {
        if (window.google) {
          clearInterval(intervalo);
          renderizarBotao();
        }
      }, 100);
      return () => clearInterval(intervalo);
    }
  }, [entrarComGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-6">
        <h1 className="text-xl font-bold text-slate-800">Faz minhas contas!</h1>
        <p className="text-sm text-slate-500">Entre com sua conta Google para continuar</p>
        <div className="flex justify-center" ref={botaoRef} />
      </div>
    </div>
  );
}

export default Login;