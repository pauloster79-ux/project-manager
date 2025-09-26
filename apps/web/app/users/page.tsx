'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Users() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Risks', href: '/risks' },
    { name: 'Updates', href: '/updates' },
    { name: 'Users', href: '/users' },
    { name: 'Settings', href: '/settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '256px', 
        height: '100vh', 
        backgroundColor: 'white', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
      }}>
        <div style={{ padding: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Project Manager
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
            AI-powered platform v4
          </p>
        </div>
        
        <nav style={{ marginTop: '32px' }}>
          <div style={{ padding: '0 16px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#6b7280', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              margin: 0
            }}>
              Navigation
            </h3>
          </div>
          <div style={{ marginTop: '16px' }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    margin: '4px 8px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#dbeafe' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#4b5563',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                      e.currentTarget.style.color = '#111827'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#4b5563'
                    }
                  }}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
        
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              height: '32px', 
              width: '32px', 
              backgroundColor: '#2563eb', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>JD</span>
            </div>
            <div style={{ marginLeft: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                John Doe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '256px' }}>
        {/* Top bar */}
        <header style={{ 
          backgroundColor: 'white', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          borderBottom: '1px solid #e5e7eb' 
        }}>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Users
                </h1>
                <select style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  outline: 'none'
                }}>
                  <option>Select Project</option>
                  <option>Project Alpha</option>
                  <option>Project Beta</option>
                  <option>Project Gamma</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Invite User
                </button>
                <div style={{ 
                  height: '32px', 
                  width: '32px', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>JD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Team Members
            </h1>
            <p style={{ marginTop: '8px', color: '#6b7280' }}>
              Manage your team and user permissions
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              User List
            </h3>
            <p style={{ color: '#6b7280' }}>
              Team members and their roles will appear here.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}