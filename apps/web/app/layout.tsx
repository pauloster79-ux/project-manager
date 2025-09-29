import "./globals.css";

export const metadata = {
  title: "AI PM Hub",
  description: "AI quality-gated project hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
