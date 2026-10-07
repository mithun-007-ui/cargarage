'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, AlertCircle } from 'lucide-react';

export interface SelectOption {
  id: number | string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  id?: string;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: number | string | null;
  onChange: (selected: SelectOption | null) => void;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export default function SearchableSelect({
  id,
  label,
  placeholder = 'Type or select...',
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search query with currently selected value option
  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  useEffect(() => {
    if (selectedOption) {
      setSearchQuery(selectedOption.name);
    } else if (!isOpen) {
      setSearchQuery('');
    }
  }, [value, selectedOption, isOpen]);

  // Filter options based on user typing
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Close dropdown when clicking outside container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If input contains text that doesn't match selected option, reset or clear
        if (selectedOption) {
          setSearchQuery(selectedOption.name);
        } else {
          setSearchQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const handleSelect = (option: SelectOption) => {
    onChange(option);
    setSearchQuery(option.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    setHighlightedIndex(0);

    // If query is cleared or modified, notify parent if it no longer matches selected item
    if (selectedOption && query.trim() !== selectedOption.name) {
      // User is typing a new query; unset selection until a dropdown item is picked
      const exactMatch = options.find((o) => o.name.toLowerCase() === query.trim().toLowerCase());
      if (exactMatch) {
        onChange(exactMatch);
      } else {
        onChange(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % Math.max(filteredOptions.length, 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev === 0 ? Math.max(filteredOptions.length - 1, 0) : prev - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: disabled ? '#9CA3AF' : '#667085' }}
      >
        {label}
      </label>

      <div className="relative">
        {/* Optional Icon prefix */}
        {icon && (
          <span
            className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none"
            style={{ color: disabled ? '#D1D5DB' : '#9CA3AF' }}
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Select State first...' : placeholder}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          style={{
            display: 'block',
            width: '100%',
            paddingTop: '0.625rem',
            paddingBottom: '0.625rem',
            paddingLeft: icon ? '2.5rem' : '0.875rem',
            paddingRight: '2.5rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            color: disabled ? '#9CA3AF' : '#202020',
            background: disabled ? '#F3F4F6' : '#FFFFFF',
            border: `1px solid ${error ? '#EF4444' : isOpen ? '#E65313' : '#E2D8CE'}`,
            borderRadius: '0.5rem',
            outline: 'none',
            boxSizing: 'border-box',
            minHeight: '44px',
            cursor: disabled ? 'not-allowed' : 'text',
            boxShadow: isOpen ? '0 0 0 3px rgba(230,83,19,0.1)' : 'none',
          }}
        />

        {/* Dropdown Chevron indicator */}
        <span
          className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none transition-transform duration-200"
          style={{
            color: disabled ? '#D1D5DB' : '#9CA3AF',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDown size={16} />
        </span>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#EF4444' }}>
          <AlertCircle size={12} />
          <span>{error}</span>
        </p>
      )}

      {/* Floating Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl shadow-lg overflow-hidden border max-h-60 overflow-y-auto"
          style={{
            background: '#FFFFFF',
            borderColor: '#E2D8CE',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center italic">
              No results found for "{searchQuery}"
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedOption && String(selectedOption.id) === String(opt.id);
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={opt.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before select
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors"
                  style={{
                    background: isSelected
                      ? '#FFF3EE'
                      : isHighlighted
                      ? '#F8F5F0'
                      : 'transparent',
                    color: isSelected ? '#E65313' : '#202020',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <span className="truncate">{opt.name}</span>
                  {isSelected && <Check size={16} style={{ color: '#E65313' }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
