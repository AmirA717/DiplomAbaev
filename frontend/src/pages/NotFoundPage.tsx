import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border-4 border-slate-800 bg-white p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Страница не найдена</h1>
        <p className="mt-3 text-slate-600">Возможно, ссылка устарела или была введена с ошибкой.</p>
        <div className="mt-6">
          <Link to="/">
            <Button>На главную</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


