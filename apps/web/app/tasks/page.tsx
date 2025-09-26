import BasicLayout from '../components/BasicLayout'

export default function Tasks() {
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-2 text-gray-600">Track and manage your tasks</p>
          </div>
          <button className="btn-primary">Create Task</button>
        </div>
        
        {/* Task Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">All</button>
          <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50">To Do</button>
          <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50">In Progress</button>
          <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Completed</button>
        </div>
        
        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Design user authentication flow</h3>
                  <p className="text-sm text-gray-500">Project Alpha • Assigned to John Doe</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>
                <span className="text-sm text-gray-500">Due Dec 10</span>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Set up database schema</h3>
                  <p className="text-sm text-gray-500">Project Beta • Assigned to Jane Smith</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">To Do</span>
                <span className="text-sm text-gray-500">Due Dec 15</span>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 line-through">Create project wireframes</h3>
                  <p className="text-sm text-gray-500">Project Alpha • Completed by Mike Johnson</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                <span className="text-sm text-gray-500">Dec 5</span>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Implement API endpoints</h3>
                  <p className="text-sm text-gray-500">Project Gamma • Assigned to Sarah Wilson</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Overdue</span>
                <span className="text-sm text-gray-500">Due Dec 8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
