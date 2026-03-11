"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/* ── Types ─────────────────────────────────────────── */
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
  threadId?: string;
}

/* ── Avatar helpers ────────────────────────────────── */
const AVATAR_COLORS = [
  "#4285f4","#ea4335","#fbbc04","#34a853",
  "#ff6d00","#46bdc6","#7c4dff","#f06292",
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return (p[0][0] ?? "?").toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/* Minimal browser-safe MD5 for Gravatar hashes */
function md5Hex(str: string): string {
  const input = str.trim().toLowerCase();
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);
    a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);
    a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);
    a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);
    a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);
    a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);
    a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);
    a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);
    a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);
    a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);
    a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);
    a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);
    a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);
    a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);
    a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);
    a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);
    x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
  }
  function cmn(q:number,a:number,b:number,x:number,s:number,t:number){a=add32(add32(a,q),add32(x,t));return add32((a<<s)|(a>>>(32-s)),b)}
  function ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn((b&c)|((~b)&d),a,b,x,s,t)}
  function gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn((b&d)|(c&(~d)),a,b,x,s,t)}
  function hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn(b^c^d,a,b,x,s,t)}
  function ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn(c^(b|(~d)),a,b,x,s,t)}
  function add32(a:number,b:number){return(a+b)&0xFFFFFFFF}
  function md5blk(s:string){const md5blks:number[]=[];for(let i=0;i<64;i+=4)md5blks[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);return md5blks}
  function rhex(n:number){const hc="0123456789abcdef";let s="";for(let j=0;j<4;j++)s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s}
  let n=input.length;const state=[1732584193,-271733879,-1732584194,271733878];let i;
  for(i=64;i<=n;i+=64)md5cycle(state,md5blk(input.substring(i-64,i)));
  const tail=input.substring(i-64);const tl=tail.length;const ta:number[]=[];for(let j=0;j<tl;j++)ta[j>>2]|=tail.charCodeAt(j)<<((j%4)<<3);
  ta[tl>>2]|=0x80<<((tl%4)<<3);if(tl>55){for(let j=ta.length;j<16;j++)ta[j]=0;md5cycle(state,ta);for(let j=0;j<16;j++)ta[j]=0}else{for(let j=ta.length;j<16;j++)ta[j]=0}
  ta[14]=n*8;md5cycle(state,ta);
  return rhex(state[0])+rhex(state[1])+rhex(state[2])+rhex(state[3]);
}

const PERSONAL_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "me.com","live.com","aol.com","protonmail.com","msn.com",
]);

/**
 * Avatar priority: Google Workspace photo > BIMI (via logo.clearbit.com) > Gravatar > initials
 * For personal domains we skip BIMI and go straight to Gravatar.
 */
function SenderAvatar({ name, email, className, style }: {
  name: string; email: string; className?: string; style?: React.CSSProperties;
}) {
  const [stage, setStage] = useState<"bimi"|"gravatar"|"initials">("bimi");
  const domain = email.split("@")[1] ?? "";
  const isPersonal = PERSONAL_DOMAINS.has(domain);
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5Hex(email)}?s=68&d=404`;
  const bimiUrl = `https://logo.clearbit.com/${domain}`;
  const effectiveStage = isPersonal ? (stage === "bimi" ? "gravatar" : stage) : stage;

  if (effectiveStage === "bimi") {
    return (
      <img
        src={bimiUrl}
        alt={name}
        className={className ?? "email-avatar"}
        style={{ objectFit: "cover", ...(style ?? {}) }}
        onError={() => setStage("gravatar")}
      />
    );
  }
  if (effectiveStage === "gravatar") {
    return (
      <img
        src={gravatarUrl}
        alt={name}
        className={className ?? "email-avatar"}
        style={{ objectFit: "cover", ...(style ?? {}) }}
        onError={() => setStage("initials")}
      />
    );
  }
  return (
    <div className={className ?? "email-avatar"} style={{ background: avatarColor(name), ...(style ?? {}) }}>
      {getInitials(name)}
    </div>
  );
}

/* ── Attachment icons ──────────────────────────────── */
function AttachmentIcon({ mimeType, name }: { mimeType: string; name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = mimeType.includes("pdf") || ext === "pdf";
  const isImage = mimeType.startsWith("image/") || ["jpg","jpeg","png","gif","webp","svg"].includes(ext);
  const isWord = ["doc","docx"].includes(ext) || mimeType.includes("word");
  const isExcel = ["xls","xlsx","csv"].includes(ext) || mimeType.includes("spreadsheet");
  const isVideo = mimeType.startsWith("video/") || ["mp4","mov","avi","mkv"].includes(ext);
  const isAudio = mimeType.startsWith("audio/") || ["mp3","wav","m4a"].includes(ext);
  const isZip = ["zip","rar","7z","tar","gz"].includes(ext) || mimeType.includes("zip");

  if (isPdf) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.2"/><path d="M11 1v4h3" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/><text x="5" y="13" fontSize="4" fontWeight="700" fill="#ef4444">PDF</text></svg>;
  if (isImage) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2"/><circle cx="7" cy="8" r="1.5" fill="#3b82f6"/><path d="M2 14l4-4 3 3 3-3 4 4" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (isWord) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.2"/><path d="M11 1v4h3" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round"/><text x="5" y="13" fontSize="5" fontWeight="700" fill="#2563eb">W</text></svg>;
  if (isExcel) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2"/><path d="M11 1v4h3" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/><text x="5.5" y="13" fontSize="5" fontWeight="700" fill="#16a34a">X</text></svg>;
  if (isVideo) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="12" height="12" rx="2" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.2"/><path d="M14 8l4-2v8l-4-2V8z" fill="#7c3aed"/></svg>;
  if (isAudio) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.2"/><path d="M8 7v6M10 5v10M12 7v6" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round"/></svg>;
  if (isZip) return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1.2"/><path d="M9 1v15M11 1v15" stroke="#6b7280" strokeWidth="1" strokeDasharray="2 2"/></svg>;
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="11" height="15" rx="1.5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/><path d="M11 1v4h3" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 10h5M6 12h3" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/></svg>;
}

/* ── Search bar ────────────────────────────────────── */
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

  return (
    <div className="search-container">
      <div className="search-bar-wrapper">
        <svg className="search-icon" viewBox="0 0 20 20" fill="none"><path d="M13 13L17 17M8.5 15C5.46 15 3 12.54 3 9.5S5.46 4 8.5 4 14 6.46 14 9.5 11.54 15 8.5 15z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <input className="search-bar" type="text" placeholder="Search emails..." value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)} />
        {value && (
          <button className="search-clear" onClick={() => { setValue(""); onSearch(""); }} title="Clear">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
      {focused && (
        <div className="search-dropdown">
          <div className="search-dropdown-label">Quick filters</div>
          <div className="search-filters-row">
            {SEARCH_FILTERS.map(f => (
              <button key={f.chip} className="search-filter-chip" onMouseDown={() => {
                const next = (value.trimEnd() + " " + f.chip).trimStart();
                setValue(next); onSearch(next);
              }}>{f.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Compose Modal ─────────────────────────────────── */
function ComposeModal({ from, onClose, onSent }: { from: string; onClose: () => void; onSent: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!to || !subject || !body) { setError("Fill in all fields"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.error?.message ?? "Send failed"); }
      onSent();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally { setSending(false); }
  }

  return (
    <div className="compose-overlay" onClick={onClose}>
      <div className="compose-modal" onClick={e => e.stopPropagation()}>
        <div className="compose-header">
          <span className="compose-title">New Message</span>
          <button className="compose-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="compose-fields">
          <div className="compose-field">
            <label>From</label>
            <input type="text" value={from} disabled />
          </div>
          <div className="compose-field">
            <label>To</label>
            <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" autoFocus />
          </div>
          <div className="compose-field">
            <label>Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
          </div>
        </div>
        <textarea className="compose-body" value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email..." rows={10} />
        {error && <div className="compose-error">{error}</div>}
        <div className="compose-footer">
          <button className="compose-send-btn" onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
          <button className="compose-discard" onClick={onClose}>Discard</button>
        </div>
      </div>
    </div>
  );
}

/* ── Constants ─────────────────────────────────────── */
const MAIL_LABELS = [
  { id: "INBOX", label: "Inbox" },
  { id: "SENT", label: "Sent" },
  { id: "DRAFT", label: "Drafts" },
  { id: "SPAM", label: "Spam" },
  { id: "TRASH", label: "Trash" },
];

const DIGEST_CACHE_KEY = "pigeon_daily_digest";
const DIGEST_TTL = 3 * 60 * 60 * 1000; // 3 hours

/* ── Main Component ────────────────────────────────── */
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
  const [smartLabels, setSmartLabels] = useState<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [dailyDigest, setDailyDigest] = useState<string | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* Fetch inbox */
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
        /* Smart labels — once */
        if (activeLabel === "INBOX" && list.length > 0 && smartLabels.length === 0) {
          fetch("/api/ai/labels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails: list }) })
            .then(r => r.json()).then(d => { if (d.labels?.length) setSmartLabels(d.labels); }).catch(() => {});
        }
        /* Daily digest — cached for 3 hours */
        if (activeLabel === "INBOX" && list.length > 0) {
          tryLoadDigest(list);
        }
      })
      .catch(() => setEmails([]))
      .finally(() => setLoadingList(false));
  }, [activeLabel, search]);

  function tryLoadDigest(list: Email[]) {
    try {
      const cached = localStorage.getItem(DIGEST_CACHE_KEY);
      if (cached) {
        const { digest, ts } = JSON.parse(cached);
        if (Date.now() - ts < DIGEST_TTL) { setDailyDigest(digest); return; }
      }
    } catch {}
    setDigestLoading(true);
    fetch("/api/ai/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails: list }) })
      .then(r => r.json())
      .then(d => {
        if (d.digest) {
          setDailyDigest(d.digest);
          localStorage.setItem(DIGEST_CACHE_KEY, JSON.stringify({ digest: d.digest, ts: Date.now() }));
        }
      })
      .catch(() => {})
      .finally(() => setDigestLoading(false));
  }

  /* Pagination */
  function loadMore() {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    const params = new URLSearchParams({ label: activeLabel, pageToken: nextPageToken });
    if (search) params.set("q", search);
    fetch("/api/gmail/messages?" + params)
      .then(r => r.json())
      .then(data => { setEmails(prev => [...prev, ...(data.emails ?? [])]); setNextPageToken(data.nextPageToken ?? null); })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  /* Fetch detail */
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setLoadingDetail(true);
    fetch("/api/gmail/message/" + selectedId)
      .then(r => r.json()).then(data => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  /* Iframe auto-height */
  function handleIframeLoad() {
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow?.document?.documentElement) {
        iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + "px";
      }
    } catch {}
  }

  /* Reply */
  async function handleReply() {
    if (!replyText.trim() || !detail || !session?.user?.email) return;
    setReplySending(true);
    try {
      await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: detail.senderEmail,
          subject: detail.subject.startsWith("Re:") ? detail.subject : "Re: " + detail.subject,
          body: replyText,
          threadId: detail.threadId,
        }),
      });
      setReplyText("");
    } catch {}
    setReplySending(false);
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const emailSrcDoc = detail?.body
    ? `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#111827;margin:0;padding:0;line-height:1.6}img{max-width:100%;height:auto}a{color:#2563eb}*{box-sizing:border-box}table{max-width:100%!important}</style></head><body>${detail.body}</body></html>`
    : null;

  return (
    <div className="dashboard-main">
      {showCompose && <ComposeModal from={session?.user?.email ?? ""} onClose={() => setShowCompose(false)} onSent={() => { setActiveLabel("SENT"); }} />}

      {/* Nav Pane */}
      <aside className="nav-pane">
        <div className="profile-section">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="profile-avatar-circle" style={{ objectFit: "cover" }} referrerPolicy="no-referrer" />
          ) : (
            <div className="profile-avatar-circle" style={{ background: avatarColor(session?.user?.name ?? "U") }}>
              {getInitials(session?.user?.name ?? "U")}
            </div>
          )}
          <div className="profile-info">
            <span className="profile-name">{session?.user?.name}</span>
            <span className="profile-email">{session?.user?.email}</span>
          </div>
        </div>

        <button className="btn-compose" onClick={() => setShowCompose(true)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 2.5L10 6M2 14l1.5-4.5L12 1l3 3-9.5 8.5L2 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Compose
        </button>

        <div className="nav-section">
          <div className="nav-title">Mail</div>
          <div className="nav-list">
            {MAIL_LABELS.map(item => (
              <button key={item.id}
                className={"nav-item" + (activeLabel === item.id && !search ? " active" : "")}
                onClick={() => { setActiveLabel(item.id); setSearch(""); setSelectedId(null); setDetail(null); }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {smartLabels.length > 0 && (
          <div className="nav-section">
            <div className="nav-title">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: "4px" }}><path d="M5 1l.9 2.7H9L6.5 5.4l.9 2.7L5 6.4l-2.4 1.7.9-2.7L1 3.7h3.1L5 1z" fill="currentColor"/></svg>
              Smart Labels
            </div>
            <div className="nav-list">
              {smartLabels.map(label => (
                <button key={label} className="nav-item" onClick={() => { setActiveLabel("INBOX"); setSearch(label); }}>
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

      {/* List Pane */}
      <section className="list-pane">
        <div className="list-header">
          <div className="list-title">
            {activeLabel === "INBOX" ? "Good Morning, " + firstName : MAIL_LABELS.find(l => l.id === activeLabel)?.label}
          </div>
          <SearchBar onSearch={setSearch} />
        </div>

        {/* Daily Digest */}
        {activeLabel === "INBOX" && (dailyDigest || digestLoading) && (
          <div className="daily-digest">
            <div className="daily-digest-label">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l.9 2.7H9.6L7.2 5.4l.9 2.7L6 6.4l-2.1 1.7.9-2.7L2.4 3.7H5.1L6 1z" fill="#7c3aed"/></svg>
              Daily Digest
            </div>
            <p className="daily-digest-text">{digestLoading ? "Generating digest..." : dailyDigest}</p>
          </div>
        )}

        <div className="emails-container">
          {loadingList ? (
            <div className="state-msg">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="state-msg">No emails found.</div>
          ) : (
            <>
              {emails.map(email => (
                <div key={email.id}
                  className={"email-card" + (selectedId === email.id ? " selected" : "") + (email.isUnread ? " unread" : "")}
                  onClick={() => setSelectedId(email.id)}>
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

      {/* Detail Pane */}
      <section className="detail-pane">
        {!selectedId || (!detail && !loadingDetail) ? (
          <div className="detail-empty">Select an email to read</div>
        ) : loadingDetail ? (
          <div className="detail-empty">Loading...</div>
        ) : detail ? (
          <>
            <div className="detail-header">
              <div className="detail-actions">
                <button className="icon-btn" title="Back"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                <button className="icon-btn" title="Delete"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 00.5.5h7a.5.5 0 00.5-.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                <button className="icon-btn" title="Archive"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1.5 2h13l-1 3H2.5L1.5 2zM2.5 5v9.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V5M6.5 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
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

              {emailSrcDoc ? (
                <iframe ref={iframeRef} srcDoc={emailSrcDoc} sandbox="allow-same-origin allow-popups" className="email-iframe" title="Email content" onLoad={handleIframeLoad} />
              ) : (
                <div className="detail-body">{detail.snippet}</div>
              )}

              {detail.attachments.length > 0 && (
                <div className="attachments-section">
                  <div className="attachments-title">Attachments</div>
                  <div className="attachments-grid">
                    {detail.attachments.map((att, i) => (
                      <div key={i} className="attachment-card">
                        <div className="attachment-icon-wrap"><AttachmentIcon mimeType={att.mimeType} name={att.name} /></div>
                        <div className="attachment-info">
                          <div className="attachment-name">{att.name}</div>
                          <div className="attachment-size">{att.size}</div>
                        </div>
                        <button className="attachment-dl" title="Download"><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 2v7M4 7l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="reply-box">
              <textarea className="reply-input" placeholder="Reply to email..." value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} />
              <div className="reply-footer">
                <button className="reply-attach" title="Attach file"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5V4a4 4 0 018 0v7a2.5 2.5 0 01-5 0V5a1 1 0 012 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                <div className="reply-right-actions">
                  <button className="reply-voice" title="Voice"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h1.5M4 5v6M6.5 3.5v9M9 5v6M11.5 6.5v3M14.5 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
                  <button className="reply-send" title="Send" onClick={handleReply} disabled={replySending}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L7 9M14 2L9.5 14 7 9 2 6.5 14 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
