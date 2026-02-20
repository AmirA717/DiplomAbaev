import { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const resolvedId = id ?? props.name;

  return (
    <label className="block space-y-2" htmlFor={resolvedId}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={resolvedId}
        className={cn(
          'w-full rounded-lg border-2 border-slate-500 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-red-700">{error}</span> : null}
    </label>
  );
}


