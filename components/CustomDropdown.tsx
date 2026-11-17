'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ThemeConfig } from '@/lib/theme';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  tagline?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  themeGlow?: string;
}

interface CustomDropdownProps<T extends string> {
  id: string;
  label: string;
  options: readonly DropdownOption<T>[] | DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  theme: ThemeConfig;
  leadingIcon?: ReactNode;
}

export default function CustomDropdown<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  theme,
  leadingIcon,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((o) => o.value === value));
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((o) => o.value === value));
      } else {
        setHighlightedIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen((prev) => !prev);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
  };

  const SelectedIcon = selectedOption.icon;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className={`text-xs font-semibold ${theme.inkMuted}`}
      >
        {label}
      </label>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        aria-labelledby={`${id}-label ${id}-trigger`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer ${
          theme.tray
        } ${theme.border} ${theme.borderHover} ${
          isOpen ? 'ring-2 ring-[#00D2FF]/40 border-[#00D2FF]/60' : ''
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {SelectedIcon ? (
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-xs ${
                selectedOption.themeGlow ??
                'bg-white/5 border-white/10 text-cyan-400'
              }`}
            >
              <SelectedIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          ) : leadingIcon ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-400">
              {leadingIcon}
            </div>
          ) : null}

          <div className="flex flex-col min-w-0 leading-tight">
            <span className={`text-sm font-semibold truncate ${theme.ink}`}>
              {selectedOption.label}
            </span>
            {selectedOption.tagline ? (
              <span className={`text-[11px] truncate ${theme.inkSubtle}`}>
                {selectedOption.tagline}
              </span>
            ) : null}
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            theme.inkSubtle
          } ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Animated Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={`${id}-menu`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`absolute top-full left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border p-1.5 shadow-2xl backdrop-blur-md ${
              theme.panel
            } ${theme.border}`}
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const isHighlighted = idx === highlightedIndex;
              const OptionIcon = option.icon;

              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-100 cursor-pointer ${
                    isSelected
                      ? theme.isDark
                        ? 'bg-[#192336] text-white'
                        : 'bg-[#F2ECE1] text-[#1A1715]'
                      : isHighlighted
                      ? theme.isDark
                        ? 'bg-[#151D2C]'
                        : 'bg-[#F7F3EB]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {OptionIcon ? (
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs ${
                        option.themeGlow ??
                        'bg-white/5 border-white/10 text-cyan-400'
                      }`}
                    >
                      <OptionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-cyan-400 font-bold' : theme.ink
                        }`}
                      >
                        {option.label}
                      </span>
                      {isSelected ? (
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-cyan-400"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>

                    {option.tagline ? (
                      <p className={`text-[10.5px] font-medium text-cyan-500/90`}>
                        {option.tagline}
                      </p>
                    ) : null}

                    {option.description ? (
                      <p className={`text-[11px] leading-snug mt-0.5 ${theme.inkSubtle}`}>
                        {option.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
