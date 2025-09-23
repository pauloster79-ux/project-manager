export const metadata = { title: "AI Project Hub" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin:0, fontFamily:"system-ui" }}>
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", minHeight:"100vh" }}>
          <aside style={{ borderRight:"1px solid #eee", padding:16 }}>
            <h2 style={{ marginTop:0 }}>Project Hub</h2>
            <nav>
              <a href="/projects">Projects</a><br/>
              <a href="/resources">Resources</a><br/>
              <a href="/settings">Settings</a>
            </nav>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
