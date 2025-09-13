import React from 'react';

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  className = '',
  ref,
  ...props
}) {
  const base = "bg-gray-500 hover:bg-sray-300 focus:bg-gray-100 text-slate-700 rounded-md mr-2 px-2 py-1";
  return (
    <input
      className={`${base} ${className}`.trim()}
      type={type}
      step={step}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ref={ref}
      {...props}
    />
  );
}
