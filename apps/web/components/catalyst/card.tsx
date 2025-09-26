import clsx from 'clsx'
import React from 'react'

export function Card({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card"
      className={clsx(
        className,
        // Base styles
        'group relative rounded-xl p-6 ring-1',
        // Background color
        'bg-white/50 dark:bg-zinc-800/50',
        // Ring color
        'ring-zinc-950/5 dark:ring-white/10',
        // Shadow
        'shadow-sm',
        // Hover
        'hover:shadow-md transition-shadow duration-200'
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={clsx(
        className,
        'flex flex-col space-y-1.5 pb-4'
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={clsx(
        className,
        'text-lg font-semibold leading-none tracking-tight text-zinc-900 dark:text-white'
      )}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={clsx(
        className,
        'text-sm text-zinc-600 dark:text-zinc-400'
      )}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={clsx(
        className,
        'pt-0'
      )}
      {...props}
    />
  )
}

export function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={clsx(
        className,
        'flex items-center pt-4'
      )}
      {...props}
    />
  )
}
