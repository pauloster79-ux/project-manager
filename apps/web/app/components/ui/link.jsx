import clsx from 'clsx'
import NextLink from 'next/link'
import { forwardRef } from 'react'

export const Link = forwardRef(function Link({ href, ...props }, ref) {
  return (
    <NextLink
      ref={ref}
      href={href}
      {...props}
      className={clsx(
        props.className,
        'inline-flex items-center gap-0.5 justify-center rounded-md text-sm font-medium outline-offset-2 transition active:transition-none',
        'text-zinc-500 hover:text-zinc-700 focus:outline-2 focus:outline-blue-500',
        'dark:text-zinc-400 dark:hover:text-zinc-300'
      )}
    />
  )
})
