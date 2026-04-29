import { FC, ReactNode } from 'react';

interface AuthFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  required?: boolean;
}

export const AuthField: FC<AuthFieldProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  required = true
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white font-black uppercase italic tracking-widest">{label}</label>
      <div className="flex items-center bg-white transform -skew-x-12 px-4 focus-within:ring-4 focus-within:ring-main transition-all">
        {icon}
        <input
          type={type}
          className="w-full bg-transparent border-none p-4 text-text-main font-black italic focus:outline-none transform skew-x-12"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      </div>
    </div>
  );
};
