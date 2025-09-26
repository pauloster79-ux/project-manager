"use client";

import { useRouter } from "next/navigation";
import * as Headless from "@headlessui/react";
import clsx from "clsx";

// Replace with GET /api/projects in Packet 7a
const STUB_PROJECTS = [
  { id: "demo", name: "Demo Project", icon: "⚙️" },
  { id: "alpha", name: "Alpha Rollout", icon: "🚀" },
];

export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  const currentProject = STUB_PROJECTS.find(p => p.id === currentProjectId);

  return (
    <Headless.Listbox
      value={currentProjectId}
      onChange={(id) => router.push(`/projects/${id}/risks`)}
    >
      <Headless.Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
        <span className="block truncate">
          {currentProject ? (
            <div className="flex items-center gap-2">
              <span>{currentProject.icon}</span>
              <span>{currentProject.name}</span>
            </div>
          ) : (
            "Select project"
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04L10 14.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </Headless.Listbox.Button>
      <Headless.Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {STUB_PROJECTS.map((project) => (
          <Headless.Listbox.Option
            key={project.id}
            value={project.id}
            className={({ active }) =>
              clsx(
                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-10 pr-4'
              )
            }
          >
            {({ selected }) => (
              <>
                <span className={clsx(selected ? 'font-medium' : 'font-normal', 'block truncate')}>
                  <div className="flex items-center gap-2">
                    <span>{project.icon}</span>
                    <span>{project.name}</span>
                  </div>
                </span>
                {selected ? (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : null}
              </>
            )}
          </Headless.Listbox.Option>
        ))}
      </Headless.Listbox.Options>
    </Headless.Listbox>
  );
}
