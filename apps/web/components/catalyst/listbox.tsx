'use client'

import clsx from 'clsx'
import { Fragment, useState } from 'react'

export function Listbox<T>({
  className,
  placeholder,
  autoFocus,
  'aria-label': ariaLabel,
  children: options,
  value,
  onChange,
  ...props
}: {
  className?: string
  placeholder?: React.ReactNode
  autoFocus?: boolean
  'aria-label'?: string
  children?: React.ReactNode
  value?: T
  onChange?: (value: T) => void
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={clsx('relative', className)} {...props}>
      <button
        type="button"
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx([
          // Basic layout
          'group relative block w-full',
          // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
          'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
          // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
          'dark:before:hidden',
          // Hide default focus styles
          'focus:outline-hidden',
          // Focus ring
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset focus:after:ring-2 focus:after:ring-blue-500',
          // Disabled state
          'disabled:opacity-50 disabled:before:bg-zinc-950/5 disabled:before:shadow-none',
        ])}
      >
        <span className="block truncate text-zinc-500">
          {placeholder || 'Select an option'}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="size-5 stroke-zinc-500 group-disabled:stroke-zinc-600 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
          >
            <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div
          className={clsx(
            // Base styles
            'absolute z-50 w-full min-w-[calc(100%+1.75rem)] scroll-py-1 rounded-xl p-1 select-none',
            // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
            'outline outline-transparent focus:outline-hidden',
            // Handle scrolling when menu won't fit in viewport
            'overflow-y-scroll overscroll-contain',
            // Popover background
            'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
            // Shadows
            'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
            // Transitions
            'transition-opacity duration-100 ease-in'
          )}
        >
          {options}
        </div>
      )}
    </div>
  )
}

export function ListboxOption<T>({
  children,
  className,
  value,
  ...props
}: { 
  className?: string
  children?: React.ReactNode
  value: T
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'value'>) {
  return (
    <div
      {...props}
      className={clsx(
        // Basic layout
        'group/option grid cursor-default grid-cols-[--spacing(5)_1fr] items-baseline gap-x-2 rounded-lg py-2.5 pr-3.5 pl-2 sm:grid-cols-[--spacing(4)_1fr] sm:py-1.5 sm:pr-3 sm:pl-1.5',
        // Typography
        'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
        // Focus
        'outline-hidden hover:bg-blue-500 hover:text-white',
        // Forced colors mode
        'forced-color-adjust-none forced-colors:hover:bg-[Highlight] forced-colors:hover:text-[HighlightText]',
        // Disabled
        'data-disabled:opacity-50',
        className
      )}
    >
      <svg
        className="relative hidden size-5 self-center stroke-current group-data-selected/option:inline sm:size-4"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="col-start-2">{children}</span>
    </div>
  )
}

export function ListboxLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'ml-2.5 truncate first:ml-0 sm:ml-2 sm:first:ml-0')} />
}

export function ListboxDescription({ className, children, ...props }: React.ComponentPropsWithoutRef<'span'>) {
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