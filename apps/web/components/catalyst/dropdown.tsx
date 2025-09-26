'use client'

import clsx from 'clsx'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Link } from './link'

export function Dropdown({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props}>{children}</div>
}

export function DropdownButton<T extends React.ElementType = typeof Button>({
  as: Component = Button as any,
  ...props
}: { className?: string } & Omit<React.ComponentPropsWithoutRef<T>, 'className'>) {
  return <Component {...props} />
}

export function DropdownMenu({
  anchor = 'bottom',
  className,
  children,
  ...props
}: { 
  className?: string
  anchor?: 'top' | 'bottom'
  children: React.ReactNode
}) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        // Anchor positioning
        '[--anchor-gap:--spacing(2)] [--anchor-padding:--spacing(1)] data-[anchor~=end]:[--anchor-offset:6px] data-[anchor~=start]:[--anchor-offset:-6px] sm:data-[anchor~=end]:[--anchor-offset:4px] sm:data-[anchor~=start]:[--anchor-offset:-4px]',
        // Base styles
        'isolate w-max rounded-xl p-1',
        // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
        'outline outline-transparent focus:outline-hidden',
        // Handle scrolling when menu won't fit in viewport
        'overflow-y-auto',
        // Popover background
        'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
        // Shadows
        'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
        // Define grid at the menu level if subgrid is supported
        'supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr_1.5rem_0.5rem_auto]',
        // Transitions
        'transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0'
      )}
    >
      {children}
    </div>
  )
}

export function DropdownItem({
  className,
  href,
  children,
  ...props
}: { 
  className?: string
  href?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'children'>) {
  let classes = clsx(
    className,
    // Base styles
    'group cursor-default rounded-lg px-3.5 py-2.5 focus:outline-hidden sm:px-3 sm:py-1.5',
    // Text styles
    'text-left text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
    // Focus
    'data-focus:bg-blue-500 data-focus:text-white',
    // Disabled state
    'data-disabled:opacity-50',
    // Forced colors mode
    'forced-color-adjust-none forced-colors:data-focus:bg-[Highlight] forced-colors:data-focus:text-[HighlightText] forced-colors:data-focus:*:data-[slot=icon]:text-[HighlightText]',
    // Use subgrid when available but fallback to an explicit grid layout if not
    'col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center supports-[grid-template-columns:subgrid]:grid-cols-subgrid',
    // Icons
    '*:data-[slot=icon]:col-start-1 *:data-[slot=icon]:row-start-1 *:data-[slot=icon]:mr-2.5 *:data-[slot=icon]:-ml-0.5 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:mr-2 sm:*:data-[slot=icon]:size-4',
    '*:data-[slot=icon]:text-zinc-500 data-focus:*:data-[slot=icon]:text-white dark:*:data-[slot=icon]:text-zinc-400 dark:data-focus:*:data-[slot=icon]:text-white',
    // Avatar
    '*:data-[slot=avatar]:mr-2.5 *:data-[slot=avatar]:-ml-1 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:mr-2 sm:*:data-[slot=avatar]:size-5'
  )

  return href ? (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

export function DropdownHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(className, 'col-span-5 px-3.5 pt-2.5 pb-1 sm:px-3')} />
}

export function DropdownSection({
  className,
  children,
  ...props
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        // Define grid at the section level instead of the item level if subgrid is supported
        'col-span-full supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr_1.5rem_0.5rem_auto]'
      )}
    >
      {children}
    </div>
  )
}

export function DropdownHeading({
  className,
  children,
  ...props
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'col-span-full grid grid-cols-[1fr_auto] gap-x-12 px-3.5 pt-2 pb-1 text-sm/5 font-medium text-zinc-500 sm:px-3 sm:text-xs/5 dark:text-zinc-400'
      )}
    >
      {children}
    </div>
  )
}

export function DropdownDivider({
  className,
  ...props
}: { className?: string }) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'col-span-full mx-3.5 my-1 h-px border-0 bg-zinc-950/5 sm:mx-3 dark:bg-white/10 forced-colors:bg-[CanvasText]'
      )}
    />
  )
}

export function DropdownLabel({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} data-slot="label" className={clsx(className, 'col-start-2 row-start-1')} {...props} />
}

export function DropdownDescription({
  className,
  children,
  ...props
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="description"
      {...props}
      className={clsx(
        className,
        'col-span-2 col-start-2 row-start-2 text-sm/5 text-zinc-500 group-data-focus:text-white sm:text-xs/5 dark:text-zinc-400 forced-colors:group-data-focus:text-[HighlightText]'
      )}
    >
      {children}
    </div>
  )
}

export function DropdownShortcut({
  keys,
  className,
  ...props
}: { 
  keys: string | string[]
  className?: string
}) {
  return (
    <kbd
      {...props}
      className={clsx(className, 'col-start-5 row-start-1 flex justify-self-end')}
    >
      {(Array.isArray(keys) ? keys : keys.split('')).map((char, index) => (
        <kbd
          key={index}
          className={clsx([
            'min-w-[2ch] text-center font-sans text-zinc-400 capitalize group-data-focus:text-white forced-colors:group-data-focus:text-[HighlightText]',
            // Make sure key names that are longer than one character (like "Tab") have extra space
            index > 0 && char.length > 1 && 'pl-1',
          ])}
        >
          {char}
        </kbd>
      ))}
    </kbd>
  )
}
