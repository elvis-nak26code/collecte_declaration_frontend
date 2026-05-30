import { useState , useEffect} from "react";
import { Users, Clock, ShieldCheck, Server, BellRing, Activity, LayoutDashboard, UserCheck, FileText, Settings, BarChart3, Menu, Bell, ChevronDown, Check, X, LogOut, TrendingUp, AlertTriangle, Circle, MapPin, Mail, Briefcase ,Phone , Building} from "lucide-react";
import SectionRequests from "../../components/SectionRequests/index.jsx";
// ═══════════════════════════════════════════════════════
//  DONNÉES & CONFIG
// ═══════════════════════════════════════════════════════
const CONFIG = {
  brand: { name: "SOFITEX", subtitle: "Système d'Administration", gold: "#B8860B", goldLight: "#D4A017" },
  admin: { name: "Mamadou Ouédraogo", role: "Super Administrateur", email: "m.ouedraogo@sofitex.bf", initials: "MO" },
  accounts: [
    { id: 1, name: "Mamadou Ouédraogo", role: "Super Admin",    email: "m.ouedraogo@sofitex.bf", initials: "MO" },
    { id: 2, name: "Aminata Traoré",    role: "Admin Régional", email: "a.traore@sofitex.bf",    initials: "AT" },
    { id: 3, name: "Ibrahim Koné",      role: "Superviseur",    email: "i.kone@sofitex.bf",      initials: "IK" },
  ],
  stats: { totalUsers: 1284, activeUsers: 1147, pendingRequests: 23, auditLogs: 45892, serversOnline: 12, alertsCount: 4 },
  connectionRequests: [
    { id: 1, user: "Fatou Diallo",    email: "f.diallo@sofitex.bf",    role: "Agent de terrain", region: "Bobo-Dioulasso", requestedAt: "2025-05-17 08:34", status: "pending",  avatar: "FD" },
    { id: 2, user: "Seydou Barro",    email: "s.barro@sofitex.bf",     role: "Technicien",       region: "Ouagadougou",   requestedAt: "2025-05-17 09:12", status: "pending",  avatar: "SB" },
    { id: 3, user: "Aïcha Compaoré",  email: "a.compaore@sofitex.bf",  role: "Comptable",        region: "Banfora",       requestedAt: "2025-05-17 09:45", status: "pending",  avatar: "AC" },
    { id: 4, user: "Moussa Sawadogo", email: "m.sawadogo@sofitex.bf",  role: "Ingénieur",        region: "Koudougou",     requestedAt: "2025-05-17 10:01", status: "pending",  avatar: "MS" },
    { id: 5, user: "Rokia Ouédraogo", email: "r.ouedraogo@sofitex.bf", role: "RH",               region: "Ouagadougou",   requestedAt: "2025-05-16 15:22", status: "pending",  avatar: "RO" },
  ],
  auditLogs: [
    { id: 1, user: "Mamadou Ouédraogo", action: "Connexion système",             ip: "192.168.1.10", time: "09:03:12", level: "info",    module: "Auth" },
    { id: 2, user: "Aminata Traoré",    action: "Modification utilisateur #482", ip: "192.168.1.25", time: "09:17:44", level: "warning", module: "Users" },
    { id: 3, user: "Système",           action: "Sauvegarde automatique DB",     ip: "10.0.0.1",     time: "09:30:00", level: "info",    module: "Backup" },
    { id: 4, user: "Ibrahim Koné",      action: "Tentative d'accès refusée",     ip: "192.168.1.42", time: "09:44:22", level: "danger",  module: "Auth" },
    { id: 5, user: "Fatou Diallo",      action: "Demande de connexion soumise",  ip: "192.168.1.77", time: "09:12:05", level: "info",    module: "Auth" },
    { id: 6, user: "Mamadou Ouédraogo", action: "Export rapport mensuel",        ip: "192.168.1.10", time: "09:55:18", level: "info",    module: "Reports" },
    { id: 7, user: "Système",           action: "Alerte: CPU > 85%",             ip: "10.0.0.2",     time: "10:01:33", level: "danger",  module: "Monitor" },
    { id: 8, user: "Aminata Traoré",    action: "Suppression fichier temp",      ip: "192.168.1.25", time: "10:12:00", level: "warning", module: "Files" },
  ],
  users: [
    { id: 1, name: "Fatou Diallo",    email: "f.diallo@sofitex.bf",    role: "Agent terrain", region: "Bobo",      status: "active",    lastLogin: "Aujourd'hui 08:12", initials: "FD" },
    { id: 2, name: "Seydou Barro",    email: "s.barro@sofitex.bf",     role: "Technicien",    region: "Ouaga",     status: "active",    lastLogin: "Hier 14:30",        initials: "SB" },
    { id: 3, name: "Aïcha Compaoré",  email: "a.compaore@sofitex.bf",  role: "Comptable",     region: "Banfora",   status: "inactive",  lastLogin: "05/14 09:00",       initials: "AC" },
    { id: 4, name: "Moussa Sawadogo", email: "m.sawadogo@sofitex.bf",  role: "Ingénieur",     region: "Koudougou", status: "active",    lastLogin: "Aujourd'hui 10:01", initials: "MS" },
    { id: 5, name: "Rokia Ouédraogo", email: "r.ouedraogo@sofitex.bf", role: "RH",            region: "Ouaga",     status: "suspended", lastLogin: "05/10 11:22",       initials: "RO" },
    { id: 6, name: "Drissa Konaté",   email: "d.konate@sofitex.bf",    role: "Superviseur",   region: "Bobo",      status: "active",    lastLogin: "Aujourd'hui 07:45", initials: "DK" },
  ],
  systemStatus: [
    { name: "Serveur Principal", status: "online",  load: 42, region: "Ouaga" },
    { name: "Serveur Backup",    status: "online",  load: 18, region: "Bobo" },
    { name: "Base de données",   status: "warning", load: 78, region: "Ouaga" },
    { name: "Serveur Fichiers",  status: "online",  load: 31, region: "Bobo" },
    { name: "API Gateway",       status: "online",  load: 55, region: "Ouaga" },
    { name: "Monitoring",        status: "offline", load: 0,  region: "Banfora" },
  ],
};

// ═══════════════════════════════════════════════════════
//  THÈME
// ═══════════════════════════════════════════════════════
const T = {
  sidebarBg:      "#0D1F12",
  sidebarBorder:  "#1A3320",
  sidebarText:    "#7A9E8A",
  sidebarActive:  "#FFFFFF",
  mainBg:         "#F4F6F9",
  cardBg:         "#FFFFFF",
  cardBorder:     "#E4E8EE",
  cardShadow:     "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  textPrimary:    "#0F1923",
  textSecondary:  "#4A5568",
  textMuted:      "#9AA5B4",
  navAccent:      "#FFFFFF",
  navAccentBg:    "rgba(52,168,103,0.12)",
  navAccentBorder:"rgba(52,168,103,0.3)",
  gold:           "#B8860B",
  goldLight:      "#FEF7E6",
  goldBorder:     "#E6B84A",
  green:          "#16A34A",
  greenBg:        "#F0FDF4",
  greenBorder:    "#BBF7D0",
  red:            "#DC2626",
  redBg:          "#FEF2F2",
  redBorder:      "#FECACA",
  yellow:         "#D97706",
  yellowBg:       "#FFFBEB",
  yellowBorder:   "#FDE68A",
  blue:           "#2563EB",
  blueBg:         "#EFF6FF",
  blueBorder:     "#BFDBFE",
  purple:         "#7C3AED",
  purpleBg:       "#F5F3FF",
  purpleBorder:   "#DDD6FE",
  teal:           "#0891B2",
  tealBg:         "#ECFEFF",
  tealBorder:     "#A5F3FC",
  gray:           "#374151",
  grayBg:         "#F9FAFB",
  grayBorder:     "#E5E7EB",
};

// ═══════════════════════════════════════════════════════
//  COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════

const Avatar = ({ initials, size = 36, bg = T.goldLight, color = T.gold, border = T.goldBorder }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: bg, border: `1.5px solid ${border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: size * 0.34, color,
    flexShrink: 0, letterSpacing: "0.03em",
    fontFamily: "'DM Mono', monospace",
  }}>{initials}</div>
);

const Badge = ({ type }) => {
  const map = {
    info:      { bg: T.blueBg,   color: T.blue,   border: T.blueBorder,   label: "Info" },
    warning:   { bg: T.yellowBg, color: T.yellow,  border: T.yellowBorder, label: "Avertissement" },
    danger:    { bg: T.redBg,    color: T.red,      border: T.redBorder,    label: "Critique" },
    active:    { bg: T.greenBg,  color: T.green,    border: T.greenBorder,  label: "Actif" },
    inactive:  { bg: T.grayBg,   color: T.gray,     border: T.grayBorder,   label: "Inactif" },
    suspended: { bg: T.redBg,    color: T.red,      border: T.redBorder,    label: "Suspendu" },
    online:    { bg: T.greenBg,  color: T.green,    border: T.greenBorder,  label: "En ligne" },
    warning2:  { bg: T.yellowBg, color: T.yellow,   border: T.yellowBorder, label: "Attention" },
    offline:   { bg: T.grayBg,   color: T.gray,     border: T.grayBorder,   label: "Hors ligne" },
    pending:   { bg: T.purpleBg, color: T.purple,   border: T.purpleBorder, label: "En attente" },
  };
  const s = map[type] || map.info;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const col = status === "online" ? T.green : status === "warning" ? T.yellow : T.textMuted;
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />;
};

const Card = ({ children, style = {}, className = "" }) => (
  <div className={`sofitex-card ${className}`} style={{
    background: T.cardBg, border: `1px solid ${T.cardBorder}`,
    borderRadius: 12, boxShadow: T.cardShadow, ...style,
  }}>
    {children}
  </div>
);

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 3, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ fontSize: 13, color: T.textMuted }}>{subtitle}</p>
    </div>
    {children && <div style={{ display: "flex", gap: 8 }}>{children}</div>}
  </div>
);

const BtnPrimary = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} className="btn-primary" style={{
    background: "#0D1F12", color: "#fff", border: "none", borderRadius: 8,
    padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 6, ...style,
  }}>{children}</button>
);

const BtnOutline = ({ children, onClick, color = T.textSecondary, style = {} }) => (
  <button onClick={onClick} className="btn-outline" style={{
    background: "transparent", color, border: `1px solid ${T.cardBorder}`,
    borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 6, ...style,
  }}>{children}</button>
);

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} style={{
    background: T.cardBg, border: `1px solid ${T.cardBorder}`,
    color: T.textSecondary, padding: "7px 12px", borderRadius: 8,
    fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer",
  }}>{children}</select>
);

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════

import Chargement from "../../components/Chargement";
import toast from 'react-hot-toast';
import {useNavigate} from "react-router-dom";

const Sidebar = ({ active, setActive, collapsed, admin, pendingCount }) => {
  const [Deconnexion,setDeconnextion] = useState(false);
  const navigate = useNavigate();

  const nav = [
    { id: "dashboard", label: "Tableau de bord",  Icon: LayoutDashboard },
    { id: "requests",  label: "Demandes d'accès", Icon: UserCheck, badge: pendingCount },
    { id: "users",     label: "Utilisateurs",      Icon: Users },
    { id: "audit",     label: "Journal d'audit",   Icon: FileText },
    // { id: "system",    label: "Statut système",    Icon: Server },
    { id: "reports",   label: "Rapports",          Icon: BarChart3 },
    { id: "settings",  label: "Paramètres",        Icon: Settings },
  ];

  return (
    <aside style={{
      width: collapsed ? 64 : 220, flexShrink: 0,
      background: T.sidebarBg,
      borderRight: `1px solid ${T.sidebarBorder}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
      overflow: "hidden",
    }}>
      {/* Profil admin */}
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={admin.initials} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Elvis Nacanabo</div>
              <div style={{ fontSize: 10, color: T.sidebarText, marginTop: 1 }}>{admin.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sidebarText, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Navigation
          </div>
        )}
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)}
              className="nav-item"
              style={{
                display: "flex", alignItems: "center",
                gap: collapsed ? 0 : 10,
                padding: collapsed ? "11px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8,
                color: isActive ? "#FFFFFF" : T.sidebarText,
                background: isActive ? "rgba(52,168,103,0.15)" : "transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: 13, cursor: "pointer", position: "relative",
                marginBottom: 2,
                transition: "all 0.15s ease",
              }}>
              {isActive && (
                <span style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 18, background: "#4ADE80", borderRadius: "0 2px 2px 0",
                }} />
              )}
              <item.Icon size={16} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{
                      background: T.red, color: "#fff", borderRadius: 10,
                      fontSize: 10, fontWeight: 700, padding: "1px 6px", minWidth: 18, textAlign: "center",
                    }}>{item.badge}</span>
                  )}
                </>
              )}
              {collapsed && item.badge > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 8, width: 7, height: 7,
                  background: T.red, borderRadius: "50%",
                }} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Déconnexion */}
      {!collapsed && (
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.sidebarBorder}` }}>
          <button 
          onClick={() => {
            setDeconnextion(true);
            localStorage.removeItem("token");
            toast.success("Déconnecté avec succès !");
            navigate("/");
          }}
          className="logout-btn" style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,2255,1)", border: "none" ,
            borderRadius: 8, padding: "9px 10px", color: "#EF4444",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.3s ease",
          }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      )}
      {Deconnexion && <Chargement texte="Deconnexion . . ."/>}
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  TOPBAR
// ═══════════════════════════════════════════════════════
const TopBar = ({ brand, currentAccount, accounts, onToggleSidebar, onSwitchAccount, alertsCount }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <header style={{
      height: 56, background: T.sidebarBg,
      borderBottom: `1px solid ${T.sidebarBorder}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", flexShrink: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onToggleSidebar} className="icon-btn" style={{
          background: "transparent", border: "none", color: T.sidebarText,
          cursor: "pointer", padding: 6, borderRadius: 6,
          display: "flex", alignItems: "center",
        }}>
          <Menu size={18} />
        </button>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", letterSpacing: "0.04em" }}>
            SOFITEX — Système de Collecte des Données Personnelles
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Alerte */}
        <div style={{ position: "relative" }}>
          <button className="icon-btn" style={{
            background: "transparent", border: "none", color: T.sidebarText,
            cursor: "pointer", padding: 7, borderRadius: 7,
            display: "flex", alignItems: "center",
          }}>
            <Bell size={17} />
          </button>
          {alertsCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4, width: 15, height: 15,
              background: T.red, color: "#fff", borderRadius: "50%",
              fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{alertsCount}</span>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: T.sidebarBorder }} />

        {/* Compte */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMenu(s => !s)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: T.navAccentBg, border: `1px solid ${T.navAccentBorder}`,
            borderRadius: 8, padding: "5px 10px", cursor: "pointer",
          }}>
            <Avatar initials={currentAccount.initials} size={26} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>
                {currentAccount.name.split(" ")[0]} {currentAccount.name.split(" ")[1]?.[0]}.
              </div>
              <div style={{ fontSize: 10, color: T.sidebarText }}>{currentAccount.role}</div>
            </div>
            <ChevronDown size={13} color={T.sidebarText} />
          </button>

          {showMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240,
              background: T.sidebarBg, border: `1px solid ${T.sidebarBorder}`,
              borderRadius: 10, overflow: "hidden", zIndex: 200,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            }}>
              <div style={{ padding: "10px 14px 8px", fontSize: 10, color: T.sidebarText, letterSpacing: "0.1em", fontWeight: 600 }}>
                CHANGER DE COMPTE
              </div>
              {accounts.map(acc => (
                <div key={acc.id} onClick={() => { onSwitchAccount(acc); setShowMenu(false); }}
                  className="account-item"
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    cursor: "pointer",
                    background: acc.id === currentAccount.id ? T.navAccentBg : "transparent",
                    transition: "all 0.12s",
                  }}>
                  <Avatar initials={acc.initials} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#F1F5F9" }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: T.sidebarText }}>{acc.role}</div>
                  </div>
                  {acc.id === currentAccount.id && <Check size={14} color="#4ADE80" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
const Toast = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      background: ok ? T.greenBg : T.redBg,
      border: `1px solid ${ok ? T.greenBorder : T.redBorder}`,
      borderRadius: 10, padding: "12px 18px",
      color: ok ? T.green : T.red,
      fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "toastIn 0.25s ease",
    }}>
      {ok ? <Check size={15} /> : <X size={15} />}
      {toast.msg}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD
// ═══════════════════════════════════════════════════════
const getRoleLabel = (t) => ({ Usager: 'Usager', DPO: 'DPO', UtilisateurMetier: 'Utilisateur Métier', Administrateur: 'Administrateur', CIL: 'CIL' })[t] ?? t ?? '—';

// Modale de rejet intégrée au dashboard (même design que SectionRequests)
const ModalRejetDashboard = ({ demande, onConfirm, onCancel, loading }) => {
  const [motif, setMotif] = useState('');
  const nomComplet = `${demande?.prenom ?? ''} ${demande?.nom ?? ''}`.trim() || demande?.email || '—';
  if (!demande) return null;
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 900, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.18s ease' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 901, width: 460, background: T.cardBg, borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', border: `1px solid ${T.cardBorder}`, animation: 'modalIn 0.22s ease', overflow: 'hidden' }}>
        {/* En-tête */}
        <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${T.cardBorder}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.redBg, border: `1px solid ${T.redBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color={T.red} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Refuser la demande</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{nomComplet}</div>
          </div>
          <button onClick={onCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>
        {/* Corps */}
        <div style={{ padding: '18px 22px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 8, letterSpacing: '0.03em' }}>
            Motif du refus <span style={{ color: T.red }}>*</span>
          </label>
          <textarea
            autoFocus
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Expliquez la raison du refus de cette demande d'accès..."
            rows={4}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${motif.trim() ? T.cardBorder : T.redBorder}`, fontSize: 13, color: T.textPrimary, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, background: T.grayBg, transition: 'border-color 0.15s', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: 11, color: motif.trim().length < 5 ? T.red : T.textMuted, marginTop: 6 }}>
            {motif.trim().length === 0 ? 'Le motif est obligatoire' : motif.trim().length < 5 ? 'Motif trop court (5 caractères min.)' : `${motif.trim().length} caractères`}
          </div>
        </div>
        {/* Pied */}
        <div style={{ padding: '14px 22px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: 'transparent', color: T.textSecondary, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Annuler
          </button>
          <button
            onClick={() => motif.trim().length >= 5 && onConfirm(motif.trim())}
            disabled={loading || motif.trim().length < 5}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: motif.trim().length >= 5 ? T.red : T.redBorder, color: '#fff', fontSize: 13, fontWeight: 600, cursor: motif.trim().length >= 5 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.15s', opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Envoi...</>
              : <><X size={13} /> Confirmer le refus</>
            }
          </button>
        </div>
      </div>
    </>
  );
};

const SectionDashboard = ({ cfg, realRequests, loadingRequests, pendingCount, setSection, onApprove, onReject }) => {
  const [approvingId,  setApprovingId]  = useState(null);   // id en cours d'approbation
  const [rejetModal,   setRejetModal]   = useState(null);   // demande à rejeter
  const [rejetLoading, setRejetLoading] = useState(false);

  const statsCards = [
    { label: "Utilisateurs totaux",  value: cfg.stats.totalUsers.toLocaleString("fr"),  sub: `${cfg.stats.activeUsers} actifs`,  color: T.green,  bgColor: T.greenBg,  borderColor: T.greenBorder,  Icon: Users },
    { label: "Demandes en attente",  value: pendingCount,                                sub: "à traiter",                        color: T.purple, bgColor: T.purpleBg, borderColor: T.purpleBorder, Icon: Clock },
    { label: "Entrées d'audit",      value: cfg.stats.auditLogs.toLocaleString("fr"),   sub: "événements journalisés",           color: T.blue,   bgColor: T.blueBg,   borderColor: T.blueBorder,   Icon: ShieldCheck },
    { label: "Alertes actives",      value: cfg.stats.alertsCount,                       sub: "à résoudre",                      color: T.red,    bgColor: T.redBg,    borderColor: T.redBorder,    Icon: BellRing },
  ];

  const handleApproveLocal = async (id) => {
    setApprovingId(id);
    await onApprove(id);
    setApprovingId(null);
  };

  const handleRejectConfirm = async (motif) => {
    setRejetLoading(true);
    await onReject(rejetModal.idDemande, motif);
    setRejetLoading(false);
    setRejetModal(null);
  };

  const pendingList = realRequests.filter(r => r.statutDemandeAcces === "EN_ATTENTE").slice(0, 4);

  return (
    <>
      <ModalRejetDashboard
        demande={rejetModal}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejetModal(null)}
        loading={rejetLoading}
      />

      <div className="slide-in">
        <PageHeader
          title="Tableau de bord"
          subtitle={`Vue d'ensemble — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
        />

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
          {statsCards.map((s, i) => (
            <Card key={i} className="card-hover" style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "12px 12px 0 0" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bgColor, border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  <s.Icon size={18} strokeWidth={1.8} />
                </div>
                <TrendingUp size={13} color={s.color} style={{ opacity: 0.4, marginTop: 4 }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, fontFamily: "'DM Mono', monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 500 }}>{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Activité + Demandes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Activité récente */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={15} color={T.textSecondary} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Activité récente</h3>
              </div>
              <button onClick={() => setSection("audit")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
            </div>
            <div style={{ padding: "8px 0" }}>
              {cfg.auditLogs.slice(0, 5).map((log, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "9px 18px", borderBottom: i < 4 ? `1px solid ${T.grayBg}` : "none" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5, background: log.level === "danger" ? T.red : log.level === "warning" ? T.yellow : T.green }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.action}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{log.user} · {log.time}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: log.level === "danger" ? T.redBg : log.level === "warning" ? T.yellowBg : T.grayBg, color: log.level === "danger" ? T.red : log.level === "warning" ? T.yellow : T.textMuted }}>{log.module}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Demandes en attente */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserCheck size={15} color={T.textSecondary} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Demandes en attente</h3>
              </div>
              <button onClick={() => setSection("requests")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
            </div>

            <div style={{ padding: "8px 0" }}>
              {/* ── Skeleton de chargement ── */}
              {loadingRequests && [1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderBottom: i < 3 ? `1px solid ${T.grayBg}` : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.cardBorder, flexShrink: 0, animation: "pulse 1.4s ease-in-out infinite" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ width: "55%", height: 11, borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ width: "35%", height: 9,  borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
                  </div>
                  <div style={{ width: 60, height: 26, borderRadius: 7, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
                </div>
              ))}

              {/* ── Liste réelle ── */}
              {!loadingRequests && pendingList.map((req, i) => {
                const initiales  = ((req.prenom?.charAt(0) ?? '') + (req.nom?.charAt(0) ?? '')).toUpperCase() || '?';
                const nomComplet = `${req.prenom ?? ''} ${req.nom ?? ''}`.trim() || req.email;
                const isApproving = approvingId === req.idDemande;
                return (
                  <div key={req.idDemande} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderBottom: i < pendingList.length - 1 ? `1px solid ${T.grayBg}` : "none", opacity: isApproving ? 0.5 : 1, transition: "opacity 0.2s" }}>
                    <Avatar initials={initiales} size={32} bg={T.purpleBg} color={T.purple} border={T.purpleBorder} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nomComplet}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{getRoleLabel(req.typeUtilisateur)}{req.ville ? ` · ${req.ville}` : ''}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {/* Bouton Approuver — spinner si en cours */}
                      <button
                        onClick={() => !isApproving && handleApproveLocal(req.idDemande)}
                        disabled={isApproving}
                        title="Approuver"
                        style={{ width: 28, height: 28, background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: isApproving ? "not-allowed" : "pointer", color: T.green }}
                      >
                        {isApproving
                          ? <span style={{ width: 11, height: 11, border: `2px solid ${T.greenBorder}`, borderTopColor: T.green, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                          : <Check size={13} />
                        }
                      </button>
                      {/* Bouton Refuser — ouvre la modale */}
                      <button
                        onClick={() => setRejetModal(req)}
                        disabled={isApproving}
                        title="Refuser"
                        style={{ width: 28, height: 28, background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: isApproving ? "not-allowed" : "pointer", color: T.red }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── Vide ── */}
              {!loadingRequests && pendingList.length === 0 && (
                <div style={{ padding: "20px 18px", fontSize: 12, color: T.textMuted, fontStyle: "italic", textAlign: "center" }}>
                  Aucune demande en attente
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : UTILISATEURS
// ═══════════════════════════════════════════════════════
const SectionUsers = ({ users, setUsers, loadingUsers, showToast }) => {
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [confirmModal, setConfirmModal] = useState(null); // { user, action }

  const filtered = users
    .filter(u => filter === "all" || u.status === filter)
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) ||
                 u.email?.toLowerCase().includes(search.toLowerCase()));

  const callApi = async (userId, action) => {
    const token = localStorage.getItem("token");
    const method = action === "supprimer" ? "DELETE" : "PUT";
    const url = action === "supprimer"
      ? `http://localhost:8080/api/admin/utilisateurs/${userId}`
      : `http://localhost:8080/api/admin/utilisateurs/${userId}/${action}`;
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  };

  const actionToStatus = { reactiver: "active", desactiver: "inactive", supprimer: "suspended" };
  const actionLabel    = { reactiver: "réactivé", desactiver: "désactivé", supprimer: "supprimé" };

  const handleAction = async (user, action) => {
    const newStatus = actionToStatus[action];
    setUsers(us => us.map(x => x.id === user.id ? { ...x, status: newStatus } : x));
    setConfirmModal(null);
    try {
      await callApi(user.id, action);
      toast.success(`Utilisateur ${actionLabel[action]} avec succès`);
    } catch {
      setUsers(us => us.map(x => x.id === user.id ? { ...x, status: user.status } : x));
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Boutons selon statut — sans "Suspendre"
  const getActions = (u) => {
    if (u.status === "active") return [
      { action: "desactiver", label: "Désactiver", color: T.gray,   bg: T.grayBg,  border: T.grayBorder  },
      { action: "supprimer",  label: "Supprimer",  color: T.red,    bg: T.redBg,   border: T.redBorder   },
    ];
    if (u.status === "inactive") return [
      { action: "reactiver",  label: "Réactiver",  color: T.green,  bg: T.greenBg, border: T.greenBorder },
      { action: "supprimer",  label: "Supprimer",  color: T.red,    bg: T.redBg,   border: T.redBorder   },
    ];
    if (u.status === "suspended") return [
      { action: "reactiver",  label: "Réactiver",  color: T.green,  bg: T.greenBg, border: T.greenBorder },
    ];
    return [];
  };

  // ── Skeleton ─────────────────────────────────────────
  if (loadingUsers) {
    return (
      <div className="slide-in">
        <PageHeader title="Utilisateurs" subtitle="Chargement des données…" />
        <Card style={{ overflow: "hidden" }}>
          <div style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}`, padding: "11px 16px", display: "flex", gap: 16 }}>
            {["40%", "12%", "12%", "14%", "10%"].map((w, i) => (
              <div key={i} style={{ height: 11, width: w, borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: i < 5 ? `1px solid ${T.cardBorder}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
              <div style={{ flex: "0 0 30%", display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ height: 13, width: "70%", borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
                <div style={{ height: 10, width: "55%", borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
              </div>
              <div style={{ flex: "0 0 13%", height: 12, borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
              <div style={{ flex: "0 0 10%", height: 22, borderRadius: 20, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
              <div style={{ flex: "0 0 14%", height: 12, borderRadius: 5, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
              <div style={{ flex: 1, display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <div style={{ width: 80, height: 28, borderRadius: 8, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
                <div style={{ width: 80, height: 28, borderRadius: 8, background: T.cardBorder, animation: "pulse 1.4s ease-in-out infinite" }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className="slide-in">

      {/* ── Modale de confirmation ── */}
      {confirmModal && (
        <>
          <div onClick={() => setConfirmModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 900, backdropFilter: "blur(2px)", animation: "fadeIn 0.18s ease" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 400, background: T.cardBg, borderRadius: 14, padding: "28px 28px 22px", boxShadow: "0 20px 60px rgba(0,0,0,.2)", border: `1px solid ${T.cardBorder}`, animation: "modalIn 0.22s ease" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>Confirmer l'action</div>
            <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
              Voulez-vous vraiment <strong>{confirmModal.action}</strong> l'utilisateur <strong>{confirmModal.user.name}</strong> ?
              {confirmModal.action === "supprimer" && (
                <div style={{ marginTop: 8, fontSize: 12, color: T.red }}>⚠️ Cette action est irréversible.</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: "transparent", fontSize: 13, cursor: "pointer", color: T.textSecondary }}>Annuler</button>
              <button onClick={() => handleAction(confirmModal.user, confirmModal.action)} style={{ padding: "7px 18px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff", background: confirmModal.action === "reactiver" ? T.green : confirmModal.action === "desactiver" ? T.gray : T.red }}>Confirmer</button>
            </div>
          </div>
        </>
      )}

      <PageHeader title="Utilisateurs" subtitle={`${users.length} utilisateur${users.length !== 1 ? "s" : ""} dans le système`}>
        {/* Barre de recherche */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", width: 230, fontFamily: "inherit" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", padding: 0 }}>
              <X size={13} />
            </button>
          )}
        </div>
        {/* Filtre statut */}
        <Select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="suspended">Suspendus</option>
        </Select>
      </PageHeader>

      {filtered.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>
            {search ? `Aucun résultat pour « ${search} »` : "Aucun utilisateur trouvé pour ce filtre."}
          </div>
        </Card>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
                {["Utilisateur", "Rôle", "Statut", "Dernière connexion", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.cardBorder}` : "none" }} className="table-row-hover">
                  {/* Utilisateur */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={u.initials} size={34} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Rôle */}
                  <td style={{ padding: "12px 16px", fontSize: 13, color: T.textSecondary }}>{u.role}</td>
                  {/* Statut */}
                  <td style={{ padding: "12px 16px" }}><Badge type={u.status} /></td>
                  {/* Dernière connexion */}
                  <td style={{ padding: "12px 16px", fontSize: 12, color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>{u.lastLogin}</td>
                  {/* Actions */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {getActions(u).map(({ action, label, color, bg, border }) => (
                        <button
                          key={action}
                          onClick={() => setConfirmModal({ user: u, action })}
                          style={{ padding: "4px 11px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", transition: "opacity .15s" }}
                          onMouseEnter={e => e.currentTarget.style.opacity = ".7"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : JOURNAL D'AUDIT
// ═══════════════════════════════════════════════════════
const SectionAudit = ({ logs }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="slide-in">
      <PageHeader title="Journal d'audit" subtitle="Traçabilité complète des activités système">
        <Select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Tous les niveaux</option>
          <option value="info">Info</option>
          <option value="warning">Avertissement</option>
          <option value="danger">Critique</option>
        </Select>
        <BtnOutline><FileText size={13} /> Exporter</BtnOutline>
      </PageHeader>

      <Card style={{ overflow: "hidden" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
              {["Heure", "Utilisateur", "Action", "Module", "IP", "Niveau"].map(h => (
                <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={i} className="table-row-hover" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.textMuted }}>{log.time}</td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: T.textSecondary, fontWeight: 500 }}>{log.user}</td>
                <td style={{ padding: "11px 16px", fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>{log.action}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ background: T.goldLight, border: `1px solid ${T.goldBorder}55`, borderRadius: 6, padding: "2px 8px", fontSize: 11, color: T.gold, fontWeight: 600 }}>{log.module}</span>
                </td>
                <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted }}>{log.ip}</td>
                <td style={{ padding: "11px 16px" }}><Badge type={log.level} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : RAPPORTS
// ═══════════════════════════════════════════════════════
const SectionReports = () => {
  const reports = [
    { title: "Rapport d'activité mensuel", desc: "Synthèse des connexions et actions utilisateurs", Icon: BarChart3,   color: T.gold,   bg: T.goldLight },
    { title: "Rapport de sécurité",        desc: "Incidents, tentatives d'accès et alertes",        Icon: ShieldCheck, color: T.red,    bg: T.redBg },
    { title: "Rapport utilisateurs",       desc: "État des comptes et statistiques d'usage",        Icon: Users,       color: T.blue,   bg: T.blueBg },
    // { title: "Rapport système",            desc: "Performance serveurs et disponibilité",           Icon: Server,      color: T.green,  bg: T.greenBg },
  ];
  return (
    <div className="slide-in">
      <PageHeader title="Rapports" subtitle="Génération et export des rapports d'activité" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {reports.map((r, i) => (
          <Card key={i} className="card-hover" style={{ padding: 22 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, marginBottom: 14 }}>
              <r.Icon size={20} strokeWidth={1.6} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 5 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 18, lineHeight: 1.55 }}>{r.desc}</div>
            <BtnOutline color={r.color} style={{ borderColor: `${r.color}44` }}>
              <FileText size={13} /> Générer le rapport
            </BtnOutline>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : PARAMÈTRES
// ═══════════════════════════════════════════════════════
const SectionSettings = () => {
  return (
    <div className="slide-in">
      <PageHeader title="Paramètres" subtitle="Configuration du système et des préférences" />
      <Card style={{ overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} color={T.gold} />
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>Notifications</h3>
        </div>

        {["Alertes système", "Rapport quotidien", "Nouvelles demandes d'accès", "Alertes de sécurité"].map((item, ii, arr) => (
          <div key={ii} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: ii < arr.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
            <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>{item}</span>
            <ToggleSwitch defaultOn={ii % 2 === 0} />
          </div>
        ))}

        <EmailSenderRow />
      </Card>
    </div>
  );
};

const EmailSenderRow = () => {
  const [email, setEmail]         = useState("notifications@systeme.com");
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState("");
  const [saved, setSaved]         = useState(false);

  const startEdit = () => {
    setDraft(email);
    setEditing(true);
    setSaved(false);
  };

  const handleSave = () => {
    if (!draft.trim() || !draft.includes("@")) return;
    setEmail(draft.trim());
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft("");
  };

  return (
    <div style={{ borderTop: `1px solid ${T.cardBorder}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Adresse d'expédition des emails
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="email"
          value={editing ? draft : email}
          disabled={!editing}
          onChange={e => setDraft(e.target.value)}
          style={{
            flex: 1, fontSize: 13, padding: "8px 12px",
            border: `1px solid ${T.cardBorder}`, borderRadius: 6,
            background: editing ? T.inputBg : T.cardBg,
            color: T.textPrimary, outline: "none",
            opacity: editing ? 1 : 0.7,
          }}
        />
        {!editing ? (
          <button onClick={startEdit} style={btnStyle(T)}>Modifier</button>
        ) : (
          <>
            <button onClick={handleSave} style={btnPrimaryStyle(T)}>Enregistrer</button>
            <button onClick={handleCancel} style={btnStyle(T)}>Annuler</button>
          </>
        )}
      </div>
      {saved && (
        <span style={{ fontSize: 11, color: T.green }}>✓ Adresse mise à jour</span>
      )}
    </div>
  );
};

const ToggleSwitch = ({ defaultOn }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(v => !v)} style={{ width: 40, height: 22, borderRadius: 22, background: on ? T.green : T.grayBorder, position: "relative", cursor: "pointer", transition: "background 0.2s ease", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
};

const btnStyle    = (T) => ({ fontSize: 12, padding: "7px 14px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textPrimary, cursor: "pointer", whiteSpace: "nowrap" });
const btnPrimaryStyle = (T) => ({ ...btnStyle(T), border: `1px solid ${T.gold}`, color: T.gold });

// ═══════════════════════════════════════════════════════
//  DASHBOARD PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function TableauDeBoard() {
  const [section, setSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(CONFIG.accounts[0]);
  const [requests, setRequests] = useState(CONFIG.connectionRequests);
  const [users,        setUsers]        = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Données API réelles, fetchées dès le montage ────────────────────────────
  // realRequests      → liste complète des demandes (format API)
  // realPendingCount  → badge sidebar + widget dashboard
  const [realRequests,     setRealRequests]     = useState([]);
  const [realPendingCount, setRealPendingCount] = useState(0);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/admin/demandes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setRealRequests(data);
        setRealPendingCount(data.filter(r => r.statutDemandeAcces === 'EN_ATTENTE').length);
      } catch (err) {
        console.error('Fetch demandes erreur:', err.message);
      }
    };

    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch utilisateurs dès le montage ───────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/admin/utilisateurs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        // Le backend filtre déjà (APPROUVEE uniquement), on mappe directement
        const mapped = data.map(u => ({
          id:        u.id,
          name:      `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email,
          email:     u.email ?? '—',
          role:      ({ Usager: 'Usager', DPO: 'DPO', UtilisateurMetier: 'Utilisateur Métier', Administrateur: 'Administrateur', CIL: 'CIL' })[u.typeUtilisateur] ?? u.typeUtilisateur ?? '—',
          status:    ({ ACTIF: 'active', INACTIF: 'inactive', SUSPENDU: 'suspended', SUPPRIME: 'suspended' })[u.statutUtilisateur] ?? 'inactive',
          lastLogin: u.dernierAcces
            ? new Date(u.dernierAcces).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : '—',
          initials:  ((u.prenom?.charAt(0) ?? '') + (u.nom?.charAt(0) ?? '')).toUpperCase() || '?',
        }));
        setUsers(mapped);
      } catch (err) {
        console.error('Fetch utilisateurs erreur:', err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Approve/reject pour le widget "Demandes en attente" du tableau de bord
  const handleApproveReal = async (id) => {
    const token = localStorage.getItem('token');
    setRealRequests(r => r.map(x => x.idDemande === id ? { ...x, statutDemandeAcces: 'APPROUVEE' } : x));
    setRealPendingCount(c => Math.max(0, c - 1));
    try {
      const res = await fetch(`http://localhost:8080/api/admin/demandes/${id}/valider`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision: 'APPROUVEE' }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRealRequests(r => r.map(x => x.idDemande === id ? { ...x, statutDemandeAcces: 'EN_ATTENTE' } : x));
      setRealPendingCount(c => c + 1);
    }
  };

  const handleRejectReal = async (id) => {
    const token = localStorage.getItem('token');
    setRealRequests(r => r.map(x => x.idDemande === id ? { ...x, statutDemandeAcces: 'REJETEE' } : x));
    setRealPendingCount(c => Math.max(0, c - 1));
    showToast("Demande refusée", "error");
    try {
      const res = await fetch(`http://localhost:8080/api/admin/demandes/${id}/rejeter`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ motif: 'Refusé depuis le tableau de bord' }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRealRequests(r => r.map(x => x.idDemande === id ? { ...x, statutDemandeAcces: 'EN_ATTENTE' } : x));
      setRealPendingCount(c => c + 1);
    }
  };

  const handleApprove = (id) => {
    setRequests(r => r.map(x => x.id === id ? { ...x, status: "approved" } : x));
  };
  const handleReject = (id) => {
    setRequests(r => r.map(x => x.id === id ? { ...x, status: "rejected" } : x));
    showToast("Demande refusée", "error");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 4px; }

        .slide-in { animation: slideIn 0.22s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .sofitex-card { transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; }
        .card-hover:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important; border-color: ${T.cardBorder} !important; transform: translateY(-1px); }

        .btn-primary { transition: all 0.15s ease; }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13,31,18,0.3); }
        .btn-outline { transition: all 0.15s ease; }
        .btn-outline:hover { background: ${T.grayBg} !important; transform: translateY(-1px); }

        .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #E2E8F0 !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.1) !important; }
        .icon-btn:hover { background: rgba(255,255,255,0.07) !important; }
        .account-item:hover { background: rgba(52,168,103,0.08) !important; }
        .table-row-hover:hover td { background: ${T.grayBg}; }

        @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>

      <TopBar
        brand={CONFIG.brand}
        currentAccount={currentAccount}
        accounts={CONFIG.accounts}
        onToggleSidebar={() => setCollapsed(c => !c)}
        onSwitchAccount={setCurrentAccount}
        alertsCount={CONFIG.stats.alertsCount}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── CORRECTION : on passe realPendingCount (valeur dynamique de l'API) ── */}
        <Sidebar
          active={section}
          setActive={setSection}
          collapsed={collapsed}
          admin={CONFIG.admin}
          pendingCount={realPendingCount}
        />

        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: T.mainBg }}>
          {section === "dashboard" && (
            <SectionDashboard cfg={CONFIG} realRequests={realRequests} pendingCount={realPendingCount} setSection={setSection} onApprove={handleApproveReal} onReject={handleRejectReal} />
          )}
          {section === "requests" && (
            // ── CORRECTION : on passe onPendingCountChange pour mettre à jour le badge ──
            <SectionRequests
              onApprove={handleApprove}
              onReject={handleReject}
              onPendingCountChange={setRealPendingCount}
            />
          )}
          {section === "users" && <SectionUsers users={users} setUsers={setUsers} loadingUsers={loadingUsers} showToast={showToast} />}
          {section === "audit" && <SectionAudit logs={CONFIG.auditLogs} />}
          {/* {section === "system" && <SectionSystem systemStatus={CONFIG.systemStatus} />} */}
          {section === "reports" && <SectionReports />}
          {section === "settings" && <SectionSettings />}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}