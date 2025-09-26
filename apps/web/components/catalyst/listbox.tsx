'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { Fragment } from 'react'

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
  return (
    <Headless.Listbox value={value} onChange={onChange}>
      <div className={clsx('relative', className)} {...props}>
        <Headless.Listbox.Button
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          className={clsx([
            // Basic layout
            'group relative block w-full',
            // Button specific styles
            'cursor-default py-2 pl-3 pr-10 text-left',
            'border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20',
            'bg-white dark:bg-zinc-800/75',
            'rounded-lg shadow-sm',
            // Hide default focus styles
            'focus:outline-hidden',
            // Focus ring
            'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            // Disabled state
            'disabled:opacity-50',
          ])}
        >
          <span className="block truncate text-zinc-950 dark:text-white">
            {value ? (
              // Find the selected option and display its content
              (() => {
                const selectedOption = React.Children.toArray(options).find((child: any) => 
                  child?.props?.value === value
                ) as any;
                return selectedOption?.props?.children || placeholder || 'Select an option';
              })()
            ) : (
              placeholder || 'Select an option'
            )}
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
        </Headless.Listbox.Button>
        
        <Headless.Listbox.Options
          className={clsx(
            // Base styles
            'absolute z-50 w-full mt-1 rounded-lg p-1 select-none',
            // Handle scrolling when menu won't fit in viewport
            'overflow-y-auto max-h-60',
            // Popover background
            'bg-white dark:bg-zinc-800',
            // Shadows
            'shadow-lg border border-zinc-200 dark:border-zinc-700',
            // Transitions
            'transition-opacity duration-100 ease-in'
          )}
        >
          {options}
        </Headless.Listbox.Options>
      </div>
    </Headless.Listbox>
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
} & Omit<React.ComponentPropsWithoutRef<'li'>, 'value'>) {
  return (
    <Headless.Listbox.Option
      value={value}
      className={({ active, selected }) =>
        clsx(
          // Basic layout
          'group/option flex cursor-default items-center gap-2 rounded-lg py-2 px-3',
          // Typography
          'text-sm text-zinc-950 dark:text-white',
          // Focus and active states
          'outline-hidden',
          active ? 'bg-blue-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700',
          // Disabled
          'data-disabled:opacity-50',
          className
        )
      }
      {...props}
    >
      {({ selected }) => (
        <>
          <svg
            className={clsx(
              "relative size-5 self-center stroke-current sm:size-4",
              selected ? "inline" : "hidden"
            )}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="col-start-2">{children}</span>
        </>
      )}
    </Headless.Listbox.Option>
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