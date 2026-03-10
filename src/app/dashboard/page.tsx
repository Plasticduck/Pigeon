"use client";

import { useState } from "react";
import { mockEmails } from "@/lib/mockData";

export default function DashboardPage() {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(mockEmails[0].id);

  const selectedEmail = mockEmails.find(e => e.id === selectedEmailId) || mockEmails[0];

  return (
    <div className="dashboard-main">
      {/* Pane 1: Navigation */}
      <aside className="nav-pane">
        <div className="profile-section">
          <div className="profile-avatar"></div>
          <div className="profile-info">
            <span className="profile-name">Johnathan Hayes</span>
            <span className="profile-email">johnathan@gmail.com</span>
          </div>
        </div>

        <div className="compose-btn-wrapper">
          <button className="btn-compose">
            <span>+</span> Compose email
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-title">General</div>
          <div className="nav-list">
            <button className="nav-item active">Inbox</button>
            <button className="nav-item">Sent</button>
            <button className="nav-item">Drafts</button>
            <button className="nav-item">AI Features</button>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">Folders</div>
          <div className="nav-list">
            <button className="nav-item">Operation</button>
            <button className="nav-item">Front-End</button>
            <button className="nav-item">UI Design</button>
            <button className="nav-item">Debugs</button>
          </div>
        </div>
      </aside>

      {/* Pane 2: Email List */}
      <section className="list-pane">
        <div className="list-header">
          <div className="list-title">Good Morning, Johnathan</div>
          <div className="list-filters">
            <span className="filter-item active">All Mails</span>
            <span className="filter-item">Unread (125)</span>
            <span className="filter-item">Others (5)</span>
          </div>
        </div>

        <div className="emails-container">
          {mockEmails.map((email) => (
            <div 
              key={email.id} 
              className={`email-card ${selectedEmailId === email.id ? 'selected' : ''}`}
              onClick={() => setSelectedEmailId(email.id)}
            >
              <div className="email-sender">
                <span>{email.senderName}</span>
                <span className="email-date">{email.date}</span>
              </div>
              <div className="email-subject">{email.subject}</div>
              <div className="email-preview">{email.preview}</div>
              <div className="email-meta">
                <span className="email-tag">{email.label}</span>
                {email.attachments.length > 0 && (
                  <span className="email-tag">📎 {email.attachments.length}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pane 3: Detail View */}
      <section className="detail-pane">
        <div className="detail-header">
          <div className="detail-actions">
            <button>← Back</button>
            <button>🗑️ Delete</button>
            <button>Archive</button>
          </div>
          <div>All Categories ⌄</div>
        </div>

        <div className="detail-content">
          <h2 className="detail-subject">{selectedEmail.subject}</h2>
          
          <div className="detail-sender-info">
            <div className="profile-avatar"></div>
            <div className="detail-sender-text">
              <span className="name">{selectedEmail.senderName}</span>
              <span className="email">{selectedEmail.senderEmail}</span>
            </div>
            <div className="detail-date">{selectedEmail.date}</div>
          </div>

          {selectedEmail.aiSummary && (
            <div className="ai-summary">
              <div className="ai-icon">✨</div>
              <div className="ai-text">{selectedEmail.aiSummary}</div>
            </div>
          )}

          <div className="detail-body">
            {selectedEmail.body}
          </div>

          {selectedEmail.attachments.length > 0 && (
            <div className="attachments-section">
              <div className="attachments-title">Attachments Securely Scanned</div>
              <div className="attachments-grid">
                {selectedEmail.attachments.map((att, idx) => (
                  <div key={idx} className="attachment-card">
                    <div className="attachment-name">📄 {att.name}</div>
                    <div className="attachment-meta">
                      <span>{att.size}</span>
                      <span className="attachment-download">Download</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
