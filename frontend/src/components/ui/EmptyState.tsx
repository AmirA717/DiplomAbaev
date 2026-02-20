interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-400 bg-slate-100 p-6 text-center">
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}


