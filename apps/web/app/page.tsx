import BasicLayout from './components/BasicLayout'

export default function Home() {
  return (
    <BasicLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome to Project Manager</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Your AI-powered project management platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Quick Actions</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Get started with common tasks</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Create Project</button>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Recent Projects</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">View your latest work</p>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">View All</button>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Analytics</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Track your progress</p>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">View Reports</button>
          </div>
        </div>
      </div>
    </BasicLayout>
  )
}
