import SimpleAdminLayout from '../components/SimpleAdminLayout'

export default function Updates() {
  return (
    <SimpleAdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Updates</h1>
            <p className="mt-2 text-gray-600">Project updates and announcements</p>
          </div>
          <button className="btn-primary">Create Update</button>
        </div>
        
        {/* Updates Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">John Doe</h3>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Project Alpha Milestone Completed</h4>
                  <p className="text-gray-600 mb-4">
                    We've successfully completed the user authentication module for Project Alpha. 
                    The team has implemented secure login, registration, and password reset functionality. 
                    Next up: Dashboard implementation.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📁 Project Alpha</span>
                    <span>👥 5 members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JS</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Jane Smith</h3>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Project Beta Planning Update</h4>
                  <p className="text-gray-600 mb-4">
                    Completed the initial planning phase for Project Beta. We've finalized the technical 
                    architecture and created detailed user stories. Development is scheduled to begin next week.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📁 Project Beta</span>
                    <span>👥 3 members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">MJ</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Mike Johnson</h3>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Risk Mitigation Plan</h4>
                  <p className="text-gray-600 mb-4">
                    Identified a potential risk with the third-party API integration. We've created a 
                    backup plan and are exploring alternative solutions. Will provide more details in 
                    the next team meeting.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>⚠️ Risk Management</span>
                    <span>👥 All teams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
