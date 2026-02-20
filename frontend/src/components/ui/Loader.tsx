interface LoaderProps {
  label?: string;
  fullPage?: boolean;
}

export function Loader({ label = 'Загрузка...', fullPage = false }: LoaderProps) {
  return (
    <div
      className={fullPage ? 'flex min-h-screen items-center justify-center p-6' : 'flex items-center justify-center p-6'}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl border-2 border-slate-300 bg-white px-6 py-4 text-slate-700">{label}</div>
    </div>
  );
}


