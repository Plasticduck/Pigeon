"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  isUnread: boolean;
  snippet: string;
}

interface EmailDetail extends Email {
  to: string;
  body: string;
  attachments: { name: string; size: string; mimeType: string }[];
}

const AVATAR_COLORS = [
  "#4285f4", "#ea4335", "#fbbc04", "#34a853",
  "#ff6d00", "#46bdc6", "#7c4dff", "#f06292",
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return (p[0][0] ?? "?").toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const LABELS = [
  { id: "INBOX", label: "Inbox" },
  { id: "SENT", label: "Sent" },
  { id: "DRAFT", label: "Drafts" },
  { id: "SPAM", label: "Spam" },
  { id: "TRASH", label: "Trash" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmailDetail | null>(null);
  const [search, setSearch] = useState("");
  const [activeLabel, setActiveLabel] = useState("INBOX");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoadingList(true);
    const params = new URLSearchParams({ label: activeLabel });
    if (search) params.set("q", search);
    fetch(`/api/gmail/messages?${params}`)
      .then(r => r.json())
      .then(data => {
        const list: Email[] = data.emails ?? [];
        setEmails(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => setEmails([]))
      .finally(() => setLoadingList(false));
  }, [activeLabel, search]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setLoadingDetail(true);
    fetch(`/api/gmail/message/${selectedId}`)
      .then(r => r.json())
      .then(data => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  function handleSearch(val: string) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 500);
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="dashboard-main">
      <aside className="nav-pane">
        <div className="profile-section">
          <div className="profile-avatar-circle" style={{ background: avatarColor(session?.user?.name ?? "U") }}>
            {initials(session?.user?.name ?? "U")}
          </div>
          <div className="profile-info">
            <span className="profile-name">{session?.user?.name}</span>
            <span className="profile-email">{session?.user?.email}</span>
          </div>
        </div>

        <button className="btn-compose">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 2.5L10 6M2 14l1.5-4.5L12 1l3 3-9.5 8.5L2 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Compose
        </button>

        <div className="nav-section">
          <div className="nav-title">Mail</div>
          <div className="nav-list">
            {LABELS.map(item => (
              <button
                key={item.id}
                className={"nav-item" + (activeLabel === item.id ? " active" : "")}
                onClick={() => { setActiveLabel(item.id); setSelectedId(null); setDetail(null); }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">Other</div>
          <div className="nav-list">
            <button className="nav-item">Email Settings</button>
            <button className="nav-item">Feedback</button>
          </div>
        </div>
      </aside>

      <section className="list-pane">
        <div className="list-header">
          <div className="list-title">
            {activeLabel === "INBOX" ? "Good Morning, " + firstName : LABELS.find(l => l.id === activeLabel)?.label}
          </div>
          <div className="search-bar-wrapper">
            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
              <path d="M13 13L17 17M8.5 15C5.46 15 3 12.54 3 9.5S5.46 4 8.5 4 14 6.46 14 9.5 11.54 15 8.5 15z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input className="search-bar" type="text" placeholder="Search emails..." onChange={e => handleSearch(e.target.value)} />
          </div>
        </div>

        <div className="emails-container">
          {loadingList ? (
            <div className="state-msg">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="state-msg">No emails found.</div>
          ) : (
            emails.map(email => (
              <div
                key={email.id}
                className={"email-card" + (selectedId === email.id ? " selected" : "") + (email.isUnread ? " unread" : "")}
                onClick={() => setSelectedId(email.id)}
              >
                <div className="email-avatar" style={{ background: avatarColor(email.senderName) }}>
                  {initials(email.senderName)}
                </div>
                <div className="email-card-body">
                  <div className="email-row-top">
                    <span className="sender-name">{email.senderName}</span>
                    <span className="email-date">{email.date}</span>
                  </div>
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-preview">{email.snippet}</div>
                </div>
                {email.isUnread && <div className="unread-dot" />}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="detail-pane">
        {!selectedId || (!detail && !loadingDetail) ? (
          <div className="detail-empty">Select an email to read</div>
        ) : loadingDetail ? (
          <div className="detail-empty">Loading...</div>
        ) : detail ? (
          <>
            <div className="detail-header">
              <div className="detail-actions">
                <button className="icon-btn" title="Back">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="icon-btn" title="Delete">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 00.5.5h7a.5.5 0 00.5-.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="icon-btn" title="Archive">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1.5 2h13l-1 3H2.5L1.5 2zM2.5 5v9.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V5M6.5 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <span className="detail-date-header">{detail.date}</span>
            </div>

            <div className="detail-content">
              <h2 className="detail-subject">{detail.subject}</h2>
              <div className="detail-sender-info">
                <div className="email-avatar" style={{ background: avatarColor(detail.senderName) }}>
                  {initials(detail.senderName)}
                </div>
                <div className="detail-sender-text">
                  <span className="name">{detail.senderName}</span>
                  <span className="addr">{detail.senderEmail}</span>
                  {detail.to && <span className="addr">To: {detail.to}</span>}
                </div>
              </div>

              {detail.body ? (
                <div className="detail-body" dangerouslySetInnerHTML={{ __html: detail.body }} />
              ) : (
                <div className="detail-body">{detail.snippet}</div>
              )}

              {detail.attachments.length > 0 && (
                <div className="attachments-section">
                  <div className="attachments-title">Attachments</div>
                  <div className="attachments-grid">
                    {detail.attachments.map((att, i) => (
                      <div key={i} className="attachment-card">
                        <div className="attachment-name">{att.name}</div>
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

            <div className="reply-box">
              <input className="reply-input" type="text" placeholder="Reply to email..." />
              <div className="reply-actions">
                <button className="reply-attach" title="Attach">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 7.5L7 14a4 4 0 01-5.66-5.66l6.5-6.5a2.5 2.5 0 013.54 3.54L5 11.84A1 1 0 013.59 10.4L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="reply-send" title="Send">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 2L7 9M14 2L9.5 14 7 9 2 6.5 14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
