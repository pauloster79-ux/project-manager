import CatalystAdminLayout from './components/CatalystAdminLayout'
import { Button } from './components/ui/button'

export default function Home() {
  return (
    <CatalystAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome to Project Manager</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Your AI-powered project management platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Quick Actions</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Get started with common tasks</p>
            <Button color="blue">Create Project</Button>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Recent Projects</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">View your latest work</p>
            <Button outline>View All</Button>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Analytics</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Track your progress</p>
            <Button outline>View Reports</Button>
          </div>
        </div>
      </div>
    </CatalystAdminLayout>
  )
}
