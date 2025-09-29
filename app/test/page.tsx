export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Deployment Test Page</h1>
      <p>If you can see this, the deployment is working!</p>
      <p>Current time: {new Date().toISOString()}</p>
      <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go to Login Page
      </a>
    </div>
  );
}
