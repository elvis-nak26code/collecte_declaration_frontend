// TableauDeBoard.jsx — version corrigée complète
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users, Clock, ShieldCheck, BellRing, Activity, LayoutDashboard,
  UserCheck, FileText, Settings, BarChart3, Menu, Bell, ChevronDown,
  Check, X, LogOut, TrendingUp, AlertTriangle, UserCircle, Download,
  RefreshCw, Lock, Eye, EyeOff, Save, UserX
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// La section "Demandes d'accès" est désormais gérée en interne par
// SectionDemandesAcces (plus bas dans ce fichier) : elle exclut toujours
// les Usagers et classe les demandes en attente en premier.
import Chargement from "../../components/Chargement";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════
//  CONFIG & THÈME
// ═══════════════════════════════════════════════════════
const BASE = 'http://localhost:8080/api';

const T = {
  sidebarBg:"#0D1F12",sidebarBorder:"#1A3320",sidebarText:"#7A9E8A",
  mainBg:"#F4F6F9",cardBg:"#FFFFFF",cardBorder:"#E4E8EE",
  cardShadow:"0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  textPrimary:"#0F1923",textSecondary:"#4A5568",textMuted:"#9AA5B4",
  navAccentBg:"rgba(52,168,103,0.12)",navAccentBorder:"rgba(52,168,103,0.3)",
  gold:"#B8860B",goldLight:"#FEF7E6",goldBorder:"#E6B84A",
  green:"#16A34A",greenBg:"#F0FDF4",greenBorder:"#BBF7D0",
  red:"#DC2626",redBg:"#FEF2F2",redBorder:"#FECACA",
  yellow:"#D97706",yellowBg:"#FFFBEB",yellowBorder:"#FDE68A",
  blue:"#2563EB",blueBg:"#EFF6FF",blueBorder:"#BFDBFE",
  purple:"#7C3AED",purpleBg:"#F5F3FF",purpleBorder:"#DDD6FE",
  teal:"#0891B2",tealBg:"#ECFEFF",tealBorder:"#A5F3FC",
  gray:"#374151",grayBg:"#F9FAFB",grayBorder:"#E5E7EB",
};

// ── Décoder le JWT sans lib externe ──────────────────────────────────
const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return {}; }
};

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const getRoleLabel = (t) => ({
  Usager:'Usager', DPO:'DPO', UtilisateurMetier:'Utilisateur Métier',
  Administrateur:'Administrateur', CIL:'CIL', DG:'Direction Générale'
})[t] ?? t ?? '—';

// ═══════════════════════════════════════════════════════
//  COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════
const Avatar = ({ initials, size=36, bg=T.goldLight, color=T.gold, border=T.goldBorder }) => (
  <div style={{ width:size,height:size,borderRadius:"50%",background:bg,border:`1.5px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.34,color,flexShrink:0,letterSpacing:"0.03em",fontFamily:"'DM Mono',monospace" }}>{initials}</div>
);

const Badge = ({ type }) => {
  const map = {
    info:{bg:T.blueBg,color:T.blue,border:T.blueBorder,label:"Info"},
    warning:{bg:T.yellowBg,color:T.yellow,border:T.yellowBorder,label:"Avertissement"},
    danger:{bg:T.redBg,color:T.red,border:T.redBorder,label:"Critique"},
    active:{bg:T.greenBg,color:T.green,border:T.greenBorder,label:"Actif"},
    inactive:{bg:T.grayBg,color:T.gray,border:T.grayBorder,label:"Inactif"},
    suspended:{bg:T.redBg,color:T.red,border:T.redBorder,label:"Suspendu"},
    online:{bg:T.greenBg,color:T.green,border:T.greenBorder,label:"En ligne"},
    offline:{bg:T.grayBg,color:T.gray,border:T.grayBorder,label:"Hors ligne"},
    pending:{bg:T.purpleBg,color:T.purple,border:T.purpleBorder,label:"En attente"},
    SUCCES:{bg:T.greenBg,color:T.green,border:T.greenBorder,label:"Succès"},
    ECHEC:{bg:T.redBg,color:T.red,border:T.redBorder,label:"Échec"},
  };
  const s = map[type] || map.info;
  return (
    <span style={{ background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,letterSpacing:"0.02em",display:"inline-flex",alignItems:"center",gap:5 }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:s.color,display:"inline-block" }}/>
      {s.label}
    </span>
  );
};

const Card = ({ children, style={}, className="" }) => (
  <div className={`sofitex-card ${className}`} style={{ background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:12,boxShadow:T.cardShadow,...style }}>{children}</div>
);

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24 }}>
    <div>
      <h1 style={{ fontSize:20,fontWeight:700,color:T.textPrimary,marginBottom:3,letterSpacing:"-0.02em" }}>{title}</h1>
      <p style={{ fontSize:13,color:T.textMuted }}>{subtitle}</p>
    </div>
    {children && <div style={{ display:"flex",gap:8 }}>{children}</div>}
  </div>
);

const BtnPrimary = ({ children, onClick, style={}, disabled=false }) => (
  <button onClick={onClick} disabled={disabled} className="btn-primary" style={{ background:disabled?"#888":"#0D1F12",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,...style }}>{children}</button>
);

const BtnOutline = ({ children, onClick, color=T.textSecondary, style={}, disabled=false }) => (
  <button onClick={onClick} disabled={disabled} className="btn-outline" style={{ background:"transparent",color,border:`1px solid ${T.cardBorder}`,borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.6:1,display:"inline-flex",alignItems:"center",gap:6,...style }}>{children}</button>
);

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} style={{ background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.textSecondary,padding:"7px 12px",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer" }}>{children}</select>
);

const Spinner = ({ size=13, color="#fff" }) => (
  <span style={{ width:size,height:size,border:`2px solid rgba(255,255,255,0.3)`,borderTopColor:color,borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }}/>
);

// ═══════════════════════════════════════════════════════
//  PANNEAU NOTIFICATIONS — corrigé
//  - Animation d'apparition propre
//  - Marque TOUT comme lu automatiquement à l'ouverture
// ═══════════════════════════════════════════════════════
const PanneauNotifications = ({ userId, onClose, onCountChange }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  const fetchNotifs = useCallback(async () => {
    if (!userId) return;
    try {
      const r = await fetch(`${BASE}/notifications/${userId}`, { headers: authHeader() });
      if (!r.ok) return;
      const data = await r.json();
      const sorted = [...data].sort((a,b) => b.idNotification - a.idNotification);
      setNotifs(sorted);
      return sorted;
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId]);

  // À l'ouverture : fetch puis marque TOUT comme lu automatiquement
  useEffect(() => {
    const init = async () => {
      const sorted = await fetchNotifs();
      if (!sorted) return;
      const hasUnread = sorted.some(n => n.statut === 'NON_LUE');
      if (hasUnread && userId) {
        try {
          await fetch(`${BASE}/notifications/${userId}/lire-tout`, { method:'PATCH', headers: authHeader() });
          setNotifs(ns => ns.map(n => ({...n, statut:'LUE'})));
          onCountChange(0);
        } catch(e) { console.error(e); }
      } else {
        onCountChange(0);
      }
    };
    init();
  }, [userId]);

  // Fermer si clic dehors
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeColor = { ALERTE:T.red, RAPPEL:T.yellow, CONFIRMATION:T.green, RELANCE:T.yellow, DEMANDE_MODIFICATION:T.blue, DEMANDE_SUPPRESSION:T.red, PLAINTE:T.purple };
  const typeLabel = { ALERTE:'Alerte', RAPPEL:'Rappel', CONFIRMATION:'Confirmation', RELANCE:'Relance', DEMANDE_MODIFICATION:'Modif.', DEMANDE_SUPPRESSION:'Suppression', PLAINTE:'Plainte' };

  return (
    <div
      ref={ref}
      style={{
        position:"absolute",top:"calc(100% + 10px)",right:0,width:380,
        background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:14,
        boxShadow:"0 20px 50px rgba(0,0,0,0.22)",zIndex:300,overflow:"hidden",
        animation:"notifPanelIn 0.2s cubic-bezier(0.16,1,0.3,1)"
      }}
    >
      {/* Header */}
      <div style={{ padding:"14px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.grayBg }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Bell size={14} color={T.gold}/>
          <div style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>Notifications</div>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:4,borderRadius:6 }}>
          <X size={15}/>
        </button>
      </div>
      {/* Liste */}
      <div style={{ maxHeight:420,overflowY:"auto" }}>
        {loading && (
          <div style={{ padding:32,textAlign:"center",color:T.textMuted,fontSize:13 }}>
            <span style={{ display:"inline-block",width:18,height:18,border:`2px solid ${T.cardBorder}`,borderTopColor:T.gold,borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>
            <div style={{ marginTop:8 }}>Chargement…</div>
          </div>
        )}
        {!loading && notifs.length===0 && (
          <div style={{ padding:40,textAlign:"center",color:T.textMuted,fontSize:13 }}>
            <Bell size={28} color={T.cardBorder} style={{ marginBottom:10,display:"block",margin:"0 auto 10px" }}/>
            <div>Aucune notification</div>
          </div>
        )}
        {!loading && notifs.map((n, i) => {
          const col = typeColor[n.typeNotification] || T.textMuted;
          return (
            <div key={n.idNotification} style={{
              padding:"12px 16px",
              borderBottom:i<notifs.length-1?`1px solid ${T.cardBorder}`:"none",
              background:"transparent",
              display:"flex",gap:10,alignItems:"flex-start"
            }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:col,flexShrink:0,marginTop:5 }}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                  <span style={{ fontSize:10,fontWeight:700,background:`${col}18`,color:col,padding:"1px 6px",borderRadius:4 }}>
                    {typeLabel[n.typeNotification]||n.typeNotification}
                  </span>
                  <span style={{ fontSize:10,color:T.textMuted }}>{n.dateEnvoi}</span>
                </div>
                <div style={{ fontSize:12,color:T.textSecondary,lineHeight:1.5 }}>{n.contenu}</div>
                {n.dateEcheance && <div style={{ fontSize:10,color:T.textMuted,marginTop:2 }}>Échéance : {n.dateEcheance}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, collapsed, adminInfo, pendingCount }) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const initiales = ((adminInfo?.prenom?.charAt(0)??'')+(adminInfo?.nom?.charAt(0)??'')).toUpperCase() || 'AD';

  const nav = [
    { id:"dashboard", label:"Tableau de bord",  Icon:LayoutDashboard },
    { id:"requests",  label:"Demandes d'accès", Icon:UserCheck, badge:pendingCount },
    { id:"users",     label:"Utilisateurs",      Icon:Users },
    { id:"usagers",   label:"Usagers",           Icon:UserCircle },
    { id:"audit",     label:"Journal d'audit",   Icon:FileText },
    { id:"reports",   label:"Rapports",          Icon:BarChart3 },
    { id:"settings",  label:"Paramètres",        Icon:Settings },
  ];

  return (
    <aside style={{ width:collapsed?64:220,flexShrink:0,background:T.sidebarBg,borderRight:`1px solid ${T.sidebarBorder}`,display:"flex",flexDirection:"column",transition:"width 0.22s cubic-bezier(.4,0,.2,1)",overflow:"hidden" }}>
      {!collapsed && (
        <div style={{ padding:"14px 16px",borderBottom:`1px solid ${T.sidebarBorder}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Avatar initials={initiales} size={36}/>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12,fontWeight:600,color:"#F1F5F9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{adminInfo?.prenom} {adminInfo?.nom}</div>
              <div style={{ fontSize:10,color:T.sidebarText,marginTop:1 }}>Super Administrateur</div>
            </div>
          </div>
        </div>
      )}
      <nav style={{ flex:1,padding:"10px 8px",overflowY:"auto" }}>
        {!collapsed && <div style={{ fontSize:9,fontWeight:700,color:T.sidebarText,letterSpacing:"0.12em",textTransform:"uppercase",padding:"4px 8px 10px" }}>Navigation</div>}
        {nav.map(item => {
          const isActive = active===item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)} className="nav-item" style={{ display:"flex",alignItems:"center",gap:collapsed?0:10,padding:collapsed?"11px 0":"9px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,color:isActive?"#FFFFFF":T.sidebarText,background:isActive?"rgba(52,168,103,0.15)":"transparent",fontWeight:isActive?600:400,fontSize:13,cursor:"pointer",position:"relative",marginBottom:2,transition:"all 0.15s ease" }}>
              {isActive && <span style={{ position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:18,background:"#4ADE80",borderRadius:"0 2px 2px 0" }}/>}
              <item.Icon size={16} strokeWidth={isActive?2:1.5} style={{ flexShrink:0 }}/>
              {!collapsed && (
                <>
                  <span style={{ flex:1 }}>{item.label}</span>
                  {item.badge>0 && <span style={{ background:T.red,color:"#fff",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 6px",minWidth:18,textAlign:"center" }}>{item.badge}</span>}
                </>
              )}
              {collapsed && item.badge>0 && <span style={{ position:"absolute",top:6,right:8,width:7,height:7,background:T.red,borderRadius:"50%" }}/>}
            </div>
          );
        })}
      </nav>
      {!collapsed && (
        <div style={{ padding:"10px 8px",borderTop:`1px solid ${T.sidebarBorder}` }}>
          <button onClick={() => { setLoggingOut(true); localStorage.removeItem("token"); toast.success("Déconnecté !"); navigate("/"); }} className="logout-btn" style={{ width:"100%",display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",borderRadius:8,padding:"9px 10px",color:"#EF4444",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.3s ease" }}>
            <LogOut size={14}/> Déconnexion
          </button>
        </div>
      )}
      {loggingOut && <Chargement texte="Déconnexion…"/>}
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  TOPBAR
// ═══════════════════════════════════════════════════════
const TopBar = ({ onToggleSidebar, userId, notifCount, setNotifCount }) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const handleBellClick = () => setShowNotifs(v => !v);

  return (
    <header style={{ height:56,background:T.sidebarBg,borderBottom:`1px solid ${T.sidebarBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0,zIndex:100 }}>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        <button onClick={onToggleSidebar} className="icon-btn" style={{ background:"transparent",border:"none",color:T.sidebarText,cursor:"pointer",padding:6,borderRadius:6,display:"flex",alignItems:"center" }}><Menu size={18}/></button>
        {/* Logo + libellé de l'espace */}
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#E6B84A,#B8860B)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(184,134,11,0.35)" }}>
            <ShieldCheck size={16} color="#0D1F12" strokeWidth={2.4}/>
          </div>
          <div style={{ fontSize:13,fontWeight:700,color:"#E2E8F0",letterSpacing:"0.02em" }}>Espace Administrateur</div>
        </div>
      </div>
      {/* Cloche notifications */}
      <div style={{ position:"relative" }}>
        <button
          onClick={handleBellClick}
          className="icon-btn"
          style={{ background:"transparent",border:"none",color:T.sidebarText,cursor:"pointer",padding:7,borderRadius:7,display:"flex",alignItems:"center",position:"relative" }}
        >
          <Bell size={17}/>
          {notifCount > 0 && (
            <span style={{
              position:"absolute",top:2,right:2,width:16,height:16,
              background:T.red,color:"#fff",borderRadius:"50%",
              fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
              border:`2px solid ${T.sidebarBg}`
            }}>
              {notifCount > 99 ? '99+' : notifCount}
            </span>
          )}
        </button>
        {showNotifs && userId && (
          <PanneauNotifications
            userId={userId}
            onClose={() => setShowNotifs(false)}
            onCountChange={setNotifCount}
          />
        )}
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════
//  CAMEMBERT STATISTIQUES
// ═══════════════════════════════════════════════════════
const COLORS_PIE = ['#16A34A','#2563EB','#7C3AED','#0891B2','#D97706','#DC2626','#B8860B'];

const CamembertStats = ({ stats, loading }) => {
  const [activeTab, setActiveTab] = useState('roles');

  if (loading) return (
    <Card style={{ padding:24,display:"flex",alignItems:"center",justifyContent:"center",height:280 }}>
      <div style={{ textAlign:"center",color:T.textMuted,fontSize:13 }}>Chargement des statistiques…</div>
    </Card>
  );

  if (!stats) return null;

  // Préparer les données selon l'onglet
  const datasets = {
    roles: Object.entries(stats.utilisateursParRole || {}).map(([name, value]) => ({
      name: getRoleLabel(name), value
    })),
    demandes: Object.entries(stats.demandesParStatut || {}).map(([name, value]) => ({
      name: { EN_ATTENTE:'En attente', APPROUVEE:'Approuvée', REJETEE:'Rejetée' }[name] || name, value
    })),
    modules: Object.entries(stats.actionsParModule || {}).map(([name, value]) => ({
      name, value
    })).sort((a,b) => b.value - a.value).slice(0, 6),
    resultats: Object.entries(stats.actionsParResultat || {}).map(([name, value]) => ({
      name: { SUCCES:'Succès', ECHEC:'Échec' }[name] || name, value
    })),
  };

  const tabs = [
    { key:'roles',    label:'Utilisateurs' },
    { key:'demandes', label:'Demandes' },
    { key:'modules',  label:'Audit par module' },
    { key:'resultats',label:'Résultats audit' },
  ];

  const data = datasets[activeTab] || [];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card style={{ padding:0,overflow:"hidden" }}>
      {/* Header avec onglets */}
      <div style={{ padding:"14px 18px 0",borderBottom:`1px solid ${T.cardBorder}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
          <Activity size={15} color={T.textSecondary}/>
          <h3 style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>Statistiques de la plateforme</h3>
        </div>
        <div style={{ display:"flex",gap:2 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding:"6px 12px",fontSize:11,fontWeight:600,borderRadius:"6px 6px 0 0",
                border:"none",cursor:"pointer",transition:"all 0.15s",
                background:activeTab===tab.key ? T.cardBg : "transparent",
                color:activeTab===tab.key ? T.textPrimary : T.textMuted,
                borderBottom:activeTab===tab.key ? `2px solid ${T.gold}` : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding:"16px 18px",display:"flex",alignItems:"center",gap:24 }}>
        {data.length === 0 ? (
          <div style={{ flex:1,textAlign:"center",padding:40,color:T.textMuted,fontSize:12,fontStyle:"italic" }}>
            Aucune donnée disponible
          </div>
        ) : (
          <>
            {/* Camembert */}
            <div style={{ width:200,height:200,flexShrink:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Nombre']}
                    contentStyle={{ borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Légende détaillée */}
            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:8 }}>
              {data.map((entry, index) => {
                const pct = total > 0 ? Math.round(entry.value / total * 100) : 0;
                return (
                  <div key={index} style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:10,height:10,borderRadius:3,background:COLORS_PIE[index % COLORS_PIE.length],flexShrink:0 }}/>
                    <div style={{ flex:1,fontSize:12,color:T.textSecondary,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{entry.name}</div>
                    <div style={{ fontSize:12,fontWeight:700,color:T.textPrimary,fontFamily:"'DM Mono',monospace" }}>{entry.value}</div>
                    <div style={{ fontSize:11,color:T.textMuted,minWidth:32,textAlign:"right" }}>{pct}%</div>
                    {/* Barre de progression */}
                    <div style={{ width:60,height:4,borderRadius:2,background:T.cardBorder,overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`,height:"100%",background:COLORS_PIE[index % COLORS_PIE.length],borderRadius:2 }}/>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop:4,paddingTop:8,borderTop:`1px solid ${T.cardBorder}`,display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMuted }}>
                <span>Total</span>
                <span style={{ fontWeight:700,color:T.textPrimary,fontFamily:"'DM Mono',monospace" }}>{total}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION DASHBOARD — avec camembert
// ═══════════════════════════════════════════════════════
const ModalRejetDashboard = ({ demande, onConfirm, onCancel, loading }) => {
  const [motif, setMotif] = useState('');
  const nomComplet = `${demande?.prenom??''} ${demande?.nom??''}`.trim() || demande?.email || '—';
  if (!demande) return null;
  return (
    <>
      <div onClick={onCancel} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:900,backdropFilter:'blur(2px)',animation:'fadeIn 0.18s ease' }}/>
      <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:901,width:460,background:T.cardBg,borderRadius:16,boxShadow:'0 24px 60px rgba(0,0,0,0.2)',border:`1px solid ${T.cardBorder}`,animation:'modalIn 0.22s ease',overflow:'hidden' }}>
        <div style={{ padding:'20px 22px 16px',borderBottom:`1px solid ${T.cardBorder}`,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:T.redBg,border:`1px solid ${T.redBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><AlertTriangle size={18} color={T.red}/></div>
          <div><div style={{ fontSize:15,fontWeight:700,color:T.textPrimary }}>Refuser la demande</div><div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>{nomComplet}</div></div>
          <button onClick={onCancel} style={{ marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:T.textMuted,display:'flex',padding:4,borderRadius:6 }}><X size={16}/></button>
        </div>
        <div style={{ padding:'18px 22px' }}>
          <label style={{ display:'block',fontSize:12,fontWeight:600,color:T.textSecondary,marginBottom:8,letterSpacing:'0.03em' }}>Motif du refus <span style={{ color:T.red }}>*</span></label>
          <textarea autoFocus value={motif} onChange={e=>setMotif(e.target.value)} placeholder="Expliquez la raison…" rows={4} style={{ width:'100%',padding:'10px 12px',borderRadius:8,border:`1px solid ${motif.trim()?T.cardBorder:T.redBorder}`,fontSize:13,color:T.textPrimary,fontFamily:'inherit',resize:'vertical',outline:'none',lineHeight:1.6,background:T.grayBg,boxSizing:'border-box' }}/>
          <div style={{ fontSize:11,color:motif.trim().length<5?T.red:T.textMuted,marginTop:6 }}>{motif.trim().length===0?'Le motif est obligatoire':motif.trim().length<5?'Motif trop court (5 min.)':`${motif.trim().length} caractères`}</div>
        </div>
        <div style={{ padding:'14px 22px 20px',display:'flex',justifyContent:'flex-end',gap:10 }}>
          <button onClick={onCancel} disabled={loading} style={{ padding:'8px 18px',borderRadius:8,border:`1px solid ${T.cardBorder}`,background:'transparent',color:T.textSecondary,fontSize:13,fontWeight:500,cursor:'pointer' }}>Annuler</button>
          <button onClick={() => motif.trim().length>=5 && onConfirm(motif.trim())} disabled={loading||motif.trim().length<5} style={{ padding:'8px 20px',borderRadius:8,border:'none',background:motif.trim().length>=5?T.red:T.redBorder,color:'#fff',fontSize:13,fontWeight:600,cursor:motif.trim().length>=5?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:7,opacity:loading?0.7:1 }}>
            {loading?<><Spinner/> Envoi…</>:<><X size={13}/> Confirmer le refus</>}
          </button>
        </div>
      </div>
    </>
  );
};

const SectionDashboard = ({ adminInfo, realRequests, loadingRequests, pendingCount, setSection, onApprove, onReject }) => {
  const [approvingId, setApprovingId] = useState(null);
  const [rejetModal, setRejetModal]   = useState(null);
  const [rejetLoading, setRejetLoading] = useState(false);
  const [dashStats, setDashStats]     = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats pour le camembert
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const r = await fetch(`${BASE}/admin/stats`, { headers: authHeader() });
        if (r.ok) {
          const data = await r.json();
          setDashStats(data);
        }
      } catch(e) { console.error(e); }
      finally { setLoadingStats(false); }
    };
    fetchStats();
  }, []);

  const statsCards = [
    { label:"Demandes en attente", value:pendingCount, sub:"à traiter", color:T.purple, bgColor:T.purpleBg, borderColor:T.purpleBorder, Icon:Clock },
    { label:"Demandes totales",    value:realRequests.filter(r=>r.typeUtilisateur!=='Usager').length, sub:"hors usagers", color:T.blue,   bgColor:T.blueBg,   borderColor:T.blueBorder,   Icon:Users },
    { label:"Approuvées",          value:realRequests.filter(r=>r.statutDemandeAcces==='APPROUVEE'&&r.typeUtilisateur!=='Usager').length, sub:"accès validés", color:T.green,  bgColor:T.greenBg,  borderColor:T.greenBorder,  Icon:ShieldCheck },
    { label:"Rejetées",            value:realRequests.filter(r=>r.statutDemandeAcces==='REJETEE'&&r.typeUtilisateur!=='Usager').length,   sub:"refusées",    color:T.red,    bgColor:T.redBg,    borderColor:T.redBorder,    Icon:BellRing },
  ];

  const handleApproveLocal = async (id) => { setApprovingId(id); await onApprove(id); setApprovingId(null); };
  const handleRejectConfirm = async (motif) => { setRejetLoading(true); await onReject(rejetModal.idDemande, motif); setRejetLoading(false); setRejetModal(null); };

  // Demandes en attente, non-Usager, plus récentes en premier
  const pendingList = realRequests
    .filter(r => r.statutDemandeAcces==='EN_ATTENTE' && r.typeUtilisateur!=='Usager')
    .sort((a,b) => new Date(b.dateDemande) - new Date(a.dateDemande))
    .slice(0, 4);

  return (
    <>
      <ModalRejetDashboard demande={rejetModal} onConfirm={handleRejectConfirm} onCancel={() => setRejetModal(null)} loading={rejetLoading}/>
      <div className="slide-in">
        <PageHeader title="Tableau de bord" subtitle={`Vue d'ensemble — ${new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`}/>

        {/* Stats cards */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4, minmax(0,1fr))",gap:14,marginBottom:20 }}>
          {statsCards.map((s,i) => (
            <Card key={i} className="card-hover" style={{ padding:"18px 20px",position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:s.color,borderRadius:"12px 12px 0 0" }}/>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:s.bgColor,border:`1px solid ${s.borderColor}`,display:"flex",alignItems:"center",justifyContent:"center",color:s.color }}><s.Icon size={18} strokeWidth={1.8}/></div>
                <TrendingUp size={13} color={s.color} style={{ opacity:0.4,marginTop:4 }}/>
              </div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:26,fontWeight:800,color:T.textPrimary,fontFamily:"'DM Mono',monospace",lineHeight:1,letterSpacing:"-0.02em" }}>{s.value}</div>
              <div style={{ fontSize:11,color:s.color,marginTop:5,fontWeight:500 }}>{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Grille : camembert + demandes récentes */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:0 }}>
          {/* Camembert */}
          <CamembertStats stats={dashStats} loading={loadingStats}/>

          {/* Demandes récentes */}
          <Card style={{ padding:0,overflow:"hidden" }}>
            <div style={{ padding:"16px 18px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}><UserCheck size={15} color={T.textSecondary}/><h3 style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>Demandes en attente</h3></div>
              <button onClick={() => setSection("requests")} style={{ fontSize:12,color:T.gold,background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Voir tout →</button>
            </div>
            <div style={{ padding:"8px 0" }}>
              {loadingRequests && [1,2,3].map(i=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 18px",borderBottom:i<3?`1px solid ${T.grayBg}`:"none" }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:T.cardBorder,flexShrink:0,animation:"pulse 1.4s ease-in-out infinite" }}/>
                  <div style={{ flex:1,display:"flex",flexDirection:"column",gap:7 }}>
                    <div style={{ width:"55%",height:11,borderRadius:5,background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
                    <div style={{ width:"35%",height:9,borderRadius:5,background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
                  </div>
                </div>
              ))}
              {!loadingRequests && pendingList.map((req,i) => {
                const initiales = ((req.prenom?.charAt(0)??'')+(req.nom?.charAt(0)??'')).toUpperCase()||'?';
                const nomComplet = `${req.prenom??''} ${req.nom??''}`.trim()||req.email;
                const isApproving = approvingId===req.idDemande;
                return (
                  <div key={req.idDemande} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 18px",borderBottom:i<pendingList.length-1?`1px solid ${T.grayBg}`:"none",opacity:isApproving?0.5:1,transition:"opacity 0.2s" }}>
                    <Avatar initials={initiales} size={32} bg={T.purpleBg} color={T.purple} border={T.purpleBorder}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:600,color:T.textPrimary,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{nomComplet}</div>
                      <div style={{ fontSize:11,color:T.textMuted }}>{getRoleLabel(req.typeUtilisateur)}{req.ville?` · ${req.ville}`:''}</div>
                    </div>
                    <div style={{ display:"flex",gap:5 }}>
                      <button onClick={() => !isApproving && handleApproveLocal(req.idDemande)} disabled={isApproving} title="Approuver" style={{ width:28,height:28,background:T.greenBg,border:`1px solid ${T.greenBorder}`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:isApproving?"not-allowed":"pointer",color:T.green }}>
                        {isApproving?<Spinner size={11} color={T.green}/>:<Check size={13}/>}
                      </button>
                      <button onClick={() => setRejetModal(req)} disabled={isApproving} title="Refuser" style={{ width:28,height:28,background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:isApproving?"not-allowed":"pointer",color:T.red }}><X size={13}/></button>
                    </div>
                  </div>
                );
              })}
              {!loadingRequests && pendingList.length===0 && <div style={{ padding:"30px 18px",fontSize:12,color:T.textMuted,fontStyle:"italic",textAlign:"center" }}>✓ Aucune demande en attente</div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION DEMANDES D'ACCÈS — hors Usagers, nouvelles en premier
//  Tableau (même style que Utilisateurs / Usagers / Journal d'audit),
//  avec recherche + filtres, et le motif consultable en un clic.
//  Classement : EN_ATTENTE (plus récentes en premier) puis
//  APPROUVEE / REJETEE (les plus anciennes / déjà traitées) en bas.
// ═══════════════════════════════════════════════════════
const SectionDemandesAcces = ({ realRequests, loadingRequests, onApprove, onReject }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [approvingId, setApprovingId] = useState(null);
  const [rejetModal, setRejetModal] = useState(null);
  const [rejetLoading, setRejetLoading] = useState(false);
  const [motifModal, setMotifModal] = useState(null); // demande dont on affiche le motif complet

  // Les Usagers ne doivent jamais apparaître dans les demandes d'accès :
  // ils se connectent directement sans validation administrative.
  const horsUsagers = realRequests.filter(r => r.typeUtilisateur !== 'Usager');

  const statusBadge = { EN_ATTENTE:'pending', APPROUVEE:'active', REJETEE:'suspended' };
  const statusLabel = { EN_ATTENTE:'En attente', APPROUVEE:'Approuvée', REJETEE:'Rejetée' };
  const roles = [...new Set(horsUsagers.map(r => r.typeUtilisateur))].filter(Boolean);

  const filtered = horsUsagers
    .filter(r => statusFilter==="all" || r.statutDemandeAcces===statusFilter)
    .filter(r => roleFilter==="all" || r.typeUtilisateur===roleFilter)
    .filter(r => {
      const nomComplet = `${r.prenom??''} ${r.nom??''}`.toLowerCase();
      return nomComplet.includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase());
    })
    // Classement : demandes en attente (nouvelles) en haut, triées de la plus
    // récente à la plus ancienne ; demandes déjà traitées (anciennes / validées)
    // en dessous, également triées de la plus récente à la plus ancienne.
    .sort((a,b) => {
      const rang = (s) => s==='EN_ATTENTE' ? 0 : 1;
      const ra = rang(a.statutDemandeAcces), rb = rang(b.statutDemandeAcces);
      if (ra !== rb) return ra - rb;
      return new Date(b.dateDemande) - new Date(a.dateDemande);
    });

  const handleApproveLocal = async (id) => { setApprovingId(id); await onApprove(id); setApprovingId(null); };
  const handleRejectConfirm = async (motif) => { setRejetLoading(true); await onReject(rejetModal.idDemande, motif); setRejetLoading(false); setRejetModal(null); };

  if (loadingRequests) return (
    <div className="slide-in"><PageHeader title="Demandes d'accès" subtitle="Chargement…"/>
      <Card style={{ overflow:"hidden" }}>
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{ display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderBottom:`1px solid ${T.cardBorder}` }}>
            <div style={{ width:34,height:34,borderRadius:"50%",background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:7 }}>
              <div style={{ height:13,width:"40%",borderRadius:5,background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
              <div style={{ height:10,width:"30%",borderRadius:5,background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );

  return (
    <div className="slide-in">
      <ModalRejetDashboard demande={rejetModal} onConfirm={handleRejectConfirm} onCancel={() => setRejetModal(null)} loading={rejetLoading}/>
      {motifModal && (
        <>
          <div onClick={() => setMotifModal(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:900,backdropFilter:'blur(2px)',animation:'fadeIn 0.18s ease' }}/>
          <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:901,width:460,background:T.cardBg,borderRadius:16,boxShadow:'0 24px 60px rgba(0,0,0,0.2)',border:`1px solid ${T.cardBorder}`,animation:'modalIn 0.22s ease',overflow:'hidden' }}>
            <div style={{ padding:'20px 22px 16px',borderBottom:`1px solid ${T.cardBorder}`,display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:T.blueBg,border:`1px solid ${T.blueBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><FileText size={18} color={T.blue}/></div>
              <div>
                <div style={{ fontSize:15,fontWeight:700,color:T.textPrimary }}>Motif de la demande</div>
                <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>{`${motifModal.prenom??''} ${motifModal.nom??''}`.trim()||motifModal.email}</div>
              </div>
              <button onClick={() => setMotifModal(null)} style={{ marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:T.textMuted,display:'flex',padding:4,borderRadius:6 }}><X size={16}/></button>
            </div>
            <div style={{ padding:'18px 22px',fontSize:13,color:T.textSecondary,lineHeight:1.7,whiteSpace:'pre-wrap' }}>
              {motifModal.motif?.trim() ? motifModal.motif : <span style={{ fontStyle:'italic',color:T.textMuted }}>Aucun motif renseigné pour cette demande.</span>}
            </div>
            <div style={{ padding:'0 22px 20px',display:'flex',justifyContent:'flex-end' }}>
              <button onClick={() => setMotifModal(null)} style={{ padding:'8px 18px',borderRadius:8,border:`1px solid ${T.cardBorder}`,background:'transparent',color:T.textSecondary,fontSize:13,fontWeight:500,cursor:'pointer' }}>Fermer</button>
            </div>
          </div>
        </>
      )}
      <PageHeader title="Demandes d'accès" subtitle={`${filtered.length} demande(s) — hors Usagers · nouvelles en premier`}>
        <div style={{ position:"relative",display:"flex",alignItems:"center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute",left:10,pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:30,paddingRight:10,paddingTop:7,paddingBottom:7,borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.cardBg,outline:"none",width:220,fontFamily:"inherit" }}/>
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute",right:8,background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:0 }}><X size={13}/></button>}
        </div>
        <Select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="all">Tous les rôles</option>
          {roles.map(r=><option key={r} value={r}>{getRoleLabel(r)}</option>)}
        </Select>
        <Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVEE">Approuvées</option>
          <option value="REJETEE">Rejetées</option>
        </Select>
      </PageHeader>
      {filtered.length===0 ? (
        <Card style={{ padding:40,textAlign:"center" }}><div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic" }}>{search?`Aucun résultat pour « ${search} »`:"Aucune demande trouvée."}</div></Card>
      ) : (
        <Card style={{ overflow:"hidden" }}>
          <table style={{ borderCollapse:"collapse",width:"100%" }}>
            <thead><tr style={{ background:T.grayBg,borderBottom:`1px solid ${T.cardBorder}` }}>
              {["Demandeur","Rôle","Ville","Motif","Date de la demande","Statut","Actions"].map(h=>(
                <th key={h} style={{ padding:"11px 16px",fontSize:11,fontWeight:700,color:T.textMuted,textAlign:"left",letterSpacing:"0.07em",textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((req,i) => {
                const initiales = ((req.prenom?.charAt(0)??'')+(req.nom?.charAt(0)??'')).toUpperCase()||'?';
                const nomComplet = `${req.prenom??''} ${req.nom??''}`.trim()||req.email;
                const isApproving = approvingId===req.idDemande;
                const enAttente = req.statutDemandeAcces==='EN_ATTENTE';
                return (
                  <tr key={req.idDemande} style={{ borderBottom:i<filtered.length-1?`1px solid ${T.cardBorder}`:"none",opacity:isApproving?0.5:1 }} className="table-row-hover">
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <Avatar initials={initiales} size={34} bg={T.purpleBg} color={T.purple} border={T.purpleBorder}/>
                        <div><div style={{ fontSize:13,fontWeight:600,color:T.textPrimary }}>{nomComplet}</div><div style={{ fontSize:11,color:T.textMuted }}>{req.email}</div></div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px",fontSize:13,color:T.textSecondary }}>{getRoleLabel(req.typeUtilisateur)}</td>
                    <td style={{ padding:"12px 16px",fontSize:13,color:T.textSecondary }}>{req.ville||'—'}</td>
                    <td style={{ padding:"12px 16px" }}>
                      {req.motif?.trim() ? (
                        <button onClick={() => setMotifModal(req)} title="Voir le motif complet" style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:0,maxWidth:180 }}>
                          <span style={{ fontSize:12,color:T.textSecondary,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{req.motif}</span>
                          <Eye size={13} color={T.blue} style={{ flexShrink:0 }}/>
                        </button>
                      ) : (
                        <span style={{ fontSize:12,color:T.textMuted,fontStyle:"italic" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding:"12px 16px",fontSize:12,color:T.textMuted,fontFamily:"'DM Mono',monospace" }}>{req.dateDemande ? new Date(req.dateDemande).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                    <td style={{ padding:"12px 16px" }}><Badge type={statusBadge[req.statutDemandeAcces]||'info'}/></td>
                    <td style={{ padding:"12px 16px" }}>
                      {enAttente ? (
                        <div style={{ display:"flex",gap:5 }}>
                          <button onClick={() => !isApproving && handleApproveLocal(req.idDemande)} disabled={isApproving} title="Approuver" style={{ width:28,height:28,background:T.greenBg,border:`1px solid ${T.greenBorder}`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:isApproving?"not-allowed":"pointer",color:T.green }}>
                            {isApproving?<Spinner size={11} color={T.green}/>:<Check size={13}/>}
                          </button>
                          <button onClick={() => setRejetModal(req)} disabled={isApproving} title="Refuser" style={{ width:28,height:28,background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:isApproving?"not-allowed":"pointer",color:T.red }}><X size={13}/></button>
                        </div>
                      ) : (
                        <span style={{ fontSize:11,color:T.textMuted,fontStyle:"italic" }}>{statusLabel[req.statutDemandeAcces]||'Traitée'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION UTILISATEURS (hors Usagers, uniquement approuvés)
// ═══════════════════════════════════════════════════════
const SectionUsers = ({ users, setUsers, loadingUsers }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);

  // Hors usagers ET uniquement ceux dont la demande est APPROUVEE
  const nonUsagers = users.filter(u =>
    u.role !== 'Usager' &&
    (u.statutDemandeAcces === 'APPROUVEE' || u.statutDemandeAcces == null)
  );
  const filtered = nonUsagers
    .filter(u => filter==="all" || u.status===filter)
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const callApi = async (userId, action) => {
    const method = action==="supprimer"?"DELETE":"PUT";
    const url = action==="supprimer"
      ? `${BASE}/admin/utilisateurs/${userId}`
      : `${BASE}/admin/utilisateurs/${userId}/statut`;
    const body = action==="supprimer" ? undefined : JSON.stringify({ statut: action==="reactiver"?"ACTIF":action==="desactiver"?"INACTIF":"SUSPENDU" });
    const res = await fetch(url, { method, headers:{ ...authHeader(),'Content-Type':'application/json' }, body });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  };

  const handleAction = async (user, action) => {
    const newStatus = { reactiver:"active", desactiver:"inactive", supprimer:"suspended" }[action];
    setUsers(us => us.map(x => x.id===user.id ? {...x,status:newStatus} : x));
    setConfirmModal(null);
    try {
      await callApi(user.id, action);
      toast.success(`Utilisateur ${{ reactiver:"réactivé", desactiver:"désactivé", supprimer:"supprimé" }[action]}`);
    } catch {
      setUsers(us => us.map(x => x.id===user.id ? {...x,status:user.status} : x));
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getActions = (u) => {
    if (u.status==="active")    return [{ action:"desactiver",label:"Désactiver",color:T.gray,bg:T.grayBg,border:T.grayBorder },{ action:"supprimer",label:"Supprimer",color:T.red,bg:T.redBg,border:T.redBorder }];
    if (u.status==="inactive")  return [{ action:"reactiver",label:"Réactiver",color:T.green,bg:T.greenBg,border:T.greenBorder },{ action:"supprimer",label:"Supprimer",color:T.red,bg:T.redBg,border:T.redBorder }];
    if (u.status==="suspended") return [{ action:"reactiver",label:"Réactiver",color:T.green,bg:T.greenBg,border:T.greenBorder }];
    return [];
  };

  if (loadingUsers) return (
    <div className="slide-in"><PageHeader title="Utilisateurs" subtitle="Chargement…"/>
      <Card style={{ overflow:"hidden" }}>
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{ display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderBottom:`1px solid ${T.cardBorder}` }}>
            <div style={{ width:34,height:34,borderRadius:"50%",background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:7 }}>
              <div style={{ height:13,width:"40%",borderRadius:5,background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
              <div style={{ height:10,width:"30%",borderRadius:5,background:T.cardBorder,animation:"pulse 1.4s ease-in-out infinite" }}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );

  return (
    <div className="slide-in">
      {confirmModal && (
        <>
          <div onClick={() => setConfirmModal(null)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:900,backdropFilter:"blur(2px)" }}/>
          <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,width:400,background:T.cardBg,borderRadius:14,padding:"28px 28px 22px",boxShadow:"0 20px 60px rgba(0,0,0,.2)",border:`1px solid ${T.cardBorder}`,animation:"modalIn 0.22s ease" }}>
            <div style={{ fontSize:15,fontWeight:700,color:T.textPrimary,marginBottom:8 }}>Confirmer l'action</div>
            <div style={{ fontSize:13,color:T.textSecondary,marginBottom:24,lineHeight:1.6 }}>
              Voulez-vous vraiment <strong>{confirmModal.action}</strong> l'utilisateur <strong>{confirmModal.user.name}</strong> ?
              {confirmModal.action==="supprimer" && <div style={{ marginTop:8,fontSize:12,color:T.red }}>⚠️ Cette action est irréversible.</div>}
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding:"7px 18px",borderRadius:8,border:`1px solid ${T.cardBorder}`,background:"transparent",fontSize:13,cursor:"pointer",color:T.textSecondary }}>Annuler</button>
              <button onClick={() => handleAction(confirmModal.user,confirmModal.action)} style={{ padding:"7px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",color:"#fff",background:confirmModal.action==="reactiver"?T.green:confirmModal.action==="desactiver"?T.gray:T.red }}>Confirmer</button>
            </div>
          </div>
        </>
      )}
      <PageHeader title="Utilisateurs" subtitle={`${nonUsagers.length} utilisateur(s) approuvé(s) — hors Usagers`}>
        <div style={{ position:"relative",display:"flex",alignItems:"center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute",left:10,pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:30,paddingRight:10,paddingTop:7,paddingBottom:7,borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.cardBg,outline:"none",width:230,fontFamily:"inherit" }}/>
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute",right:8,background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:0 }}><X size={13}/></button>}
        </div>
        <Select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="suspended">Suspendus</option>
        </Select>
      </PageHeader>
      {filtered.length===0 ? (
        <Card style={{ padding:40,textAlign:"center" }}><div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic" }}>{search?`Aucun résultat pour « ${search} »`:"Aucun utilisateur trouvé."}</div></Card>
      ) : (
        <Card style={{ overflow:"hidden" }}>
          <table style={{ borderCollapse:"collapse",width:"100%" }}>
            <thead><tr style={{ background:T.grayBg,borderBottom:`1px solid ${T.cardBorder}` }}>
              {["Utilisateur","Rôle","Statut","Actions"].map(h=>(
                <th key={h} style={{ padding:"11px 16px",fontSize:11,fontWeight:700,color:T.textMuted,textAlign:"left",letterSpacing:"0.07em",textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((u,i)=>(
                <tr key={u.id} style={{ borderBottom:i<filtered.length-1?`1px solid ${T.cardBorder}`:"none" }} className="table-row-hover">
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <Avatar initials={u.initials} size={34}/>
                      <div><div style={{ fontSize:13,fontWeight:600,color:T.textPrimary }}>{u.name}</div><div style={{ fontSize:11,color:T.textMuted }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px",fontSize:13,color:T.textSecondary }}>{u.role}</td>
                  <td style={{ padding:"12px 16px" }}><Badge type={u.status}/></td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                      {getActions(u).map(({ action,label,color,bg,border })=>(
                        <button key={action} onClick={() => setConfirmModal({user:u,action})} style={{ padding:"4px 11px",fontSize:11,fontWeight:600,borderRadius:7,border:`1px solid ${border}`,background:bg,color,cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{label}</button>
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
//  SECTION USAGERS — TOUS les usagers sans exception
// ═══════════════════════════════════════════════════════
const SectionUsagers = ({ users, loadingUsers }) => {
  const [search, setSearch] = useState("");

  // TOUS les usagers, sans filtre statut
  const tousUsagers = users.filter(u => u.role === 'Usager');
  const usagers = tousUsagers
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="slide-in">
      <PageHeader title="Usagers" subtitle={`${tousUsagers.length} usager(s) au total`}>
        <div style={{ position:"relative",display:"flex",alignItems:"center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute",left:10,pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:30,paddingRight:10,paddingTop:7,paddingBottom:7,borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.cardBg,outline:"none",width:230,fontFamily:"inherit" }}/>
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute",right:8,background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:0 }}><X size={13}/></button>}
        </div>
      </PageHeader>
      {loadingUsers ? (
        <Card style={{ padding:40,textAlign:"center" }}><div style={{ fontSize:13,color:T.textMuted }}>Chargement…</div></Card>
      ) : usagers.length===0 ? (
        <Card style={{ padding:40,textAlign:"center" }}>
          <UserX size={32} color={T.textMuted} style={{ marginBottom:12 }}/>
          <div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic" }}>{search?`Aucun résultat pour « ${search} »`:"Aucun usager trouvé."}</div>
        </Card>
      ) : (
        <Card style={{ overflow:"hidden" }}>
          <table style={{ borderCollapse:"collapse",width:"100%" }}>
            <thead><tr style={{ background:T.grayBg,borderBottom:`1px solid ${T.cardBorder}` }}>
              {["Usager","Email"].map(h=>(
                <th key={h} style={{ padding:"11px 16px",fontSize:11,fontWeight:700,color:T.textMuted,textAlign:"left",letterSpacing:"0.07em",textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {usagers.map((u,i)=>(
                <tr key={u.id} style={{ borderBottom:i<usagers.length-1?`1px solid ${T.cardBorder}`:"none" }} className="table-row-hover">
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <Avatar initials={u.initials} size={34} bg={T.tealBg} color={T.teal} border={T.tealBorder}/>
                      <div style={{ fontSize:13,fontWeight:600,color:T.textPrimary }}>{u.name}</div>
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px",fontSize:12,color:T.textMuted }}>{u.email}</td>
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
//  SECTION JOURNAL D'AUDIT — toutes les actions
// ═══════════════════════════════════════════════════════
const SectionAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/admin/journal-audit`, { headers: authHeader() });
      if (!r.ok) return;
      const data = await r.json();
      // Afficher TOUTES les actions sans exception
      setLogs(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs
    .filter(l => filter==="all" || l.resultatAction===filter)
    .filter(l => moduleFilter==="all" || l.moduleConserne===moduleFilter)
    .filter(l => roleFilter==="all" || l.utilisateurRole===roleFilter);

  const modules = [...new Set(logs.map(l=>l.moduleConserne))].filter(Boolean);
  const roles   = [...new Set(logs.map(l=>l.utilisateurRole))].filter(Boolean);

  const typeActionLabel = {
    CREATION:'Création', MODIFICATION:'Modification', SUPPRESSION:'Suppression',
    CONSULTATION:'Consultation', CONNEXION:'Connexion'
  };
  const moduleColor = {
    DECLARATION:T.blue, DEMANDE:T.purple, PLAINTE:T.red,
    UTILISATEUR:T.green, DONNEE:T.teal, TRAITEMENT:T.gold, SESSION:T.gray
  };

  const exportCSV = () => {
    const header = "Date,Utilisateur,Email,Rôle,Action,Module,Résultat\n";
    const rows = filtered.map(l =>
      `${l.dateAction},"${l.utilisateurNomPrenom||''}","${l.utilisateurEmail||''}","${getRoleLabel(l.utilisateurRole)}","${typeActionLabel[l.typeAction]||l.typeAction}","${l.moduleConserne}","${l.resultatAction}"`
    ).join('\n');
    const blob = new Blob([header+rows], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`journal_audit_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="slide-in">
      <PageHeader title="Journal d'audit" subtitle={`${filtered.length} entrée(s) — toutes les actions de la plateforme`}>
        <Select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="all">Tous les rôles</option>
          {roles.map(r=><option key={r} value={r}>{getRoleLabel(r)}</option>)}
        </Select>
        <Select value={moduleFilter} onChange={e=>setModuleFilter(e.target.value)}>
          <option value="all">Tous les modules</option>
          {modules.map(m=><option key={m} value={m}>{m}</option>)}
        </Select>
        <Select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">Tous les résultats</option>
          <option value="SUCCES">Succès</option>
          <option value="ECHEC">Échec</option>
        </Select>
        <BtnOutline onClick={exportCSV}><Download size={13}/> CSV</BtnOutline>
        <BtnOutline onClick={fetchLogs}><RefreshCw size={13}/> Rafraîchir</BtnOutline>
      </PageHeader>
      {loading ? (
        <Card style={{ padding:40,textAlign:"center" }}><div style={{ fontSize:13,color:T.textMuted }}>Chargement du journal…</div></Card>
      ) : (
        <Card style={{ overflow:"hidden" }}>
          <table style={{ borderCollapse:"collapse",width:"100%" }}>
            <thead><tr style={{ background:T.grayBg,borderBottom:`1px solid ${T.cardBorder}` }}>
              {["Date","Utilisateur","Rôle","Action","Module","Résultat"].map(h=>(
                <th key={h} style={{ padding:"11px 16px",fontSize:11,fontWeight:700,color:T.textMuted,textAlign:"left",letterSpacing:"0.07em",textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length===0 && (
                <tr><td colSpan={6} style={{ padding:32,textAlign:"center",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>Aucune entrée</td></tr>
              )}
              {filtered.map((log,i)=>(
                <tr key={log.idJournal} className="table-row-hover" style={{ borderBottom:i<filtered.length-1?`1px solid ${T.cardBorder}`:"none" }}>
                  <td style={{ padding:"11px 16px",fontFamily:"'DM Mono',monospace",fontSize:12,color:T.textMuted }}>{log.dateAction}</td>
                  <td style={{ padding:"11px 16px" }}>
                    <div style={{ fontSize:12,fontWeight:600,color:T.textPrimary }}>{log.utilisateurNomPrenom||'—'}</div>
                    <div style={{ fontSize:10,color:T.textMuted }}>{log.utilisateurEmail||''}</div>
                  </td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ fontSize:11,color:T.textSecondary,background:T.grayBg,padding:"2px 7px",borderRadius:5,fontWeight:500 }}>{getRoleLabel(log.utilisateurRole)}</span>
                  </td>
                  <td style={{ padding:"11px 16px",fontSize:13,color:T.textPrimary,fontWeight:500 }}>{typeActionLabel[log.typeAction]||log.typeAction}</td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ background:`${moduleColor[log.moduleConserne]||T.gold}18`,border:`1px solid ${moduleColor[log.moduleConserne]||T.gold}44`,borderRadius:6,padding:"2px 8px",fontSize:11,color:moduleColor[log.moduleConserne]||T.gold,fontWeight:600 }}>{log.moduleConserne}</span>
                  </td>
                  <td style={{ padding:"11px 16px" }}><Badge type={log.resultatAction}/></td>
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
//  SECTION RAPPORTS — export Excel (.xlsx) structuré
// ═══════════════════════════════════════════════════════
const exportExcel = async (filename, sheetName, columns, rows) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SOFITEX";
  wb.created = new Date();

  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 22 }));

  rows.forEach(r => ws.addRow(r));

  // En-tête stylé
  const headerRow = ws.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D1F12" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFB8860B" } } };
  });
  headerRow.height = 22;

  // Bordures + lignes alternées
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell(cell => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE4E8EE" } },
        bottom: { style: "thin", color: { argb: "FFE4E8EE" } },
      };
      cell.alignment = { vertical: "middle" };
    });
    if (rowNumber % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      });
    }
  });

  ws.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
};

// ═══════════════════════════════════════════════════════
//  EXPORT PDF STRUCTURÉ — titre + description + tableau
// ═══════════════════════════════════════════════════════
const exportPDF = (filename, title, description, columns, rows) => {
  const orientation = columns.length > 5 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;

  // ── Bandeau d'en-tête (titre) ────────────────────────────────
  doc.setFillColor(13, 31, 18); // #0D1F12
  doc.rect(0, 0, pageWidth, 66, "F");
  doc.setFillColor(184, 134, 11); // #B8860B — liseré doré
  doc.rect(0, 66, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, marginX, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(230, 184, 74); // gold clair
  doc.text("SOFITEX — Système de Collecte des Données Personnelles", marginX, 48);

  // ── Description ──────────────────────────────────────────────
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(description, pageWidth - marginX * 2);
  doc.text(descLines, marginX, 90);

  const tableStartY = 90 + descLines.length * 13 + 14;

  // ── Tableau des données ──────────────────────────────────────
  autoTable(doc, {
    startY: tableStartY,
    head: [columns.map(c => c.header)],
    body: rows.map(r => columns.map(c => (r[c.key] ?? '—').toString())),
    styles: { fontSize: 8.5, cellPadding: 5, textColor: [30, 30, 30], lineColor: [228, 232, 238], lineWidth: 0.5 },
    headStyles: { fillColor: [13, 31, 18], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: marginX, right: marginX },
    theme: "grid",
  });

  // ── Pied de page (date + pagination) ─────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      marginX, pageHeight - 20
    );
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - marginX - 50, pageHeight - 20);
  }

  doc.save(filename);
};

const SectionReports = ({ users, realRequests }) => {
  const [loading, setLoading] = useState({});
  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  // ── Colonnes et données partagées entre Excel et PDF ──────────────────
  const colsUtilisateurs = [
    { header:"Nom complet", key:"name" },
    { header:"Email", key:"email", width:28 },
    { header:"Rôle", key:"role" },
    { header:"Statut", key:"status" },
  ];
  const rowsUtilisateurs = () => users.filter(u=>u.role!=='Usager').map(u => ({
    name:u.name, email:u.email, role:u.role,
    status:{active:'Actif',inactive:'Inactif',suspended:'Suspendu'}[u.status]||u.status,
  }));

  const colsUsagers = [
    { header:"Nom complet", key:"name" },
    { header:"Email", key:"email", width:28 },
    { header:"Statut", key:"status" },
  ];
  const rowsUsagers = () => users.filter(u=>u.role==='Usager').map(u => ({
    name:u.name, email:u.email,
    status:{active:'Actif',inactive:'Inactif',suspended:'Suspendu'}[u.status]||u.status,
  }));

  const colsDemandes = [
    { header:"Nom", key:"nom" },
    { header:"Prénom", key:"prenom" },
    { header:"Email", key:"email", width:28 },
    { header:"Type", key:"type" },
    { header:"Statut", key:"statut" },
    { header:"Date demande", key:"date" },
    { header:"Ville", key:"ville" },
  ];
  const rowsDemandes = () => realRequests.filter(r=>r.typeUtilisateur!=='Usager').map(r => ({
    nom:r.nom||'', prenom:r.prenom||'', email:r.email||'',
    type:getRoleLabel(r.typeUtilisateur), statut:{EN_ATTENTE:'En attente',APPROUVEE:'Approuvée',REJETEE:'Rejetée'}[r.statutDemandeAcces]||r.statutDemandeAcces||'',
    date:r.dateDemande ? new Date(r.dateDemande).toLocaleDateString('fr-FR') : '', ville:r.ville||'',
  }));

  const colsAudit = [
    { header:"Date", key:"date", width:20 },
    { header:"Utilisateur", key:"user" },
    { header:"Email", key:"email", width:28 },
    { header:"Rôle", key:"role" },
    { header:"Action", key:"action" },
    { header:"Module", key:"module" },
    { header:"Résultat", key:"resultat" },
  ];
  const fetchAuditRows = async () => {
    const r = await fetch(`${BASE}/admin/journal-audit`, { headers: authHeader() });
    const data = await r.json();
    return data.map(l => ({
      date:l.dateAction, user:l.utilisateurNomPrenom||'', email:l.utilisateurEmail||'',
      role:getRoleLabel(l.utilisateurRole), action:l.typeAction, module:l.moduleConserne,
      resultat:l.resultatAction,
    }));
  };

  const today = () => new Date().toISOString().slice(0,10);

  // ── Excel ──────────────────────────────────────────────────────────
  const genRapportUtilisateurs = async () => {
    setLoad('users', true);
    try {
      await exportExcel(`rapport_utilisateurs_${today()}.xlsx`, "Utilisateurs", colsUtilisateurs, rowsUtilisateurs());
      toast.success("Rapport utilisateurs exporté (Excel)");
    } catch { toast.error("Erreur export utilisateurs"); }
    finally { setLoad('users', false); }
  };

  const genRapportUsagers = async () => {
    setLoad('usagers', true);
    try {
      await exportExcel(`rapport_usagers_${today()}.xlsx`, "Usagers", colsUsagers, rowsUsagers());
      toast.success("Rapport usagers exporté (Excel)");
    } catch { toast.error("Erreur export usagers"); }
    finally { setLoad('usagers', false); }
  };

  const genRapportDemandes = async () => {
    setLoad('demandes', true);
    try {
      await exportExcel(`rapport_demandes_${today()}.xlsx`, "Demandes", colsDemandes, rowsDemandes());
      toast.success("Rapport demandes exporté (Excel)");
    } catch { toast.error("Erreur export demandes"); }
    finally { setLoad('demandes', false); }
  };

  const genRapportAudit = async () => {
    setLoad('audit', true);
    try {
      const data = await fetchAuditRows();
      await exportExcel(`rapport_audit_${today()}.xlsx`, "Journal d'audit", colsAudit, data);
      toast.success("Rapport audit exporté (Excel)");
    } catch { toast.error("Erreur export audit"); }
    finally { setLoad('audit', false); }
  };

  // ── PDF ────────────────────────────────────────────────────────────
  const genRapportUtilisateursPDF = async () => {
    setLoad('users-pdf', true);
    try {
      exportPDF(
        `rapport_utilisateurs_${today()}.pdf`,
        "Rapport des utilisateurs",
        `Ce rapport liste l'ensemble des utilisateurs de la plateforme (hors Usagers), avec leur rôle et leur statut de compte. Il recense ${rowsUtilisateurs().length} utilisateur(s) au total, générés le ${new Date().toLocaleDateString('fr-FR')}.`,
        colsUtilisateurs, rowsUtilisateurs()
      );
      toast.success("Rapport utilisateurs exporté (PDF)");
    } catch { toast.error("Erreur export PDF utilisateurs"); }
    finally { setLoad('users-pdf', false); }
  };

  const genRapportUsagersPDF = async () => {
    setLoad('usagers-pdf', true);
    try {
      exportPDF(
        `rapport_usagers_${today()}.pdf`,
        "Rapport des usagers",
        `Ce rapport recense l'ensemble des usagers inscrits sur la plateforme, avec leur statut de compte. Il contient ${rowsUsagers().length} usager(s) au total, générés le ${new Date().toLocaleDateString('fr-FR')}.`,
        colsUsagers, rowsUsagers()
      );
      toast.success("Rapport usagers exporté (PDF)");
    } catch { toast.error("Erreur export PDF usagers"); }
    finally { setLoad('usagers-pdf', false); }
  };

  const genRapportDemandesPDF = async () => {
    setLoad('demandes-pdf', true);
    try {
      exportPDF(
        `rapport_demandes_${today()}.pdf`,
        "Rapport des demandes d'accès",
        `Ce rapport présente toutes les demandes d'accès reçues (hors Usagers), avec leur statut, la date de la demande et la ville du demandeur. Il recense ${rowsDemandes().length} demande(s) au total, générées le ${new Date().toLocaleDateString('fr-FR')}.`,
        colsDemandes, rowsDemandes()
      );
      toast.success("Rapport demandes exporté (PDF)");
    } catch { toast.error("Erreur export PDF demandes"); }
    finally { setLoad('demandes-pdf', false); }
  };

  const genRapportAuditPDF = async () => {
    setLoad('audit-pdf', true);
    try {
      const data = await fetchAuditRows();
      exportPDF(
        `rapport_audit_${today()}.pdf`,
        "Journal d'audit complet",
        `Ce rapport détaille l'intégralité des actions enregistrées dans le journal d'audit de la plateforme : utilisateur concerné, rôle, action, module et résultat. Il recense ${data.length} entrée(s) au total, générées le ${new Date().toLocaleDateString('fr-FR')}.`,
        colsAudit, data
      );
      toast.success("Rapport audit exporté (PDF)");
    } catch { toast.error("Erreur export PDF audit"); }
    finally { setLoad('audit-pdf', false); }
  };

  const stats = [
    { label:"Total utilisateurs", value:users.filter(u=>u.role!=='Usager').length, color:T.green },
    { label:"Total usagers",      value:users.filter(u=>u.role==='Usager').length,  color:T.teal },
    { label:"Demandes en attente",value:realRequests.filter(r=>r.statutDemandeAcces==='EN_ATTENTE'&&r.typeUtilisateur!=='Usager').length, color:T.purple },
    { label:"Demandes approuvées",value:realRequests.filter(r=>r.statutDemandeAcces==='APPROUVEE').length, color:T.blue },
  ];

  const reports = [
    { key:'users',    pdfKey:'users-pdf',    title:"Rapport Utilisateurs", desc:"Liste des utilisateurs approuvés avec statut et rôle", Icon:Users, color:T.blue, bgColor:T.blueBg, actionExcel:genRapportUtilisateurs, actionPDF:genRapportUtilisateursPDF },
    { key:'usagers',  pdfKey:'usagers-pdf',  title:"Rapport Usagers",      desc:"Tous les usagers de la plateforme avec statut", Icon:UserCircle, color:T.teal, bgColor:T.tealBg, actionExcel:genRapportUsagers, actionPDF:genRapportUsagersPDF },
    { key:'demandes', pdfKey:'demandes-pdf', title:"Rapport Demandes",     desc:"Toutes les demandes d'accès avec décisions et dates", Icon:UserCheck, color:T.purple, bgColor:T.purpleBg, actionExcel:genRapportDemandes, actionPDF:genRapportDemandesPDF },
    { key:'audit',    pdfKey:'audit-pdf',    title:"Rapport Audit",        desc:"Journal d'audit complet — toutes les actions de la plateforme", Icon:ShieldCheck, color:T.green, bgColor:T.greenBg, actionExcel:genRapportAudit, actionPDF:genRapportAuditPDF },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Rapports" subtitle="Génération et export des rapports au format Excel (.xlsx) et PDF"/>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4, minmax(0,1fr))",gap:12,marginBottom:20 }}>
        {stats.map((s,i)=>(
          <Card key={i} style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:28,fontWeight:800,color:s.color,fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:14 }}>
        {reports.map(rp=>(
          <Card key={rp.key} className="card-hover" style={{ padding:22 }}>
            <div style={{ width:46,height:46,borderRadius:12,background:rp.bgColor,display:"flex",alignItems:"center",justifyContent:"center",color:rp.color,marginBottom:14 }}>
              <rp.Icon size={20} strokeWidth={1.6}/>
            </div>
            <div style={{ fontSize:14,fontWeight:700,color:T.textPrimary,marginBottom:5 }}>{rp.title}</div>
            <div style={{ fontSize:12,color:T.textSecondary,marginBottom:18,lineHeight:1.55 }}>{rp.desc}</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              <BtnPrimary onClick={rp.actionExcel} disabled={loading[rp.key]} style={{ width:"100%",justifyContent:"center",background:rp.color }}>
                {loading[rp.key]?<><Spinner/> Génération…</>:<><Download size={13}/> Exporter Excel</>}
              </BtnPrimary>
              <BtnOutline onClick={rp.actionPDF} disabled={loading[rp.pdfKey]} color={rp.color} style={{ width:"100%",justifyContent:"center",borderColor:rp.color }}>
                {loading[rp.pdfKey]?<><Spinner size={13} color={rp.color}/> Génération…</>:<><FileText size={13}/> Exporter PDF</>}
              </BtnOutline>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION PARAMÈTRES — profil et mot de passe fonctionnels
// ═══════════════════════════════════════════════════════
const SectionSettings = ({ adminInfo, setAdminInfo }) => {
  const [editNom,    setEditNom]    = useState(adminInfo?.nom||'');
  const [editPrenom, setEditPrenom] = useState(adminInfo?.prenom||'');
  const [savingProfil, setSavingProfil] = useState(false);

  const [ancienMdp,  setAncienMdp]  = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [savingPwd,  setSavingPwd]  = useState(false);

  // Sync si adminInfo change (ex. après sauvegarde)
  useEffect(() => {
    setEditNom(adminInfo?.nom || '');
    setEditPrenom(adminInfo?.prenom || '');
  }, [adminInfo]);

  const saveProfil = async () => {
    if (!editNom.trim() || !editPrenom.trim()) return toast.error("Nom et prénom requis");
    setSavingProfil(true);
    try {
      const r = await fetch(`${BASE}/admin/profil`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: editNom.trim(), prenom: editPrenom.trim() }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${r.status}`);
      }
      setAdminInfo(prev => ({...prev, nom:editNom.trim(), prenom:editPrenom.trim()}));
      localStorage.setItem('adminNom',    editNom.trim());
      localStorage.setItem('adminPrenom', editPrenom.trim());
      toast.success("Profil mis à jour avec succès");
    } catch(e) { toast.error(e.message || "Erreur lors de la mise à jour du profil"); }
    finally { setSavingProfil(false); }
  };

  const saveMdp = async () => {
    if (!ancienMdp) return toast.error("Ancien mot de passe requis");
    if (nouveauMdp.length < 6) return toast.error("Nouveau MDP trop court (6 min.)");
    if (nouveauMdp !== confirmMdp) return toast.error("Les mots de passe ne correspondent pas");
    setSavingPwd(true);
    try {
      const r = await fetch(`${BASE}/admin/mot-de-passe`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${r.status}`);
      }
      toast.success("Mot de passe modifié avec succès");
      setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
    } catch(e) { toast.error(e.message || "Erreur lors du changement de mot de passe"); }
    finally { setSavingPwd(false); }
  };

  return (
    <div className="slide-in">
      <PageHeader title="Paramètres" subtitle="Configuration du système et du profil administrateur"/>

      {/* Profil admin */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ padding:"14px 20px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:8 }}>
          <UserCircle size={14} color={T.gold}/><h3 style={{ fontSize:12,fontWeight:700,color:T.gold,letterSpacing:"0.08em",textTransform:"uppercase" }}>Profil Administrateur</h3>
        </div>
        <div style={{ padding:"18px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <div>
            <label style={{ display:"block",fontSize:11,fontWeight:600,color:T.textSecondary,marginBottom:6 }}>Prénom</label>
            <input value={editPrenom} onChange={e=>setEditPrenom(e.target.value)} style={{ width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={{ display:"block",fontSize:11,fontWeight:600,color:T.textSecondary,marginBottom:6 }}>Nom</label>
            <input value={editNom} onChange={e=>setEditNom(e.target.value)} style={{ width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
          </div>
        </div>
        <div style={{ padding:"0 20px 18px",display:"flex",justifyContent:"flex-end" }}>
          <BtnPrimary onClick={saveProfil} disabled={savingProfil}>
            {savingProfil?<><Spinner/> Enregistrement…</>:<><Save size={13}/> Enregistrer le profil</>}
          </BtnPrimary>
        </div>
      </Card>

      {/* Changement MDP */}
      <Card>
        <div style={{ padding:"14px 20px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:8 }}>
          <Lock size={14} color={T.blue}/><h3 style={{ fontSize:12,fontWeight:700,color:T.blue,letterSpacing:"0.08em",textTransform:"uppercase" }}>Changer le mot de passe</h3>
        </div>
        <div style={{ padding:"18px 20px",display:"flex",flexDirection:"column",gap:12 }}>
          {[
            { label:"Ancien mot de passe", val:ancienMdp, set:setAncienMdp, idx:0 },
            { label:"Nouveau mot de passe (6 min.)", val:nouveauMdp, set:setNouveauMdp, idx:1 },
            { label:"Confirmer le nouveau mot de passe", val:confirmMdp, set:setConfirmMdp, idx:2 }
          ].map(({ label,val,set,idx })=>(
            <div key={idx}>
              <label style={{ display:"block",fontSize:11,fontWeight:600,color:T.textSecondary,marginBottom:6 }}>{label}</label>
              <div style={{ position:"relative" }}>
                <input type={showPwd?"text":"password"} value={val} onChange={e=>set(e.target.value)} style={{ width:"100%",padding:"8px 36px 8px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
                {idx===1 && <button onClick={() => setShowPwd(v=>!v)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex" }}>{showPwd?<EyeOff size={14}/>:<Eye size={14}/>}</button>}
              </div>
              {idx===1 && nouveauMdp && nouveauMdp.length<6 && <div style={{ fontSize:11,color:T.red,marginTop:4 }}>Trop court (6 caractères minimum)</div>}
              {idx===2 && confirmMdp && confirmMdp!==nouveauMdp && <div style={{ fontSize:11,color:T.red,marginTop:4 }}>Ne correspond pas</div>}
            </div>
          ))}
        </div>
        <div style={{ padding:"0 20px 18px",display:"flex",justifyContent:"flex-end" }}>
          <BtnPrimary onClick={saveMdp} disabled={savingPwd} style={{ background:T.blue }}>
            {savingPwd?<><Spinner/> Modification…</>:<><Lock size={13}/> Changer le mot de passe</>}
          </BtnPrimary>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  DASHBOARD PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function TableauDeBoard() {
  const [section,   setSection]   = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const [adminInfo, setAdminInfo] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return { nom:'Admin', prenom:'', id:null };
    const p = parseJwt(token);
    return {
      nom:    localStorage.getItem('adminNom')    || p.nom    || 'Admin',
      prenom: localStorage.getItem('adminPrenom') || p.prenom || '',
      id:     p.userId || null,
    };
  });

  const [realRequests,    setRealRequests]    = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [realPendingCount,setRealPendingCount]= useState(0);
  const [users,           setUsers]           = useState([]);
  const [loadingUsers,    setLoadingUsers]    = useState(true);
  const [notifCount,      setNotifCount]      = useState(0);

  // Fetch demandes
  const fetchDemandes = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/admin/demandes`, { headers: authHeader() });
      if (!r.ok) return;
      const data = await r.json();
      // On exclut systématiquement les demandes des Usagers (ils se connectent
      // même sans validation de leur demande, donc elles n'ont pas à apparaître ici)
      const sansUsagers = data.filter(d => d.typeUtilisateur !== 'Usager');
      const sorted = [...sansUsagers].sort((a,b) => new Date(b.dateDemande) - new Date(a.dateDemande));
      setRealRequests(sorted);
      setRealPendingCount(sorted.filter(r=>r.statutDemandeAcces==='EN_ATTENTE').length);
    } catch(e) { console.error(e); }
    finally { setLoadingRequests(false); }
  }, []);

  useEffect(() => {
    fetchDemandes();
    const iv = setInterval(fetchDemandes, 30000);
    return () => clearInterval(iv);
  }, [fetchDemandes]);

  // Fetch utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const r = await fetch(`${BASE}/admin/utilisateurs`, { headers: authHeader() });
        if (!r.ok) return;
        const data = await r.json();
        setUsers(data.map(u => ({
          id:         u.id,
          name:       `${u.prenom??''} ${u.nom??''}`.trim()||u.email,
          email:      u.email??'—',
          role:       { Usager:'Usager',DPO:'DPO',UtilisateurMetier:'Utilisateur Métier',Administrateur:'Administrateur',CIL:'CIL',DG:'Direction Générale' }[u.typeUtilisateur]??u.typeUtilisateur??'—',
          status:     { ACTIF:'active',INACTIF:'inactive',SUSPENDU:'suspended',SUPPRIME:'suspended' }[u.statutUtilisateur]??'inactive',
          lastLogin:  u.dernierAcces ? new Date(u.dernierAcces).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—',
          initials:   ((u.prenom?.charAt(0)??'')+(u.nom?.charAt(0)??'')).toUpperCase()||'?',
          statutDemandeAcces: u.statutDemandeAcces,
        })));
      } catch(e) { console.error(e); }
      finally { setLoadingUsers(false); }
    };
    fetchUsers();
  }, []);

  // Fetch compteur notifs
  useEffect(() => {
    if (!adminInfo.id) return;
    const fetchNotifCount = async () => {
      try {
        const r = await fetch(`${BASE}/notifications/${adminInfo.id}/non-lues`, { headers: authHeader() });
        if (!r.ok) return;
        const data = await r.json();
        // Ne pas écraser si l'utilisateur vient de tout marquer lu (count=0 géré localement)
        setNotifCount(prev => prev === 0 ? 0 : data.length);
      } catch {}
    };
    fetchNotifCount();
    const iv = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(iv);
  }, [adminInfo.id]);

  // Approve / Reject
  const handleApproveReal = async (id) => {
    setRealRequests(rs => rs.map(x => x.idDemande===id ? {...x,statutDemandeAcces:'APPROUVEE'} : x));
    setRealPendingCount(c => Math.max(0,c-1));
    try {
      const r = await fetch(`${BASE}/admin/demandes/${id}/valider`, { method:'PUT', headers:{...authHeader(),'Content-Type':'application/json'} });
      if (!r.ok) throw new Error();
      toast.success("Demande approuvée");
    } catch {
      setRealRequests(rs => rs.map(x => x.idDemande===id ? {...x,statutDemandeAcces:'EN_ATTENTE'} : x));
      setRealPendingCount(c => c+1);
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleRejectReal = async (id, motif) => {
    setRealRequests(rs => rs.map(x => x.idDemande===id ? {...x,statutDemandeAcces:'REJETEE'} : x));
    setRealPendingCount(c => Math.max(0,c-1));
    try {
      const r = await fetch(`${BASE}/admin/demandes/${id}/rejeter`, { method:'PUT', headers:{...authHeader(),'Content-Type':'application/json'}, body:JSON.stringify({motif}) });
      if (!r.ok) throw new Error();
      toast.success("Demande refusée");
    } catch {
      setRealRequests(rs => rs.map(x => x.idDemande===id ? {...x,statutDemandeAcces:'EN_ATTENTE'} : x));
      setRealPendingCount(c => c+1);
      toast.error("Erreur lors du rejet");
    }
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Instrument Sans','DM Sans',system-ui,sans-serif",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.cardBorder};border-radius:4px;}
        .slide-in{animation:slideIn 0.22s ease;}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes notifPanelIn{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .sofitex-card{transition:box-shadow 0.18s,border-color 0.18s,transform 0.18s;}
        .card-hover:hover{box-shadow:0 6px 20px rgba(0,0,0,0.09)!important;transform:translateY(-1px);}
        .btn-primary{transition:all 0.15s ease;}
        .btn-primary:hover:not(:disabled){opacity:0.85;transform:translateY(-1px);}
        .btn-outline{transition:all 0.15s ease;}
        .btn-outline:hover{background:${T.grayBg}!important;transform:translateY(-1px);}
        .nav-item:hover{background:rgba(255,255,255,0.05)!important;color:#E2E8F0!important;}
        .logout-btn:hover{background:rgba(239,68,68,0.1)!important;}
        .icon-btn:hover{background:rgba(255,255,255,0.07)!important;}
        .table-row-hover:hover td{background:${T.grayBg};}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <TopBar onToggleSidebar={() => setCollapsed(c=>!c)} userId={adminInfo.id} notifCount={notifCount} setNotifCount={setNotifCount}/>

      <div style={{ display:"flex",flex:1,overflow:"hidden" }}>
        <Sidebar active={section} setActive={setSection} collapsed={collapsed} adminInfo={adminInfo} pendingCount={realPendingCount}/>
        <main style={{ flex:1,overflow:"auto",padding:"24px 28px",background:T.mainBg }}>
          {section==="dashboard" && <SectionDashboard adminInfo={adminInfo} realRequests={realRequests} loadingRequests={loadingRequests} pendingCount={realPendingCount} setSection={setSection} onApprove={handleApproveReal} onReject={handleRejectReal}/>}
          {section==="requests"  && <SectionDemandesAcces realRequests={realRequests} loadingRequests={loadingRequests} onApprove={handleApproveReal} onReject={handleRejectReal}/>}
          {section==="users"     && <SectionUsers users={users} setUsers={setUsers} loadingUsers={loadingUsers}/>}
          {section==="usagers"   && <SectionUsagers users={users} loadingUsers={loadingUsers}/>}
          {section==="audit"     && <SectionAudit/>}
          {section==="reports"   && <SectionReports users={users} realRequests={realRequests}/>}
          {section==="settings"  && <SectionSettings adminInfo={adminInfo} setAdminInfo={setAdminInfo}/>}
        </main>
      </div>
    </div>
  );
}