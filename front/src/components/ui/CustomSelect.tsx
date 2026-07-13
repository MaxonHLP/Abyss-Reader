import { useState, useRef, useEffect } from 'react';

export interface CustomSelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string; // Classes para el botón
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value || opt.value === Number(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate block mr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-[100] mt-1 w-full rounded-xl shadow-xl overflow-hidden origin-top transform transition-all duration-200 ease-out scale-100 opacity-100"
          style={{
            backgroundColor: 'var(--color-abyss-bg-nav, #0A5571)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <ul 
            className="py-1 max-h-60 overflow-y-auto"
            role="listbox"
          >
            <li
              role="option"
              aria-selected={value === ''}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="px-4 py-2.5 cursor-pointer transition-colors duration-150"
              style={{
                color: 'rgba(0, 230, 215, 0.6)', // cyan muted
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-abyss-bg-input-form-crear, #008C86)';
                e.currentTarget.style.color = '#25F7E9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(0, 230, 215, 0.6)';
              }}
            >
              {placeholder}
            </li>
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer transition-colors duration-150 ${isSelected ? 'font-bold' : 'font-medium'}`}
                  style={{
                    color: 'var(--color-abyss-navbar-text, #00E6D7)',
                    backgroundColor: isSelected ? 'rgba(0, 140, 134, 0.5)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-abyss-bg-input-form-crear, #008C86)';
                    e.currentTarget.style.color = '#25F7E9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? 'rgba(0, 140, 134, 0.5)' : 'transparent';
                    e.currentTarget.style.color = 'var(--color-abyss-navbar-text, #00E6D7)';
                  }}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
