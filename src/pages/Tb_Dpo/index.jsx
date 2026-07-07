import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen, FileText, Bell, LogOut, Menu, Plus, Eye, Check, X,
  Clock, CheckCircle2, XCircle, AlertCircle, Send,
  StopCircle, Download, RefreshCw, ChevronLeft, ChevronRight,
  BarChart3, Cpu, ArrowUpRight, Shield, Pencil,
  Activity, FileCheck, Calendar, User, Wrench
} from "lucide-react";

// ═══════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════
const BASE = "http://localhost:8080/api";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" });
const parseJwt = (t) => { try { return JSON.parse(atob(t.split(".")[1])); } catch { return {}; } };

// Une déclaration ne doit s'afficher dans l'espace DPO QUE si elle a été
// créée manuellement par le DPO (bouton "Déclarer"). Les déclarations
// auto-créées en BROUILLON en même temps que le traitement (par
// l'Utilisateur Métier) doivent rester invisibles tant qu'elles n'ont pas
// été reprises/soumises explicitement.
const estDeclarationManuelle = (d) => d?.origineDeclaration === "MANUELLE";

// Statuts pour lesquels une déclaration peut encore être modifiée par le DPO
// (doit rester synchronisé avec DeclarationService.verifierModifiable côté backend).
const STATUTS_MODIFIABLES = ["BROUILLON", "EN_ATTENTE", "EN_ATTENTE_DG", "REJETEE_DG", "REJETEE_CIL"];
const estModifiable = (statut) => STATUTS_MODIFIABLES.includes(statut);
const estRejetee = (statut) => statut === "REJETEE_DG" || statut === "REJETEE_CIL";

// Endpoints REST (création/édition) par type de déclaration
const ENDPOINT_TYPE = {
  NORMALE: "normale",
  COLLECTE_SITE: "collecte-site",
  VIDEO_SURVEILLANCE: "video-surveillance",
  AUTORISATION: "autorisation",
};

// ═══════════════════════════════════════════════════════
//  THÈME
// ═══════════════════════════════════════════════════════
const T = {
  sidebarBg:"#0D1F12",sidebarBorder:"#1A3320",sidebarText:"#7A9E8A",
  mainBg:"#F4F6F9",cardBg:"#FFFFFF",cardBorder:"#E4E8EE",
  cardShadow:"0 1px 3px rgba(0,0,0,0.06)",
  textPrimary:"#0F1923",textSecondary:"#4A5568",textMuted:"#9AA5B4",
  gold:"#B8860B",goldLight:"#FEF7E6",goldBorder:"#E6B84A",
  green:"#16A34A",greenBg:"#F0FDF4",greenBorder:"#BBF7D0",
  red:"#DC2626",redBg:"#FEF2F2",redBorder:"#FECACA",
  yellow:"#D97706",yellowBg:"#FFFBEB",yellowBorder:"#FDE68A",
  blue:"#2563EB",blueBg:"#EFF6FF",blueBorder:"#BFDBFE",
  purple:"#7C3AED",purpleBg:"#F5F3FF",purpleBorder:"#DDD6FE",
  teal:"#0891B2",tealBg:"#ECFEFF",tealBorder:"#A5F3FC",
  gray:"#374151",grayBg:"#F9FAFB",grayBorder:"#E5E7EB",
  orange:"#EA580C",orangeBg:"#FFF7ED",orangeBorder:"#FED7AA",
};

// ═══════════════════════════════════════════════════════
//  COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════
const Avatar = ({ initials, size=36, bg=T.goldLight, color=T.gold, border=T.goldBorder }) => (
  <div style={{ width:size,height:size,borderRadius:"50%",background:bg,border:`1.5px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.34,color,flexShrink:0,letterSpacing:"0.03em",fontFamily:"'DM Mono',monospace" }}>{initials}</div>
);

const Card = ({ children, style={}, className="" }) => (
  <div className={`dpo-card ${className}`} style={{ background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:12,boxShadow:T.cardShadow,...style }}>{children}</div>
);

const Badge = ({ type }) => {
  const map = {
    EN_COURS:           { bg:T.blueBg,   color:T.blue,   border:T.blueBorder,   label:"En cours" },
    TERMINEE:           { bg:T.greenBg,  color:T.green,  border:T.greenBorder,  label:"Terminée" },
    ANNULEE:            { bg:T.grayBg,   color:T.gray,   border:T.grayBorder,   label:"Annulée" },
    EN_ATTENTE:         { bg:T.yellowBg, color:T.yellow, border:T.yellowBorder, label:"En attente" },
    APPROUVEE:          { bg:T.greenBg,  color:T.green,  border:T.greenBorder,  label:"Approuvée" },
    APPROUVEE_DG:       { bg:T.greenBg,  color:T.green,  border:T.greenBorder,  label:"Approuvée DG" },
    REJETEE:            { bg:T.redBg,    color:T.red,    border:T.redBorder,    label:"Rejetée" },
    REJETEE_DG:         { bg:T.redBg,    color:T.red,    border:T.redBorder,    label:"Rejetée DG" },
    BROUILLON:          { bg:T.grayBg,   color:T.gray,   border:T.grayBorder,   label:"Brouillon" },
    EN_VERIFICATION_CIL:{ bg:T.purpleBg, color:T.purple, border:T.purpleBorder, label:"Vérif. CIL" },
    VALIDEE_CIL:        { bg:T.tealBg,   color:T.teal,   border:T.tealBorder,   label:"Validée CIL" },
    REJETEE_CIL:        { bg:T.redBg,    color:T.red,    border:T.redBorder,    label:"Rejetée CIL" },
    TERRAIN:            { bg:T.purpleBg, color:T.purple, border:T.purpleBorder, label:"Terrain" },
    EN_LIGNE:           { bg:T.tealBg,   color:T.teal,   border:T.tealBorder,   label:"En ligne" },
    NORMALE:            { bg:T.blueBg,   color:T.blue,   border:T.blueBorder,   label:"Normale" },
    COLLECTE_SITE:      { bg:T.tealBg,   color:T.teal,   border:T.tealBorder,   label:"Site Internet" },
    VIDEO_SURVEILLANCE: { bg:T.purpleBg, color:T.purple, border:T.purpleBorder, label:"Vidéosurveillance" },
    AUTORISATION:       { bg:T.yellowBg, color:T.yellow, border:T.yellowBorder, label:"Autorisation" },
    ALERTE:             { bg:T.redBg,    color:T.red,    border:T.redBorder,    label:"Alerte" },
    RAPPEL:             { bg:T.yellowBg, color:T.yellow, border:T.yellowBorder, label:"Rappel" },
    CONFIRMATION:       { bg:T.greenBg,  color:T.green,  border:T.greenBorder,  label:"Confirmation" },
    RELANCE:            { bg:T.yellowBg, color:T.yellow, border:T.yellowBorder, label:"Relance" },
    EN_ATTENTE_DG:      { bg:T.yellowBg, color:T.yellow, border:T.yellowBorder, label:"En attente DG" },
    VALIDEE_DG:         { bg:T.greenBg,  color:T.green,  border:T.greenBorder,  label:"Validée DG" },
    REJETEE_DG2:        { bg:T.redBg,    color:T.red,    border:T.redBorder,    label:"Rejetée DG" },
  };
  const s = map[type] || { bg:T.grayBg,color:T.gray,border:T.grayBorder,label:type||"—" };
  return (
    <span style={{ background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:s.color,display:"inline-block" }}/>
      {s.label}
    </span>
  );
};

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24 }}>
    <div>
      <h1 style={{ fontSize:20,fontWeight:700,color:T.textPrimary,marginBottom:3,letterSpacing:"-0.02em" }}>{title}</h1>
      <p style={{ fontSize:13,color:T.textMuted }}>{subtitle}</p>
    </div>
    {children && <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>{children}</div>}
  </div>
);

const Btn = ({ children, onClick, variant="outline", style={}, disabled=false, type="button" }) => {
  const base = { borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,border:"none",opacity:disabled?0.55:1,transition:"all 0.15s",fontFamily:"inherit",...style };
  const v = {
    primary: { background:T.blue,color:"#fff" },
    danger:  { background:T.redBg,color:T.red,border:`1px solid ${T.redBorder}` },
    success: { background:T.greenBg,color:T.green,border:`1px solid ${T.greenBorder}` },
    warning: { background:T.yellowBg,color:T.yellow,border:`1px solid ${T.yellowBorder}` },
    outline: { background:"transparent",color:T.textSecondary,border:`1px solid ${T.cardBorder}` },
    orange:  { background:T.orangeBg,color:T.orange,border:`1px solid ${T.orangeBorder}` },
    dark:    { background:"#0D1F12",color:"#fff" },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base,...(v[variant]||v.outline) }}>{children}</button>;
};

const Inp = ({ label, value, onChange, type="text", placeholder, required, rows, readOnly }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
    {label && <label style={{ fontSize:12,fontWeight:600,color:T.textSecondary,letterSpacing:"0.03em" }}>{label}{required && <span style={{ color:T.red }}> *</span>}</label>}
    {rows
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} readOnly={readOnly}
          style={{ padding:"9px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:readOnly?T.grayBg:T.grayBg,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.6,opacity:readOnly?0.7:1 }}/>
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          style={{ padding:"9px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,outline:"none",fontFamily:"inherit",opacity:readOnly?0.7:1 }}/>
    }
  </div>
);

const Sel = ({ label, value, onChange, children, required, readOnly }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
    {label && <label style={{ fontSize:12,fontWeight:600,color:T.textSecondary,letterSpacing:"0.03em" }}>{label}{required && <span style={{ color:T.red }}> *</span>}</label>}
    <select value={value} onChange={onChange} disabled={readOnly}
      style={{ padding:"9px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,fontFamily:"inherit",outline:"none",opacity:readOnly?0.7:1 }}>{children}</select>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.grayBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,cursor:"pointer" }} onClick={() => onChange(!checked)}>
    <div style={{ width:36,height:20,borderRadius:10,background:checked?T.green:T.cardBorder,transition:"background 0.2s",position:"relative",flexShrink:0 }}>
      <div style={{ position:"absolute",top:2,left:checked?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
    </div>
    <span style={{ fontSize:13,color:T.textSecondary,fontWeight:500 }}>{label}</span>
  </div>
);

const Spinner = ({ color="#fff", size=14 }) => (
  <span style={{ width:size,height:size,border:`2px solid rgba(255,255,255,0.3)`,borderTopColor:color,borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }}/>
);

const SectionTitle = ({ icon: Icon, color, label }) => (
  <div style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 20px",borderBottom:`1px solid ${T.cardBorder}`,background:T.grayBg }}>
    <Icon size={14} color={color}/><span style={{ fontSize:11,fontWeight:700,color,letterSpacing:"0.08em",textTransform:"uppercase" }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════════════
//  PANNEAU NOTIFICATIONS
// ═══════════════════════════════════════════════════════
const PanneauNotifications = ({ userId, onClose, onCountChange }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ref = useRef();

  useEffect(() => {
    const init = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const r = await fetch(`${BASE}/notifications/${userId}`, { headers: authH() });
        if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
        const data = await r.json();
        const sorted = [...data].sort((a,b) => b.idNotification - a.idNotification);
        setNotifs(sorted);
        const hasUnread = sorted.some(n => n.statut === "NON_LUE");
        if (hasUnread) {
          const rl = await fetch(`${BASE}/notifications/${userId}/lire-tout`, { method:"PATCH", headers:authH() });
          if (rl.ok) setNotifs(ns => ns.map(n => ({ ...n, statut:"LUE" })));
        }
        onCountChange(0);
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    };
    init();
  }, [userId]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeColor = { ALERTE:T.red, RAPPEL:T.yellow, CONFIRMATION:T.green, RELANCE:T.orange, DEMANDE_MODIFICATION:T.blue, DEMANDE_SUPPRESSION:T.blue, PLAINTE:T.purple };

  return (
    <div ref={ref} style={{ position:"absolute",top:"calc(100% + 10px)",right:0,width:380,background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:14,boxShadow:"0 20px 50px rgba(0,0,0,0.22)",zIndex:300,overflow:"hidden" }}>
      <div style={{ padding:"14px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.grayBg }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}><Bell size={14} color={T.gold}/><div style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>Notifications</div></div>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:4 }}><X size={15}/></button>
      </div>
      <div style={{ maxHeight:420,overflowY:"auto" }}>
        {loading && <div style={{ padding:32,textAlign:"center",color:T.textMuted,fontSize:13 }}>Chargement…</div>}
        {!loading && error && <div style={{ padding:24,textAlign:"center",color:T.red,fontSize:12,display:"flex",flexDirection:"column",gap:8,alignItems:"center" }}><AlertCircle size={16}/>{error}</div>}
        {!loading && !error && notifs.length===0 && <div style={{ padding:40,textAlign:"center",color:T.textMuted,fontSize:13 }}>Aucune notification</div>}
        {!loading && !error && notifs.map((n,i) => {
          const col = typeColor[n.typeNotification] || T.textMuted;
          return (
            <div key={n.idNotification} style={{ padding:"12px 16px",borderBottom:i<notifs.length-1?`1px solid ${T.cardBorder}`:"none",display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:col,flexShrink:0,marginTop:5 }}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                  <span style={{ fontSize:10,fontWeight:700,background:`${col}18`,color:col,padding:"1px 6px",borderRadius:4 }}>{n.typeNotification}</span>
                  <span style={{ fontSize:10,color:T.textMuted }}>{n.dateEnvoi}</span>
                </div>
                <div style={{ fontSize:12,color:T.textSecondary,lineHeight:1.5 }}>{n.contenu}</div>
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
const TopBar = ({ onToggle, userId, notifCount, setNotifCount, dpoInfo }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  return (
    <header style={{ height:56,background:T.sidebarBg,borderBottom:`1px solid ${T.sidebarBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0,zIndex:100 }}>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        <button onClick={onToggle} style={{ background:"transparent",border:"none",color:T.sidebarText,cursor:"pointer",padding:6,borderRadius:6,display:"flex" }}><Menu size={18}/></button>
        <div style={{ fontSize:13,fontWeight:700,color:"#E2E8F0",letterSpacing:"0.04em" }}>SOFITEX — Espace DPO</div>
      </div>
      <div style={{ position:"relative" }}>
        <button onClick={() => setShowNotifs(v => !v)} style={{ background:"transparent",border:"none",color:T.sidebarText,cursor:"pointer",padding:7,borderRadius:7,display:"flex",alignItems:"center",position:"relative" }}>
          <Bell size={17}/>
          {notifCount > 0 && <span style={{ position:"absolute",top:2,right:2,width:16,height:16,background:T.red,color:"#fff",borderRadius:"50%",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.sidebarBg}` }}>{notifCount>99?"99+":notifCount}</span>}
        </button>
        {showNotifs && userId && <PanneauNotifications userId={userId} onClose={() => setShowNotifs(false)} onCountChange={setNotifCount}/>}
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, collapsed, dpoInfo, declEnAttente }) => {
  const navigate = useNavigate();
  const initials = ((dpoInfo?.prenom?.[0]||"") + (dpoInfo?.nom?.[0]||"")).toUpperCase() || "DP";
  const nav = [
    { id:"dashboard",    label:"Tableau de bord",  Icon:BarChart3 },
    { id:"sessions",     label:"Sessions",          Icon:FolderOpen },
    { id:"traitements",  label:"Traitements",       Icon:Cpu },
    { id:"declarations", label:"Déclarations",      Icon:FileText, badge:declEnAttente },
    { id:"rapports",     label:"Rapports & Export", Icon:Download },
  ];
  return (
    <aside style={{ width:collapsed?64:230,flexShrink:0,background:T.sidebarBg,borderRight:`1px solid ${T.sidebarBorder}`,display:"flex",flexDirection:"column",transition:"width 0.22s cubic-bezier(.4,0,.2,1)",overflow:"hidden" }}>
      {!collapsed && (
        <div style={{ padding:"14px 16px",borderBottom:`1px solid ${T.sidebarBorder}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Avatar initials={initials} size={36}/>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12,fontWeight:600,color:"#F1F5F9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{dpoInfo?.prenom} {dpoInfo?.nom}</div>
              <div style={{ fontSize:10,color:T.sidebarText,marginTop:1 }}>Délégué à la Protection des Données</div>
            </div>
          </div>
        </div>
      )}
      <nav style={{ flex:1,padding:"10px 8px",overflowY:"auto" }}>
        {!collapsed && <div style={{ fontSize:9,fontWeight:700,color:T.sidebarText,letterSpacing:"0.12em",textTransform:"uppercase",padding:"4px 8px 10px" }}>Navigation</div>}
        {nav.map(item => {
          const isActive = active===item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)} className="nav-item"
              style={{ display:"flex",alignItems:"center",gap:collapsed?0:10,padding:collapsed?"11px 0":"9px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,color:isActive?"#FFFFFF":T.sidebarText,background:isActive?"rgba(52,168,103,0.15)":"transparent",fontWeight:isActive?600:400,fontSize:13,cursor:"pointer",position:"relative",marginBottom:2,transition:"all 0.15s ease" }}>
              {isActive && <span style={{ position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:18,background:"#4ADE80",borderRadius:"0 2px 2px 0" }}/>}
              <item.Icon size={16} strokeWidth={isActive?2:1.5} style={{ flexShrink:0 }}/>
              {!collapsed && <><span style={{ flex:1 }}>{item.label}</span>{item.badge>0 && <span style={{ background:T.red,color:"#fff",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 6px",minWidth:18,textAlign:"center" }}>{item.badge}</span>}</>}
              {collapsed && item.badge>0 && <span style={{ position:"absolute",top:6,right:8,width:7,height:7,background:T.red,borderRadius:"50%" }}/>}
            </div>
          );
        })}
      </nav>
      {!collapsed && (
        <div style={{ padding:"10px 8px",borderTop:`1px solid ${T.sidebarBorder}` }}>
          <button onClick={() => { localStorage.removeItem("token"); toast.success("Déconnecté !"); navigate("/"); }} className="logout-btn" style={{ width:"100%",display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",borderRadius:8,padding:"9px 10px",color:"#EF4444",fontSize:12,fontWeight:500,cursor:"pointer" }}>
            <LogOut size={14}/> Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : CRÉER SESSION
// ═══════════════════════════════════════════════════════
const ModalCreerSession = ({ onClose, onSave }) => {
  const [f, setF] = useState({ nomSession:"", lieu:"", typeCollecte:"EN_LIGNE", description:"", dateDebut:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k,v) => setF(p => ({...p,[k]:v}));
  const valid = f.nomSession.trim() && f.lieu.trim();
  const minDate = new Date().toISOString().split("T")[0];

  const handleSave = async () => {
    if (!valid) return;
    setLoading(true); setError("");
    try {
      const payload = { nomSession:f.nomSession, lieu:f.lieu, typeCollecte:f.typeCollecte, description:f.description, dateDebut:f.dateDebut ? new Date(f.dateDebut+"T00:00:00").toISOString() : new Date().toISOString(), dateFin:null };
      const r = await fetch(`${BASE}/sessions`, { method:"POST", headers:authH(), body:JSON.stringify(payload) });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
      const data = await r.json();
      onSave(data); onClose(); toast.success("Session créée !");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,width:500,maxHeight:"90vh",overflowY:"auto",background:T.cardBg,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",border:`1px solid ${T.cardBorder}` }}>
        <div style={{ padding:"20px 22px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,background:T.cardBg,zIndex:1 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:T.greenBg,border:`1px solid ${T.greenBorder}`,display:"flex",alignItems:"center",justifyContent:"center" }}><FolderOpen size={18} color={T.green}/></div>
          <div><div style={{ fontSize:15,fontWeight:700,color:T.textPrimary }}>Nouvelle session de collecte</div><div style={{ fontSize:12,color:T.textMuted }}>Date de début = aujourd'hui si non renseignée</div></div>
          <button onClick={onClose} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:T.textMuted }}><X size={16}/></button>
        </div>
        <div style={{ padding:"20px 22px",display:"flex",flexDirection:"column",gap:14 }}>
          <Inp label="Nom de la session" value={f.nomSession} onChange={e=>upd("nomSession",e.target.value)} placeholder="Ex: Collecte RH — Juillet 2026" required/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <Inp label="Lieu" value={f.lieu} onChange={e=>upd("lieu",e.target.value)} placeholder="Ex: Bobo-Dioulasso" required/>
            <Sel label="Type de collecte" value={f.typeCollecte} onChange={e=>upd("typeCollecte",e.target.value)}>
              <option value="EN_LIGNE">En ligne</option>
              <option value="TERRAIN">Terrain</option>
            </Sel>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:T.textSecondary,marginBottom:6 }}>Date de début <span style={{ fontWeight:400,color:T.textMuted }}>(optionnelle)</span></label>
            <input type="date" min={minDate} value={f.dateDebut} onChange={e=>upd("dateDebut",e.target.value)} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,fontFamily:"inherit",outline:"none" }}/>
          </div>
          <Inp label="Description" value={f.description} onChange={e=>upd("description",e.target.value)} placeholder="Objectif de la session" rows={3}/>
          {error && <div style={{ padding:"10px 12px",background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:8,fontSize:12,color:T.red,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={13}/>{error}</div>}
        </div>
        <div style={{ padding:"14px 22px 20px",display:"flex",justifyContent:"flex-end",gap:10,borderTop:`1px solid ${T.cardBorder}` }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading||!valid}>{loading?<><Spinner/> Création…</>:<><Plus size={13}/> Créer la session</>}</Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : MODIFIER SESSION
// ═══════════════════════════════════════════════════════
const ModalModifierSession = ({ session, onClose, onSave }) => {
  const toDateInput = (iso) => iso ? iso.split("T")[0] : "";
  const [f, setF] = useState({
    nomSession: session.nomSession || "",
    lieu: session.lieu || "",
    typeCollecte: session.typeCollecte || "EN_LIGNE",
    description: session.description || "",
    dateDebut: toDateInput(session.dateDebut),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k,v) => setF(p => ({...p,[k]:v}));
  const valid = f.nomSession.trim() && f.lieu.trim();

  const handleSave = async () => {
    if (!valid) return;
    setLoading(true); setError("");
    try {
      const payload = {
        nomSession:f.nomSession, lieu:f.lieu, typeCollecte:f.typeCollecte, description:f.description,
        dateDebut: f.dateDebut ? new Date(f.dateDebut+"T00:00:00").toISOString() : session.dateDebut,
        dateFin: session.dateFin || null,
      };
      const r = await fetch(`${BASE}/sessions/${session.idSession}`, { method:"PUT", headers:authH(), body:JSON.stringify(payload) });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
      const data = await r.json();
      onSave(data); onClose(); toast.success("Session mise à jour !");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,width:500,maxHeight:"90vh",overflowY:"auto",background:T.cardBg,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",border:`1px solid ${T.cardBorder}` }}>
        <div style={{ padding:"20px 22px 16px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,background:T.cardBg,zIndex:1 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:T.blueBg,border:`1px solid ${T.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Pencil size={17} color={T.blue}/></div>
          <div><div style={{ fontSize:15,fontWeight:700,color:T.textPrimary }}>Modifier la session #{session.idSession}</div><div style={{ fontSize:12,color:T.textMuted }}>Les traitements liés ne sont pas affectés</div></div>
          <button onClick={onClose} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:T.textMuted }}><X size={16}/></button>
        </div>
        <div style={{ padding:"20px 22px",display:"flex",flexDirection:"column",gap:14 }}>
          <Inp label="Nom de la session" value={f.nomSession} onChange={e=>upd("nomSession",e.target.value)} placeholder="Ex: Collecte RH — Juillet 2026" required/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <Inp label="Lieu" value={f.lieu} onChange={e=>upd("lieu",e.target.value)} placeholder="Ex: Bobo-Dioulasso" required/>
            <Sel label="Type de collecte" value={f.typeCollecte} onChange={e=>upd("typeCollecte",e.target.value)}>
              <option value="EN_LIGNE">En ligne</option>
              <option value="TERRAIN">Terrain</option>
            </Sel>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:T.textSecondary,marginBottom:6 }}>Date de début</label>
            <input type="date" value={f.dateDebut} onChange={e=>upd("dateDebut",e.target.value)} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.grayBg,fontFamily:"inherit",outline:"none" }}/>
          </div>
          <Inp label="Description" value={f.description} onChange={e=>upd("description",e.target.value)} placeholder="Objectif de la session" rows={3}/>
          {error && <div style={{ padding:"10px 12px",background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:8,fontSize:12,color:T.red,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={13}/>{error}</div>}
        </div>
        <div style={{ padding:"14px 22px 20px",display:"flex",justifyContent:"flex-end",gap:10,borderTop:`1px solid ${T.cardBorder}` }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading||!valid}>{loading?<><Spinner/> Enregistrement…</>:<><Check size={13}/> Enregistrer</>}</Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : CLÔTURER SESSION
// ═══════════════════════════════════════════════════════
const ModalCloture = ({ session, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/sessions/${session.idSession}/statut?valeur=TERMINEE`, { method:"PATCH", headers:authH() });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
      const data = await r.json();
      onConfirm(data); onClose(); toast.success("Session clôturée !");
    } catch(e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,width:440,background:T.cardBg,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",border:`1px solid ${T.cardBorder}`,overflow:"hidden" }}>
        <div style={{ padding:"24px 24px 0" }}>
          <div style={{ width:48,height:48,borderRadius:"50%",background:T.yellowBg,border:`2px solid ${T.yellowBorder}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16 }}><StopCircle size={24} color={T.yellow}/></div>
          <div style={{ fontSize:16,fontWeight:700,color:T.textPrimary,marginBottom:8 }}>Clôturer la session</div>
          <div style={{ fontSize:13,color:T.textSecondary,lineHeight:1.65,marginBottom:16 }}>Voulez-vous vraiment clôturer la session <strong>#{session.idSession} — {session.nomSession || session.lieu}</strong> ? Cette action est <strong style={{ color:T.red }}>irréversible</strong>.</div>
          <div style={{ padding:"10px 14px",background:T.yellowBg,border:`1px solid ${T.yellowBorder}`,borderRadius:8,fontSize:12,color:T.yellow,display:"flex",gap:8,alignItems:"flex-start",marginBottom:20 }}>
            <AlertCircle size={14} style={{ flexShrink:0,marginTop:1 }}/><span>Assurez-vous que tous les traitements sont terminés avant de clôturer.</span>
          </div>
        </div>
        <div style={{ padding:"0 24px 24px",display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="warning" onClick={handleConfirm} disabled={loading}>{loading?<><Spinner color={T.yellow}/> Clôture…</>:<><StopCircle size={13}/> Confirmer la clôture</>}</Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : DONNÉES D'UN TRAITEMENT
// ═══════════════════════════════════════════════════════
const ModalDonnees = ({ traitement, onClose }) => {
  const [donnees, setDonnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try {
        const r = await fetch(`${BASE}/donnees/par-traitement?traitementId=${traitement.idTraitement}`, { headers:authH() });
        if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
        setDonnees(await r.json());
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, [traitement.idTraitement]);

  // Colonnes dynamiques à partir des clés présentes dans les données
  const columns = (() => {
    const keys = new Set();
    donnees.forEach(d => Object.keys(d).forEach(k => { if (k!=="idDonnee" && k!=="traitementId") keys.add(k); }));
    return Array.from(keys);
  })();

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,width:"min(920px,92vw)",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",background:T.cardBg,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",border:`1px solid ${T.cardBorder}` }}>
        <div style={{ padding:"18px 22px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:T.tealBg,border:`1px solid ${T.tealBorder}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Database size={18} color={T.teal}/></div>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:T.textPrimary }}>Données du traitement</div>
            <div style={{ fontSize:12,color:T.textMuted }}>{traitement.nom || traitement.description || `#${traitement.idTraitement}`} — {donnees.length} entrée(s)</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:T.textMuted }}><X size={16}/></button>
        </div>
        <div style={{ overflow:"auto",flex:1 }}>
          {loading && <div style={{ padding:40,textAlign:"center",color:T.textMuted,fontSize:13 }}>Chargement…</div>}
          {!loading && error && <div style={{ padding:24,color:T.red,fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/>{error}</div>}
          {!loading && !error && donnees.length===0 && <div style={{ padding:40,textAlign:"center",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>Aucune donnée enregistrée pour ce traitement.</div>}
          {!loading && !error && donnees.length>0 && (
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead>
                <tr style={{ background:T.grayBg,position:"sticky",top:0 }}>
                  <th style={{ textAlign:"left",padding:"9px 14px",color:T.textMuted,fontWeight:700,textTransform:"uppercase",fontSize:10,letterSpacing:"0.06em" }}>#</th>
                  {columns.map(c => <th key={c} style={{ textAlign:"left",padding:"9px 14px",color:T.textMuted,fontWeight:700,textTransform:"uppercase",fontSize:10,letterSpacing:"0.06em",whiteSpace:"nowrap" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {donnees.map((d,i) => (
                  <tr key={d.idDonnee||i} style={{ borderTop:`1px solid ${T.cardBorder}` }}>
                    <td style={{ padding:"9px 14px",color:T.textMuted,fontFamily:"'DM Mono',monospace" }}>{i+1}</td>
                    {columns.map(c => <td key={c} style={{ padding:"9px 14px",color:T.textPrimary,whiteSpace:"nowrap" }}>{String(d[c] ?? "—")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  ÉTAPES DE DÉCLARATION
// ═══════════════════════════════════════════════════════
const ETAPES_NORMALE = ["Identification","Traitement","Personnes","Sécurité","Droits"];
const ETAPES_SITE    = ["Identification","Site Internet","Cookies","Sécurité","Droits"];
const ETAPES_VIDEO   = ["Identification","Dispositif","Accès","Sécurité","Droits"];
const ETAPES_AUTO    = ["Identification","Traitement","Données santé","Transfert","Droits"];

const StepIndicator = ({ etapes, current }) => (
  <div style={{ display:"flex",alignItems:"center",gap:0,marginBottom:24,overflowX:"auto",paddingBottom:4 }}>
    {etapes.map((e,i) => (
      <div key={i} style={{ display:"flex",alignItems:"center",flexShrink:0 }}>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",background:i<current?T.green:i===current?T.blue:T.cardBorder,color:i<=current?"#fff":T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,transition:"all 0.2s" }}>
            {i < current ? <Check size={13}/> : i+1}
          </div>
          <span style={{ fontSize:10,color:i===current?T.textPrimary:T.textMuted,fontWeight:i===current?700:400,whiteSpace:"nowrap" }}>{e}</span>
        </div>
        {i < etapes.length-1 && <div style={{ width:40,height:2,background:i<current?T.green:T.cardBorder,margin:"0 4px",marginBottom:16,transition:"background 0.2s" }}/>}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════
//  CHAMPS COMMUNS — Étape 0 : Identification
// ═══════════════════════════════════════════════════════
const ChampsCommuns1 = ({ f, upd }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      <Inp label="Responsable de la déclaration" value={f.responsableDeclaration} onChange={e=>upd("responsableDeclaration",e.target.value)} placeholder="Nom Prénom" required/>
      <Inp label="Contact confidentialité" value={f.contactConfidentialite} onChange={e=>upd("contactConfidentialite",e.target.value)} placeholder="email ou téléphone"/>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      <Inp label="Secteur d'activité" value={f.secteur} onChange={e=>upd("secteur",e.target.value)} placeholder="Ex: Finance, RH…"/>
      <Sel label="Nature de la demande" value={f.natureDemande} onChange={e=>upd("natureDemande",e.target.value)}>
        <option value="">Sélectionner…</option>
        <option value="PREMIERE">Première déclaration</option>
        <option value="MODIFICATION">Modification</option>
        <option value="SUPPRESSION">Suppression</option>
      </Sel>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      <Inp label="Date de mise en œuvre" type="date" value={f.dateMiseEnOeuvre} onChange={e=>upd("dateMiseEnOeuvre",e.target.value)}/>
      <Inp label="Durée de conservation" value={f.dureeConservation} onChange={e=>upd("dureeConservation",e.target.value)} placeholder="Ex: 5 ans"/>
    </div>
    <Inp label="Lieu de stockage" value={f.lieuStockage} onChange={e=>upd("lieuStockage",e.target.value)} placeholder="Ex: Serveurs internes, cloud…"/>
    <Inp label="Catégories de données" value={f.categoriesDonnees} onChange={e=>upd("categoriesDonnees",e.target.value)} placeholder="Types de données traitées" rows={2}/>
    <Inp label="Origine des données" value={f.origineDonnees} onChange={e=>upd("origineDonnees",e.target.value)} placeholder="Comment les données sont collectées" rows={2}/>
  </div>
);

// ═══════════════════════════════════════════════════════
//  CHAMPS SÉCURITÉ — complets
// ═══════════════════════════════════════════════════════
const ChampsSécurité = ({ f, upd }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
    <Inp label="Mesures de sécurité techniques et organisationnelles" value={f.mesuresSecurite} onChange={e=>upd("mesuresSecurite",e.target.value)} placeholder="Chiffrement, contrôle d'accès, pseudonymisation, pare-feu…" rows={3}/>
    <Toggle label="Politique d'accès aux bâtiments en place" checked={!!f.politiqueAccesBatiments} onChange={v=>upd("politiqueAccesBatiments",v)}/>
    <Toggle label="Mesures de sensibilisation du personnel" checked={!!f.mesuresSensibilisation} onChange={v=>upd("mesuresSensibilisation",v)}/>
    <Inp label="Catégories de personnes ayant accès aux données" value={f.categoriesPersonnesAcces} onChange={e=>upd("categoriesPersonnesAcces",e.target.value)} placeholder="Ex: Équipe RH, direction, prestataires…"/>
    <Toggle label="Recours à un sous-traitant" checked={!!f.recoursSousTraitant} onChange={v=>upd("recoursSousTraitant",v)}/>
    {f.recoursSousTraitant && (
      <>
        <Toggle label="Contrat de confidentialité avec le sous-traitant" checked={!!f.contratConfidentialiteSousTraitant} onChange={v=>upd("contratConfidentialiteSousTraitant",v)}/>
        <Inp label="Rôles des sous-traitants" value={f.rolesSousTraitants} onChange={e=>upd("rolesSousTraitants",e.target.value)} rows={2} placeholder="Description des missions des sous-traitants"/>
      </>
    )}
    <Toggle label="Communication à d'autres organismes" checked={!!f.communicationAutresOrganismes} onChange={v=>upd("communicationAutresOrganismes",v)}/>
    {f.communicationAutresOrganismes && (
      <>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Inp label="Destinataire (nom)" value={f.destinataireNom} onChange={e=>upd("destinataireNom",e.target.value)} placeholder="Nom de l'organisme"/>
          <Inp label="Destinataire (adresse)" value={f.destinataireAdresse} onChange={e=>upd("destinataireAdresse",e.target.value)} placeholder="Adresse de l'organisme"/>
        </div>
        <Toggle label="Destinataire conforme CIL" checked={!!f.destinataireConformeCil} onChange={v=>upd("destinataireConformeCil",v)}/>
        <Inp label="Finalité de la communication" value={f.finaliteCommunication} onChange={e=>upd("finaliteCommunication",e.target.value)} placeholder="Pourquoi ces données sont communiquées"/>
      </>
    )}
    <Toggle label="Transfert de données vers un pays étranger" checked={!!f.transfertPaysEtranger} onChange={v=>upd("transfertPaysEtranger",v)}/>
    {f.transfertPaysEtranger && (
      <>
        <Inp label="Pays de destination" value={f.paysDestination} onChange={e=>upd("paysDestination",e.target.value)} placeholder="Ex: France, UE, USA…"/>
        <Inp label="Garanties de protection à l'étranger" value={f.garantiesProtectionEtranger} onChange={e=>upd("garantiesProtectionEtranger",e.target.value)} placeholder="Clauses contractuelles, décision d'adéquation…" rows={2}/>
      </>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════
//  CHAMPS DROITS — complets
// ═══════════════════════════════════════════════════════
const ChampsDroits = ({ f, upd }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
    <div style={{ padding:"10px 14px",background:T.blueBg,border:`1px solid ${T.blueBorder}`,borderRadius:8,fontSize:12,color:T.blue }}>
      <strong>Droits des personnes concernées</strong> — Informez comment les personnes peuvent exercer leurs droits (accès, rectification, suppression, opposition, portabilité).
    </div>
    <Inp label="Moyens d'information des personnes sur leurs droits" value={f.moyensInformationDroits} onChange={e=>upd("moyensInformationDroits",e.target.value)} placeholder="Ex: Notice d'information, mentions légales, email de bienvenue…" rows={2}/>
    <Inp label="Moyens d'exercice des droits" value={f.moyensExerciceDroits} onChange={e=>upd("moyensExerciceDroits",e.target.value)} placeholder="Ex: Formulaire en ligne, courrier postal, email dédié…" rows={2}/>
    <Inp label="Coordonnées pour l'exercice des droits" value={f.coordonneesExerciceDroits} onChange={e=>upd("coordonneesExerciceDroits",e.target.value)} placeholder="Email, adresse postale, numéro de téléphone…"/>
    <Inp label="Délai de réponse aux demandes de droits" value={f.delaiCommunicationDroits} onChange={e=>upd("delaiCommunicationDroits",e.target.value)} placeholder="Ex: 30 jours calendaires"/>
    <div style={{ padding:"10px 14px",background:T.grayBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,fontSize:12,color:T.textSecondary,fontWeight:600 }}>
      Responsable de la déclaration CIL
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      <Inp label="Nom et prénom du responsable" value={f.nomPrenomResponsable} onChange={e=>upd("nomPrenomResponsable",e.target.value)} placeholder="Prénom NOM"/>
      <Inp label="Fonction du responsable" value={f.fonctionResponsable} onChange={e=>upd("fonctionResponsable",e.target.value)} placeholder="Ex: Directeur RH, DPO…"/>
    </div>
    <Inp label="Service ou département" value={f.serviceResponsable} onChange={e=>upd("serviceResponsable",e.target.value)} placeholder="Ex: Direction des Ressources Humaines"/>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      <Inp label="Date de signature" type="date" value={f.dateSignature} onChange={e=>upd("dateSignature",e.target.value)}/>
      <Inp label="Lieu de signature" value={f.lieuSignature} onChange={e=>upd("lieuSignature",e.target.value)} placeholder="Ex: Bobo-Dioulasso"/>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
//  FORMULAIRES SPÉCIFIQUES PAR TYPE
// ═══════════════════════════════════════════════════════
const FormulaireNormale = ({ f, upd, etape }) => {
  if (etape===1) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Inp label="Dénomination du traitement" value={f.denominationTraitement} onChange={e=>upd("denominationTraitement",e.target.value)} placeholder="Nom officiel du traitement" required/>
      <Inp label="Finalité du traitement" value={f.finaliteTraitement} onChange={e=>upd("finaliteTraitement",e.target.value)} placeholder="Objectif principal du traitement" rows={2}/>
      <Inp label="Base légale / Texte juridique" value={f.texteJuridique} onChange={e=>upd("texteJuridique",e.target.value)} placeholder="Loi, décret, contrat, intérêt légitime…" rows={2}/>
      <Sel label="Type de traitement" value={f.typeTraitement} onChange={e=>upd("typeTraitement",e.target.value)}>
        <option value="">Sélectionner…</option>
        <option value="Automatisé">Automatisé</option>
        <option value="Manuel">Manuel</option>
        <option value="Mixte">Mixte</option>
      </Sel>
      <Inp label="Intitulé du traitement" value={f.intituleTraitement} onChange={e=>upd("intituleTraitement",e.target.value)} placeholder="Intitulé complet du traitement"/>
      <Inp label="Support du traitement" value={f.supportTraitement} onChange={e=>upd("supportTraitement",e.target.value)} placeholder="Ex: Logiciel SIRH, fichier Excel, base de données…"/>
    </div>
  );
  if (etape===2) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Inp label="Catégories de personnes concernées" value={f.categoriesPersonnesConcernees} onChange={e=>upd("categoriesPersonnesConcernees",e.target.value)} placeholder="Ex: Employés, clients, fournisseurs, visiteurs…" rows={2}/>
      <Inp label="Nombre estimé de personnes concernées" type="number" value={f.nombrePersonnesConcernees} onChange={e=>upd("nombrePersonnesConcernees",e.target.value)} placeholder="Estimation du nombre"/>
      <Inp label="Catégories de données collectées" value={f.categoriesDonneesCollectees} onChange={e=>upd("categoriesDonneesCollectees",e.target.value)} placeholder="Ex: Nom, prénom, adresse, données financières…" rows={2}/>
      <Toggle label="Données sensibles traitées (santé, biométriques, opinions politiques…)" checked={!!f.donneesSensibles} onChange={v=>upd("donneesSensibles",v)}/>
      {f.donneesSensibles && <Inp label="Nature des données sensibles" value={f.natureDonneesSensibles} onChange={e=>upd("natureDonneesSensibles",e.target.value)} rows={2} placeholder="Précisez les catégories de données sensibles"/>}
      <Toggle label="Procédure manuelle décrite dans le dossier" checked={!!f.descriptionProcedureManuelle} onChange={v=>upd("descriptionProcedureManuelle",v)}/>
      <Inp label="Caractéristiques techniques du système" value={f.caracteristiquesTechniques} onChange={e=>upd("caracteristiquesTechniques",e.target.value)} rows={2} placeholder="Architecture technique, logiciels utilisés…"/>
      <Inp label="Interconnexions avec d'autres traitements" value={f.motifsInterconnexion} onChange={e=>upd("motifsInterconnexion",e.target.value)} rows={2} placeholder="Quels autres fichiers ou systèmes sont connectés et pourquoi"/>
    </div>
  );
  return null;
};

const FormulaireCollecteSite = ({ f, upd, etape }) => {
  if (etape===1) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Inp label="Dénomination du traitement" value={f.denominationTraitement} onChange={e=>upd("denominationTraitement",e.target.value)} placeholder="Nom du traitement sur le site web" required/>
      <Inp label="URL du site internet" value={f.urlSite} onChange={e=>upd("urlSite",e.target.value)} placeholder="https://www.sofitex.bf"/>
      <Inp label="Finalité du traitement" value={f.finaliteTraitement} onChange={e=>upd("finaliteTraitement",e.target.value)} rows={2} placeholder="Objectif de la collecte sur le site"/>
      <Inp label="Catégories de personnes concernées" value={f.categoriesPersonnesConcernees} onChange={e=>upd("categoriesPersonnesConcernees",e.target.value)} rows={2} placeholder="Visiteurs, utilisateurs inscrits…"/>
      <Inp label="Caractéristiques de la structure principale" value={f.caracteristiquesMainStructure} onChange={e=>upd("caracteristiquesMainStructure",e.target.value)} rows={2} placeholder="Hébergeur, CMS, technologies utilisées…"/>
    </div>
  );
  if (etape===2) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Toggle label="Données de connexion collectées (logs, IP)" checked={!!f.donneesConnexion} onChange={v=>upd("donneesConnexion",v)}/>
      {f.donneesConnexion && <Inp label="Description des données de connexion" value={f.descriptionDonneesConnexion} onChange={e=>upd("descriptionDonneesConnexion",e.target.value)} rows={2} placeholder="IP, date/heure, navigateur, pages visitées…"/>}
      <Toggle label="Utilisation de cookies ou traceurs" checked={!!f.cookies} onChange={v=>upd("cookies",v)}/>
      {f.cookies && (
        <>
          <Sel label="Type de cookies" value={f.typeCookies} onChange={e=>upd("typeCookies",e.target.value)}>
            <option value="">Sélectionner…</option>
            <option value="Techniques">Techniques (nécessaires)</option>
            <option value="Analytiques">Analytiques / statistiques</option>
            <option value="Publicitaires">Publicitaires</option>
            <option value="Mixte">Mixte</option>
          </Sel>
          <Inp label="Description des cookies" value={f.descriptionCookies} onChange={e=>upd("descriptionCookies",e.target.value)} rows={2} placeholder="Nom, finalité et éditeur de chaque cookie"/>
          <Inp label="Durée de conservation des cookies" value={f.dureeConservationCookies} onChange={e=>upd("dureeConservationCookies",e.target.value)} placeholder="Ex: 13 mois"/>
          <Toggle label="Consentement préalable au dépôt de cookies" checked={!!f.consentementCookies} onChange={v=>upd("consentementCookies",v)}/>
        </>
      )}
      <Toggle label="Formulaires de collecte en ligne" checked={!!f.formulairesEnLigne} onChange={v=>upd("formulairesEnLigne",v)}/>
      {f.formulairesEnLigne && <Inp label="Données collectées via formulaires" value={f.donneesFormulaires} onChange={e=>upd("donneesFormulaires",e.target.value)} rows={2} placeholder="Champs des formulaires : nom, email, téléphone…"/>}
      <Inp label="Téléchargement / traitement des données collectées" value={f.telechargementTraitement} onChange={e=>upd("telechargementTraitement",e.target.value)} rows={2} placeholder="Comment les données collectées sont-elles traitées ensuite"/>
    </div>
  );
  return null;
};

const FormulaireVideo = ({ f, upd, etape }) => {
  if (etape===1) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Inp label="Finalités du système de vidéosurveillance" value={f.finalites} onChange={e=>upd("finalites",e.target.value)} rows={2} placeholder="Sécurité des biens, sécurité des personnes, contrôle d'accès…"/>
      <Inp label="Adresse d'installation du système" value={f.adresseInstallation} onChange={e=>upd("adresseInstallation",e.target.value)} placeholder="Adresse complète du site surveillé"/>
      <Inp label="Nature de l'environnement surveillé" value={f.natureEnvironnement} onChange={e=>upd("natureEnvironnement",e.target.value)} placeholder="Intérieur, extérieur, zones publiques, zones privées…"/>
      <Inp label="Emplacement précis des caméras" value={f.emplacementCameras} onChange={e=>upd("emplacementCameras",e.target.value)} rows={2} placeholder="Hall d'entrée, parking, salle des serveurs…"/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Inp label="Nombre total de caméras" type="number" value={f.nombreTotalCameras} onChange={e=>upd("nombreTotalCameras",e.target.value)} placeholder="Nombre"/>
        <Inp label="Modèle / marque du dispositif" value={f.modeleDispositif} onChange={e=>upd("modeleDispositif",e.target.value)} placeholder="Ex: Hikvision DS-2CD…"/>
      </div>
      <Inp label="Durée de conservation des enregistrements" value={f.dureeConservationVideo} onChange={e=>upd("dureeConservationVideo",e.target.value)} placeholder="Ex: 30 jours"/>
    </div>
  );
  if (etape===2) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Toggle label="Visualisation en temps réel possible" checked={!!f.visualisationTempsReel} onChange={v=>upd("visualisationTempsReel",v)}/>
      <Inp label="Mode de transfert des images" value={f.modeTransfert} onChange={e=>upd("modeTransfert",e.target.value)} placeholder="IP, analogique, sans fil…"/>
      <Toggle label="Enregistrement du son en plus des images" checked={!!f.sonDeSon} onChange={v=>upd("sonDeSon",v)}/>
      <Inp label="Type d'enregistrement" value={f.typeEnregistrement} onChange={e=>upd("typeEnregistrement",e.target.value)} placeholder="Continu, sur détection de mouvement, planifié…"/>
      <Toggle label="Accès aux images à distance possible" checked={!!f.accesImagesDistance} onChange={v=>upd("accesImagesDistance",v)}/>
      {f.accesImagesDistance && <Inp label="Modalités d'accès à distance" value={f.modalitesAccesDistance} onChange={e=>upd("modalitesAccesDistance",e.target.value)} placeholder="VPN, application mobile sécurisée…"/>}
      <Inp label="Personnes habilitées à visionner les images" value={f.personnesHabilitees} onChange={e=>upd("personnesHabilitees",e.target.value)} placeholder="Agent de sécurité, responsable sécurité, DRH…"/>
      <Inp label="Emplacement des pictogrammes d'information" value={f.localisationPictogrammes} onChange={e=>upd("localisationPictogrammes",e.target.value)} placeholder="Entrée du bâtiment, accueil, parkings…"/>
    </div>
  );
  return null;
};

const FormulaireAutorisation = ({ f, upd, etape }) => {
  if (etape===1) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Inp label="Dénomination du traitement" value={f.denominationTraitement} onChange={e=>upd("denominationTraitement",e.target.value)} required/>
      <Inp label="Finalité du traitement" value={f.finaliteTraitement} onChange={e=>upd("finaliteTraitement",e.target.value)} rows={2}/>
      <Inp label="Catégories de personnes concernées" value={f.categoriesPersonnesConcernees} onChange={e=>upd("categoriesPersonnesConcernees",e.target.value)} rows={2}/>
      <Inp label="Nombre estimé de personnes concernées" type="number" value={f.nombrePersonnesConcernees} onChange={e=>upd("nombrePersonnesConcernees",e.target.value)}/>
      <Inp label="Fonctionnalités du système" value={f.fonctionnalitesSysteme} onChange={e=>upd("fonctionnalitesSysteme",e.target.value)} rows={2}/>
      <Inp label="Certification ou agrément sécurité" value={f.certificationSecurite} onChange={e=>upd("certificationSecurite",e.target.value)} placeholder="ISO 27001, agrément ANSSI…"/>
    </div>
  );
  if (etape===2) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Toggle label="Le traitement concerne des données de santé" checked={!!f.traitementDonneesSante} onChange={v=>upd("traitementDonneesSante",v)}/>
      {f.traitementDonneesSante && (
        <>
          <Toggle label="Implique des professionnels de santé" checked={!!f.professionalSante} onChange={v=>upd("professionalSante",v)}/>
          <Inp label="Durée de conservation des données de santé" value={f.dureeConservationSante} onChange={e=>upd("dureeConservationSante",e.target.value)} placeholder="Ex: 10 ans après la fin de la prise en charge"/>
          <Inp label="Finalité du traitement de données de santé" value={f.finaliteSante} onChange={e=>upd("finaliteSante",e.target.value)} rows={2}/>
        </>
      )}
      <Toggle label="Connexion / interconnexion avec d'autres fichiers" checked={!!f.connexionFichiers} onChange={v=>upd("connexionFichiers",v)}/>
      {f.connexionFichiers && (
        <>
          <Inp label="Catégories de données interconnectées" value={f.categoriesDonneesInterconnexion} onChange={e=>upd("categoriesDonneesInterconnexion",e.target.value)} rows={2}/>
          <Inp label="Identité des fichiers / systèmes interconnectés" value={f.identiteFichiersInterconnexion} onChange={e=>upd("identiteFichiersInterconnexion",e.target.value)} rows={2}/>
        </>
      )}
    </div>
  );
  if (etape===3) return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Toggle label="Le pays de destination assure un niveau de protection adéquat" checked={!!f.paysDestinationProtectionDonnees} onChange={v=>upd("paysDestinationProtectionDonnees",v)}/>
      <Inp label="Pays(s) de destination des données" value={f.paysDestinationTransfert} onChange={e=>upd("paysDestinationTransfert",e.target.value)} placeholder="Ex: France, Côte d'Ivoire…"/>
      <Inp label="Catégories de données transférées" value={f.categoriesDonneesTransfert} onChange={e=>upd("categoriesDonneesTransfert",e.target.value)} rows={2}/>
      <Inp label="Fondement juridique du transfert" value={f.fondementJuridique} onChange={e=>upd("fondementJuridique",e.target.value)} placeholder="Clauses contractuelles types, décision d'adéquation…"/>
      <Toggle label="Consentement des personnes concernées obtenu" checked={!!f.consentementPersonnesConcernees} onChange={v=>upd("consentementPersonnesConcernees",v)}/>
      {f.consentementPersonnesConcernees && <Inp label="Méthode de recueil du consentement" value={f.methodeRecueilConsentement} onChange={e=>upd("methodeRecueilConsentement",e.target.value)} rows={2} placeholder="Formulaire signé, case à cocher en ligne…"/>}
    </div>
  );
  return null;
};

// ═══════════════════════════════════════════════════════
//  MODALE DÉCLARATION MULTI-ÉTAPES (création ET édition)
// ═══════════════════════════════════════════════════════
const ModalDeclaration = ({ traitement, declaration, mode="create", onClose, onSave, dpoId }) => {
  const isEdit = mode === "edit" && !!declaration?.idDeclaration;

  const init = {
    // Identification (étape 0)
    responsableDeclaration:  declaration?.responsableDeclaration  || "",
    contactConfidentialite:  declaration?.contactConfidentialite  || "",
    secteur:                 declaration?.secteur                 || "",
    natureDemande:           declaration?.natureDemande           || "",
    dateMiseEnOeuvre:        declaration?.dateMiseEnOeuvre        || "",
    dureeConservation:       declaration?.dureeConservation       || (traitement?.dureeConservation ? String(traitement.dureeConservation)+" ans" : ""),
    lieuStockage:            declaration?.lieuStockage            || "",
    categoriesDonnees:       declaration?.categoriesDonnees       || "",
    origineDonnees:          declaration?.origineDonnees          || "",
    typeDeclaration:         declaration?.typeDeclaration         || "NORMALE",
    // Sécurité
    mesuresSecurite:         declaration?.mesuresSecurite         || "",
    politiqueAccesBatiments: declaration?.politiqueAccesBatiments || false,
    mesuresSensibilisation:  declaration?.mesuresSensibilisation  || false,
    categoriesPersonnesAcces:declaration?.categoriesPersonnesAcces|| "",
    recoursSousTraitant:     declaration?.recoursSousTraitant     || false,
    contratConfidentialiteSousTraitant: declaration?.contratConfidentialiteSousTraitant || false,
    rolesSousTraitants:      declaration?.rolesSousTraitants      || "",
    communicationAutresOrganismes: declaration?.communicationAutresOrganismes || false,
    destinataireNom:         declaration?.destinataireNom         || "",
    destinataireAdresse:     declaration?.destinataireAdresse     || "",
    destinataireConformeCil: declaration?.destinataireConformeCil || false,
    finaliteCommunication:   declaration?.finaliteCommunication   || "",
    transfertPaysEtranger:   declaration?.transfertPaysEtranger   || false,
    paysDestination:         declaration?.paysDestination         || "",
    garantiesProtectionEtranger: declaration?.garantiesProtectionEtranger || "",
    // Droits
    moyensInformationDroits: declaration?.moyensInformationDroits || "",
    moyensExerciceDroits:    declaration?.moyensExerciceDroits    || "",
    coordonneesExerciceDroits: declaration?.coordonneesExerciceDroits || "",
    delaiCommunicationDroits: declaration?.delaiCommunicationDroits || "",
    nomPrenomResponsable:    declaration?.nomPrenomResponsable    || "",
    fonctionResponsable:     declaration?.fonctionResponsable     || "",
    serviceResponsable:      declaration?.serviceResponsable      || "",
    dateSignature:           declaration?.dateSignature           || "",
    lieuSignature:           declaration?.lieuSignature            || "",
    // Normale
    denominationTraitement:  declaration?.denominationTraitement  || "",
    finaliteTraitement:      declaration?.finaliteTraitement      || traitement?.description || "",
    texteJuridique:          declaration?.texteJuridique          || "",
    typeTraitement:          declaration?.typeTraitement          || "",
    intituleTraitement:      declaration?.intituleTraitement      || "",
    supportTraitement:       declaration?.supportTraitement       || "",
    categoriesPersonnesConcernees: declaration?.categoriesPersonnesConcernees || "",
    nombrePersonnesConcernees: declaration?.nombrePersonnesConcernees || "",
    categoriesDonneesCollectees: declaration?.categoriesDonneesCollectees || "",
    donneesSensibles:        declaration?.donneesSensibles        || false,
    natureDonneesSensibles:  declaration?.natureDonneesSensibles  || "",
    descriptionProcedureManuelle: declaration?.descriptionProcedureManuelle || false,
    caracteristiquesTechniques: declaration?.caracteristiquesTechniques || "",
    motifsInterconnexion:    declaration?.motifsInterconnexion    || "",
    // Site internet
    urlSite:                 declaration?.urlSite                 || "",
    caracteristiquesMainStructure: declaration?.caracteristiquesMainStructure || "",
    donneesConnexion:        declaration?.donneesConnexion        || false,
    descriptionDonneesConnexion: declaration?.descriptionDonneesConnexion || "",
    cookies:                 declaration?.cookies                 || false,
    typeCookies:             declaration?.typeCookies             || "",
    descriptionCookies:      declaration?.descriptionCookies      || "",
    dureeConservationCookies: declaration?.dureeConservationCookies || "",
    consentementCookies:     declaration?.consentementCookies     || false,
    formulairesEnLigne:      declaration?.formulairesEnLigne      || false,
    donneesFormulaires:      declaration?.donneesFormulaires      || "",
    telechargementTraitement: declaration?.telechargementTraitement || "",
    // Vidéosurveillance
    finalites:               declaration?.finalites               || "",
    adresseInstallation:     declaration?.adresseInstallation     || "",
    natureEnvironnement:     declaration?.natureEnvironnement     || "",
    emplacementCameras:      declaration?.emplacementCameras      || "",
    nombreTotalCameras:      declaration?.nombreTotalCameras      || "",
    modeleDispositif:        declaration?.modeleDispositif        || "",
    dureeConservationVideo:  declaration?.dureeConservationVideo  || "",
    visualisationTempsReel:  declaration?.visualisationTempsReel  || false,
    modeTransfert:           declaration?.modeTransfert           || "",
    sonDeSon:                declaration?.sonDeSon                || false,
    typeEnregistrement:      declaration?.typeEnregistrement      || "",
    accesImagesDistance:     declaration?.accesImagesDistance     || false,
    modalitesAccesDistance:  declaration?.modalitesAccesDistance  || "",
    personnesHabilitees:     declaration?.personnesHabilitees     || "",
    localisationPictogrammes: declaration?.localisationPictogrammes || "",
    // Autorisation
    fonctionnalitesSysteme:  declaration?.fonctionnalitesSysteme  || "",
    certificationSecurite:   declaration?.certificationSecurite   || traitement?.certificationSecurite || "",
    traitementDonneesSante:  declaration?.traitementDonneesSante  || false,
    professionalSante:       declaration?.professionalSante       || false,
    dureeConservationSante:  declaration?.dureeConservationSante  || "",
    finaliteSante:           declaration?.finaliteSante           || "",
    connexionFichiers:       declaration?.connexionFichiers       || false,
    categoriesDonneesInterconnexion: declaration?.categoriesDonneesInterconnexion || "",
    identiteFichiersInterconnexion: declaration?.identiteFichiersInterconnexion || "",
    paysDestinationProtectionDonnees: declaration?.paysDestinationProtectionDonnees || false,
    paysDestinationTransfert: declaration?.paysDestinationTransfert || "",
    categoriesDonneesTransfert: declaration?.categoriesDonneesTransfert || "",
    fondementJuridique:      declaration?.fondementJuridique      || "",
    consentementPersonnesConcernees: declaration?.consentementPersonnesConcernees || false,
    methodeRecueilConsentement: declaration?.methodeRecueilConsentement || "",
  };

  const [f, setF] = useState(init);
  const [etape, setEtape] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k,v) => setF(p => ({...p,[k]:v}));
  const isEdit = mode === "edit";

  const typeMap = { NORMALE:ETAPES_NORMALE, COLLECTE_SITE:ETAPES_SITE, VIDEO_SURVEILLANCE:ETAPES_VIDEO, AUTORISATION:ETAPES_AUTO };
  const etapes = typeMap[f.typeDeclaration] || ETAPES_NORMALE;
  const isLast = etape === etapes.length - 1;

  const buildPayload = () => {
    const commun = {
      traitementId: traitement?.idTraitement,
      dateSoumission: new Date().toISOString().split("T")[0],
      secteur:f.secteur, natureDemande:f.natureDemande||null,
      responsableDeclaration:f.responsableDeclaration,
      contactConfidentialite:f.contactConfidentialite,
      dateMiseEnOeuvre:f.dateMiseEnOeuvre||null,
      categoriesDonnees:f.categoriesDonnees, origineDonnees:f.origineDonnees,
      dureeConservation:f.dureeConservation, lieuStockage:f.lieuStockage,
      communicationAutresOrganismes:f.communicationAutresOrganismes,
      destinataireNom:f.destinataireNom, destinataireAdresse:f.destinataireAdresse,
      finaliteCommunication:f.finaliteCommunication,
      destinataireConformeCil:f.destinataireConformeCil,
      transfertPaysEtranger:f.transfertPaysEtranger,
      paysDestination:f.paysDestination,
      garantiesProtectionEtranger:f.garantiesProtectionEtranger,
      recoursSousTraitant:f.recoursSousTraitant,
      contratConfidentialiteSousTraitant:f.contratConfidentialiteSousTraitant,
      rolesSousTraitants:f.rolesSousTraitants,
      categoriesPersonnesAcces:f.categoriesPersonnesAcces,
      politiqueAccesBatiments:f.politiqueAccesBatiments,
      mesuresSecurite:f.mesuresSecurite,
      mesuresSensibilisation:f.mesuresSensibilisation,
      moyensInformationDroits:f.moyensInformationDroits,
      moyensExerciceDroits:f.moyensExerciceDroits,
      coordonneesExerciceDroits:f.coordonneesExerciceDroits,
      delaiCommunicationDroits:f.delaiCommunicationDroits,
      nomPrenomResponsable:f.nomPrenomResponsable,
      fonctionResponsable:f.fonctionResponsable,
      serviceResponsable:f.serviceResponsable,
      dateSignature:f.dateSignature||null,
      lieuSignature:f.lieuSignature,
    };
    if (f.typeDeclaration==="NORMALE") return { ...commun,
      denominationTraitement:f.denominationTraitement, finaliteTraitement:f.finaliteTraitement,
      texteJuridique:f.texteJuridique, typeTraitement:f.typeTraitement,
      intituleTraitement:f.intituleTraitement, supportTraitement:f.supportTraitement,
      categoriesPersonnesConcernees:f.categoriesPersonnesConcernees,
      nombrePersonnesConcernees:f.nombrePersonnesConcernees?Number(f.nombrePersonnesConcernees):null,
      categoriesDonneesCollectees:f.categoriesDonneesCollectees,
      donneesSensibles:f.donneesSensibles, natureDonneesSensibles:f.natureDonneesSensibles,
      descriptionProcedureManuelle:f.descriptionProcedureManuelle,
      caracteristiquesTechniques:f.caracteristiquesTechniques, motifsInterconnexion:f.motifsInterconnexion,
    };
    if (f.typeDeclaration==="COLLECTE_SITE") return { ...commun,
      denominationTraitement:f.denominationTraitement, urlSite:f.urlSite,
      finaliteTraitement:f.finaliteTraitement,
      categoriesPersonnesConcernees:f.categoriesPersonnesConcernees,
      caracteristiquesMainStructure:f.caracteristiquesMainStructure,
      donneesConnexion:f.donneesConnexion, descriptionDonneesConnexion:f.descriptionDonneesConnexion,
      cookies:f.cookies, typeCookies:f.typeCookies,
      descriptionCookies:f.descriptionCookies, dureeConservationCookies:f.dureeConservationCookies,
      consentementCookies:f.consentementCookies,
      formulairesEnLigne:f.formulairesEnLigne, donneesFormulaires:f.donneesFormulaires,
      telechargementTraitement:f.telechargementTraitement,
    };
    if (f.typeDeclaration==="VIDEO_SURVEILLANCE") return { ...commun,
      finalites:f.finalites, adresseInstallation:f.adresseInstallation,
      natureEnvironnement:f.natureEnvironnement, emplacementCameras:f.emplacementCameras,
      nombreTotalCameras:f.nombreTotalCameras?Number(f.nombreTotalCameras):null,
      modeleDispositif:f.modeleDispositif, dureeConservationVideo:f.dureeConservationVideo,
      visualisationTempsReel:f.visualisationTempsReel, modeTransfert:f.modeTransfert,
      sonDeSon:f.sonDeSon, typeEnregistrement:f.typeEnregistrement,
      accesImagesDistance:f.accesImagesDistance, modalitesAccesDistance:f.modalitesAccesDistance,
      personnesHabilitees:f.personnesHabilitees, localisationPictogrammes:f.localisationPictogrammes,
    };
    if (f.typeDeclaration==="AUTORISATION") return { ...commun,
      denominationTraitement:f.denominationTraitement, finaliteTraitement:f.finaliteTraitement,
      categoriesPersonnesConcernees:f.categoriesPersonnesConcernees,
      nombrePersonnesConcernees:f.nombrePersonnesConcernees?Number(f.nombrePersonnesConcernees):null,
      fonctionnalitesSysteme:f.fonctionnalitesSysteme, certificationSecurite:f.certificationSecurite,
      traitementDonneesSante:f.traitementDonneesSante, professionalSante:f.professionalSante,
      dureeConservationSante:f.dureeConservationSante, finaliteSante:f.finaliteSante,
      connexionFichiers:f.connexionFichiers,
      categoriesDonneesInterconnexion:f.categoriesDonneesInterconnexion,
      identiteFichiersInterconnexion:f.identiteFichiersInterconnexion,
      paysDestinationProtectionDonnees:f.paysDestinationProtectionDonnees,
      paysDestinationTransfert:f.paysDestinationTransfert,
      categoriesDonneesTransfert:f.categoriesDonneesTransfert,
      fondementJuridique:f.fondementJuridique,
      consentementPersonnesConcernees:f.consentementPersonnesConcernees,
      methodeRecueilConsentement:f.methodeRecueilConsentement,
    };
    return commun;
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    const suffix = ENDPOINT_TYPE[f.typeDeclaration] || "normale";

    try {
      if (isEdit) {
        // ── ÉDITION : PUT sur la déclaration existante ──────────────────
        const url = `${BASE}/declarations/${declaration.idDeclaration}/${suffix}`;
        const r = await fetch(url, { method:"PUT", headers:authH(), body:JSON.stringify(buildPayload()) });
        if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
        let data = await r.json();

        // Si la déclaration avait été rejetée (DG ou CIL), on la renvoie
        // automatiquement dans le circuit (statut → EN_ATTENTE, pour le DG).
        const etaitRejetee = estRejetee(declaration.statut);
        if (etaitRejetee) {
          const rs = await fetch(`${BASE}/declarations/${declaration.idDeclaration}/soumettre`, { method:"PUT", headers:authH() });
          if (!rs.ok) { const e = await rs.json().catch(()=>({})); throw new Error(e.message||`Erreur ${rs.status}`); }
          data = await rs.json();
          toast.success("Déclaration corrigée et renvoyée à la Direction Générale !");
        } else {
          toast.success("Déclaration mise à jour !");
        }
        onSave(data); onClose();
      } else {
        // ── CRÉATION : POST ──────────────────────────────────────────────
        const endpointMap = {
          NORMALE:"/declarations/normale",
          COLLECTE_SITE:"/declarations/collecte-site",
          VIDEO_SURVEILLANCE:"/declarations/video-surveillance",
          AUTORISATION:"/declarations/autorisation"
        };
        const url = BASE + (endpointMap[f.typeDeclaration]||"/declarations/normale");
        const r = await fetch(url, { method:"POST", headers:authH(), body:JSON.stringify(buildPayload()) });
        if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
        const data = await r.json();
        onSave(data); onClose(); toast.success("Déclaration soumise à la Direction Générale !");
      }
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const renderEtapeContent = () => {
    if (etape===0) return (
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <Sel label="Type de déclaration" value={f.typeDeclaration} onChange={e=>{upd("typeDeclaration",e.target.value);setEtape(0);}} readOnly={isEdit}>
          <option value="NORMALE">Déclaration normale</option>
          <option value="COLLECTE_SITE">Collecte via site internet</option>
          <option value="VIDEO_SURVEILLANCE">Vidéosurveillance</option>
          <option value="AUTORISATION">Demande d'autorisation</option>
        </Sel>
        {isEdit && <div style={{ fontSize:11,color:T.textMuted }}>Le type de déclaration ne peut pas être modifié après création.</div>}
        <ChampsCommuns1 f={f} upd={upd}/>
      </div>
    );
    // Étapes spécifiques selon type
    if (f.typeDeclaration==="NORMALE" && (etape===1||etape===2))
      return <FormulaireNormale f={f} upd={upd} etape={etape}/>;
    if (f.typeDeclaration==="COLLECTE_SITE" && (etape===1||etape===2))
      return <FormulaireCollecteSite f={f} upd={upd} etape={etape}/>;
    if (f.typeDeclaration==="VIDEO_SURVEILLANCE" && (etape===1||etape===2))
      return <FormulaireVideo f={f} upd={upd} etape={etape}/>;
    if (f.typeDeclaration==="AUTORISATION" && (etape===1||etape===2||etape===3))
      return <FormulaireAutorisation f={f} upd={upd} etape={etape}/>;
    // Étapes communes finales
    if (etape===etapes.length-2) return <ChampsSécurité f={f} upd={upd}/>;
    if (etape===etapes.length-1) return <ChampsDroits f={f} upd={upd}/>;
    return null;
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,width:640,maxHeight:"92vh",overflowY:"auto",background:T.cardBg,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",border:`1px solid ${T.cardBorder}` }}>
        <div style={{ padding:"18px 22px 14px",borderBottom:`1px solid ${T.cardBorder}`,position:"sticky",top:0,background:T.cardBg,zIndex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:isEdit?T.orangeBg:T.purpleBg,border:`1px solid ${isEdit?T.orangeBorder:T.purpleBorder}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              {isEdit ? <Pencil size={18} color={T.orange}/> : <Send size={18} color={T.purple}/>}
            </div>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:T.textPrimary }}>
                {isEdit ? `Corriger la déclaration #${declaration.idDeclaration}` : "Nouvelle déclaration CIL"}
              </div>
              <div style={{ fontSize:12,color:T.textMuted }}>
                Traitement : {traitement?.nom || traitement?.description || (declaration?.traitementId ? `#${declaration.traitementId}` : "—")}
              </div>
            </div>
            <button onClick={onClose} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:T.textMuted }}><X size={16}/></button>
          </div>
          <StepIndicator etapes={etapes} current={etape}/>
        </div>

        {isEdit && estRejetee(declaration.statut) && etape===0 && (
          <div style={{ margin:"14px 22px 0",padding:"10px 14px",background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:8,fontSize:12,color:T.red,display:"flex",gap:8,alignItems:"center" }}>
            <AlertCircle size={13}/> Cette déclaration a été rejetée. Corrigez les champs nécessaires puis cliquez sur « Renvoyer » à la dernière étape.
          </div>
        )}
        {!isEdit && declaration && etape===0 && (
          <div style={{ margin:"14px 22px 0",padding:"10px 14px",background:T.yellowBg,border:`1px solid ${T.yellowBorder}`,borderRadius:8,fontSize:12,color:T.yellow,display:"flex",gap:8,alignItems:"center" }}>
            <FileCheck size={13}/> Champs pré-remplis depuis la déclaration existante — tous modifiables.
          </div>
        )}

        {traitement && (
          <div style={{ margin:"14px 22px 0",padding:"10px 14px",background:T.grayBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:12 }}>
            <span><strong style={{ color:T.textMuted }}>Traitement :</strong> <span style={{ color:T.textPrimary }}>{traitement.nom || traitement.description}</span></span>
            <span><strong style={{ color:T.textMuted }}>Conservation :</strong> <span style={{ color:T.textPrimary }}>{traitement.dureeConservation} ans</span></span>
            <span><strong style={{ color:T.textMuted }}>Département :</strong> <span style={{ color:T.textPrimary }}>{traitement.department||"—"}</span></span>
          </div>
        )}

        <div style={{ padding:"16px 22px" }}>
          {renderEtapeContent()}
          {error && <div style={{ marginTop:14,padding:"10px 12px",background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:8,fontSize:12,color:T.red,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={13}/>{error}</div>}
        </div>

        <div style={{ padding:"14px 22px 20px",display:"flex",justifyContent:"space-between",gap:10,borderTop:`1px solid ${T.cardBorder}`,position:"sticky",bottom:0,background:T.cardBg }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <div style={{ display:"flex",gap:8 }}>
            {etape > 0 && <Btn onClick={() => setEtape(e => e-1)}><ChevronLeft size={13}/> Précédent</Btn>}
            {!isLast
              ? <Btn variant="primary" onClick={() => setEtape(e => e+1)}>Suivant <ChevronRight size={13}/></Btn>
              : <Btn variant={isEdit?"warning":"primary"} onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><Spinner color={isEdit?T.yellow:"#fff"}/> {isEdit?"Envoi…":"Soumission…"}</>
                    : isEdit
                      ? (estRejetee(declaration.statut) ? <><Send size={13}/> Corriger et renvoyer</> : <><Check size={13}/> Enregistrer</>)
                      : <><Send size={13}/> Soumettre</>
                  }
                </Btn>
            }
          </div>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  EXPORT PDF
// ═══════════════════════════════════════════════════════
const exportDeclarationPDF = (declaration, traitement) => {
  const statLabel = {
    EN_ATTENTE:"En attente DG", APPROUVEE_DG:"Approuvée par la DG", REJETEE_DG:"Rejetée par la DG",
    EN_VERIFICATION_CIL:"En vérification CIL", VALIDEE_CIL:"Validée CIL", REJETEE_CIL:"Rejetée CIL",
    BROUILLON:"Brouillon", APPROUVEE:"Approuvée", REJETEE:"Rejetée"
  };
  const typeLabel = { NORMALE:"Déclaration Normale", COLLECTE_SITE:"Collecte via Site Internet", VIDEO_SURVEILLANCE:"Système de Vidéosurveillance", AUTORISATION:"Demande d'Autorisation" };
  const date = new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Déclaration #${declaration.idDeclaration}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;margin:0;padding:0;color:#1a1a1a;font-size:13px;}
  .page{max-width:800px;margin:0 auto;padding:40px;}
  .header{background:#0D1F12;color:#fff;padding:28px 32px;border-radius:8px 8px 0 0;}
  .header h1{margin:0 0 6px;font-size:22px;font-weight:800;}
  .header p{margin:0;opacity:0.7;font-size:12px;}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-top:10px;}
  .badge-yellow{background:#FEF9C3;color:#854D0E;border:1px solid #FDE047;}
  .badge-green{background:#DCFCE7;color:#166534;border:1px solid #86EFAC;}
  .badge-red{background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;}
  .badge-blue{background:#DBEAFE;color:#1E40AF;border:1px solid #93C5FD;}
  .section{margin-top:20px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;}
  .section-title{background:#F9FAFB;padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6B7280;border-bottom:1px solid #E5E7EB;}
  .section-body{padding:16px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .field label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9CA3AF;margin-bottom:3px;display:block;}
  .field .value{font-size:13px;color:#1a1a1a;font-weight:500;}
  .footer{margin-top:32px;padding-top:16px;border-top:2px solid #E5E7EB;display:flex;justify-content:space-between;font-size:11px;color:#9CA3AF;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body><div class="page">
<div class="header">
  <div style="font-size:16px;font-weight:800;letter-spacing:0.08em;">SOFITEX</div>
  <h1>Déclaration de Traitement de Données Personnelles</h1>
  <p>Référence : DECL-${declaration.idDeclaration} &nbsp;|&nbsp; Généré le : ${date}</p>
  <span class="badge ${declaration.statut?.includes('APPROUVEE')||declaration.statut==='VALIDEE_CIL'?'badge-green':declaration.statut?.includes('REJETEE')?'badge-red':declaration.statut==='EN_VERIFICATION_CIL'?'badge-blue':'badge-yellow'}">${statLabel[declaration.statut]||declaration.statut||"—"}</span>
</div>
<div class="section">
  <div class="section-title">Informations générales</div>
  <div class="section-body"><div class="grid">
    <div class="field"><label>Type de déclaration</label><div class="value">${typeLabel[declaration.typeDeclaration]||declaration.typeDeclaration||"—"}</div></div>
    <div class="field"><label>Date de soumission</label><div class="value">${declaration.dateSoumission||"—"}</div></div>
    <div class="field"><label>DPO déclarant</label><div class="value">${declaration.dpoNomPrenom||"—"}</div></div>
    <div class="field"><label>Statut</label><div class="value">${statLabel[declaration.statut]||"—"}</div></div>
    <div class="field"><label>Secteur</label><div class="value">${declaration.secteur||"—"}</div></div>
    <div class="field"><label>Nature de la demande</label><div class="value">${declaration.natureDemande||"—"}</div></div>
  </div></div>
</div>
${traitement ? `<div class="section"><div class="section-title">Traitement associé</div><div class="section-body"><div class="grid">
  <div class="field"><label>ID</label><div class="value">#${traitement.idTraitement}</div></div>
  <div class="field"><label>Nom</label><div class="value">${traitement.nom||traitement.description||"—"}</div></div>
  <div class="field"><label>Département</label><div class="value">${traitement.department||"—"}</div></div>
  <div class="field"><label>Session</label><div class="value">#${traitement.sessionCollecteId||"—"}</div></div>
</div></div></div>` : ""}
<div class="section"><div class="section-title">Responsable & Contact</div><div class="section-body"><div class="grid">
  <div class="field"><label>Responsable</label><div class="value">${declaration.responsableDeclaration||"—"}</div></div>
  <div class="field"><label>Contact confidentialité</label><div class="value">${declaration.contactConfidentialite||"—"}</div></div>
  <div class="field"><label>Date de mise en œuvre</label><div class="value">${declaration.dateMiseEnOeuvre||"—"}</div></div>
  <div class="field"><label>Lieu de stockage</label><div class="value">${declaration.lieuStockage||"—"}</div></div>
</div></div></div>
<div class="section"><div class="section-title">Données traitées</div><div class="section-body"><div class="grid">
  <div class="field"><label>Catégories de données</label><div class="value">${declaration.categoriesDonnees||"—"}</div></div>
  <div class="field"><label>Origine des données</label><div class="value">${declaration.origineDonnees||"—"}</div></div>
  <div class="field"><label>Durée de conservation</label><div class="value">${declaration.dureeConservation||"—"}</div></div>
  <div class="field"><label>Transfert étranger</label><div class="value">${declaration.transfertPaysEtranger?"Oui":"Non"}</div></div>
</div></div></div>
<div class="section"><div class="section-title">Sécurité & Accès</div><div class="section-body">
  <div class="field" style="margin-bottom:10px"><label>Mesures de sécurité</label><div class="value">${declaration.mesuresSecurite||"—"}</div></div>
  <div class="grid">
    <div class="field"><label>Catégories d'accès</label><div class="value">${declaration.categoriesPersonnesAcces||"—"}</div></div>
    <div class="field"><label>Politique bâtiments</label><div class="value">${declaration.politiqueAccesBatiments?"Oui":"Non"}</div></div>
    <div class="field"><label>Sensibilisation</label><div class="value">${declaration.mesuresSensibilisation?"Oui":"Non"}</div></div>
    <div class="field"><label>Sous-traitance</label><div class="value">${declaration.recoursSousTraitant?"Oui":"Non"}</div></div>
  </div>
</div></div>
<div class="section"><div class="section-title">Exercice des droits</div><div class="section-body"><div class="grid">
  <div class="field"><label>Moyens d'information</label><div class="value">${declaration.moyensInformationDroits||"—"}</div></div>
  <div class="field"><label>Moyens d'exercice</label><div class="value">${declaration.moyensExerciceDroits||"—"}</div></div>
  <div class="field"><label>Coordonnées exercice</label><div class="value">${declaration.coordonneesExerciceDroits||"—"}</div></div>
  <div class="field"><label>Délai de communication</label><div class="value">${declaration.delaiCommunicationDroits||"—"}</div></div>
  <div class="field"><label>Nom du responsable</label><div class="value">${declaration.nomPrenomResponsable||"—"}</div></div>
  <div class="field"><label>Fonction</label><div class="value">${declaration.fonctionResponsable||"—"}</div></div>
</div></div></div>
<div class="footer">
  <span>SOFITEX — Système de Collecte des Données Personnelles</span>
  <span>Document confidentiel — DECL-${declaration.idDeclaration}</span>
</div>
</div><script>window.onload=()=>window.print();</script></body></html>`;
  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
};

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD — sans bandeau workflow
// ═══════════════════════════════════════════════════════
const SectionDashboard = ({ sessions, declarations, setSection, dpoInfo }) => {
  // Déclarations manuelles uniquement (créées par le DPO via "Déclarer")
  const declsManuelles = declarations.filter(estDeclarationManuelle);
  const actives      = sessions.filter(s => s.statutSession==="EN_COURS");
  const enAttenteDG  = declsManuelles.filter(d => d.statut==="EN_ATTENTE" || d.statut==="EN_ATTENTE_DG");
  const approuvees   = declsManuelles.filter(d => d.statut==="APPROUVEE_DG"||d.statut==="VALIDEE_CIL"||d.statut==="APPROUVEE");

  const stats = [
    { label:"Sessions actives",      value:actives.length,          sub:"en cours de collecte",    color:T.blue,   bg:T.blueBg,   border:T.blueBorder,   Icon:FolderOpen },
    { label:"Déclarations soumises", value:declsManuelles.length,   sub:`${approuvees.length} approuvées DG`, color:T.green, bg:T.greenBg, border:T.greenBorder, Icon:FileText },
    { label:"En attente DG",         value:enAttenteDG.length,      sub:"validation DG requise",   color:T.yellow, bg:T.yellowBg, border:T.yellowBorder, Icon:Clock },
    { label:"En verif. CIL",         value:declsManuelles.filter(d=>d.statut==="EN_VERIFICATION_CIL").length, sub:"transmises après DG", color:T.purple, bg:T.purpleBg, border:T.purpleBorder, Icon:Shield },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Tableau de bord DPO" subtitle={`Bonjour ${dpoInfo?.prenom||"DPO"} — ${new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`}/>

      {/* Statistiques */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:20 }}>
        {stats.map((s,i) => (
          <Card key={i} style={{ padding:"18px 20px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:s.color,borderRadius:"12px 12px 0 0" }}/>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:s.color }}><s.Icon size={18} strokeWidth={1.8}/></div>
              <ArrowUpRight size={13} color={s.color} style={{ opacity:0.4,marginTop:4 }}/>
            </div>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:26,fontWeight:800,color:T.textPrimary,fontFamily:"'DM Mono',monospace",lineHeight:1,letterSpacing:"-0.02em" }}>{s.value}</div>
            <div style={{ fontSize:11,color:s.color,marginTop:5,fontWeight:500 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Card style={{ padding:0,overflow:"hidden" }}>
          <div style={{ padding:"16px 18px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}><FolderOpen size={15} color={T.textSecondary}/><h3 style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>Sessions actives</h3></div>
            <button onClick={() => setSection("sessions")} style={{ fontSize:12,color:T.gold,background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Voir tout →</button>
          </div>
          <div>
            {actives.length===0 && <div style={{ padding:24,textAlign:"center",fontSize:13,color:T.textMuted,fontStyle:"italic" }}>Aucune session active</div>}
            {actives.slice(0,4).map((s,i) => (
              <div key={s.idSession} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 18px",borderBottom:i<Math.min(actives.length,4)-1?`1px solid ${T.grayBg}`:"none" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:T.textPrimary }}>Session #{s.idSession} — {s.nomSession || s.lieu}</div>
                  <div style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>{s.nombreTraitements} traitement(s) · {s.typeCollecte}</div>
                </div>
                <Badge type={s.statutSession}/>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding:0,overflow:"hidden" }}>
          <div style={{ padding:"16px 18px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}><FileText size={15} color={T.textSecondary}/><h3 style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>Déclarations récentes</h3></div>
            <button onClick={() => setSection("declarations")} style={{ fontSize:12,color:T.gold,background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Voir tout →</button>
          </div>
          <div>
            {declsManuelles.length===0 && <div style={{ padding:24,textAlign:"center",fontSize:13,color:T.textMuted,fontStyle:"italic" }}>Aucune déclaration manuelle</div>}
            {declsManuelles.slice(0,4).map((d,i) => (
              <div key={d.idDeclaration} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 18px",borderBottom:i<Math.min(declsManuelles.length,4)-1?`1px solid ${T.grayBg}`:"none" }}>
                <div style={{ width:32,height:32,borderRadius:8,background:d.statut?.includes("APPROUVEE")||d.statut==="VALIDEE_CIL"?T.greenBg:d.statut?.includes("REJETEE")?T.redBg:T.yellowBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {d.statut?.includes("APPROUVEE")||d.statut==="VALIDEE_CIL"?<CheckCircle2 size={15} color={T.green}/>:d.statut?.includes("REJETEE")?<XCircle size={15} color={T.red}/>:<Clock size={15} color={T.yellow}/>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:T.textPrimary }}>Déclaration #{d.idDeclaration}</div>
                  <div style={{ fontSize:11,color:T.textMuted }}>{d.dateSoumission}</div>
                </div>
                <Badge type={d.statut}/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : SESSIONS
// ═══════════════════════════════════════════════════════
const SectionSessions = ({ sessions, setSessions, setSection, setSelectedSession }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [cloture,    setCloture]    = useState(null);
  const [editSession,setEditSession]= useState(null);
  const [filter,     setFilter]     = useState("all");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${BASE}/sessions`, { headers:authH() });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
      setSessions(await r.json());
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [setSessions]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter==="all" ? sessions : sessions.filter(s => s.statutSession===filter);

  return (
    <div className="slide-in">
      {showCreate && <ModalCreerSession onClose={() => setShowCreate(false)} onSave={s => { setSessions(p => [s,...p]); }}/>}
      {cloture && <ModalCloture session={cloture} onClose={() => setCloture(null)} onConfirm={updated => setSessions(p => p.map(s => s.idSession===updated.idSession?updated:s))}/>}
      {editSession && <ModalModifierSession session={editSession} onClose={() => setEditSession(null)} onSave={updated => setSessions(p => p.map(s => s.idSession===updated.idSession?updated:s))}/>}
      <PageHeader title="Sessions de collecte" subtitle={`${sessions.filter(s=>s.statutSession==="EN_COURS").length} active(s) sur ${sessions.length}`}>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.textSecondary,padding:"7px 12px",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none" }}>
          <option value="all">Tous les statuts</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
        <Btn variant="outline" onClick={load}><RefreshCw size={13}/> Rafraîchir</Btn>
        <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={13}/> Nouvelle session</Btn>
      </PageHeader>
      {loading && <Card style={{ padding:40,textAlign:"center" }}><div style={{ color:T.textMuted,fontSize:13 }}>Chargement…</div></Card>}
      {!loading && error && <Card style={{ padding:20 }}><div style={{ color:T.red,fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/>{error}</div></Card>}
      {!loading && !error && (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {filtered.map(s => (
            <Card key={s.idSession} style={{ padding:0,overflow:"hidden" }}>
              <div style={{ display:"flex",alignItems:"stretch" }}>
                <div style={{ width:4,background:s.statutSession==="EN_COURS"?T.blue:s.statutSession==="TERMINEE"?T.green:T.gray,flexShrink:0 }}/>
                <div style={{ flex:1,padding:"16px 20px" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8 }}>
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                        <span style={{ fontSize:14,fontWeight:700,color:T.textPrimary }}>{s.nomSession || `Session #${s.idSession}`}</span>
                        <Badge type={s.statutSession}/><Badge type={s.typeCollecte}/>
                      </div>
                      <div style={{ display:"flex",gap:18,fontSize:12,color:T.textMuted,flexWrap:"wrap" }}>
                        <span style={{ display:"flex",alignItems:"center",gap:5 }}><FolderOpen size={12} color={T.textMuted}/>{s.lieu||"—"}</span>
                        <span style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <Calendar size={12} color={T.textMuted}/>
                          {s.dateDebut?.split("T")[0]||"—"}{s.dateFin?` → ${s.dateFin.split("T")[0]}`:""}</span>
                        <span style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <User size={12} color={T.textMuted}/>
                          {s.dpoNomComplet||"—"}</span>
                        <span style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <Wrench size={12} color={T.textMuted}/>
                          {s.nombreTraitements} traitement(s)</span>
                      </div>
                      {s.description && <div style={{ fontSize:12,color:T.textSecondary,marginTop:6,lineHeight:1.5 }}>{s.description}</div>}
                    </div>
                    <span style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:T.textMuted,flexShrink:0,marginLeft:16 }}>#{s.idSession}</span>
                  </div>
                  <div style={{ display:"flex",gap:8,paddingTop:10,borderTop:`1px solid ${T.cardBorder}` }}>
                    <Btn onClick={() => { setSelectedSession(s.idSession); setSection("traitements"); }} style={{ fontSize:12,padding:"6px 12px" }}><Eye size={12}/> Voir traitements</Btn>
                    <Btn onClick={() => setEditSession(s)} style={{ fontSize:12,padding:"6px 12px" }}><Pencil size={12}/> Modifier</Btn>
                    {s.statutSession==="EN_COURS" && <Btn variant="warning" onClick={() => setCloture(s)} style={{ fontSize:12,padding:"6px 12px" }}><StopCircle size={12}/> Clôturer</Btn>}
                    {s.statutSession==="TERMINEE" && <span style={{ fontSize:12,color:T.green,display:"flex",alignItems:"center",gap:5,padding:"6px 0" }}><CheckCircle2 size={13}/> Clôturée le {s.dateFin?.split("T")[0]}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length===0 && <Card style={{ padding:40,textAlign:"center" }}><p style={{ color:T.textMuted,fontSize:13,fontStyle:"italic" }}>Aucune session pour ce filtre.</p></Card>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TRAITEMENTS
// ═══════════════════════════════════════════════════════
const SectionTraitements = ({ declarations, setDeclarations, sessions, dpoInfo }) => {
  const [traitements,   setTraitements]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [showDecl,      setShowDecl]      = useState(null);
  const [declPrefill,   setDeclPrefill]   = useState(null);
  const [showDonnees,   setShowDonnees]   = useState(null);
  const [filterSession, setFilterSession] = useState("all");
  const [search,        setSearch]        = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${BASE}/traitements/envoyes-dpo`, { headers:authH() });
      if (!r.ok) {
        const r2 = await fetch(`${BASE}/traitements`, { headers:authH() });
        if (!r2.ok) { const e = await r2.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r2.status}`); }
        const all = await r2.json();
        setTraitements(all.filter(t => t.envoyeAuDpo === true));
      } else {
        setTraitements(await r.json());
      }
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Déclarations manuelles uniquement (créées par le DPO) — celles auto-créées
  // en BROUILLON avec le traitement ne comptent jamais comme "déjà déclaré".
  const hasDeclared = (tId) => declarations.some(d => d.traitementId===tId && estDeclarationManuelle(d));
  const getDeclOf = (tId) => declarations.find(d => d.traitementId===tId && estDeclarationManuelle(d));

  const getSessionInfo = (t) => {
    if (t.sessionCollecteId) {
      const sess = sessions.find(s => s.idSession === t.sessionCollecteId);
      return sess ? { id:sess.idSession, lieu:sess.nomSession || sess.lieu, statut:sess.statutSession } : { id:t.sessionCollecteId, lieu:"—", statut:"—" };
    }
    return null;
  };

  const filtered = traitements.filter(t => {
    const matchSession = filterSession==="all" || String(t.sessionCollecteId)===filterSession;
    const matchSearch  = !search.trim() || (t.nom||t.description||"").toLowerCase().includes(search.toLowerCase()) || String(t.idTraitement).includes(search);
    return matchSession && matchSearch;
  });

  const sessionIds = [...new Set(filtered.map(t => t.sessionCollecteId))];

  return (
    <div className="slide-in">
      {showDecl && (
        <ModalDeclaration
          traitement={showDecl}
          declaration={declPrefill}
          mode="create"
          onClose={() => { setShowDecl(null); setDeclPrefill(null); }}
          onSave={d => setDeclarations(p => [d,...p])}
          dpoId={dpoInfo?.id}
        />
      )}
      {showDonnees && <ModalDonnees traitement={showDonnees} onClose={() => setShowDonnees(null)}/>}
      <PageHeader title="Traitements reçus" subtitle={`${traitements.length} traitement(s) envoyé(s) au DPO — toutes sessions`}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ padding:"7px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.cardBg,outline:"none",fontFamily:"inherit",width:180 }}/>
          <select value={filterSession} onChange={e=>setFilterSession(e.target.value)} style={{ padding:"7px 12px",borderRadius:8,border:`1px solid ${T.cardBorder}`,fontSize:13,color:T.textPrimary,background:T.cardBg,fontFamily:"inherit",outline:"none" }}>
            <option value="all">Toutes les sessions</option>
            {sessions.map(s => <option key={s.idSession} value={String(s.idSession)}>#{s.idSession} — {s.nomSession || s.lieu}</option>)}
          </select>
        </div>
        <Btn variant="outline" onClick={load}><RefreshCw size={13}/> Rafraîchir</Btn>
      </PageHeader>

      {loading && <Card style={{ padding:40,textAlign:"center" }}><div style={{ color:T.textMuted,fontSize:13 }}>Chargement…</div></Card>}
      {!loading && error && <Card style={{ padding:20 }}><div style={{ color:T.red,fontSize:13,display:"flex",gap:8,alignItems:"center" }}><AlertCircle size={14}/>{error}</div></Card>}
      {!loading && !error && traitements.length===0 && (
        <Card style={{ padding:48,textAlign:"center" }}>
          <Cpu size={40} color={T.textMuted} style={{ margin:"0 auto 12px",display:"block",opacity:0.3 }}/>
          <p style={{ color:T.textMuted,fontSize:13 }}>Aucun traitement envoyé au DPO pour le moment.</p>
        </Card>
      )}
      {!loading && !error && filtered.length > 0 && (
        filterSession !== "all" ? (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14 }}>
            {filtered.map(t => <TraitementCard key={t.idTraitement} t={t} sessionInfo={getSessionInfo(t)} hasDeclared={hasDeclared} getDeclOf={getDeclOf} setShowDecl={setShowDecl} setDeclPrefill={setDeclPrefill} setShowDonnees={setShowDonnees}/>)}
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
            {sessionIds.map(sessId => {
              const sessTraitements = filtered.filter(t => t.sessionCollecteId===sessId);
              const sessInfo = getSessionInfo(sessTraitements[0]);
              return (
                <div key={sessId||"no-session"}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12,padding:"10px 14px",background:T.grayBg,border:`1px solid ${T.cardBorder}`,borderRadius:10 }}>
                    <FolderOpen size={15} color={T.textSecondary}/>
                    <span style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>
                      {sessId ? `Session #${sessId}${sessInfo?.lieu ? ` — ${sessInfo.lieu}` : ""}` : "Sans session"}
                    </span>
                    {sessInfo?.statut && <Badge type={sessInfo.statut}/>}
                    <span style={{ fontSize:11,color:T.textMuted,marginLeft:"auto" }}>{sessTraitements.length} traitement(s)</span>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14 }}>
                    {sessTraitements.map(t => <TraitementCard key={t.idTraitement} t={t} sessionInfo={sessInfo} hasDeclared={hasDeclared} getDeclOf={getDeclOf} setShowDecl={setShowDecl} setDeclPrefill={setDeclPrefill} setShowDonnees={setShowDonnees}/>)}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      {!loading && !error && filtered.length===0 && traitements.length>0 && (
        <Card style={{ padding:40,textAlign:"center" }}><p style={{ color:T.textMuted,fontSize:13 }}>Aucun résultat pour ce filtre.</p></Card>
      )}
    </div>
  );
};

const TraitementCard = ({ t, sessionInfo, hasDeclared, getDeclOf, setShowDecl, setDeclPrefill, setShowDonnees }) => {
  const declared = hasDeclared(t.idTraitement);
  const decl = getDeclOf(t.idTraitement);
  return (
    <Card style={{ padding:20 }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:T.blueBg,border:`1px solid ${T.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Cpu size={18} color={T.blue} strokeWidth={1.5}/></div>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:T.textPrimary }}>{t.nom||t.description||`Traitement #${t.idTraitement}`}</div>
            <div style={{ fontSize:11,color:T.textMuted,fontFamily:"'DM Mono',monospace" }}>#{t.idTraitement}</div>
          </div>
        </div>
        <Badge type={t.statut}/>
      </div>
      {t.description && <p style={{ fontSize:12,color:T.textSecondary,marginBottom:10,lineHeight:1.55 }}>{t.description}</p>}
      {sessionInfo && (
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10,padding:"6px 10px",background:T.grayBg,borderRadius:7,fontSize:11,color:T.textMuted }}>
          <FolderOpen size={11}/>
          <span>Session #{sessionInfo.id} — {sessionInfo.lieu}</span>
          <Badge type={sessionInfo.statut}/>
        </div>
      )}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10 }}>
        {[
          { label:"Entrées",      value:t.nombreDonnee??0,                    mono:true },
          { label:"Conservation", value:`${t.dureeConservation||"—"} ans`,    mono:false },
          { label:"Département",  value:t.department||"—",                    mono:false },
        ].map((it,i) => (
          <div key={i} style={{ padding:"8px 10px",background:T.grayBg,borderRadius:8,textAlign:"center" }}>
            <div style={{ fontSize:it.mono?16:12,fontWeight:700,color:T.textPrimary,fontFamily:it.mono?"'DM Mono',monospace":"inherit" }}>{it.value}</div>
            <div style={{ fontSize:10,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.06em" }}>{it.label}</div>
          </div>
        ))}
      </div>
      {t.envoyeAuDpo && <div style={{ fontSize:11,color:T.green,marginBottom:8,display:"flex",alignItems:"center",gap:4 }}><CheckCircle2 size={11}/> Envoyé au DPO le {t.dateEnvoiDpo?.split("T")[0]}</div>}
      <div style={{ display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${T.cardBorder}`,paddingTop:10,flexWrap:"wrap" }}>
        {declared && decl && <Badge type={decl.statut}/>}
        <div style={{ flex:1 }}/>
        <Btn onClick={() => setShowDonnees(t)} style={{ fontSize:11,padding:"5px 10px" }}><Database size={12}/> Données</Btn>
        {!declared ? (
          <Btn variant="primary" onClick={() => { setShowDecl(t); setDeclPrefill(null); }} style={{ fontSize:11,padding:"5px 12px" }}><Send size={12}/> Déclarer</Btn>
        ) : (
          <>
            <span style={{ fontSize:11,color:T.green,display:"flex",alignItems:"center",gap:4 }}><CheckCircle2 size={11}/> Déclaré</span>
            <Btn onClick={() => { setShowDecl(t); setDeclPrefill(decl); }} style={{ fontSize:11,padding:"4px 10px" }}><Plus size={11}/> Nouvelle décl.</Btn>
          </>
        )}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DÉCLARATIONS — manuelles uniquement
//  Filtres : En attente DG | Approuvées DG | Rejetées DG
//  + Modifier / Corriger et renvoyer une déclaration rejetée
// ═══════════════════════════════════════════════════════
const SectionDeclarations = ({ declarations, setDeclarations, dpoInfo }) => {
  const [filter,      setFilter]      = useState("all");
  const [loading,     setLoading]     = useState(true);
  const [exportingId, setExportingId] = useState(null);
  const [editTarget,  setEditTarget]  = useState(null);   // { declaration, traitement }
  const [loadingEditId, setLoadingEditId] = useState(null);

  const load = useCallback(async () => {
    if (!dpoInfo?.id) return;
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/declarations/mes-declarations?dpoId=${dpoInfo.id}`, { headers:authH() });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.message||`Erreur ${r.status}`); }
      const all = await r.json();
      // Le backend filtre déjà sur origineDeclaration === MANUELLE, mais on
      // applique le filtre côté front aussi par sécurité (défense en profondeur).
      setDeclarations(all.filter(estDeclarationManuelle));
    } catch(e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [dpoInfo?.id, setDeclarations]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter==="all" ? declarations : declarations.filter(d =>
    filter==="APPROUVEE" ? (d.statut?.includes("APPROUVEE")||d.statut==="VALIDEE_CIL") :
    filter==="REJETEE"   ? d.statut?.includes("REJETEE") :
    d.statut===filter
  );

  const handleExport = async (decl) => {
    setExportingId(decl.idDeclaration);
    let trait = null;
    if (decl.traitementId) {
      try {
        const r = await fetch(`${BASE}/traitements/${decl.traitementId}`, { headers:authH() });
        if (r.ok) trait = await r.json();
      } catch {}
    }
    exportDeclarationPDF(decl, trait);
    setExportingId(null);
  };

  // Ouvre la modale d'édition : récupère le traitement lié pour le contexte
  // d'affichage (nom, durée de conservation…) puis ouvre ModalDeclaration en mode "edit".
  const handleEdit = async (decl) => {
    setLoadingEditId(decl.idDeclaration);
    let trait = null;
    if (decl.traitementId) {
      try {
        const r = await fetch(`${BASE}/traitements/${decl.traitementId}`, { headers:authH() });
        if (r.ok) trait = await r.json();
      } catch {}
    }
    setLoadingEditId(null);
    setEditTarget({ declaration: decl, traitement: trait });
  };

  const handleEditSaved = (updated) => {
    setDeclarations(prev => prev.map(d => d.idDeclaration===updated.idDeclaration ? updated : d));
  };

  const statIcon = (statut) => {
    if (statut?.includes("APPROUVEE")||statut==="VALIDEE_CIL") return <CheckCircle2 size={16} color={T.green}/>;
    if (statut?.includes("REJETEE")) return <XCircle size={16} color={T.red}/>;
    if (statut==="EN_VERIFICATION_CIL") return <Shield size={16} color={T.purple}/>;
    return <Clock size={16} color={T.yellow}/>;
  };

  // 3 compteurs uniquement (CIL retiré)
  const stats = [
    { label:"En attente DG", value:declarations.filter(d=>d.statut==="EN_ATTENTE"||d.statut==="EN_ATTENTE_DG").length, color:T.yellow, id:"EN_ATTENTE" },
    { label:"Approuvées DG", value:declarations.filter(d=>d.statut==="APPROUVEE_DG"||d.statut==="APPROUVEE").length,   color:T.green,  id:"APPROUVEE" },
    { label:"Rejetées",      value:declarations.filter(d=>d.statut?.includes("REJETEE")).length,                       color:T.red,    id:"REJETEE" },
  ];

  return (
    <div className="slide-in">
      {editTarget && (
        <ModalDeclaration
          traitement={editTarget.traitement}
          declaration={editTarget.declaration}
          mode="edit"
          onClose={() => setEditTarget(null)}
          onSave={handleEditSaved}
          dpoId={dpoInfo?.id}
        />
      )}

      <PageHeader title="Mes déclarations" subtitle={`${declarations.length} déclaration(s) manuelle(s) soumises`}>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.textSecondary,padding:"7px 12px",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none" }}>
          <option value="all">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente DG</option>
          <option value="APPROUVEE">Approuvées DG</option>
          <option value="REJETEE">Rejetées</option>
        </select>
        <Btn variant="outline" onClick={load}><RefreshCw size={13}/> Rafraîchir</Btn>
      </PageHeader>

      {/* 3 compteurs workflow */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
        {stats.map(s => (
          <Card key={s.id} style={{ padding:"14px 18px",cursor:"pointer",border:filter===s.id?`2px solid ${s.color}`:`1px solid ${T.cardBorder}` }} onClick={() => setFilter(filter===s.id?"all":s.id)}>
            <div style={{ fontSize:24,fontWeight:800,color:s.color,fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
            <div style={{ fontSize:11,color:T.textMuted,marginTop:4,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {loading && <Card style={{ padding:40,textAlign:"center" }}><div style={{ color:T.textMuted,fontSize:13 }}>Chargement…</div></Card>}
      {!loading && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {filtered.map(d => (
            <Card key={d.idDeclaration} style={{ padding:0,overflow:"hidden" }}>
              <div style={{ display:"flex",alignItems:"stretch" }}>
                <div style={{ width:4,background:d.statut?.includes("APPROUVEE")||d.statut==="VALIDEE_CIL"?T.green:d.statut?.includes("REJETEE")?T.red:d.statut==="EN_VERIFICATION_CIL"?T.purple:T.yellow,flexShrink:0 }}/>
                <div style={{ flex:1,padding:"16px 20px" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap" }}>
                        <div style={{ width:32,height:32,borderRadius:8,background:d.statut?.includes("APPROUVEE")||d.statut==="VALIDEE_CIL"?T.greenBg:d.statut?.includes("REJETEE")?T.redBg:T.yellowBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{statIcon(d.statut)}</div>
                        <span style={{ fontSize:14,fontWeight:700,color:T.textPrimary }}>Déclaration #{d.idDeclaration}</span>
                        <Badge type={d.statut}/>
                        {d.typeDeclaration && <Badge type={d.typeDeclaration}/>}
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8 }}>
                        {[
                          { label:"Date de soumission", value:d.dateSoumission||"—" },
                          { label:"DPO",                value:d.dpoNomPrenom||"—" },
                          { label:"Traitement",         value:d.traitementId?`#${d.traitementId}`:"—" },
                        ].map((it,i) => (
                          <div key={i} style={{ fontSize:12 }}>
                            <div style={{ color:T.textMuted,marginBottom:2 }}>{it.label}</div>
                            <div style={{ fontWeight:600,color:T.textSecondary }}>{it.value}</div>
                          </div>
                        ))}
                      </div>
                      {d.responsableDeclaration && <div style={{ fontSize:12,color:T.textMuted }}>Responsable : {d.responsableDeclaration}{d.fonctionResponsable?` · ${d.fonctionResponsable}`:""}</div>}
                      {estRejetee(d.statut) && (
                        <div style={{ marginTop:8,padding:"7px 10px",background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:7,fontSize:11,color:T.red,display:"flex",alignItems:"center",gap:6 }}>
                          <AlertCircle size={12}/> Rejetée — cliquez sur « Corriger et renvoyer » pour la soumettre à nouveau.
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex",gap:6,marginLeft:16,flexShrink:0 }}>
                      {estModifiable(d.statut) && (
                        <Btn
                          variant={estRejetee(d.statut) ? "warning" : "outline"}
                          onClick={() => handleEdit(d)}
                          disabled={loadingEditId===d.idDeclaration}
                          style={{ fontSize:11,padding:"5px 10px" }}
                        >
                          {loadingEditId===d.idDeclaration
                            ? <><Spinner color={T.yellow} size={11}/> …</>
                            : estRejetee(d.statut)
                              ? <><Send size={12}/> Corriger et renvoyer</>
                              : <><Pencil size={12}/> Modifier</>
                          }
                        </Btn>
                      )}
                      <Btn onClick={() => handleExport(d)} disabled={exportingId===d.idDeclaration} style={{ fontSize:11,padding:"5px 10px" }}>
                        {exportingId===d.idDeclaration?<><Spinner color={T.textSecondary} size={11}/> Export…</>:<><Download size={12}/> PDF</>}
                      </Btn>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length===0 && <Card style={{ padding:40,textAlign:"center" }}><p style={{ color:T.textMuted,fontSize:13,fontStyle:"italic" }}>Aucune déclaration pour ce filtre.</p></Card>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : RAPPORTS & EXPORT — boutons colorés
// ═══════════════════════════════════════════════════════
const SectionRapports = ({ sessions, declarations, dpoInfo }) => {
  const [loading, setLoading] = useState({});
  const setLoad = (k,v) => setLoading(l => ({...l,[k]:v}));

  const declsManuelles = declarations.filter(estDeclarationManuelle);

  const exportCSV = (filename, headers, rows) => {
    const content = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF"+content], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  const rapportSessions = async () => {
    setLoad("sessions",true);
    await new Promise(r=>setTimeout(r,400));
    exportCSV(`sessions_dpo_${new Date().toISOString().slice(0,10)}.csv`,
      ["ID","Nom","Lieu","Type","Statut","Date début","Date fin","Traitements","DPO"],
      sessions.map(s => `${s.idSession},"${s.nomSession||""}","${s.lieu}","${s.typeCollecte}","${s.statutSession}","${s.dateDebut?.split("T")[0]||""}","${s.dateFin?.split("T")[0]||""}",${s.nombreTraitements},"${s.dpoNomComplet||""}"`)
    );
    setLoad("sessions",false);
    toast.success("Export sessions généré");
  };

  const rapportDeclarations = async () => {
    setLoad("declarations",true);
    await new Promise(r=>setTimeout(r,400));
    exportCSV(`declarations_manuelles_${new Date().toISOString().slice(0,10)}.csv`,
      ["ID","Type","Statut","Date soumission","DPO","Responsable","Traitement ID"],
      declsManuelles.map(d => `${d.idDeclaration},"${d.typeDeclaration||""}","${d.statut||""}","${d.dateSoumission||""}","${d.dpoNomPrenom||""}","${d.responsableDeclaration||""}",${d.traitementId||""}`)
    );
    setLoad("declarations",false);
    toast.success("Export déclarations généré");
  };

  const rapportTraitements = async () => {
    setLoad("traitements",true);
    try {
      const r = await fetch(`${BASE}/traitements`, { headers:authH() });
      const traitements = r.ok ? await r.json() : [];
      const envoyesDpo = traitements.filter(t => t.envoyeAuDpo);
      exportCSV(`traitements_dpo_${new Date().toISOString().slice(0,10)}.csv`,
        ["Traitement ID","Nom","Département","Conservation","Statut","Session ID","Date envoi DPO","Utilisateur Métier"],
        envoyesDpo.map(t => `${t.idTraitement},"${t.nom||t.description||""}","${t.department||""}",${t.dureeConservation||""},"${t.statut||""}",${t.sessionCollecteId||""},"${t.dateEnvoiDpo?.split("T")[0]||""}","${t.utilisateurMetierNom||""}"`)
      );
      toast.success(`${envoyesDpo.length} traitement(s) exporté(s)`);
    } catch { toast.error("Erreur lors du rapport traitements"); }
    finally { setLoad("traitements",false); }
  };

  const rapportPDFTous = async () => {
    if (declsManuelles.length===0) { toast.error("Aucune déclaration manuelle à exporter"); return; }
    setLoad("pdfTous",true);
    await new Promise(r=>setTimeout(r,300));
    exportDeclarationPDF(declsManuelles[0], null);
    setLoad("pdfTous",false);
    toast.success(`PDF généré pour la déclaration #${declsManuelles[0].idDeclaration}`);
  };

  const statsCards = [
    { label:"Sessions",         value:sessions.length,                                           color:T.blue,   bg:T.blueBg },
    { label:"Sessions actives", value:sessions.filter(s=>s.statutSession==="EN_COURS").length,   color:T.green,  bg:T.greenBg },
    { label:"Déclarations",     value:declsManuelles.length,                                     color:T.purple, bg:T.purpleBg },
    { label:"En attente DG",    value:declsManuelles.filter(d=>d.statut==="EN_ATTENTE"||d.statut==="EN_ATTENTE_DG").length, color:T.yellow, bg:T.yellowBg },
  ];

  // Boutons colorés selon le type d'export (plus de noir)
  const exportCards = [
    { key:"sessions",     title:"Sessions",          desc:"Toutes les sessions avec statuts, lieux et nombre de traitements associés.",          Icon:FolderOpen, color:T.blue,   bg:T.blueBg,   btnColor:T.blue,   action:rapportSessions,    label:"Export CSV" },
    { key:"declarations", title:"Déclarations",      desc:"Déclarations manuelles soumises par le DPO avec type, statut et date de soumission.", Icon:FileText,   color:T.green,  bg:T.greenBg,  btnColor:T.green,  action:rapportDeclarations, label:"Export CSV" },
    { key:"traitements",  title:"Traitements reçus", desc:"Tous les traitements envoyés au DPO, leur session d'origine et leur statut.",         Icon:Cpu,        color:T.purple, bg:T.purpleBg, btnColor:T.purple, action:rapportTraitements,  label:"Export CSV" },
    { key:"pdfTous",      title:"PDF Déclaration",   desc:"Exporte la dernière déclaration manuelle en PDF complet avec toutes les sections.",   Icon:Download,   color:T.gold,   bg:T.goldLight,btnColor:T.gold,   action:rapportPDFTous,     label:"Export PDF" },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Rapports & Export" subtitle="Exportez vos données en CSV ou générez des PDF complets"/>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:20 }}>
        {statsCards.map((s,i) => (
          <Card key={i} style={{ padding:"16px 18px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:s.color,borderRadius:"12px 12px 0 0" }}/>
            <div style={{ width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10 }}>
              <Activity size={16} color={s.color} strokeWidth={1.8}/>
            </div>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:24,fontWeight:800,color:s.color,fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14,marginBottom:20 }}>
        {exportCards.map(c => (
          <Card key={c.key} className="card-hover" style={{ padding:22 }}>
            <div style={{ width:46,height:46,borderRadius:12,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",color:c.color,marginBottom:14 }}><c.Icon size={20} strokeWidth={1.6}/></div>
            <div style={{ fontSize:14,fontWeight:700,color:T.textPrimary,marginBottom:5 }}>{c.title}</div>
            <div style={{ fontSize:12,color:T.textSecondary,marginBottom:18,lineHeight:1.55 }}>{c.desc}</div>
            <button
              onClick={c.action}
              disabled={!!loading[c.key]}
              style={{ width:"100%",padding:"9px 16px",borderRadius:8,border:"none",background:c.btnColor,color:"#fff",fontSize:13,fontWeight:600,cursor:loading[c.key]?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading[c.key]?0.6:1,transition:"opacity 0.15s" }}
            >
              {loading[c.key]?<><Spinner/> Génération…</>:<><Download size={13}/> {c.label}</>}
            </button>
          </Card>
        ))}
      </div>

      {declsManuelles.length>0 && (
        <Card style={{ padding:0,overflow:"hidden" }}>
          <SectionTitle icon={FileText} color={T.purple} label="Export PDF individuel par déclaration"/>
          <div style={{ padding:"12px 0" }}>
            {declsManuelles.slice(0,10).map((d,i) => (
              <div key={d.idDeclaration} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 20px",borderBottom:i<Math.min(declsManuelles.length,10)-1?`1px solid ${T.grayBg}`:"none" }}>
                <FileText size={14} color={T.textMuted}/>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:13,fontWeight:600,color:T.textPrimary }}>Déclaration #{d.idDeclaration}</span>
                  <span style={{ fontSize:11,color:T.textMuted,marginLeft:8 }}>{d.typeDeclaration||"—"} · {d.dateSoumission||"—"}</span>
                </div>
                <Badge type={d.statut}/>
                <Btn onClick={() => exportDeclarationPDF(d,null)} style={{ fontSize:11,padding:"4px 12px" }}><Download size={11}/> PDF</Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      {declsManuelles.length===0 && (
        <Card style={{ padding:40,textAlign:"center" }}>
          <FileText size={36} color={T.textMuted} style={{ margin:"0 auto 12px",display:"block",opacity:0.3 }}/>
          <p style={{ color:T.textMuted,fontSize:13 }}>Aucune déclaration manuelle à exporter pour le moment.</p>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════
export default function Tb_Dpo() {
  const [section,      setSection]      = useState("dashboard");
  const [collapsed,    setCollapsed]    = useState(false);
  const [sessions,     setSessions]     = useState([]);
  const [declarations, setDeclarations] = useState([]);
  const [notifCount,   setNotifCount]   = useState(0);

  const [dpoInfo, setDpoInfo] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return { nom:"DPO",prenom:"",id:null };
    const p = parseJwt(token);
    return { nom:localStorage.getItem("dpoNom")||p.nom||"DPO", prenom:localStorage.getItem("dpoPrenom")||p.prenom||"", id:p.userId||null };
  });

  useEffect(() => {
    if (!dpoInfo.id) return;
    const fetchCount = async () => {
      try {
        const r = await fetch(`${BASE}/notifications/${dpoInfo.id}/non-lues`, { headers:authH() });
        if (!r.ok) return;
        const data = await r.json();
        setNotifCount(data.length);
      } catch {}
    };
    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => clearInterval(iv);
  }, [dpoInfo.id]);

  const declEnAttente = declarations.filter(d =>
    (d.statut==="EN_ATTENTE" || d.statut==="EN_ATTENTE_DG") && estDeclarationManuelle(d)
  ).length;

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Instrument Sans','DM Sans',system-ui,sans-serif",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#E4E8EE;border-radius:4px;}
        .slide-in{animation:slideIn 0.22s ease;}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dpo-card{transition:box-shadow 0.18s,border-color 0.18s,transform 0.18s;}
        .card-hover:hover{box-shadow:0 6px 20px rgba(0,0,0,0.09)!important;transform:translateY(-1px);}
        .nav-item:hover{background:rgba(255,255,255,0.05)!important;color:#E2E8F0!important;}
        .logout-btn:hover{background:rgba(239,68,68,0.1)!important;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <TopBar onToggle={() => setCollapsed(c=>!c)} userId={dpoInfo.id} notifCount={notifCount} setNotifCount={setNotifCount} dpoInfo={dpoInfo}/>

      <div style={{ display:"flex",flex:1,overflow:"hidden" }}>
        <Sidebar active={section} setActive={setSection} collapsed={collapsed} dpoInfo={dpoInfo} declEnAttente={declEnAttente}/>
        <main style={{ flex:1,overflow:"auto",padding:"24px 28px",background:T.mainBg }}>
          {section==="dashboard"    && <SectionDashboard   sessions={sessions} declarations={declarations} setSection={setSection} dpoInfo={dpoInfo}/>}
          {section==="sessions"     && <SectionSessions    sessions={sessions} setSessions={setSessions} setSection={setSection} setSelectedSession={() => {}}/>}
          {section==="traitements"  && <SectionTraitements declarations={declarations} setDeclarations={setDeclarations} sessions={sessions} dpoInfo={dpoInfo}/>}
          {section==="declarations" && <SectionDeclarations declarations={declarations} setDeclarations={setDeclarations} dpoInfo={dpoInfo}/>}
          {section==="rapports"     && <SectionRapports    sessions={sessions} declarations={declarations} dpoInfo={dpoInfo}/>}
        </main>
      </div>
    </div>
  );
}