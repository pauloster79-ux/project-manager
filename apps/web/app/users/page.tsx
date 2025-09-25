import CatalystAdminLayout from '../components/CatalystAdminLayout'

export default function Users() {
  return (
    <CatalystAdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="mt-2 text-gray-600">Manage team members and permissions</p>
          </div>
          <button className="btn-primary">Invite User</button>
        </div>
        
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">22</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">👑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* User List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">John Doe</h3>
                  <p className="text-sm text-gray-500">john.doe@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Admin</span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JS</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Jane Smith</h3>
                  <p className="text-sm text-gray-500">jane.smith@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Manager</span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">MJ</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Mike Johnson</h3>
                  <p className="text-sm text-gray-500">mike.johnson@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Member</span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SW</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sarah Wilson</h3>
                  <p className="text-sm text-gray-500">sarah.wilson@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Member</span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
