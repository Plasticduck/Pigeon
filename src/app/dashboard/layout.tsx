import "./dashboard.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-container">
      <nav className="sidebar-app">
        <div className="sidebar-logo">P</div>
        <div className="sidebar-icons">
          <button className="sidebar-icon active" title="Inbox">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 6.5L10 11.5L17.5 6.5M3 5h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="sidebar-icon" title="Contacts">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM3 17a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="sidebar-icon" title="Analytics">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 17V10M8 17V4M13 17V8M18 17V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="sidebar-icon" title="AI Features">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l1.5 4.5H16l-3.5 2.5 1.5 4.5L10 11l-4 2.5 1.5-4.5L4 6.5h4.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="sidebar-bottom">
          <button className="sidebar-icon" title="Settings">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
