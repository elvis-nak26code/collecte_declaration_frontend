import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
import {
  FolderOpen, FileText, Database, Bell, LogOut, Menu,
  Plus, Eye, Check, X, ChevronLeft, Clock, CheckCircle2,
  XCircle, AlertCircle, Shield, Activity, BarChart3,
  Calendar, MapPin, Cpu, Lock, Unlock, Globe, Layers,
  ArrowUpRight, FilePlus, Send, Edit3, StopCircle,
  ChevronDown, Info, Clipboard, Users, Video,
  TrendingUp, RefreshCw, Loader2
} from "lucide-react";

// ═══════════════════════════════════════════════════════
//  THÈME
// ═══════════════════════════════════════════════════════
const T = {
  sidebarBg: "#0D1F12", sidebarBorder: "#1A3320",
  sidebarText: "#7A9E8A",
  mainBg: "#F4F6F9", cardBg: "#FFFFFF",
  cardBorder: "#E4E8EE", cardShadow: "0 1px 3px rgba(0,0,0,0.06)",
  textPrimary: "#0F1923", textSecondary: "#4A5568", textMuted: "#9AA5B4",
  gold: "#B8860B", goldLight: "#FEF7E6", goldBorder: "#E6B84A",
  green: "#16A34A", greenBg: "#F0FDF4", greenBorder: "#BBF7D0",
  red: "#DC2626", redBg: "#FEF2F2", redBorder: "#FECACA",
  yellow: "#D97706", yellowBg: "#FFFBEB", yellowBorder: "#FDE68A",
  blue: "#2563EB", blueBg: "#EFF6FF", blueBorder: "#BFDBFE",
  purple: "#7C3AED", purpleBg: "#F5F3FF", purpleBorder: "#DDD6FE",
  teal: "#0891B2", tealBg: "#ECFEFF", tealBorder: "#A5F3FC",
  gray: "#374151", grayBg: "#F9FAFB", grayBorder: "#E5E7EB",
  navAccentBg: "rgba(52,168,103,0.12)", navAccentBorder: "rgba(52,168,103,0.3)",
};

// ═══════════════════════════════════════════════════════
//  DONNÉES INITIALES
// ═══════════════════════════════════════════════════════
const DPO_USER = { name: "Aminata Traoré", role: "Délégué à la Protection des Données", initials: "AT", organisme: "SOFITEX", email: "a.traore@sofitex.bf" };

const INIT_SESSIONS = [
  { id: "SC-2025-001", titre: "Collecte Agents Terrain – Bobo", lieu: "Bobo-Dioulasso", typeCollecte: "TERRAIN", statut: "EN_COURS", dateDebut: "2025-05-01", dateFin: "2025-05-31", description: "Collecte terrain des agents de la région Hauts-Bassins", responsable: "Kofi Ouédraogo", nbTraitements: 3 },
  { id: "SC-2025-002", titre: "Recensement Personnel Banfora", lieu: "Banfora", typeCollecte: "EN_LIGNE", statut: "TERMINEE", dateDebut: "2025-04-10", dateFin: "2025-04-25", description: "Recensement en ligne du personnel de Banfora", responsable: "Mariam Nikiema", nbTraitements: 5 },
  { id: "SC-2025-003", titre: "Données Fournisseurs Ouaga", lieu: "Ouagadougou", typeCollecte: "EN_LIGNE", statut: "EN_COURS", dateDebut: "2025-05-12", dateFin: "2025-06-12", description: "Collecte des coordonnées fournisseurs", responsable: "Seydou Barro", nbTraitements: 2 },
  { id: "SC-2025-004", titre: "Audit RH Koudougou", lieu: "Koudougou", typeCollecte: "TERRAIN", statut: "ANNULEE", dateDebut: "2025-03-01", dateFin: "2025-03-15", description: "Audit RH annulé faute de ressources", responsable: "Fatou Compaoré", nbTraitements: 0 },
];

const INIT_TRAITEMENTS = [
  { id: "TR-001", sessionId: "SC-2025-001", nom: "Identification agents", description: "Collecte des données d'identification des agents terrain", typeDonnee: "Données d'identité", statut: "EN_COURS", nbDonnees: 142, dateCreation: "2025-05-02", sensible: false, finalite: "Gestion RH", dureeConservation: 5, department: "RH" },
  { id: "TR-002", sessionId: "SC-2025-001", nom: "Coordonnées GPS terrain", description: "Géolocalisation des points de collecte", typeDonnee: "Données de localisation", statut: "TERMINEE", nbDonnees: 98, dateCreation: "2025-05-03", sensible: false, finalite: "Logistique", dureeConservation: 3, department: "Logistique" },
  { id: "TR-003", sessionId: "SC-2025-001", nom: "Données santé agents", description: "Suivi médical obligatoire des agents", typeDonnee: "Données de santé", statut: "EN_COURS", nbDonnees: 56, dateCreation: "2025-05-05", sensible: true, finalite: "Santé au travail", dureeConservation: 10, department: "Médical" },
  { id: "TR-004", sessionId: "SC-2025-002", nom: "Données civiles personnel", description: "État civil complet", typeDonnee: "Données d'identité", statut: "TERMINEE", nbDonnees: 310, dateCreation: "2025-04-11", sensible: false, finalite: "Administration", dureeConservation: 5, department: "RH" },
  { id: "TR-005", sessionId: "SC-2025-002", nom: "Informations contractuelles", description: "Contrats et avenants de travail", typeDonnee: "Données professionnelles", statut: "TERMINEE", nbDonnees: 280, dateCreation: "2025-04-12", sensible: false, finalite: "Gestion contrats", dureeConservation: 7, department: "Juridique" },
  { id: "TR-006", sessionId: "SC-2025-003", nom: "Coordonnées fournisseurs", description: "Contacts et adresses des fournisseurs", typeDonnee: "Données de contact", statut: "EN_COURS", nbDonnees: 74, dateCreation: "2025-05-13", sensible: false, finalite: "Relations fournisseurs", dureeConservation: 3, department: "Commercial" },
  { id: "TR-007", sessionId: "SC-2025-003", nom: "Données financières", description: "IBAN et coordonnées bancaires fournisseurs", typeDonnee: "Données financières", statut: "EN_COURS", nbDonnees: 33, dateCreation: "2025-05-14", sensible: true, finalite: "Paiements", dureeConservation: 10, department: "Finance" },
];

const INIT_DECLARATIONS = [
  { id: "DECL-2025-001", traitementId: "TR-001", nom: "Déclaration – Identification agents", type: "NORMAL", statut: "APPROUVEE", dateDepot: "2025-05-03", dateValidation: "2025-05-10", commentaireDG: "", finaliteTraitement: "Gestion RH", categoriesPersonnes: "Agents terrain", baseJuridique: "Contrat de travail" },
  { id: "DECL-2025-002", traitementId: "TR-003", nom: "Déclaration – Données santé agents", type: "NORMAL", statut: "EN_ATTENTE", dateDepot: "2025-05-06", dateValidation: null, commentaireDG: "", finaliteTraitement: "Santé au travail", categoriesPersonnes: "Agents terrain", baseJuridique: "Obligation légale" },
  { id: "DECL-2025-003", traitementId: "TR-007", nom: "Déclaration – Données financières", type: "NORMAL", statut: "REJETEE", dateDepot: "2025-05-15", dateValidation: "2025-05-18", commentaireDG: "Manque de précision sur la durée de conservation.", finaliteTraitement: "Paiements fournisseurs", categoriesPersonnes: "Fournisseurs", baseJuridique: "Contrat commercial" },
];

const INIT_NOTIFICATIONS = [
  { id: 1, type: "CONFIRMATION", titre: "Déclaration approuvée", contenu: "DECL-2025-001 a été validée par la DG", date: "2025-05-10", lu: false },
  { id: 2, type: "ALERTE", titre: "Déclaration rejetée", contenu: "DECL-2025-003 a été rejetée — voir commentaire", date: "2025-05-18", lu: false },
  { id: 3, type: "RAPPEL", titre: "Session bientôt terminée", contenu: "SC-2025-001 se termine le 31 mai 2025", date: "2025-05-25", lu: true },
];

// ═══════════════════════════════════════════════════════
//  ATOMIQUES
// ═══════════════════════════════════════════════════════
const Avatar = ({ initials, size = 36, bg = T.goldLight, color = T.gold, border = T.goldBorder }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.34, color, flexShrink: 0, letterSpacing: "0.03em", fontFamily: "DM Mono, monospace" }}>{initials}</div>
);

const Card = ({ children, style = {}, className = "" }) => (
  <div className={`dpo-card ${className}`} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 12, boxShadow: T.cardShadow, ...style }}>{children}</div>
);

const Badge = ({ type }) => {
  const map = {
    EN_COURS:    { bg: T.blueBg,   color: T.blue,   border: T.blueBorder,   label: "En cours" },
    TERMINEE:    { bg: T.greenBg,  color: T.green,  border: T.greenBorder,  label: "Terminée" },
    ANNULEE:     { bg: T.grayBg,   color: T.gray,   border: T.grayBorder,   label: "Annulée" },
    EN_ATTENTE:  { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "En attente" },
    APPROUVEE:   { bg: T.greenBg,  color: T.green,  border: T.greenBorder,  label: "Approuvée" },
    REJETEE:     { bg: T.redBg,    color: T.red,    border: T.redBorder,    label: "Rejetée" },
    TERRAIN:     { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, label: "Terrain" },
    EN_LIGNE:    { bg: T.tealBg,   color: T.teal,   border: T.tealBorder,   label: "En ligne" },
    sensible:    { bg: T.redBg,    color: T.red,    border: T.redBorder,    label: "Sensible" },
    standard:    { bg: T.greenBg,  color: T.green,  border: T.greenBorder,  label: "Standard" },
    NORMAL:      { bg: T.blueBg,   color: T.blue,   border: T.blueBorder,   label: "Normale" },
    CONFIRMATION:{ bg: T.greenBg,  color: T.green,  border: T.greenBorder,  label: "Confirmée" },
    ALERTE:      { bg: T.redBg,    color: T.red,    border: T.redBorder,    label: "Alerte" },
    RAPPEL:      { bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, label: "Rappel" },
  };
  const s = map[type] || map.EN_ATTENTE;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 3, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ fontSize: 13, color: T.textMuted }}>{subtitle}</p>
    </div>
    {children && <div style={{ display: "flex", gap: 8 }}>{children}</div>}
  </div>
);

const Btn = ({ children, onClick, variant = "outline", style = {}, disabled = false }) => {
  const base = { borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, border: "none", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", fontFamily: "inherit", ...style };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "#0D1F12", color: "#fff" }}>{children}</button>;
  if (variant === "danger")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` }}>{children}</button>;
  if (variant === "success") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` }}>{children}</button>;
  if (variant === "warning") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.yellowBg, color: T.yellow, border: `1px solid ${T.yellowBorder}` }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: T.textSecondary, border: `1px solid ${T.cardBorder}` }}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder, required, as }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.03em" }}>{label}{required && <span style={{ color: T.red }}> *</span>}</label>}
    {as === "textarea"
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
          style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 }} />
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
    }
  </div>
);

const Sel = ({ label, value, onChange, children, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.03em" }}>{label}{required && <span style={{ color: T.red }}> *</span>}</label>}
    <select value={value} onChange={onChange} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, fontFamily: "inherit", outline: "none" }}>{children}</select>
  </div>
);

const Spinner = () => <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />;

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, collapsed, notifCount }) => {
    const [Deconnexion,setDeconnextion] = useState(false);
    const navigate = useNavigate();
  const nav = [
    { id: "dashboard",    label: "Tableau de bord",    Icon: BarChart3 },
    { id: "sessions",     label: "Sessions de collecte", Icon: FolderOpen },
    { id: "traitements",  label: "Traitements",         Icon: Cpu },
    { id: "declarations", label: "Déclarations",        Icon: FileText, badge: INIT_DECLARATIONS.filter(d => d.statut === "EN_ATTENTE").length },
    { id: "notifications",label: "Notifications",       Icon: Bell, badge: notifCount },
  ];
  return (
    <aside style={{ width: collapsed ? 64 : 230, flexShrink: 0, background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={DPO_USER.initials} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{DPO_USER.name}</div>
              <div style={{ fontSize: 10, color: T.sidebarText, marginTop: 1 }}>DPO — {DPO_USER.organisme}</div>
            </div>
          </div>
        </div>
      )}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {!collapsed && <div style={{ fontSize: 9, fontWeight: 700, color: T.sidebarText, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 8px 10px" }}>Navigation</div>}
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)}
              style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, padding: collapsed ? "11px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 8, color: isActive ? "#FFFFFF" : T.sidebarText, background: isActive ? "rgba(52,168,103,0.15)" : "transparent", fontWeight: isActive ? 600 : 400, fontSize: 13, cursor: "pointer", position: "relative", marginBottom: 2, transition: "all 0.15s ease" }}
              className="nav-item">
              {isActive && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#4ADE80", borderRadius: "0 2px 2px 0" }} />}
              <item.Icon size={16} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge > 0 && <span style={{ background: T.red, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{item.badge}</span>}
              {collapsed && item.badge > 0 && <span style={{ position: "absolute", top: 6, right: 8, width: 7, height: 7, background: T.red, borderRadius: "50%" }} />}
            </div>
          );
        })}
      </nav>
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
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  TOPBAR
// ═══════════════════════════════════════════════════════
const TopBar = ({ onToggle, notifCount, setActive }) => (
  <header style={{ height: 56, background: T.sidebarBg, borderBottom: `1px solid ${T.sidebarBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={onToggle} style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
        <Menu size={18} />
      </button>
      <div style={{ display: "inline-block" }}>
  <span style={{
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: "#F1F5F9",          // blanc cassé, lisible sur fond sombre
    lineHeight: 1,
    display: "block",
    borderBottom: "4px solid #1D9E75",
    paddingBottom: 5
  }}>
    SOFITEX — Espace DPO
  </span>
  
</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => setActive("notifications")} style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 7, borderRadius: 7, display: "flex", position: "relative" }}>
        <Bell size={17} />
        {notifCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 15, height: 15, background: T.red, color: "#fff", borderRadius: "50%", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifCount}</span>}
      </button>
      <div style={{ width: 1, height: 20, background: T.sidebarBorder }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.navAccentBg, border: `1px solid ${T.navAccentBorder}`, borderRadius: 8, padding: "5px 10px" }}>
        <Avatar initials={DPO_USER.initials} size={26} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>{DPO_USER.name.split(" ")[0]} {DPO_USER.name.split(" ")[1]?.[0]}.</div>
          <div style={{ fontSize: 10, color: T.sidebarText }}>DPO</div>
        </div>
      </div>
    </div>
  </header>
);

// ═══════════════════════════════════════════════════════
//  MODALE : CRÉER SESSION
// ═══════════════════════════════════════════════════════
const ModalCreerSession = ({ onClose, onSave }) => {
  const now = new Date();

  const toLocalDateValue = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const minDate = toLocalDateValue(now);

  const [f, setF] = useState({
    titre: "",
    lieu: "",
    typeCollecte: "EN_LIGNE",
    description: "",
    dateDebut: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.titre.trim() && f.lieu.trim();

  const handleSave = async () => {
    if (!valid) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        lieu: f.lieu,
        typeCollecte: f.typeCollecte,
        description: f.description,
        dateDebut: f.dateDebut
          ? new Date(f.dateDebut + "T00:00:00").toISOString()
          : new Date().toISOString(),
        dateFin: null,
      };

      const res = await fetch("http://localhost:8080/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erreur ${res.status}`);
      }

      const data = await res.json();

      onSave({
        id: String(data.id),
        titre: f.titre,
        lieu: data.lieu,
        typeCollecte: data.typeCollecte,
        statut: data.statut || "EN_COURS",
        dateDebut: data.dateDebut?.split("T")[0] ?? toLocalDateValue(now),
        dateFin: data.dateFin ?? "",
        description: data.description,
        responsable: "",
        nbTraitements: 0,
      });

      onClose();
      toast.success("Session créée avec succès !");
    } catch (e) {
      setError(e.message || "Erreur lors de la création de la session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 520, maxHeight: "90vh", overflowY: "auto", background: T.cardBg, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", border: `1px solid ${T.cardBorder}` }}>

        {/* Header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: T.cardBg, zIndex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.greenBg, border: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderOpen size={18} color={T.green} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Nouvelle session de collecte</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Si non renseignée, la date de début = date de création</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>
            <X size={16} />
          </button>
        </div>

        {/* Formulaire */}
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          <Input
            label="Titre de la session"
            value={f.titre}
            onChange={(e) => upd("titre", e.target.value)}
            placeholder="Ex: Collecte agents Bobo-Dioulasso"
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input
              label="Lieu"
              value={f.lieu}
              onChange={(e) => upd("lieu", e.target.value)}
              placeholder="Ex: Bobo-Dioulasso"
              required
            />
            <Sel
              label="Type de collecte"
              value={f.typeCollecte}
              onChange={(e) => upd("typeCollecte", e.target.value)}
            >
              <option value="EN_LIGNE">En ligne</option>
              <option value="TERRAIN">Terrain</option>
            </Sel>
          </div>

          {/* Champ date de début */}
          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>
              Date de début <span style={{ fontWeight: 400 }}>(optionnelle)</span>
            </div>
            <input
              type="date"
              min={minDate}
              value={f.dateDebut}
              onChange={(e) => upd("dateDebut", e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${T.cardBorder}`, borderRadius: 8, background: T.cardBg, color: T.textPrimary, fontFamily: "inherit" }}
            />
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              {f.dateDebut
                ? `Date sélectionnée : ${new Date(f.dateDebut + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`
                : "Laissez vide pour utiliser la date actuelle"}
            </div>
          </div>

          <Input
            label="Description"
            value={f.description}
            onChange={(e) => upd("description", e.target.value)}
            placeholder="Objectif et périmètre de la session"
            as="textarea"
          />

          {/* Info box */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 8, fontSize: 12, color: T.blue }}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span>
              {f.dateDebut
                ? <>Session programmée pour le <strong>{new Date(f.dateDebut + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</strong>.</>
                : <>Date de début : <strong>{now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</strong> — enregistrée automatiquement si non renseignée.</>}
            </span>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, color: T.red }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${T.cardBorder}` }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading || !valid}>
            {loading ? <><Spinner /> Enregistrement...</> : <><Plus size={13} /> Créer la session</>}
          </Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : CRÉER TRAITEMENT
// ═══════════════════════════════════════════════════════
const ModalCreerTraitement = ({ sessionId, onClose, onSave }) => {
  const [f, setF] = useState({ nom: "", description: "", typeDonnee: "", finalite: "", baseJuridique: "", dureeConservation: "", department: "", sensible: false });
  const [loading, setLoading] = useState(false);
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.nom.trim() && f.typeDonnee && f.finalite.trim() && f.baseJuridique;

  const handleSave = async () => {
    if (!valid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onSave({ ...f, id: "TR-" + Date.now(), sessionId, statut: "EN_COURS", nbDonnees: 0, dateCreation: new Date().toISOString().split("T")[0] });
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 560, maxHeight: "90vh", overflowY: "auto", background: T.cardBg, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", border: `1px solid ${T.cardBorder}` }}>
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: T.cardBg, zIndex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={18} color={T.blue} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Nouveau traitement</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Session {sessionId}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textMuted }}><X size={16} /></button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nom du traitement" value={f.nom} onChange={e => upd("nom", e.target.value)} placeholder="Ex: Identification des agents" required />
          <Input label="Description" value={f.description} onChange={e => upd("description", e.target.value)} placeholder="Objectif du traitement" as="textarea" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Sel label="Type de données" value={f.typeDonnee} onChange={e => upd("typeDonnee", e.target.value)} required>
              <option value="">Sélectionner…</option>
              <option>Données d'identité</option>
              <option>Données de contact</option>
              <option>Données de santé</option>
              <option>Données financières</option>
              <option>Données professionnelles</option>
              <option>Données de localisation</option>
              <option>Données biométriques</option>
            </Sel>
            <Sel label="Base juridique" value={f.baseJuridique} onChange={e => upd("baseJuridique", e.target.value)} required>
              <option value="">Sélectionner…</option>
              <option value="Contrat de travail">Contrat de travail</option>
              <option value="Obligation légale">Obligation légale</option>
              <option value="Intérêt légitime">Intérêt légitime</option>
              <option value="Consentement">Consentement</option>
              <option value="Contrat commercial">Contrat commercial</option>
            </Sel>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Finalité du traitement" value={f.finalite} onChange={e => upd("finalite", e.target.value)} placeholder="Ex: Gestion RH" required />
            <Input label="Durée de conservation (ans)" type="number" value={f.dureeConservation} onChange={e => upd("dureeConservation", e.target.value)} placeholder="Ex: 5" />
          </div>
          <Input label="Département responsable" value={f.department} onChange={e => upd("department", e.target.value)} placeholder="Ex: Ressources Humaines" />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, cursor: "pointer" }} onClick={() => upd("sensible", !f.sensible)}>
            <input type="checkbox" checked={f.sensible} onChange={() => upd("sensible", !f.sensible)} style={{ cursor: "pointer" }} />
            <label style={{ fontSize: 13, color: T.red, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Lock size={13} /> Ce traitement implique des données sensibles
            </label>
          </div>
        </div>
        <div style={{ padding: "14px 22px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${T.cardBorder}` }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading || !valid}>
            {loading ? <><Spinner /> Création...</> : <><Plus size={13} /> Créer le traitement</>}
          </Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : DÉCLARER TRAITEMENT
// ═══════════════════════════════════════════════════════
const ModalDeclarer = ({ traitement, onClose, onSave }) => {
  const [f, setF] = useState({ type: "NORMAL", categoriesPersonnes: "", destinataires: "", mesuresSecurite: "", transfertPays: false, paysDestination: "", commentaire: "" });
  const [loading, setLoading] = useState(false);
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onSave({
      id: "DECL-" + Date.now(),
      traitementId: traitement.id,
      nom: `Déclaration – ${traitement.nom}`,
      type: f.type,
      statut: "EN_ATTENTE",
      dateDepot: new Date().toISOString().split("T")[0],
      dateValidation: null,
      commentaireDG: "",
      finaliteTraitement: traitement.finalite,
      categoriesPersonnes: f.categoriesPersonnes,
      baseJuridique: traitement.baseJuridique,
    });
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 580, maxHeight: "90vh", overflowY: "auto", background: T.cardBg, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", border: `1px solid ${T.cardBorder}` }}>
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: T.cardBg, zIndex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.purpleBg, border: `1px solid ${T.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={18} color={T.purple} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Déposer une déclaration</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Traitement : {traitement.nom}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textMuted }}><X size={16} /></button>
        </div>

        {/* Récapitulatif traitement */}
        <div style={{ margin: "16px 22px 0", padding: "12px 16px", background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Récapitulatif du traitement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: T.textSecondary }}>
            <span><strong>Type de données :</strong> {traitement.typeDonnee}</span>
            <span><strong>Finalité :</strong> {traitement.finalite}</span>
            <span><strong>Base juridique :</strong> {traitement.baseJuridique}</span>
            <span><strong>Conservation :</strong> {traitement.dureeConservation} ans</span>
          </div>
        </div>

        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Sel label="Type de déclaration" value={f.type} onChange={e => upd("type", e.target.value)} required>
            <option value="NORMAL">Déclaration normale</option>
            <option value="SITE_INTERNET">Collecte via site internet</option>
            <option value="VIDEO_SURVEILLANCE">Vidéosurveillance</option>
          </Sel>
          <Input label="Catégories de personnes concernées" value={f.categoriesPersonnes} onChange={e => upd("categoriesPersonnes", e.target.value)} placeholder="Ex: Employés, clients, fournisseurs" required as="textarea" />
          <Input label="Destinataires des données" value={f.destinataires} onChange={e => upd("destinataires", e.target.value)} placeholder="Ex: Service RH, Direction, prestataires" as="textarea" />
          <Input label="Mesures de sécurité mises en place" value={f.mesuresSecurite} onChange={e => upd("mesuresSecurite", e.target.value)} placeholder="Ex: Chiffrement, contrôle d'accès, pseudonymisation…" as="textarea" />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.grayBg, border: `1px solid ${T.cardBorder}`, borderRadius: 8, cursor: "pointer" }} onClick={() => upd("transfertPays", !f.transfertPays)}>
            <input type="checkbox" checked={f.transfertPays} onChange={() => upd("transfertPays", !f.transfertPays)} style={{ cursor: "pointer" }} />
            <label style={{ fontSize: 13, color: T.textSecondary, cursor: "pointer" }}>Transfert de données vers un pays tiers</label>
          </div>
          {f.transfertPays && <Input label="Pays de destination" value={f.paysDestination} onChange={e => upd("paysDestination", e.target.value)} placeholder="Ex: France, Côte d'Ivoire" />}
          <Input label="Commentaire complémentaire" value={f.commentaire} onChange={e => upd("commentaire", e.target.value)} placeholder="Informations supplémentaires pour la DG…" as="textarea" />
        </div>
        <div style={{ padding: "14px 22px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${T.cardBorder}` }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading || !f.categoriesPersonnes.trim()}>
            {loading ? <><Spinner /> Dépôt...</> : <><Send size={13} /> Soumettre la déclaration</>}
          </Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : FIN DE SESSION
// ═══════════════════════════════════════════════════════
const ModalFinSession = ({ session, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    onConfirm(session.id);
    setLoading(false);
    onClose();
  };
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 440, background: T.cardBg, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.yellowBg, border: `2px solid ${T.yellowBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <StopCircle size={24} color={T.yellow} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>Marquer la fin de la session</div>
          <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.65, marginBottom: 16 }}>
            Êtes-vous sûr de vouloir clôturer la session <strong>"{session.titre}"</strong> ?
            Cette action est <strong style={{ color: T.red }}>irréversible</strong>. Le statut passera à <strong>TERMINÉE</strong> et aucune nouvelle collecte ne sera possible.
          </div>
          <div style={{ padding: "12px 14px", background: T.yellowBg, border: `1px solid ${T.yellowBorder}`, borderRadius: 8, fontSize: 12, color: T.yellow, display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 20 }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Assurez-vous que tous les traitements sont complétés et que les déclarations nécessaires ont été soumises avant de clôturer.</span>
          </div>
        </div>
        <div style={{ padding: "0 24px 24px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="warning" onClick={handleConfirm} disabled={loading}>
            {loading ? <><Spinner /> Clôture...</> : <><StopCircle size={13} /> Clôturer la session</>}
          </Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD DPO
// ═══════════════════════════════════════════════════════
const SectionDashboard = ({ sessions, traitements, declarations, setActive, setSelectedSession }) => {
  const sessionsActives   = sessions.filter(s => s.statut === "EN_COURS");
  const traitSensibles    = traitements.filter(t => t.sensible);
  const declEnAttente     = declarations.filter(d => d.statut === "EN_ATTENTE");
  const declApprouvees    = declarations.filter(d => d.statut === "APPROUVEE");

  const stats = [
    { label: "Sessions actives",      value: sessionsActives.length,    sub: "en cours de collecte",      color: T.blue,   bg: T.blueBg,   border: T.blueBorder,   Icon: FolderOpen },
    { label: "Traitements déclarés",  value: declarations.length,       sub: `${declApprouvees.length} approuvés`, color: T.green,  bg: T.greenBg,  border: T.greenBorder,  Icon: FileText },
    { label: "Déclarations en attente", value: declEnAttente.length,    sub: "validation DG requise",    color: T.yellow, bg: T.yellowBg, border: T.yellowBorder, Icon: Clock },
    { label: "Traitements sensibles", value: traitSensibles.length,     sub: "nécessitent vigilance",    color: T.red,    bg: T.redBg,    border: T.redBorder,    Icon: Lock },
  ];

  return (
    <div className="slide-in">
      <PageHeader
        title="Tableau de bord DPO"
        subtitle={`Bonjour ${DPO_USER.name.split(" ")[0]} — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "12px 12px 0 0" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                <s.Icon size={18} strokeWidth={1.8} />
              </div>
              <ArrowUpRight size={13} color={s.color} style={{ opacity: 0.4, marginTop: 4 }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "DM Mono, monospace" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 500 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Sessions actives */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FolderOpen size={15} color={T.textSecondary} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Sessions actives</h3>
            </div>
            <button onClick={() => setActive("sessions")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          <div>
            {sessionsActives.length === 0 && <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucune session active</div>}
            {sessionsActives.slice(0, 4).map((s, i) => (
              <div key={s.id} onClick={() => { setSelectedSession(s.id); setActive("traitements"); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: i < sessionsActives.slice(0, 4).length - 1 ? `1px solid ${T.grayBg}` : "none", cursor: "pointer" }}
                className="row-hover">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.titre}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>📍 {s.lieu} · {s.nbTraitements} traitement(s)</div>
                </div>
                <Badge type={s.typeCollecte} />
              </div>
            ))}
          </div>
        </Card>

        {/* Déclarations en attente */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={15} color={T.textSecondary} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Déclarations récentes</h3>
            </div>
            <button onClick={() => setActive("declarations")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          <div>
            {declarations.length === 0 && <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucune déclaration</div>}
            {declarations.slice(0, 4).map((d, i) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < declarations.slice(0, 4).length - 1 ? `1px solid ${T.grayBg}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: d.statut === "APPROUVEE" ? T.greenBg : d.statut === "REJETEE" ? T.redBg : T.yellowBg, border: `1px solid ${d.statut === "APPROUVEE" ? T.greenBorder : d.statut === "REJETEE" ? T.redBorder : T.yellowBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {d.statut === "APPROUVEE" ? <CheckCircle2 size={15} color={T.green} /> : d.statut === "REJETEE" ? <XCircle size={15} color={T.red} /> : <Clock size={15} color={T.yellow} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.nom}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{d.dateDepot}</div>
                </div>
                <Badge type={d.statut} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Traitements sensibles */}
      {traitSensibles.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden", borderLeft: `3px solid ${T.red}` }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={14} color={T.red} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.red }}>Traitements sensibles nécessitant vigilance</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {traitSensibles.map((t, i) => (
              <div key={t.id} style={{ padding: "12px 18px", borderRight: i < traitSensibles.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 3 }}>{t.nom}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{t.typeDonnee} · {t.nbDonnees} entrées</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : SESSIONS
// ═══════════════════════════════════════════════════════
const SectionSessions = ({ sessions, setSessions, setActive, setSelectedSession }) => {
  const [showModal, setShowModal] = useState(false);
  const [finModal,  setFinModal]  = useState(null);
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  // ── Chargement initial depuis le backend ──────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/sessions", {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();

        // Mapping backend → format utilisé dans le composant
        const mapped = data.map((s) => ({
          id:            String(s.idSession),
          titre:         `Session #${s.idSession}`,          // pas de titre en base → fallback
          lieu:          s.lieu ?? "—",
          typeCollecte:  s.typeCollecte,
          statut:        s.statutSession,
          dateDebut:     s.dateDebut?.split("T")[0] ?? "—",
          dateFin:       s.dateFin?.split("T")[0]   ?? "",
          description:   s.description ?? "",
          responsable:   s.dpoNomComplet ?? "—",
          nbTraitements: s.nombreTraitements ?? 0,
        }));

        setSessions(mapped);
      } catch (e) {
        setError(e.message || "Impossible de charger les sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleFinSession = (id) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, statut: "TERMINEE", dateFin: new Date().toISOString().split("T")[0] }
          : s
      )
    );
  };

  const handleAddSession = (s) => {
    setSessions((prev) => [s, ...prev]);
  };

  const filtered = filter === "all" ? sessions : sessions.filter((s) => s.statut === filter);

  // ── Rendu ─────────────────────────────────────────────────────────
  return (
    <div className="slide-in">
      {showModal && <ModalCreerSession onClose={() => setShowModal(false)} onSave={handleAddSession} />}
      {finModal  && <ModalFinSession session={finModal} onClose={() => setFinModal(null)} onConfirm={handleFinSession} />}

      <PageHeader
        title="Sessions de collecte"
        subtitle={`${sessions.filter((s) => s.statut === "EN_COURS").length} session(s) active(s) sur ${sessions.length}`}
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.textSecondary, padding: "7px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}
        >
          <option value="all">Tous les statuts</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
        <Btn variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={13} /> Nouvelle session
        </Btn>
      </PageHeader>

      {/* État chargement */}
      {loading && (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: T.textMuted, fontSize: 13 }}>Chargement des sessions...</p>
        </Card>
      )}

      {/* État erreur */}
      {!loading && error && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.red }}>
            <AlertCircle size={14} />
            {error}
          </div>
        </Card>
      )}

      {/* Liste */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((s) => (
            <Card key={s.id} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{ width: 4, background: s.statut === "EN_COURS" ? T.blue : s.statut === "TERMINEE" ? T.green : T.gray, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{s.titre}</span>
                        <Badge type={s.statut} />
                        <Badge type={s.typeCollecte} />
                      </div>
                      <div style={{ display: "flex", gap: 18, fontSize: 12, color: T.textMuted }}>
                        <span>📍 {s.lieu}</span>
                        <span>📅 {s.dateDebut}{s.dateFin ? ` → ${s.dateFin}` : ""}</span>
                        <span>👤 {s.responsable}</span>
                        <span>🔧 {s.nbTraitements} traitement(s)</span>
                      </div>
                      {s.description && (
                        <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 6, lineHeight: 1.5 }}>
                          {s.description}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: T.textMuted, flexShrink: 0, marginLeft: 16 }}>
                      {s.id}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${T.cardBorder}` }}>
                    {s.statut !== "ANNULEE" && (
                      <Btn onClick={() => { setSelectedSession(s.id); setActive("traitements"); }} style={{ fontSize: 12, padding: "6px 12px" }}>
                        <Eye size={12} /> Voir traitements
                      </Btn>
                    )}
                    {s.statut === "EN_COURS" && (
                      <Btn variant="warning" onClick={() => setFinModal(s)} style={{ fontSize: 12, padding: "6px 12px" }}>
                        <StopCircle size={12} /> Clôturer la session
                      </Btn>
                    )}
                    {s.statut === "TERMINEE" && (
                      <span style={{ fontSize: 12, color: T.green, display: "flex", alignItems: "center", gap: 5, padding: "6px 0" }}>
                        <CheckCircle2 size={13} /> Session clôturée le {s.dateFin}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: T.textMuted, fontSize: 13, fontStyle: "italic" }}>Aucune session pour ce filtre.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TRAITEMENTS
// ═══════════════════════════════════════════════════════
const SectionTraitements = ({ traitements, setTraitements, declarations, setDeclarations, sessions, selectedSession, setSelectedSession, setActive }) => {
  const [showCreate,   setShowCreate]   = useState(false);
  const [showDeclarer, setShowDeclarer] = useState(null);

  const session = sessions.find(s => s.id === selectedSession);
  const traitsSession = traitements.filter(t => t.sessionId === selectedSession);
  const sessionsActives = sessions.filter(s => s.statut === "EN_COURS");

  const hasDeclared = (tId) => declarations.some(d => d.traitementId === tId);

  const handleAddTraitement = (t) => {
    setTraitements(prev => [t, ...prev]);
    const sid = t.sessionId;
    // update count handled via filter
  };

  const handleAddDeclaration = (d) => {
    setDeclarations(prev => [d, ...prev]);
  };

  return (
    <div className="slide-in">
      {showCreate   && <ModalCreerTraitement sessionId={selectedSession} onClose={() => setShowCreate(false)} onSave={handleAddTraitement} />}
      {showDeclarer && <ModalDeclarer traitement={showDeclarer} onClose={() => setShowDeclarer(null)} onSave={handleAddDeclaration} />}

      {/* Sélecteur de session */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>Session de collecte</label>
            <select value={selectedSession || ""} onChange={e => setSelectedSession(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, fontFamily: "inherit", outline: "none", width: "100%", maxWidth: 420 }}>
              <option value="">— Sélectionner une session —</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.id} — {s.titre} ({s.statut})</option>)}
            </select>
          </div>
          {session && session.statut === "EN_COURS" && (
            <Btn variant="primary" onClick={() => setShowCreate(true)} style={{ marginTop: 20 }}>
              <Plus size={13} /> Nouveau traitement
            </Btn>
          )}
        </div>
        {session && (
          <div style={{ padding: "10px 16px", background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 10, display: "flex", gap: 20, fontSize: 12, color: T.textSecondary, alignItems: "center" }}>
            <Badge type={session.statut} />
            <Badge type={session.typeCollecte} />
            <span>📍 {session.lieu}</span>
            <span>📅 {session.dateDebut} → {session.dateFin}</span>
            <span>👤 {session.responsable}</span>
          </div>
        )}
      </div>

      {!selectedSession ? (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <FolderOpen size={40} color={T.textMuted} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
          <p style={{ color: T.textMuted, fontSize: 13 }}>Sélectionnez une session pour voir ses traitements.</p>
        </Card>
      ) : traitsSession.length === 0 ? (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <Cpu size={40} color={T.textMuted} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
          <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 16 }}>Aucun traitement pour cette session.</p>
          {session?.statut === "EN_COURS" && <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={13} /> Créer le premier traitement</Btn>}
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
          {traitsSession.map(t => {
            const declared = hasDeclared(t.id);
            const decl = declarations.find(d => d.traitementId === t.id);
            return (
              <Card key={t.id} style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Cpu size={18} color={T.blue} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t.nom}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Mono, monospace" }}>{t.id}</div>
                    </div>
                  </div>
                  <Badge type={t.sensible ? "sensible" : "standard"} />
                </div>

                {t.description && <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12, lineHeight: 1.55 }}>{t.description}</p>}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Entrées", value: t.nbDonnees, mono: true },
                    { label: "Conservation", value: `${t.dureeConservation} ans`, mono: false },
                    { label: "Département", value: t.department || "—", mono: false },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "9px 10px", background: T.grayBg, borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: item.mono ? 16 : 12, fontWeight: 700, color: T.textPrimary, fontFamily: item.mono ? "DM Mono, monospace" : "inherit" }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "10px 12px", background: T.grayBg, borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: T.textMuted }}>Type de données</span>
                    <span style={{ fontWeight: 600, color: T.textSecondary }}>{t.typeDonnee}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: T.textMuted }}>Finalité</span>
                    <span style={{ fontWeight: 600, color: T.textSecondary }}>{t.finalite}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: T.textMuted }}>Base juridique</span>
                    <span style={{ fontWeight: 600, color: T.textSecondary }}>{t.baseJuridique}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 12 }}>
                  <Badge type={t.statut} />
                  {declared && decl && <Badge type={decl.statut} />}
                  <div style={{ flex: 1 }} />
                  {!declared && session?.statut === "EN_COURS" ? (
                    <Btn variant="primary" onClick={() => setShowDeclarer(t)} style={{ fontSize: 11, padding: "5px 12px" }}>
                      <Send size={12} /> Déclarer
                    </Btn>
                  ) : declared ? (
                    <span style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 size={12} /> Déclaré
                    </span>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DÉCLARATIONS
// ═══════════════════════════════════════════════════════
const SectionDeclarations = ({ declarations, traitements }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? declarations : declarations.filter(d => d.statut === filter);

  const getTrait = (id) => traitements.find(t => t.id === id);

  return (
    <div className="slide-in">
      <PageHeader title="Déclarations de traitement" subtitle={`${declarations.length} déclaration(s) — ${declarations.filter(d => d.statut === "EN_ATTENTE").length} en attente de validation DG`}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.textSecondary, padding: "7px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="all">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVEE">Approuvée</option>
          <option value="REJETEE">Rejetée</option>
        </select>
      </PageHeader>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(d => {
          const trait = getTrait(d.traitementId);
          return (
            <Card key={d.id} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{ width: 4, background: d.statut === "APPROUVEE" ? T.green : d.statut === "REJETEE" ? T.red : T.yellow, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: d.statut === "APPROUVEE" ? T.greenBg : d.statut === "REJETEE" ? T.redBg : T.yellowBg, border: `1px solid ${d.statut === "APPROUVEE" ? T.greenBorder : d.statut === "REJETEE" ? T.redBorder : T.yellowBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {d.statut === "APPROUVEE" ? <CheckCircle2 size={16} color={T.green} /> : d.statut === "REJETEE" ? <XCircle size={16} color={T.red} /> : <Clock size={16} color={T.yellow} />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{d.nom}</span>
                        <Badge type={d.statut} />
                        <Badge type={d.type} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
                        {[
                          { label: "Date de dépôt", value: d.dateDepot },
                          { label: "Finalité", value: d.finaliteTraitement },
                          { label: "Base juridique", value: d.baseJuridique },
                        ].map((item, i) => (
                          <div key={i} style={{ fontSize: 12 }}>
                            <div style={{ color: T.textMuted, marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontWeight: 600, color: T.textSecondary }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {d.statut === "REJETEE" && d.commentaireDG && (
                        <div style={{ padding: "10px 14px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, color: T.red, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span><strong>Commentaire DG :</strong> {d.commentaireDG}</span>
                        </div>
                      )}
                      {d.statut === "APPROUVEE" && d.dateValidation && (
                        <div style={{ fontSize: 12, color: T.green, display: "flex", alignItems: "center", gap: 5 }}>
                          <CheckCircle2 size={12} /> Validée par la DG le {d.dateValidation}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: T.textMuted, marginLeft: 16, flexShrink: 0 }}>{d.id}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: T.textMuted, fontSize: 13, fontStyle: "italic" }}>Aucune déclaration pour ce filtre.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : NOTIFICATIONS
// ═══════════════════════════════════════════════════════
const SectionNotifications = ({ notifications, setNotifications }) => {
  const markAll = () => setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  const markOne = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));

  return (
    <div className="slide-in">
      <PageHeader title="Notifications" subtitle={`${notifications.filter(n => !n.lu).length} non lue(s)`}>
        <Btn onClick={markAll}><Check size={13} /> Tout marquer lu</Btn>
      </PageHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map(n => (
          <Card key={n.id} style={{ padding: "14px 18px", opacity: n.lu ? 0.7 : 1, borderLeft: `3px solid ${n.type === "ALERTE" ? T.red : n.type === "CONFIRMATION" ? T.green : T.yellow}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: n.type === "ALERTE" ? T.redBg : n.type === "CONFIRMATION" ? T.greenBg : T.yellowBg, border: `1px solid ${n.type === "ALERTE" ? T.redBorder : n.type === "CONFIRMATION" ? T.greenBorder : T.yellowBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {n.type === "ALERTE" ? <AlertCircle size={16} color={T.red} /> : n.type === "CONFIRMATION" ? <CheckCircle2 size={16} color={T.green} /> : <Bell size={16} color={T.yellow} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{n.titre}</span>
                  {!n.lu && <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, display: "inline-block" }} />}
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 4 }}>{n.contenu}</div>
                <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "DM Mono, monospace" }}>{n.date}</div>
              </div>
              {!n.lu && (
                <button onClick={() => markOne(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 11, padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.cardBorder}` }}>
                  Marquer lu
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════
export default function Tb_Dpo() {
  const [section,          setSection]          = useState("dashboard");
  const [collapsed,        setCollapsed]        = useState(false);
  const [selectedSession,  setSelectedSession]  = useState(null);
  const [sessions,         setSessions]         = useState(INIT_SESSIONS);
  const [traitements,      setTraitements]      = useState(INIT_TRAITEMENTS);
  const [declarations,     setDeclarations]     = useState(INIT_DECLARATIONS);
  const [notifications,    setNotifications]    = useState(INIT_NOTIFICATIONS);

  const notifCount = notifications.filter(n => !n.lu).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Instrument Sans, DM Sans, system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url(https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap);
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E4E8EE; border-radius: 4px; }
        .slide-in { animation: slideIn 0.22s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dpo-card { transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; }
        .row-hover:hover { background: #F9FAFB !important; }
        .table-row-hover:hover td { background: #F9FAFB; }
        .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #E2E8F0 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <TopBar onToggle={() => setCollapsed(c => !c)} notifCount={notifCount} setActive={setSection} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar active={section} setActive={setSection} collapsed={collapsed} notifCount={notifCount} />
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: T.mainBg }}>
          {section === "dashboard" && (
            <SectionDashboard sessions={sessions} traitements={traitements} declarations={declarations} setActive={setSection} setSelectedSession={setSelectedSession} />
          )}
          {section === "sessions" && (
            <SectionSessions sessions={sessions} setSessions={setSessions} setActive={setSection} setSelectedSession={setSelectedSession} />
          )}
          {section === "traitements" && (
            <SectionTraitements traitements={traitements} setTraitements={setTraitements} declarations={declarations} setDeclarations={setDeclarations} sessions={sessions} selectedSession={selectedSession} setSelectedSession={setSelectedSession} setActive={setSection} />
          )}
          {section === "declarations" && (
            <SectionDeclarations declarations={declarations} traitements={traitements} />
          )}
          {section === "notifications" && (
            <SectionNotifications notifications={notifications} setNotifications={setNotifications} />
          )}
        </main>
      </div>
    </div>
  );
}