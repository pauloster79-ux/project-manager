'use client'

import clsx from 'clsx'
import { useState, useRef, useEffect } from 'react'

export function Combobox<T>({
  options,
  displayValue,
  filter,
  anchor = 'bottom',
  className,
  placeholder,
  autoFocus,
  'aria-label': ariaLabel,
  children,
  value,
  onChange,
  ...props
}: {
  options: T[]
  displayValue: (value: T | null) => string | undefined
  filter?: (value: T, query: string) => boolean
  className?: string
  placeholder?: string
  autoFocus?: boolean
  'aria-label'?: string
  children: (value: NonNullable<T>) => React.ReactElement
  value?: T | null
  onChange?: (value: T | null) => void
  anchor?: 'top' | 'bottom'
}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          filter ? filter(option, query) : displayValue(option)?.toLowerCase().includes(query.toLowerCase())
        )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        setSelectedIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setSelectedIndex((prev) => (prev + 1) % filteredOptions.length)
        e.preventDefault()
        break
      case 'ArrowUp':
        setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
        e.preventDefault()
        break
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          onChange?.(filteredOptions[selectedIndex])
          setIsOpen(false)
          setQuery('')
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        e.preventDefault()
        break
    }
  }

  const handleOptionClick = (option: T) => {
    onChange?.(option)
    setIsOpen(false)
    setQuery('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, isOpen])

  return (
    <div className="relative">
      <span
        data-slot="control"
        className={clsx([
          className,
          // Basic layout
          'relative block w-full',
          // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
          'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
          // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
          'dark:before:hidden',
          // Focus ring
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500',
          // Disabled state
          'has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none',
          // Invalid state
          'has-data-invalid:before:shadow-red-500/10',
        ])}
      >
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          data-slot="control"
          aria-label={ariaLabel}
          value={query || displayValue(value ?? null) || ''}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow option clicks
            setTimeout(() => setIsOpen(false), 150)
          }}
          placeholder={placeholder}
          className={clsx([
            className,
            // Basic layout
            'relative block w-full appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
            // Horizontal padding
            'pr-[calc(--spacing(10)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pr-[calc(--spacing(9)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
            // Typography
            'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
            // Border
            'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
            // Background color
            'bg-transparent dark:bg-white/5',
            // Hide default focus styles
            'focus:outline-hidden',
            // Invalid state
            'data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500',
            // Disabled state
            'data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/15',
            // System icons
            'dark:scheme-dark',
          ])}
        />
        <button
          type="button"
          className="group absolute inset-y-0 right-0 flex items-center px-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="size-5 stroke-zinc-500 group-data-disabled:stroke-zinc-600 group-data-hover:stroke-zinc-700 sm:size-4 dark:stroke-zinc-400 dark:group-data-hover:stroke-zinc-300 forced-colors:stroke-[CanvasText]"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
          >
            <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>
      
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={listRef}
          className={clsx(
            // Anchor positioning
            'absolute z-50 min-w-[calc(var(--input-width)+8px)] scroll-py-1 rounded-xl p-1 select-none',
            // Base styles
            'isolate overflow-y-scroll overscroll-contain',
            // Popover background
            'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
            // Shadows
            'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
            // Transitions
            'transition-opacity duration-100 ease-in',
            // Position based on anchor
            anchor === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            'left-0 right-0 max-h-60'
          )}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className={clsx(
                // Basic layout
                'group/option grid w-full cursor-default grid-cols-[1fr_--spacing(5)] items-baseline gap-x-2 rounded-lg py-2.5 pr-2 pl-3.5 sm:grid-cols-[1fr_--spacing(4)] sm:py-1.5 sm:pr-2 sm:pl-3',
                // Typography
                'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
                // Focus
                'outline-hidden hover:bg-blue-500 hover:text-white',
                // Forced colors mode
                'forced-color-adjust-none forced-colors:hover:bg-[Highlight] forced-colors:hover:text-[HighlightText]',
                // Selected state
                index === selectedIndex ? 'bg-blue-500 text-white' : '',
                // Disabled
                'data-disabled:opacity-50'
              )}
              onClick={() => handleOptionClick(option)}
            >
              <span className="flex min-w-0 items-center">
                {children(option)}
              </span>
              <svg
                className="relative col-start-2 hidden size-5 self-center stroke-current group-data-selected/option:inline sm:size-4"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ComboboxOption<T>({
  children,
  className,
  ...props
}: { className?: string; children?: React.ReactNode }) {
  let sharedClasses = clsx(
    // Base
    'flex min-w-0 items-center',
    // Icons
    '*:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 sm:*:data-[slot=icon]:size-4',
    '*:data-[slot=icon]:text-zinc-500 group-data-focus/option:*:data-[slot=icon]:text-white dark:*:data-[slot=icon]:text-zinc-400',
    'forced-colors:*:data-[slot=icon]:text-[CanvasText] forced-colors:group-data-focus/option:*:data-[slot=icon]:text-[Canvas]',
    // Avatars
    '*:data-[slot=avatar]:-mx-0.5 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:size-5'
  )

  return (
    <span className={clsx(className, sharedClasses)} {...props}>
      {children}
    </span>
  )
}

export function ComboboxLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'ml-2.5 truncate first:ml-0 sm:ml-2 sm:first:ml-0')} />
}

export function ComboboxDescription({ className, children, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'flex flex-1 overflow-hidden text-zinc-500 group-data-focus/option:text-white before:w-2 before:min-w-0 before:shrink dark:text-zinc-400'
      )}
    >
      <span className="flex-1 truncate">{children}</span>
    </span>
  )
}
