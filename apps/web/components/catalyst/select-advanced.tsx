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
            if (React.isValidElement(child) && child.type === SelectContent) {
              return child.props.children;
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
    <button
      ref={ref}
      className={clsx(
        "flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:ring-offset-zinc-900 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
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
      value={value}
      className={({ active }) =>
        clsx(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-zinc-100 focus:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50",
          active && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
          className
        )
      }
      {...props}
    >
      {({ selected }) => (
        <>
          <span className={clsx("absolute left-2 flex h-3.5 w-3.5 items-center justify-center", selected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400")}>
            {selected && (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          {children}
        </>
      )}
    </Headless.Listbox.Option>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    placeholder?: string;
  }
>(({ className, children, placeholder, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={clsx("block truncate", className)}
      {...props}
    >
      {children || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
