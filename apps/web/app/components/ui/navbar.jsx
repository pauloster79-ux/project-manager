import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

export const NavbarItem = forwardRef(function NavbarItem({ className, ...props }, ref) {
  return (
    <Headless.Button
      ref={ref}
      className={clsx(
        className,
        'relative flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-950/5 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
      )}
      {...props}
    />
  )
})
