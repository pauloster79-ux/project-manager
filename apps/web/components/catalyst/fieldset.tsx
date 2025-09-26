import clsx from 'clsx'
import type React from 'react'

export function Fieldset({
  className,
  children,
  ...props
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <fieldset
      {...props}
      className={clsx(className, '*:data-[slot=text]:mt-1 [&>*+[data-slot=control]]:mt-6')}
    >
      {children}
    </fieldset>
  )
}

export function Legend({
  className,
  children,
  ...props
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <legend
      data-slot="legend"
      {...props}
      className={clsx(
        className,
        'text-base/6 font-semibold text-zinc-950 data-disabled:opacity-50 sm:text-sm/6 dark:text-white'
      )}
    >
      {children}
    </legend>
  )
}

export function FieldGroup({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div data-slot="control" {...props} className={clsx(className, 'space-y-8')} />
}

export function Field({ 
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
        '[&>[data-slot=label]+[data-slot=control]]:mt-3',
        '[&>[data-slot=label]+[data-slot=description]]:mt-1',
        '[&>[data-slot=description]+[data-slot=control]]:mt-3',
        '[&>[data-slot=control]+[data-slot=description]]:mt-3',
        '[&>[data-slot=control]+[data-slot=error]]:mt-3',
        '*:data-[slot=label]:font-medium'
      )}
    >
      {children}
    </div>
  )
}

export function Label({ 
  className, 
  children,
  ...props 
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <label
      data-slot="label"
      {...props}
      className={clsx(
        className,
        'text-base/6 text-zinc-950 select-none data-disabled:opacity-50 sm:text-sm/6 dark:text-white'
      )}
    >
      {children}
    </label>
  )
}

export function Description({
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
      className={clsx(className, 'text-base/6 text-zinc-500 data-disabled:opacity-50 sm:text-sm/6 dark:text-zinc-400')}
    >
      {children}
    </div>
  )
}

export function ErrorMessage({
  className,
  children,
  ...props
}: { 
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="error"
      {...props}
      className={clsx(className, 'text-base/6 text-red-600 data-disabled:opacity-50 sm:text-sm/6 dark:text-red-500')}
    >
      {children}
    </div>
  )
}
