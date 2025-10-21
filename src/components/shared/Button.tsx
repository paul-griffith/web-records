/**
 * Reusable Button component
 */

import type { JSX } from 'preact';

interface ButtonProps {
  children: JSX.Element | string;
  onClick?: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  ariaLabel?: string;
}

export function Button({
  children,
  onClick,
  className = 'btn',
  disabled = false,
  type = 'button',
  title,
  ariaLabel
}: ButtonProps) {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
