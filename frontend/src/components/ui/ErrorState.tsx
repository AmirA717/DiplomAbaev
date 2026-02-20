interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({ title = 'Не удалось загрузить данные', message }: ErrorStateProps) {
  return (
    <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-red-800" role="alert">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}


