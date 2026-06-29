import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FileText, Bell, LogOut, Menu, Eye, Check, X,
  Clock, CheckCircle2, XCircle, AlertCircle,
  Shield, Download, RefreshCw, ChevronLeft, ChevronRight,
  BarChart3, ArrowUpRight, Send, Inbox,
  Activity, Calendar, User, Building2, Database,
  Lock, Globe, Video, FileCheck, Search, Filter,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Info, Layers, Hash, Phone, Mail, MapPin,
  CheckSquare, XSquare, AlertTriangle
} from "lucide-react";

// ═══════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════
const BASE = "http://localhost:8080/api";
const authH = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});
const parseJwt = (t) => {
  try { return JSON.parse(atob(t.split(".")[1])); } catch { return {}; }
};

// ═══════════════════════════════════════════════════════
//  THÈME — Palette DG : Bleu ardoise + Or institutionnel
// ═══════════════════════════════════════════════════════
const T = {
  // Sidebar / header
  sidebarBg: "#0F1D2E",
  sidebarBorder: "#1A2F47",
  sidebarText: "#7A9BB5",
  sidebarActive: "#1E4976",

  // Page
  mainBg: "#F1F4F8",
  cardBg: "#FFFFFF",
  cardBorder: "#DDE3EC",
  cardShadow: "0 1px 4px rgba(15,29,46,0.07)",

  // Texte
  textPrimary: "#0F1D2E",
  textSecondary: "#3D5166",
  textMuted: "#8A9BB0",

  // Couleurs sémantiques
  gold: "#B8860B",
  goldLight: "#FEF7E6",
  goldBorder: "#E6B84A",

  blue: "#1E4976",
  blueBg: "#EEF4FB",
  blueBorder: "#BFDBFE",
  blueLight: "#3B7DD8",

  green: "#15803D",
  greenBg: "#F0FDF4",
  greenBorder: "#86EFAC",

  red: "#B91C1C",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",

  yellow: "#B45309",
  yellowBg: "#FFFBEB",
  yellowBorder: "#FDE68A",

  purple: "#6D28D9",
  purpleBg: "#F5F3FF",
  purpleBorder: "#C4B5FD",

  teal: "#0E7490",
  tealBg: "#ECFEFF",
  tealBorder: "#A5F3FC",

  gray: "#374151",
  grayBg: "#F8FAFC",
  grayBorder: "#E2E8F0",

  orange: "#C2410C",
  orangeBg: "#FFF7ED",
  orangeBorder: "#FED7AA",
};

// ═══════════════════════════════════════════════════════
//  COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════
const Avatar = ({ initials, size = 36, bg = T.blueBg, color = T.blue, border = T.blueBorder }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: bg,
    border: `1.5px solid ${border}`, display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 700, fontSize: size * 0.34,
    color, flexShrink: 0, letterSpacing: "0.03em", fontFamily: "'DM Mono', monospace",
  }}>{initials}</div>
);

const Card = ({ children, style = {}, onClick, className = "" }) => (
  <div className={`dg-card ${className}`} onClick={onClick}
    style={{
      background: T.cardBg, border: `1px solid ${T.cardBorder}`,
      borderRadius: 12, boxShadow: T.cardShadow,
      cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
);

const Badge = ({ type }) => {
  const map = {
    EN_ATTENTE: { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "En attente DG" },
    APPROUVEE_DG: { bg: T.greenBg, color: T.green, border: T.greenBorder, label: "Approuvée DG" },
    REJETEE_DG: { bg: T.redBg, color: T.red, border: T.redBorder, label: "Rejetée DG" },
    EN_VERIFICATION_CIL: { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, label: "Vérif. CIL" },
    VALIDEE_CIL: { bg: T.tealBg, color: T.teal, border: T.tealBorder, label: "Validée CIL" },
    REJETEE_CIL: { bg: T.redBg, color: T.red, border: T.redBorder, label: "Rejetée CIL" },
    BROUILLON: { bg: T.grayBg, color: T.gray, border: T.grayBorder, label: "Brouillon" },
    APPROUVEE: { bg: T.greenBg, color: T.green, border: T.greenBorder, label: "Approuvée" },
    REJETEE: { bg: T.redBg, color: T.red, border: T.redBorder, label: "Rejetée" },
    NORMALE: { bg: T.blueBg, color: T.blue, border: T.blueBorder, label: "Normale" },
    COLLECTE_SITE: { bg: T.tealBg, color: T.teal, border: T.tealBorder, label: "Site Internet" },
    VIDEO_SURVEILLANCE: { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, label: "Vidéosurveillance" },
    AUTORISATION: { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "Autorisation" },
  };
  const s = map[type] || { bg: T.grayBg, color: T.gray, border: T.grayBorder, label: type || "—" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = "outline", style = {}, disabled = false }) => {
  const base = {
    borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex",
    alignItems: "center", gap: 6, border: "none", opacity: disabled ? 0.55 : 1,
    transition: "all 0.15s", fontFamily: "inherit", ...style,
  };
  const v = {
    primary: { background: T.blue, color: "#fff" },
    success: { background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` },
    danger: { background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` },
    warning: { background: T.yellowBg, color: T.yellow, border: `1px solid ${T.yellowBorder}` },
    outline: { background: "transparent", color: T.textSecondary, border: `1px solid ${T.cardBorder}` },
    ghost: { background: "transparent", color: T.textMuted, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...(v[variant] || v.outline) }}>
      {children}
    </button>
  );
};

const Spinner = ({ color = "#fff", size = 14 }) => (
  <span style={{
    width: size, height: size, border: `2px solid rgba(255,255,255,0.3)`,
    borderTopColor: color, borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite",
  }} />
);

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 3, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ fontSize: 13, color: T.textMuted }}>{subtitle}</p>
    </div>
    {children && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════
//  PANNEAU NOTIFICATIONS
// ═══════════════════════════════════════════════════════
const PanneauNotifications = ({ userId, onClose, onCountChange }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      try {
        const r = await fetch(`${BASE}/notifications/${userId}`, { headers: authH() });
        if (!r.ok) return;
        const data = await r.json();
        const sorted = [...data].sort((a, b) => b.idNotification - a.idNotification);
        setNotifs(sorted);
        if (sorted.some(n => n.statut === "NON_LUE")) {
          await fetch(`${BASE}/notifications/${userId}/lire-tout`, { method: "PATCH", headers: authH() });
          setNotifs(ns => ns.map(n => ({ ...n, statut: "LUE" })));
        }
        onCountChange(0);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, [userId]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeColor = { ALERTE: T.red, RAPPEL: T.yellow, CONFIRMATION: T.green, RELANCE: T.orange };

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 10px)", right: 0, width: 380,
      background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 14,
      boxShadow: "0 20px 50px rgba(0,0,0,0.18)", zIndex: 300, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.grayBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} color={T.gold} />
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Notifications</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex" }}><X size={15} /></button>
      </div>
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {loading && <div style={{ padding: 32, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Chargement…</div>}
        {!loading && notifs.length === 0 && <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Aucune notification</div>}
        {!loading && notifs.map((n, i) => {
          const col = typeColor[n.typeNotification] || T.textMuted;
          return (
            <div key={n.idNotification} style={{ padding: "12px 16px", borderBottom: i < notifs.length - 1 ? `1px solid ${T.cardBorder}` : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: `${col}18`, color: col, padding: "1px 6px", borderRadius: 4 }}>{n.typeNotification}</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{n.dateEnvoi}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>{n.contenu}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  TOPBAR
// ═══════════════════════════════════════════════════════
const TopBar = ({ onToggle, userId, notifCount, setNotifCount, dgInfo }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  return (
    <header style={{
      height: 56, background: T.sidebarBg, borderBottom: `1px solid ${T.sidebarBorder}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", flexShrink: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onToggle} style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
          <Menu size={18} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: T.sidebarActive, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={13} color="#93C5FD" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", letterSpacing: "0.04em" }}>
            SOFITEX — Direction Générale
          </div>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotifs(v => !v)} style={{
          background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer",
          padding: 7, borderRadius: 7, display: "flex", alignItems: "center", position: "relative",
        }}>
          <Bell size={17} />
          {notifCount > 0 && (
            <span style={{
              position: "absolute", top: 2, right: 2, width: 16, height: 16,
              background: T.red, color: "#fff", borderRadius: "50%", fontSize: 9,
              fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${T.sidebarBg}`,
            }}>{notifCount > 99 ? "99+" : notifCount}</span>
          )}
        </button>
        {showNotifs && userId && (
          <PanneauNotifications userId={userId} onClose={() => setShowNotifs(false)} onCountChange={setNotifCount} />
        )}
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, collapsed, dgInfo, pendingCount }) => {
  const navigate = useNavigate();
  const initials = ((dgInfo?.prenom?.[0] || "") + (dgInfo?.nom?.[0] || "")).toUpperCase() || "DG";
  const nav = [
    { id: "dashboard", label: "Tableau de bord", Icon: BarChart3 },
    { id: "en-attente", label: "À valider", Icon: Inbox, badge: pendingCount },
    { id: "historique", label: "Historique", Icon: FileText },
  ];
  return (
    <aside style={{
      width: collapsed ? 64 : 230, flexShrink: 0, background: T.sidebarBg,
      borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column",
      transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden",
    }}>
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={initials} size={36} bg={T.sidebarActive} color="#93C5FD" border={T.sidebarBorder} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {dgInfo?.prenom} {dgInfo?.nom}
              </div>
              <div style={{ fontSize: 10, color: T.sidebarText, marginTop: 1 }}>Directeur(trice) Général(e)</div>
            </div>
          </div>
        </div>
      )}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sidebarText, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Navigation
          </div>
        )}
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)} className="nav-item"
              style={{
                display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
                padding: collapsed ? "11px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8, color: isActive ? "#FFFFFF" : T.sidebarText,
                background: isActive ? T.sidebarActive : "transparent",
                fontWeight: isActive ? 600 : 400, fontSize: 13, cursor: "pointer",
                position: "relative", marginBottom: 2, transition: "all 0.15s ease",
              }}>
              {isActive && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#93C5FD", borderRadius: "0 2px 2px 0" }} />}
              <item.Icon size={16} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ background: T.red, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge > 0 && (
                <span style={{ position: "absolute", top: 6, right: 8, width: 7, height: 7, background: T.red, borderRadius: "50%" }} />
              )}
            </div>
          );
        })}
      </nav>
      {!collapsed && (
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.sidebarBorder}` }}>
          <button onClick={() => { localStorage.removeItem("token"); toast.success("Déconnecté !"); navigate("/"); }}
            className="logout-btn"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", borderRadius: 8, padding: "9px 10px", color: "#EF4444", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  ICÔNE PAR TYPE DE DÉCLARATION
// ═══════════════════════════════════════════════════════
const TypeIcon = ({ type, size = 16 }) => {
  const map = {
    NORMALE: <FileText size={size} color={T.blue} />,
    COLLECTE_SITE: <Globe size={size} color={T.teal} />,
    VIDEO_SURVEILLANCE: <Video size={size} color={T.purple} />,
    AUTORISATION: <Shield size={size} color={T.yellow} />,
  };
  return map[type] || <FileText size={size} color={T.gray} />;
};

// ═══════════════════════════════════════════════════════
//  SECTION DÉTAIL — affichage complet d'une déclaration
// ═══════════════════════════════════════════════════════
const DetailRow = ({ label, value, full = false }) => {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.textMuted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500, lineHeight: 1.5 }}>
        {typeof value === "boolean" ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: value ? T.green : T.red }}>
            {value ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {value ? "Oui" : "Non"}
          </span>
        ) : value}
      </div>
    </div>
  );
};

const SectionBloc = ({ icon: Icon, color, bg, border, title, children }) => (
  <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
    <div style={{ background: bg, padding: "10px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={14} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</span>
    </div>
    <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
//  MODALE : VOIR + VALIDER / REJETER
// ═══════════════════════════════════════════════════════
const ModalDeclaration = ({ declaration, onClose, onValider, onRejeter }) => {
  const [commentaire, setCommentaire] = useState("");
  const [showRejet, setShowRejet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullData, setFullData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${BASE}/declarations/${declaration.idDeclaration}`, { headers: authH() });
        if (r.ok) setFullData(await r.json());
        else setFullData(declaration);
      } catch { setFullData(declaration); }
      finally { setLoadingDetail(false); }
    };
    load();
  }, [declaration.idDeclaration]);

  const d = fullData || declaration;
  const canAct = d.statut === "EN_ATTENTE";

  const handleValider = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/${d.idDeclaration}/valider`, { method: "PUT", headers: authH() });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || `Erreur ${r.status}`); }
      const updated = await r.json();
      onValider(updated);
      onClose();
      toast.success(`Déclaration #${d.idDeclaration} approuvée — transmise à la CIL`);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleRejeter = async () => {
    if (!commentaire.trim()) { toast.error("Veuillez saisir un motif de rejet"); return; }
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/${d.idDeclaration}/rejeter`, {
        method: "PUT", headers: authH(),
        body: JSON.stringify({ commentaire }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || `Erreur ${r.status}`); }
      const updated = await r.json();
      onRejeter(updated);
      onClose();
      toast.success(`Déclaration #${d.idDeclaration} rejetée — DPO notifié`);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,29,46,0.55)", zIndex: 900, backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 901, width: 720, maxHeight: "92vh", overflowY: "auto",
        background: T.cardBg, borderRadius: 16,
        boxShadow: "0 32px 80px rgba(15,29,46,0.28)", border: `1px solid ${T.cardBorder}`,
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px 14px", borderBottom: `1px solid ${T.cardBorder}`,
          position: "sticky", top: 0, background: T.cardBg, zIndex: 1,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TypeIcon type={d.typeDeclaration} size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
              Déclaration #{d.idDeclaration}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 10, marginTop: 2, flexWrap: "wrap" }}>
              <span>Soumis le {d.dateSoumission}</span>
              {d.dpoNomPrenom && <span>· DPO : {d.dpoNomPrenom}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge type={d.statut} />
            {d.typeDeclaration && <Badge type={d.typeDeclaration} />}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", padding: 4 }}><X size={16} /></button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {loadingDetail && (
            <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Chargement des détails…</div>
          )}
          {!loadingDetail && (
            <>
              {/* Identification */}
              <SectionBloc icon={User} color={T.blue} bg={T.blueBg} border={T.blueBorder} title="Identification & Responsable">
                <DetailRow label="Responsable déclaration" value={d.responsableDeclaration} />
                <DetailRow label="Contact confidentialité" value={d.contactConfidentialite} />
                <DetailRow label="Secteur d'activité" value={d.secteur} />
                <DetailRow label="Nature de la demande" value={d.natureDemande} />
                <DetailRow label="Date mise en œuvre" value={d.dateMiseEnOeuvre} />
                <DetailRow label="Durée de conservation" value={d.dureeConservation} />
              </SectionBloc>

              {/* Données */}
              <SectionBloc icon={Database} color={T.teal} bg={T.tealBg} border={T.tealBorder} title="Données traitées">
                <DetailRow label="Catégories de données" value={d.categoriesDonnees} full />
                <DetailRow label="Origine des données" value={d.origineDonnees} full />
                <DetailRow label="Lieu de stockage" value={d.lieuStockage} />
                <DetailRow label="Transfert vers l'étranger" value={d.transfertPaysEtranger} />
                {d.transfertPaysEtranger && <DetailRow label="Pays de destination" value={d.paysDestination} />}
              </SectionBloc>

              {/* Sécurité */}
              <SectionBloc icon={Lock} color={T.purple} bg={T.purpleBg} border={T.purpleBorder} title="Sécurité & Accès">
                <DetailRow label="Mesures de sécurité" value={d.mesuresSecurite} full />
                <DetailRow label="Catégories d'accès" value={d.categoriesPersonnesAcces} />
                <DetailRow label="Politique accès bâtiments" value={d.politiqueAccesBatiments} />
                <DetailRow label="Sensibilisation personnel" value={d.mesuresSensibilisation} />
                <DetailRow label="Sous-traitance" value={d.recoursSousTraitant} />
                {d.recoursSousTraitant && <DetailRow label="Contrat confidentialité ST" value={d.contratConfidentialiteSousTraitant} />}
                <DetailRow label="Communication externe" value={d.communicationAutresOrganismes} />
                {d.communicationAutresOrganismes && (
                  <>
                    <DetailRow label="Destinataire" value={d.destinataireNom} />
                    <DetailRow label="Finalité communication" value={d.finaliteCommunication} />
                  </>
                )}
              </SectionBloc>

              {/* Droits */}
              <SectionBloc icon={Shield} color={T.green} bg={T.greenBg} border={T.greenBorder} title="Droits des personnes">
                <DetailRow label="Moyens d'information" value={d.moyensInformationDroits} />
                <DetailRow label="Moyens d'exercice" value={d.moyensExerciceDroits} />
                <DetailRow label="Coordonnées exercice" value={d.coordonneesExerciceDroits} />
                <DetailRow label="Délai de réponse" value={d.delaiCommunicationDroits} />
                <DetailRow label="Nom responsable CIL" value={d.nomPrenomResponsable} />
                <DetailRow label="Fonction" value={d.fonctionResponsable} />
              </SectionBloc>

              {/* Traitement source */}
              {d.traitementId && (
                <SectionBloc icon={Layers} color={T.gray} bg={T.grayBg} border={T.grayBorder} title="Traitement associé">
                  <DetailRow label="ID Traitement" value={`#${d.traitementId}`} />
                  <DetailRow label="Description" value={d.traitementDescription} />
                </SectionBloc>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {canAct && (
          <div style={{ padding: "0 24px 24px" }}>
            {showRejet ? (
              <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertTriangle size={14} /> Motif de rejet
                </div>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  placeholder="Expliquez précisément pourquoi cette déclaration est rejetée…"
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.redBorder}`, fontSize: 13, color: T.textPrimary, background: "#fff", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                  <Btn onClick={() => setShowRejet(false)}>Annuler</Btn>
                  <Btn variant="danger" onClick={handleRejeter} disabled={loading || !commentaire.trim()}>
                    {loading ? <><Spinner color={T.red} size={12} /> Rejet…</> : <><XSquare size={13} /> Confirmer le rejet</>}
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: `1px solid ${T.cardBorder}` }}>
                <div style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={13} /> En attente de votre décision
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="danger" onClick={() => setShowRejet(true)}>
                    <XCircle size={13} /> Rejeter
                  </Btn>
                  <Btn variant="success" onClick={handleValider} disabled={loading}>
                    {loading ? <><Spinner color={T.green} size={12} /> Validation…</> : <><CheckSquare size={13} /> Approuver & transmettre à la CIL</>}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {!canAct && (
          <div style={{ padding: "14px 24px 20px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={onClose}>Fermer</Btn>
          </div>
        )}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  CARTE D'UNE DÉCLARATION (liste)
// ═══════════════════════════════════════════════════════
const DeclarationCard = ({ d, onView }) => {
  const typeLabel = { NORMALE: "Déclaration normale", COLLECTE_SITE: "Site Internet", VIDEO_SURVEILLANCE: "Vidéosurveillance", AUTORISATION: "Autorisation" };
  const isPending = d.statut === "EN_ATTENTE";

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{
          width: 4, flexShrink: 0,
          background: isPending ? T.yellow : d.statut?.includes("APPROUVEE") ? T.green : T.red,
          borderRadius: "0 0 0 12px",
        }} />
        <div style={{ flex: 1, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.grayBg, border: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TypeIcon type={d.typeDeclaration} size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Déclaration #{d.idDeclaration}</span>
                  <Badge type={d.statut} />
                  {d.typeDeclaration && <Badge type={d.typeDeclaration} />}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>
                  {typeLabel[d.typeDeclaration] || "—"} · Soumis le {d.dateSoumission || "—"}
                </div>
              </div>
            </div>
            <Btn onClick={() => onView(d)} variant="outline" style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}>
              <Eye size={13} /> Consulter
            </Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 16px", padding: "10px 0", borderTop: `1px solid ${T.grayBg}` }}>
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>DPO</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{d.dpoNomPrenom || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Responsable</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{d.responsableDeclaration || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Secteur</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{d.secteur || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD DG
// ═══════════════════════════════════════════════════════
const SectionDashboard = ({ declarations, allDeclarations, setSection, dgInfo }) => {
  const pending = declarations.filter(d => d.statut === "EN_ATTENTE");
  const approved = allDeclarations.filter(d => d.statut === "APPROUVEE_DG" || d.statut === "EN_VERIFICATION_CIL" || d.statut === "VALIDEE_CIL");
  const rejected = allDeclarations.filter(d => d.statut === "REJETEE_DG");
  const validatedCil = allDeclarations.filter(d => d.statut === "VALIDEE_CIL");

  const typeStats = ["NORMALE", "COLLECTE_SITE", "VIDEO_SURVEILLANCE", "AUTORISATION"].map(t => ({
    type: t,
    count: allDeclarations.filter(d => d.typeDeclaration === t).length,
  }));

  const stats = [
    { label: "En attente", value: pending.length, sub: "décisions requises", color: T.yellow, bg: T.yellowBg, border: T.yellowBorder, Icon: Clock, section: "en-attente" },
    { label: "Approuvées", value: approved.length, sub: "transmises à la CIL", color: T.green, bg: T.greenBg, border: T.greenBorder, Icon: CheckCircle2, section: "historique" },
    { label: "Rejetées", value: rejected.length, sub: "renvoyées au DPO", color: T.red, bg: T.redBg, border: T.redBorder, Icon: XCircle, section: "historique" },
    { label: "Validées CIL", value: validatedCil.length, sub: "conformité confirmée", color: T.teal, bg: T.tealBg, border: T.tealBorder, Icon: Shield, section: "historique" },
  ];

  return (
    <div className="slide-in">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bonjour ${dgInfo?.prenom || "DG"} — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card key={i} onClick={() => setSection(s.section)} className="card-hover" style={{ padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "12px 12px 0 0" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                <s.Icon size={18} strokeWidth={1.8} />
              </div>
              <ArrowUpRight size={13} color={s.color} style={{ opacity: 0.4, marginTop: 4 }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "'DM Mono', monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 500 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Déclarations en attente */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Inbox size={15} color={T.yellow} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>En attente de décision</h3>
              {pending.length > 0 && (
                <span style={{ background: T.yellow, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{pending.length}</span>
              )}
            </div>
            <button onClick={() => setSection("en-attente")} style={{ fontSize: 12, color: T.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          <div>
            {pending.length === 0 && (
              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <CheckCircle2 size={28} color={T.green} style={{ display: "block", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: T.textMuted }}>Aucune déclaration en attente</p>
              </div>
            )}
            {pending.slice(0, 4).map((d, i) => (
              <div key={d.idDeclaration} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < Math.min(pending.length, 4) - 1 ? `1px solid ${T.grayBg}` : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.yellowBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={14} color={T.yellow} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    #{d.idDeclaration} — {d.dpoNomPrenom || "DPO"}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{d.dateSoumission} · {d.typeDeclaration || "—"}</div>
                </div>
                <Badge type={d.typeDeclaration} />
              </div>
            ))}
          </div>
        </Card>

        {/* Répartition par type */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={15} color={T.blue} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Répartition par type</h3>
            </div>
          </div>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {typeStats.map(({ type, count }) => {
              const total = allDeclarations.length || 1;
              const pct = Math.round((count / total) * 100);
              const colors = { NORMALE: T.blue, COLLECTE_SITE: T.teal, VIDEO_SURVEILLANCE: T.purple, AUTORISATION: T.yellow };
              const labels = { NORMALE: "Normale", COLLECTE_SITE: "Site Internet", VIDEO_SURVEILLANCE: "Vidéosurveillance", AUTORISATION: "Autorisation" };
              const col = colors[type] || T.gray;
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: T.textSecondary, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <TypeIcon type={type} size={13} /> {labels[type]}
                    </span>
                    <span style={{ fontWeight: 700, color: col, fontFamily: "'DM Mono', monospace" }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: T.grayBg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 3, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
            {allDeclarations.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: "center" }}>Aucune déclaration</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DÉCLARATIONS EN ATTENTE
// ═══════════════════════════════════════════════════════
const SectionEnAttente = ({ declarations, setDeclarations, allDeclarations, setAllDeclarations }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/en-attente`, { headers: authH() });
      if (!r.ok) throw new Error(`Erreur ${r.status}`);
      const data = await r.json();
      setDeclarations(data);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [setDeclarations]);

  useEffect(() => { load(); }, [load]);

  const filtered = declarations.filter(d => {
    const matchSearch = !search.trim() ||
      String(d.idDeclaration).includes(search) ||
      (d.dpoNomPrenom || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.responsableDeclaration || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || d.typeDeclaration === filterType;
    return matchSearch && matchType;
  });

  const handleValider = (updated) => {
    setDeclarations(prev => prev.filter(d => d.idDeclaration !== updated.idDeclaration));
    setAllDeclarations(prev => [...prev.filter(d => d.idDeclaration !== updated.idDeclaration), updated]);
  };

  const handleRejeter = (updated) => {
    setDeclarations(prev => prev.filter(d => d.idDeclaration !== updated.idDeclaration));
    setAllDeclarations(prev => [...prev.filter(d => d.idDeclaration !== updated.idDeclaration), updated]);
  };

  return (
    <div className="slide-in">
      {selected && (
        <ModalDeclaration
          declaration={selected}
          onClose={() => setSelected(null)}
          onValider={handleValider}
          onRejeter={handleRejeter}
        />
      )}
      <PageHeader
        title="Déclarations à valider"
        subtitle={`${declarations.length} déclaration(s) en attente de votre décision`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", fontFamily: "inherit", width: 200 }}
            />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, fontFamily: "inherit", outline: "none" }}>
            <option value="all">Tous les types</option>
            <option value="NORMALE">Normale</option>
            <option value="COLLECTE_SITE">Site Internet</option>
            <option value="VIDEO_SURVEILLANCE">Vidéosurveillance</option>
            <option value="AUTORISATION">Autorisation</option>
          </select>
        </div>
        <Btn variant="outline" onClick={load}><RefreshCw size={13} /> Rafraîchir</Btn>
      </PageHeader>

      {/* Bandeau d'information workflow */}
      {declarations.length > 0 && (
        <div style={{ background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.blue }}>
          <Info size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Workflow :</strong> En approuvant une déclaration, celle-ci est automatiquement transmise à la CIL pour vérification de conformité. En la rejetant, le DPO est notifié pour corrections.
          </span>
        </div>
      )}

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><div style={{ color: T.textMuted, fontSize: 13 }}>Chargement…</div></Card>}
      {!loading && declarations.length === 0 && (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <CheckCircle2 size={48} color={T.green} style={{ display: "block", margin: "0 auto 16px", opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>File d'attente vide</div>
          <p style={{ fontSize: 13, color: T.textMuted }}>Toutes les déclarations soumises par le DPO ont été traitées.</p>
        </Card>
      )}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(d => (
            <DeclarationCard key={d.idDeclaration} d={d} onView={setSelected} />
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && declarations.length > 0 && (
        <Card style={{ padding: 40, textAlign: "center" }}><p style={{ fontSize: 13, color: T.textMuted }}>Aucun résultat pour ce filtre.</p></Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : HISTORIQUE (toutes décisions)
// ═══════════════════════════════════════════════════════
const SectionHistorique = ({ allDeclarations, setAllDeclarations }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Charge toutes les déclarations traitées (approuvées + rejetées + en vérif CIL + validées CIL)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // On fetch en-attente + pour-cil pour avoir les deux extrêmes
      const [r1, r2] = await Promise.all([
        fetch(`${BASE}/declarations/en-attente`, { headers: authH() }),
        fetch(`${BASE}/declarations/pour-cil`, { headers: authH() }),
      ]);
      const pending = r1.ok ? await r1.json() : [];
      const cil = r2.ok ? await r2.json() : [];
      // Merge avec celles déjà connues (approuvées/rejetées en local)
      const merged = [...allDeclarations];
      [...pending, ...cil].forEach(d => {
        if (!merged.find(x => x.idDeclaration === d.idDeclaration)) merged.push(d);
      });
      setAllDeclarations(merged);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [allDeclarations, setAllDeclarations]);

  useEffect(() => { if (allDeclarations.length === 0) load(); }, []);

  const nonPending = allDeclarations.filter(d => d.statut !== "EN_ATTENTE");

  const filtered = nonPending.filter(d => {
    const matchSearch = !search.trim() ||
      String(d.idDeclaration).includes(search) ||
      (d.dpoNomPrenom || "").toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "all" || d.statut === filterStatut;
    const matchType = filterType === "all" || d.typeDeclaration === filterType;
    return matchSearch && matchStatut && matchType;
  });

  return (
    <div className="slide-in">
      {selected && (
        <ModalDeclaration
          declaration={selected}
          onClose={() => setSelected(null)}
          onValider={() => { }}
          onRejeter={() => { }}
        />
      )}
      <PageHeader
        title="Historique des décisions"
        subtitle={`${nonPending.length} déclaration(s) traitée(s)`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={T.textMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", fontFamily: "inherit", width: 180 }}
            />
          </div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, fontFamily: "inherit", outline: "none" }}>
            <option value="all">Tous les statuts</option>
            <option value="APPROUVEE_DG">Approuvées DG</option>
            <option value="REJETEE_DG">Rejetées DG</option>
            <option value="EN_VERIFICATION_CIL">En vérif. CIL</option>
            <option value="VALIDEE_CIL">Validées CIL</option>
            <option value="REJETEE_CIL">Rejetées CIL</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, fontFamily: "inherit", outline: "none" }}>
            <option value="all">Tous les types</option>
            <option value="NORMALE">Normale</option>
            <option value="COLLECTE_SITE">Site Internet</option>
            <option value="VIDEO_SURVEILLANCE">Vidéosurveillance</option>
            <option value="AUTORISATION">Autorisation</option>
          </select>
        </div>
        <Btn variant="outline" onClick={load}><RefreshCw size={13} /> Rafraîchir</Btn>
      </PageHeader>

      {/* Compteurs statuts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Approuvées DG", statut: "APPROUVEE_DG", color: T.green },
          { label: "Rejetées DG", statut: "REJETEE_DG", color: T.red },
          { label: "Vérif. CIL", statut: "EN_VERIFICATION_CIL", color: T.purple },
          { label: "Validées CIL", statut: "VALIDEE_CIL", color: T.teal },
          { label: "Rejetées CIL", statut: "REJETEE_CIL", color: T.red },
        ].map(s => (
          <Card key={s.statut}
            onClick={() => setFilterStatut(filterStatut === s.statut ? "all" : s.statut)}
            className="card-hover"
            style={{ padding: "12px 14px", cursor: "pointer", border: filterStatut === s.statut ? `2px solid ${s.color}` : `1px solid ${T.cardBorder}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>
              {nonPending.filter(d => d.statut === s.statut).length}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><div style={{ color: T.textMuted, fontSize: 13 }}>Chargement…</div></Card>}
      {!loading && nonPending.length === 0 && (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <FileText size={36} color={T.textMuted} style={{ display: "block", margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 13, color: T.textMuted }}>Aucune déclaration dans l'historique.</p>
        </Card>
      )}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(d => <DeclarationCard key={d.idDeclaration} d={d} onView={setSelected} />)}
        </div>
      )}
      {!loading && filtered.length === 0 && nonPending.length > 0 && (
        <Card style={{ padding: 40, textAlign: "center" }}><p style={{ fontSize: 13, color: T.textMuted }}>Aucun résultat pour ce filtre.</p></Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════
export default function Tb_DG() {
  const [section, setSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [declarations, setDeclarations] = useState([]); // EN_ATTENTE uniquement
  const [allDeclarations, setAllDeclarations] = useState([]); // historique
  const [notifCount, setNotifCount] = useState(0);

  const [dgInfo, setDgInfo] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return { nom: "DG", prenom: "", id: null };
    const p = parseJwt(token);
    return {
      nom: localStorage.getItem("dgNom") || p.nom || "DG",
      prenom: localStorage.getItem("dgPrenom") || p.prenom || "",
      id: p.userId || null,
    };
  });

  // Charge les déclarations en attente au démarrage
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${BASE}/declarations/en-attente`, { headers: authH() });
        if (r.ok) setDeclarations(await r.json());
      } catch { }
    };
    load();
  }, []);

  // Polling notifications
  useEffect(() => {
    if (!dgInfo.id) return;
    const fetchCount = async () => {
      try {
        const r = await fetch(`${BASE}/notifications/${dgInfo.id}/non-lues`, { headers: authH() });
        if (!r.ok) return;
        const data = await r.json();
        setNotifCount(data.length);
      } catch { }
    };
    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => clearInterval(iv);
  }, [dgInfo.id]);

  // Merge des états pour allDeclarations (en attente + historique)
  const fullAll = [...allDeclarations, ...declarations.filter(d => !allDeclarations.find(a => a.idDeclaration === d.idDeclaration))];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDE3EC; border-radius: 4px; }
        .slide-in { animation: slideIn 0.22s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dg-card { transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; }
        .card-hover:hover { box-shadow: 0 6px 20px rgba(15,29,46,0.1) !important; transform: translateY(-1px); }
        .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #E2E8F0 !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <TopBar onToggle={() => setCollapsed(c => !c)} userId={dgInfo.id} notifCount={notifCount} setNotifCount={setNotifCount} dgInfo={dgInfo} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          active={section} setActive={setSection}
          collapsed={collapsed} dgInfo={dgInfo}
          pendingCount={declarations.length}
        />
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: T.mainBg }}>
          {section === "dashboard" && (
            <SectionDashboard
              declarations={declarations}
              allDeclarations={fullAll}
              setSection={setSection}
              dgInfo={dgInfo}
            />
          )}
          {section === "en-attente" && (
            <SectionEnAttente
              declarations={declarations}
              setDeclarations={setDeclarations}
              allDeclarations={fullAll}
              setAllDeclarations={setAllDeclarations}
            />
          )}
          {section === "historique" && (
            <SectionHistorique
              allDeclarations={fullAll}
              setAllDeclarations={setAllDeclarations}
            />
          )}
        </main>
      </div>
    </div>
  );
}