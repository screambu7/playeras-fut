/**
 * Componente base para grupos de filtros (checkbox)
 * Reutilizable y accesible
 */

"use client";

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function FilterGroup({
  title,
  children,
  className = "",
}: FilterGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

export function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
  count,
}: FilterCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-colors"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
      />
      <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </label>
  );
}
