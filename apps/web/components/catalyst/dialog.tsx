import clsx from 'clsx'
import type React from 'react'

const sizes = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
}

export function Dialog({
  size = 'lg',
  className,
  children,
  open,
  onClose,
  ...props
}: { 
  size?: keyof typeof sizes
  className?: string
  children: React.ReactNode
  open?: boolean
  onClose?: () => void
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'onClose'>) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex w-screen justify-center overflow-y-auto bg-zinc-950/25 px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-16 dark:bg-zinc-950/50">
      <div className="fixed inset-0 w-screen overflow-y-auto pt-6 sm:pt-0">
        <div className="grid min-h-full grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr] sm:p-4">
          <div
            className={clsx(
              className,
              sizes[size],
              'row-start-2 w-full min-w-0 rounded-t-3xl bg-white p-8 shadow-lg ring-1 ring-zinc-950/10 sm:mb-auto sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10'
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DialogTitle({
  className,
  ...props
}: { className?: string } & React.ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      {...props}
      className={clsx(className, 'text-lg/6 font-semibold text-balance text-zinc-950 sm:text-base/6 dark:text-white')}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: { className?: string } & React.ComponentPropsWithoutRef<'p'>) {
  return <p {...props} className={clsx(className, 'mt-2 text-pretty text-zinc-500 dark:text-zinc-400')} />
}

export function DialogBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(className, 'mt-6')} />
}

export function DialogActions({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto'
      )}
    />
  )
}