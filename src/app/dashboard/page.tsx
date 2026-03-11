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
  "#4285f4","#ea4335","#fbbc04","#34a853",
  "#ff6d00","#46bdc6","#7c4dff","#f06292",
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

const PERSONAL_DOMAINS = new Set(["gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com","me.com","live.com","aol.com","protonmail.com","msn.com"]);

function SenderAvatar({ name, email, className, style }: { name: string; email: string; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const domain = email.split("@")[1] ?? "";
  const useLogoApi = domain && !PERSONAL_DOMAINS.has(domain) && !failed;

  if (useLogoApi) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        className={className ?? "email-avatar"}
        style={{ objectFit: "cover", ...(style ?? {}) }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={className ?? "email-avatar"} style={{ background: avatarColor(name), ...(style ?? {}) }}>
      {initials(name)}
    </div>
  );
}

function AttachmentIcon({ mimeType, name }: { mimeType: string; name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = mimeType.includes("pdf") || ext === "pdf";
  const isImage = mimeType.startsWith("image/") || ["jpg","jpeg","png","gif","webp","svg"].includes(ext);
  const isWord = ["doc","docx"].includes(ext) || mimeType.includes("word");
  const isExcel = ["xls","xlsx","csv"].includes(ext) || mimeType.includes("spreadsheet");
  const isVideo = mimeType.startsWith("video/") || ["mp4","mov","avi","mkv"].includes(ext);
  const isAudio = mimeType.startsWith("audio/") || ["mp3","wav","m4a"].includes(ext);
  const isZip = ["zip","rar","7z","tar","gz"].includes(ext) || mimeType.includes("zip");

  if (isPdf) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="15" rx="1.5" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.2"/>
      <path d="M11 1v4h3" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
      <text x="5" y="13" fontSize="4" fontWeight="700" fill="#ef4444">PDF</text>
    </svg>
  );
  if (isImage) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="14" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2"/>
      <circle cx="7" cy="8" r="1.5" fill="#3b82f6"/>
      <path d="M2 14l4-4 3 3 3-3 4 4" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (isWord) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="15" rx="1.5" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.2"/>
      <path d="M11 1v4h3" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round"/>
      <text x="5" y="13" fontSize="5" fontWeight="700" fill="#2563eb">W</text>
    </svg>
  );
  if (isExcel) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="15" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2"/>
      <path d="M11 1v4h3" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
      <text x="5.5" y="13" fontSize="5" fontWeight="700" fill="#16a34a">X</text>
    </svg>
  );
  if (isVideo) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="12" height="12" rx="2" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.2"/>
      <path d="M14 8l4-2v8l-4-2V8z" fill="#7c3aed"/>
    </svg>
  );
  if (isAudio) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="15" rx="1.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.2"/>
      <path d="M8 7v6M10 5v10M12 7v6" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  if (isZip) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="15" rx="1.5" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1.2"/>
      <path d="M9 1v15M11 1v15" stroke="#6b7280" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="15" rx="1.5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      <path d="M11 1v4h3" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6 10h5M6 12h3" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

const SEARCH_FILTERS = [
  { label: "From", chip: "from:" },
  { label: "To", chip: "to:" },
  { label: "Subject", chip: "subject:" },
  { label: "Has attachment", chip: "has:attachment " },
  { label: "Unread", chip: "is:unread " },
  { label: "Starred", chip: "is:starred " },
];

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(val: string) {
    setValue(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(val), 500);
  }

  function applyFilter(chip: string) {
    const base = value.trimEnd();
    const next = base ? base + " " + chip : chip;
    setValue(next);
    onSearch(next);
  }

  function clear() {
    setValue("");
    onSearch("");
  }

  return (
    <div className="search-container">
      <div className="search-bar-wrapper">
        <svg className="search-icon" viewBox="0 0 20 20" fill="none">
          <path d="M13 13L17 17M8.5 15C5.46 15 3 12.54 3 9.5S5.46 4 8.5 4 14 6.46 14 9.5 11.54 15 8.5 15z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          className="search-bar"
          type="text"
          placeholder="Search emails..."
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {value && (
          <button className="search-clear" onClick={clear} title="Clear">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      {focused && (
        <div className="search-dropdown">
          <div className="search-dropdown-label">Quick filters</div>
          <div className="search-filters-row">
            {SEARCH_FILTERS.map(f => (
              <button key={f.chip} className="search-filter-chip" onMouseDown={() => applyFilter(f.chip)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MAIL_LABELS = [
  { id: "INBOX", label: "Inbox" },
  { id: "SENT", label: "Sent" },
  { id: "DRAFT", label: "Drafts" },
  { id: "SPAM", label: "Spam" },
  { id: "TRASH", label: "Trash" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmailDetail | null>(null);
  const [search, setSearch] = useState("");
  const [activeLabel, setActiveLabel] = useState("INBOX");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [smartLabels, setSmartLabels] = useState<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const summaryCache = useRef<Map<string, string>>(new Map());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoadingList(true);
    setEmails([]);
    setNextPageToken(null);
    const params = new URLSearchParams({ label: activeLabel });
    if (search) params.set("q", search);
    fetch("/api/gmail/messages?" + params)
      .then(r => r.json())
      .then(data => {
        const list: Email[] = data.emails ?? [];
        setEmails(list);
        setNextPageToken(data.nextPageToken ?? null);
        if (list.length > 0) setSelectedId(list[0].id);
        if (activeLabel === "INBOX" && list.length > 0 && smartLabels.length === 0) {
          fetch("/api/ai/labels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: list }),
          })
            .then(r => r.json())
            .then(d => { if (d.labels?.length) setSmartLabels(d.labels); })
            .catch(() => {});
        }
      })
      .catch(() => setEmails([]))
      .finally(() => setLoadingList(false));
  }, [activeLabel, search]);

  function loadMore() {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    const params = new URLSearchParams({ label: activeLabel, pageToken: nextPageToken });
    if (search) params.set("q", search);
    fetch("/api/gmail/messages?" + params)
      .then(r => r.json())
      .then(data => {
        setEmails(prev => [...prev, ...(data.emails ?? [])]);
        setNextPageToken(data.nextPageToken ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => {
    if (!selectedId) { setDetail(null); setAiSummary(null); return; }
    setLoadingDetail(true);
    setAiSummary(null);
    fetch("/api/gmail/message/" + selectedId)
      .then(r => r.json())
      .then(data => {
        setDetail(data);
        if (summaryCache.current.has(selectedId)) {
          setAiSummary(summaryCache.current.get(selectedId)!);
        } else {
          setAiSummaryLoading(true);
          fetch("/api/ai/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject: data.subject, body: data.body, snippet: data.snippet }),
          })
            .then(r => r.json())
            .then(d => {
              if (d.summary) {
                summaryCache.current.set(selectedId, d.summary);
                setAiSummary(d.summary);
              }
            })
            .catch(() => {})
            .finally(() => setAiSummaryLoading(false));
        }
      })
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  function handleIframeLoad() {
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow?.document?.documentElement) {
        const h = iframe.contentWindow.document.documentElement.scrollHeight;
        iframe.style.height = h + "px";
      }
    } catch {}
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const emailSrcDoc = detail?.body
    ? `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#111827;margin:0;padding:0;line-height:1.6}img{max-width:100%;height:auto}a{color:#2563eb}*{box-sizing:border-box}table{max-width:100%!important}</style></head><body>${detail.body}</body></html>`
    : null;

  return (
    <div className="dashboard-main">
      <aside className="nav-pane">
        <div className="profile-section">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="profile-avatar-circle" style={{ objectFit: "cover" }} referrerPolicy="no-referrer" />
          ) : (
            <div className="profile-avatar-circle" style={{ background: avatarColor(session?.user?.name ?? "U") }}>
              {initials(session?.user?.name ?? "U")}
            </div>
          )}
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
            {MAIL_LABELS.map(item => (
              <button
                key={item.id}
                className={"nav-item" + (activeLabel === item.id && !search ? " active" : "")}
                onClick={() => { setActiveLabel(item.id); setSearch(""); setSelectedId(null); setDetail(null); }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {smartLabels.length > 0 && (
          <div className="nav-section">
            <div className="nav-title">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: "4px" }}>
                <path d="M5 1l.9 2.7H9L6.5 5.4l.9 2.7L5 6.4l-2.4 1.7.9-2.7L1 3.7h3.1L5 1z" fill="currentColor"/>
              </svg>
              Smart Labels
            </div>
            <div className="nav-list">
              {smartLabels.map(label => (
                <button
                  key={label}
                  className="nav-item"
                  onClick={() => { setActiveLabel("INBOX"); setSearch(label); }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {activeLabel === "INBOX" ? "Good Morning, " + firstName : MAIL_LABELS.find(l => l.id === activeLabel)?.label}
          </div>
          <SearchBar onSearch={setSearch} />
        </div>

        <div className="emails-container">
          {loadingList ? (
            <div className="state-msg">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="state-msg">No emails found.</div>
          ) : (
            <>
              {emails.map(email => (
                <div
                  key={email.id}
                  className={"email-card" + (selectedId === email.id ? " selected" : "") + (email.isUnread ? " unread" : "")}
                  onClick={() => setSelectedId(email.id)}
                >
                  <SenderAvatar name={email.senderName} email={email.senderEmail} />
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
              ))}
              {nextPageToken && (
                <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "Loading..." : "Load older emails"}
                </button>
              )}
            </>
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
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="icon-btn" title="Delete">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 00.5.5h7a.5.5 0 00.5-.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="icon-btn" title="Archive">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M1.5 2h13l-1 3H2.5L1.5 2zM2.5 5v9.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V5M6.5 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <span className="detail-date-header">{detail.date}</span>
            </div>

            <div className="detail-content">
              <h2 className="detail-subject">{detail.subject}</h2>

              <div className="detail-sender-info">
                <SenderAvatar name={detail.senderName} email={detail.senderEmail} />
                <div className="detail-sender-text">
                  <span className="name">{detail.senderName}</span>
                  <span className="addr">{detail.senderEmail}</span>
                  {detail.to && <span className="addr">To: {detail.to}</span>}
                </div>
              </div>

              {(aiSummary || aiSummaryLoading) && (
                <div className="ai-summary-block">
                  <div className="ai-summary-label">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1l.9 2.7H9.6L7.2 5.4l.9 2.7L6 6.4l-2.1 1.7.9-2.7L2.4 3.7H5.1L6 1z" fill="#7c3aed"/>
                    </svg>
                    AI Summary
                  </div>
                  <p className="ai-summary-text">
                    {aiSummaryLoading ? "Summarizing..." : aiSummary}
                  </p>
                </div>
              )}

              {emailSrcDoc ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={emailSrcDoc}
                  sandbox="allow-same-origin allow-popups"
                  className="email-iframe"
                  title="Email content"
                  onLoad={handleIframeLoad}
                />
              ) : (
                <div className="detail-body">{detail.snippet}</div>
              )}

              {detail.attachments.length > 0 && (
                <div className="attachments-section">
                  <div className="attachments-title">Attachments</div>
                  <div className="attachments-grid">
                    {detail.attachments.map((att, i) => (
                      <div key={i} className="attachment-card">
                        <div className="attachment-icon-wrap">
                          <AttachmentIcon mimeType={att.mimeType} name={att.name} />
                        </div>
                        <div className="attachment-info">
                          <div className="attachment-name">{att.name}</div>
                          <div className="attachment-size">{att.size}</div>
                        </div>
                        <button className="attachment-dl" title="Download">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M7 2v7M4 7l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="reply-box">
              <textarea
                className="reply-input"
                placeholder="Reply to email..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
              />
              <div className="reply-footer">
                <button className="reply-attach" title="Attach file">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5V4a4 4 0 018 0v7a2.5 2.5 0 01-5 0V5a1 1 0 012 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="reply-right-actions">
                  <button className="reply-voice" title="Voice">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8h1.5M4 5v6M6.5 3.5v9M9 5v6M11.5 6.5v3M14.5 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button className="reply-send" title="Send">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 2L7 9M14 2L9.5 14 7 9 2 6.5 14 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
