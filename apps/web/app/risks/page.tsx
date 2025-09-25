import AdminLayout from '../components/AdminLayout'

export default function Risks() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risks</h1>
            <p className="mt-2 text-gray-600">Identify and manage project risks</p>
          </div>
          <button className="btn-primary">Add Risk</button>
        </div>
        
        {/* Risk Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">🔴</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">🟡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">🟢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Risks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">High</span>
                    <h3 className="text-sm font-medium text-gray-900">Key team member availability</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Lead developer may be unavailable for 2 weeks due to personal commitments</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Project:</span> Alpha • <span className="font-medium">Owner:</span> Project Manager • <span className="font-medium">Due:</span> Dec 20
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View Details</button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                    <h3 className="text-sm font-medium text-gray-900">Third-party API dependency</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">External payment service may have downtime during critical launch period</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Project:</span> Beta • <span className="font-medium">Owner:</span> Tech Lead • <span className="font-medium">Due:</span> Jan 5
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View Details</button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                    <h3 className="text-sm font-medium text-gray-900">Budget overrun potential</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Current spending rate may exceed allocated budget by 15%</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Project:</span> Gamma • <span className="font-medium">Owner:</span> Finance Manager • <span className="font-medium">Due:</span> Dec 30
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
