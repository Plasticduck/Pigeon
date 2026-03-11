"use client";

import "./dashboard.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const onDash = path === "/dashboard";

  return (
    <div className="dashboard-container">
      <nav className="sidebar-app">
        <a href="/dashboard" className="sidebar-logo" title="Pigeon" style={{ textDecoration: "none" }}>P</a>
        <div className="sidebar-icons">
          <a href="/dashboard" className={"sidebar-icon" + (onDash ? " active" : "")} title="Inbox">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 6.5L10 11.5L17.5 6.5M3 5h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <button className="sidebar-icon" title="Sent — use the Sent folder in the nav pane"
            onClick={() => { const e = document.querySelector<HTMLButtonElement>('[data-label="SENT"]'); e?.click(); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 2.5L9 11M17.5 2.5L12 17l-3-6-6-3 14.5-5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="sidebar-icon" title="Starred — use the Starred folder in the nav pane"
            onClick={() => { const e = document.querySelector<HTMLButtonElement>('[data-label="STARRED"]'); e?.click(); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l1.8 5.5H17l-4.5 3.3 1.7 5.5L10 13.5l-4.2 2.8 1.7-5.5L3 7.5h5.2L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="sidebar-icon" title="Drafts — use the Drafts folder in the nav pane"
            onClick={() => { const e = document.querySelector<HTMLButtonElement>('[data-label="DRAFT"]'); e?.click(); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.5 3.5L16.5 5.5 7 15H5v-2L14.5 3.5zM13 5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="sidebar-bottom">
          <ThemeToggle />
        </div>
      </nav>
      {children}
    </div>
  );
}
