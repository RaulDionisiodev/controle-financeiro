import { Outlet, NavLink } from 'react-router';

function App() {
  const linkClasse = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Controle Financeiro</h1>
          <nav className="flex gap-2">
            <NavLink to="/lancamentos" className={linkClasse}>Lançamentos</NavLink>
            <NavLink to="/resumo" className={linkClasse}>Resumo</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default App;