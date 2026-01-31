"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/app/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const descriptionId = hint || error ? `${inputId}-description` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
          className={cn(
            "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
            error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
            className
          )}
          {...props}
        />
        {(hint || error) && (
          <p
            id={descriptionId}
            className={cn(
              "text-xs",
              error ? "text-rose-600" : "text-slate-500"
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
