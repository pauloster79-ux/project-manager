import AdminLayout from './components/AdminLayout'

export default function Home() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Project Manager</h1>
          <p className="mt-2 text-gray-600">Your AI-powered project management platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600 mb-4">Get started with common tasks</p>
            <button className="btn-primary">Create Project</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Projects</h3>
            <p className="text-gray-600 mb-4">View your latest work</p>
            <button className="btn-secondary">View All</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">Track your progress</p>
            <button className="btn-secondary">View Reports</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
