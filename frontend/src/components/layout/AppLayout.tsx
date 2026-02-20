import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/useAuth';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/profile', label: 'Профиль' },
  { to: '/stats', label: 'Статистика' },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b-4 border-slate-900 bg-slate-800 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-600 text-xl">
              🌐
            </div>
            <div>
              <p className="text-sm text-slate-300">Кибер-образование</p>
              <p className="font-semibold">{user?.fullName ?? user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md border-2 px-3 py-1 text-sm transition',
                    isActive
                      ? 'border-blue-300 bg-blue-600 text-white'
                      : 'border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'rounded-md border-2 px-3 py-1 text-sm transition',
                    isActive
                      ? 'border-amber-300 bg-amber-600 text-white'
                      : 'border-amber-700 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30',
                  )
                }
              >
                Админ
              </NavLink>
            ) : null}
          </nav>

          <Button variant="secondary" onClick={handleLogout} className="bg-slate-200">
            Выйти
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}



