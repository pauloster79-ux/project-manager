import NextLink from 'next/link'
import React, { forwardRef } from 'react'

export const Link = forwardRef(function Link(
  props: { href: string } & React.ComponentPropsWithoutRef<typeof NextLink>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return <NextLink {...props} ref={ref} />
})
