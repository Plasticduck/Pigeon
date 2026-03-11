import "./dashboard.css";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          <ThemeToggle />
          <button className="sidebar-icon" title="Settings">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.3 2h3.4l.5 2.2c.5.2.9.5 1.3.8l2.1-.7 1.7 2.9-1.7 1.5c.1.4.1.9 0 1.3l1.7 1.5-1.7 2.9-2.1-.7c-.4.3-.8.6-1.3.8L11.7 18H8.3l-.5-2.2c-.5-.2-.9-.5-1.3-.8l-2.1.7-1.7-2.9 1.7-1.5c-.1-.4-.1-.9 0-1.3l-1.7-1.5 1.7-2.9 2.1.7c.4-.3.8-.6 1.3-.8L8.3 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
