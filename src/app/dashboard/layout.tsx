import "./dashboard.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <nav className="sidebar-app">
        <div className="sidebar-logo">P.</div>
        <div className="sidebar-icons">
          <button className="sidebar-icon active">Inbox</button>
          <button className="sidebar-icon">Sent</button>
          <button className="sidebar-icon">Drafts</button>
          <button className="sidebar-icon">AI</button>
        </div>
        <div className="sidebar-bottom">
          <button className="sidebar-icon">Settings</button>
        </div>
      </nav>
      {children}
    </div>
  );
}
