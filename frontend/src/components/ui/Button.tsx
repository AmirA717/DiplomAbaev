import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-slate-700 border-slate-900 text-white hover:bg-slate-600',
  secondary: 'bg-slate-300 border-slate-600 text-slate-900 hover:bg-slate-200',
  ghost: 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-100 border-red-500 text-red-800 hover:bg-red-50',
};

export function Button({
  className,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-lg border-2 px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variantClassNames[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}


