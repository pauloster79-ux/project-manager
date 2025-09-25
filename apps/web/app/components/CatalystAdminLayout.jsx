'use client'

import { usePathname } from 'next/navigation'
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarBody, 
  SidebarFooter, 
  SidebarSection, 
  SidebarItem, 
  SidebarLabel,
  SidebarHeading 
} from './ui/sidebar'
import { SidebarLayout } from './ui/sidebar-layout'
import { Button } from './ui/button'

// Icons
function DashboardIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4ZM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6ZM11 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6Z" />
    </svg>
  )
}

function ProjectsIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4ZM3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6ZM11 9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6Z" />
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" />
    </svg>
  )
}

function RisksIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2L3 7v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7l-7-5ZM8 15v-3h4v3H8Z" />
    </svg>
  )
}

function UpdatesIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM9 5a1 1 0 0 1 2 0v4.586l2.707 2.707a1 1 0 0 1-1.414 1.414L9 10.414V5Z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  )
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Projects', href: '/projects', icon: ProjectsIcon },
  { name: 'Tasks', href: '/tasks', icon: TasksIcon },
  { name: 'Risks', href: '/risks', icon: RisksIcon },
  { name: 'Updates', href: '/updates', icon: UpdatesIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

export default function CatalystAdminLayout({ children }) {
  const pathname = usePathname()

  const sidebar = (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">PM</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Project Manager</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">AI-powered platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarBody>
        <SidebarSection>
          <SidebarHeading>Navigation</SidebarHeading>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarItem key={item.name} href={item.href} current={isActive}>
                <item.icon />
                <SidebarLabel>{item.name}</SidebarLabel>
              </SidebarItem>
            )
          })}
        </SidebarSection>
      </SidebarBody>
      
      <SidebarFooter>
        <SidebarSection>
          <SidebarItem>
            <UserIcon />
            <SidebarLabel>John Doe</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarFooter>
    </Sidebar>
  )

  const navbar = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Project Manager</h1>
        <select className="bg-white border border-zinc-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>Select Project</option>
          <option>Project Alpha</option>
          <option>Project Beta</option>
          <option>Project Gamma</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button color="blue" size="sm">Create Project</Button>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">JD</span>
        </div>
      </div>
    </div>
  )

  return (
    <SidebarLayout navbar={navbar} sidebar={sidebar}>
      {children}
    </SidebarLayout>
  )
}
