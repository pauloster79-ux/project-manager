"use client";

import * as React from "react";
import * as Headless from "@headlessui/react";
import { clsx } from "clsx";

const Select = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }
>(({ className, children, value, onValueChange, disabled, ...props }, ref) => {
  return (
    <Headless.Listbox value={value} onChange={onValueChange} disabled={disabled}>
      <div className="relative">
        <Headless.Listbox.Button
          ref={ref}
          className={clsx(
            "flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:ring-offset-zinc-900 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500",
            className
          )}
          {...props}
        >
          {children}
        </Headless.Listbox.Button>
        <Headless.Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-800 dark:ring-zinc-700">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              return child;
            }
            return null;
          })}
        </Headless.Listbox.Options>
      </div>
    </Headless.Listbox>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={clsx(
        "flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    placeholder?: React.ReactNode;
  }
>(({ className, children, placeholder, ...props }, ref) => {
  return (
    <span ref={ref} className={clsx("block truncate", className)} {...props}>
      {children || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li"> & {
    value: string;
  }
>(({ className, children, value, ...props }, ref) => {
  return (
    <Headless.Listbox.Option
      ref={ref}
      value={value}
      className={({ active }) =>
        clsx(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          active ? "bg-blue-500 text-white" : "text-zinc-900 dark:text-white",
          className
        )
      }
      {...props}
    >
      {({ selected }) => (
        <>
          <span className="block truncate">{children}</span>
          {selected && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-blue-600 dark:text-blue-400">
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </>
      )}
    </Headless.Listbox.Option>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
