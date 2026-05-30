import { useState, useEffect, useRef } from "react";
import {
  Database, Layers, Plus, FileSpreadsheet, LayoutDashboard,
  ChevronDown, ChevronRight, Eye, Upload, PenLine, X, Check,
  Clock, AlertCircle, Activity, Menu, Bell, LogOut, Search,
  Filter, Download, RefreshCw, Table2, FolderOpen, Cpu,
  BarChart2, Info, Calendar, Hash, Globe, Lock, Unlock,
  ChevronLeft, FileText, Trash2, Edit3, MoreHorizontal,
  ArrowUpRight, CheckCircle2, XCircle, Loader2
} from "lucide-react";

// ═══════════════════════════════════════════════════════
//  THÈME — cohérent avec le dashboard admin existant
// ═══════════════════════════════════════════════════════
const T = {
  sidebarBg: "#0D1F12", sidebarBorder: "#1A3320",
  sidebarText: "#7A9E8A", sidebarActive: "#FFFFFF",
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
//  DONNÉES SIMULÉES
// ═══════════════════════════════════════════════════════
const DATA = {
  user: { name: "Kofi Ouédraogo", role: "Utilisateur Métier", email: "k.ouedraogo@sofitex.bf", initials: "KO", service: "Direction Commerciale" },
  stats: { sessionsActives: 4, traitementsTotal: 18, donneesCollectees: 3241, enAttente: 2 },
  sessions: [
    { id: "SC-2025-001", titre: "Collecte Agents Terrain – Bobo", lieu: "Bobo-Dioulasso", typeCollecte: "EN_LIGNE", statut: "EN_COURS", dateDebut: "2025-05-01", dateFin: "2025-05-31", nbTraitements: 3, dpo: "Aminata Traoré" },
    { id: "SC-2025-002", titre: "Recensement Personnel Banfora", lieu: "Banfora", typeCollecte: "TERRAIN", statut: "TERMINEE", dateDebut: "2025-04-10", dateFin: "2025-04-25", nbTraitements: 5, dpo: "Aminata Traoré" },
    { id: "SC-2025-003", titre: "Données Fournisseurs Ouaga", lieu: "Ouagadougou", typeCollecte: "EN_LIGNE", statut: "EN_COURS", dateDebut: "2025-05-12", dateFin: "2025-06-12", nbTraitements: 2, dpo: "Ibrahim Koné" },
    { id: "SC-2025-004", titre: "Audit RH Koudougou", lieu: "Koudougou", typeCollecte: "TERRAIN", statut: "ANNULEE", dateDebut: "2025-03-01", dateFin: "2025-03-15", nbTraitements: 0, dpo: "Ibrahim Koné" },
  ],
  traitements: {
    "SC-2025-001": [
      { id: "TR-001", nom: "Identification agents", description: "Collecte des données d'identification", typeDonnee: "Données d'identité", statut: "EN_COURS", nbDonnees: 142, dateCreation: "2025-05-02", sensible: false },
      { id: "TR-002", nom: "Coordonnées GPS terrain", description: "Géolocalisation des points de collecte", typeDonnee: "Données de localisation", statut: "TERMINEE", nbDonnees: 98, dateCreation: "2025-05-03", sensible: false },
      { id: "TR-003", nom: "Données santé agents", description: "Suivi médical obligatoire", typeDonnee: "Données de santé", statut: "EN_COURS", nbDonnees: 56, dateCreation: "2025-05-05", sensible: true },
    ],
    "SC-2025-002": [
      { id: "TR-004", nom: "Données civiles personnel", description: "État civil complet", typeDonnee: "Données d'identité", statut: "TERMINEE", nbDonnees: 310, dateCreation: "2025-04-11", sensible: false },
      { id: "TR-005", nom: "Informations contractuelles", description: "Contrats et avenants", typeDonnee: "Données professionnelles", statut: "TERMINEE", nbDonnees: 280, dateCreation: "2025-04-12", sensible: false },
    ],
    "SC-2025-003": [
      { id: "TR-006", nom: "Coordonnées fournisseurs", description: "Contacts et adresses", typeDonnee: "Données de contact", statut: "EN_COURS", nbDonnees: 74, dateCreation: "2025-05-13", sensible: false },
      { id: "TR-007", nom: "Données financières", description: "IBAN et coordonnées bancaires", typeDonnee: "Données financières", statut: "EN_COURS", nbDonnees: 33, dateCreation: "2025-05-14", sensible: true },
    ],
  },
  donneesExemple: [
    { id: 1, nom: "Diallo Fatou", email: "f.diallo@ex.bf", telephone: "+226 70 00 11 22", ville: "Bobo", dateNaissance: "1992-03-14", collecte: "2025-05-03" },
    { id: 2, nom: "Sawadogo Moussa", email: "m.sawa@ex.bf", telephone: "+226 76 55 33 21", ville: "Ouaga", dateNaissance: "1988-07-22", collecte: "2025-05-04" },
    { id: 3, nom: "Compaoré Aïcha", email: "a.comp@ex.bf", telephone: "+226 78 99 44 10", ville: "Banfora", dateNaissance: "1995-11-05", collecte: "2025-05-04" },
  ],
};

// ═══════════════════════════════════════════════════════
//  ATOMICS
// ═══════════════════════════════════════════════════════
const Avatar = ({ initials, size = 36, bg = T.goldLight, color = T.gold, border = T.goldBorder }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.34, color, flexShrink: 0, letterSpacing: "0.03em" }}>{initials}</div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 12, boxShadow: T.cardShadow, ...style }}>{children}</div>
);

const Badge = ({ type, label }) => {
  const map = {
    EN_COURS:  { bg: T.blueBg,   color: T.blue,   border: T.blueBorder,   text: label || "En cours" },
    TERMINEE:  { bg: T.greenBg,  color: T.green,  border: T.greenBorder,  text: label || "Terminée" },
    ANNULEE:   { bg: T.grayBg,   color: T.gray,   border: T.grayBorder,   text: label || "Annulée" },
    EN_ATTENTE:{ bg: T.yellowBg, color: T.yellow, border: T.yellowBorder, text: label || "En attente" },
    sensible:  { bg: T.redBg,    color: T.red,    border: T.redBorder,    text: "Sensible" },
    normal:    { bg: T.greenBg,  color: T.green,  border: T.greenBorder,  text: "Standard" },
    EN_LIGNE:  { bg: T.tealBg,   color: T.teal,   border: T.tealBorder,   text: "En ligne" },
    TERRAIN:   { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, text: "Terrain" },
  };
  const s = map[type] || map.EN_ATTENTE;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.text}
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

const Btn = ({ children, onClick, variant = "outline", color, style = {}, disabled = false }) => {
  const base = { borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, border: "none", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", ...style };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "#0D1F12", color: "#fff" }}>{children}</button>;
  if (variant === "danger")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: color || T.textSecondary, border: `1px solid ${T.cardBorder}` }}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.03em" }}>{label}{required && <span style={{ color: T.red }}> *</span>}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
  </div>
);

const Spinner = () => (
  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
);

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ active, setActive, collapsed }) => {
  const nav = [
    { id: "dashboard",    label: "Tableau de bord",    Icon: LayoutDashboard },
    { id: "sessions",     label: "Sessions de collecte", Icon: FolderOpen },
    { id: "traitements",  label: "Traitements",         Icon: Cpu },
    { id: "donnees",      label: "Données collectées",  Icon: Database },
    { id: "import",       label: "Import fichier",       Icon: Upload },
  ];

  return (
    <aside style={{ width: collapsed ? 64 : 220, flexShrink: 0, background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={DATA.user.initials} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{DATA.user.name}</div>
              <div style={{ fontSize: 10, color: T.sidebarText, marginTop: 1 }}>{DATA.user.service}</div>
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
              style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, padding: collapsed ? "11px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 8, color: isActive ? "#FFFFFF" : T.sidebarText, background: isActive ? "rgba(52,168,103,0.15)" : "transparent", fontWeight: isActive ? 600 : 400, fontSize: 13, cursor: "pointer", position: "relative", marginBottom: 2, transition: "all 0.15s ease" }}>
              {isActive && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#4ADE80", borderRadius: "0 2px 2px 0" }} />}
              <item.Icon size={16} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
            </div>
          );
        })}
      </nav>
      {!collapsed && (
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.sidebarBorder}` }}>
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", borderRadius: 8, padding: "9px 10px", color: "#EF4444", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
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
const TopBar = ({ onToggle }) => (
  <header style={{ height: 56, background: T.sidebarBg, borderBottom: `1px solid ${T.sidebarBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={onToggle} style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
        <Menu size={18} />
      </button>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", letterSpacing: "0.04em" }}>
        SOFITEX — Espace Utilisateur Métier
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 7, borderRadius: 7, display: "flex", position: "relative" }}>
        <Bell size={17} />
        <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: T.red, borderRadius: "50%" }} />
      </button>
      <div style={{ width: 1, height: 20, background: T.sidebarBorder }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.navAccentBg, border: `1px solid ${T.navAccentBorder}`, borderRadius: 8, padding: "5px 10px" }}>
        <Avatar initials={DATA.user.initials} size={26} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>{DATA.user.name.split(" ")[0]} {DATA.user.name.split(" ")[1]?.[0]}.</div>
          <div style={{ fontSize: 10, color: T.sidebarText }}>Utilisateur Métier</div>
        </div>
      </div>
    </div>
  </header>
);

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD
// ═══════════════════════════════════════════════════════
const SectionDashboard = ({ setSection, setSelectedSession }) => {
  const stats = [
    { label: "Sessions actives",     value: DATA.stats.sessionsActives,     sub: "sessions en cours",     color: T.blue,   bg: T.blueBg,   border: T.blueBorder,   Icon: FolderOpen },
    { label: "Traitements total",    value: DATA.stats.traitementsTotal,     sub: "tous statuts",          color: T.teal,   bg: T.tealBg,   border: T.tealBorder,   Icon: Cpu },
    { label: "Données collectées",   value: DATA.stats.donneesCollectees.toLocaleString("fr"), sub: "entrées enregistrées", color: T.green,  bg: T.greenBg,  border: T.greenBorder,  Icon: Database },
    { label: "En attente d'action",  value: DATA.stats.enAttente,            sub: "nécessitent attention", color: T.yellow, bg: T.yellowBg, border: T.yellowBorder, Icon: AlertCircle },
  ];

  const sessionsActives = DATA.sessions.filter(s => s.statut === "EN_COURS");

  return (
    <div className="slide-in">
      <PageHeader title="Tableau de bord" subtitle={`Bonjour ${DATA.user.name.split(" ")[0]} — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`} />

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
            <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 500 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Sessions actives + Activité récente */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FolderOpen size={15} color={T.textSecondary} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Sessions actives</h3>
            </div>
            <button onClick={() => setSection("sessions")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          <div>
            {sessionsActives.map((s, i) => (
              <div key={s.id} onClick={() => { setSelectedSession(s.id); setSection("traitements"); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: i < sessionsActives.length - 1 ? `1px solid ${T.cardBorder}` : "none", cursor: "pointer" }}
                className="row-hover">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.titre}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.lieu} · {s.nbTraitements} traitement(s)</div>
                </div>
                <Badge type={s.typeCollecte} />
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={15} color={T.textSecondary} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Traitements récents</h3>
          </div>
          <div>
            {Object.values(DATA.traitements).flat().slice(0, 5).map((t, i, arr) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.grayBg}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Cpu size={14} color={T.blue} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.nom}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{t.nbDonnees} entrées · {t.typeDonnee}</div>
                </div>
                <Badge type={t.statut} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : SESSIONS DE COLLECTE
// ═══════════════════════════════════════════════════════
const SectionSessions = ({ setSection, setSelectedSession }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? DATA.sessions : DATA.sessions.filter(s => s.statut === filter);

  return (
    <div className="slide-in">
      <PageHeader title="Sessions de collecte" subtitle="Sessions créées par le DPO et assignées à votre service">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, color: T.textSecondary, padding: "7px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="all">Tous les statuts</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
      </PageHeader>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(s => (
          <Card key={s.id} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              {/* Barre couleur gauche */}
              <div style={{ width: 4, background: s.statut === "EN_COURS" ? T.blue : s.statut === "TERMINEE" ? T.green : T.gray, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.statut === "EN_COURS" ? T.blueBg : T.grayBg, border: `1px solid ${s.statut === "EN_COURS" ? T.blueBorder : T.grayBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FolderOpen size={20} color={s.statut === "EN_COURS" ? T.blue : T.gray} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{s.titre}</span>
                    <Badge type={s.statut} />
                    <Badge type={s.typeCollecte} />
                  </div>
                  <div style={{ display: "flex", gap: 20, fontSize: 12, color: T.textMuted }}>
                    <span>📍 {s.lieu}</span>
                    <span>📅 {s.dateDebut} → {s.dateFin}</span>
                    <span>🔧 {s.nbTraitements} traitement(s)</span>
                    <span>👤 DPO: {s.dpo}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted, alignSelf: "center" }}>{s.id}</span>
                  {s.statut !== "ANNULEE" && (
                    <Btn variant="primary" onClick={() => { setSelectedSession(s.id); setSection("traitements"); }} style={{ fontSize: 12, padding: "7px 14px" }}>
                      <Eye size={13} /> Voir traitements
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : CRÉER TRAITEMENT
// ═══════════════════════════════════════════════════════
const ModalCreerTraitement = ({ sessionId, onClose, onSave }) => {
  const [form, setForm] = useState({ nom: "", description: "", typeDonnee: "", sensible: false, department: "" });
  const [loading, setLoading] = useState(false);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nom.trim() || !form.typeDonnee) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onSave({ ...form, id: `TR-${Date.now()}`, statut: "EN_COURS", nbDonnees: 0, dateCreation: new Date().toISOString().split("T")[0] });
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 900, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 520, background: T.cardBg, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} color={T.blue} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Nouveau traitement</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Session {sessionId}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textMuted }}><X size={16} /></button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nom du traitement" value={form.nom} onChange={e => upd("nom", e.target.value)} placeholder="Ex: Identification des agents" required />
          <Input label="Description" value={form.description} onChange={e => upd("description", e.target.value)} placeholder="Objectif et périmètre du traitement" />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>Type de données <span style={{ color: T.red }}>*</span></label>
            <select value={form.typeDonnee} onChange={e => upd("typeDonnee", e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, fontFamily: "inherit", outline: "none" }}>
              <option value="">Sélectionner un type</option>
              <option>Données d'identité</option>
              <option>Données de contact</option>
              <option>Données de santé</option>
              <option>Données financières</option>
              <option>Données professionnelles</option>
              <option>Données de localisation</option>
              <option>Données biométriques</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8 }}>
            <input type="checkbox" id="sensible" checked={form.sensible} onChange={e => upd("sensible", e.target.checked)} style={{ cursor: "pointer" }} />
            <label htmlFor="sensible" style={{ fontSize: 13, color: T.red, fontWeight: 600, cursor: "pointer" }}>
              <Lock size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              Ce traitement implique des données sensibles
            </label>
          </div>
        </div>
        <div style={{ padding: "14px 22px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${T.cardBorder}` }}>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading || !form.nom.trim() || !form.typeDonnee}>
            {loading ? <Spinner /> : <Check size={13} />}
            {loading ? "Création..." : "Créer le traitement"}
          </Btn>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TRAITEMENTS (d'une session)
// ═══════════════════════════════════════════════════════
const SectionTraitements = ({ selectedSession, setSection, setSelectedTraitement }) => {
  const [showModal, setShowModal] = useState(false);
  const [traitements, setTraitements] = useState(DATA.traitements[selectedSession] || []);
  const session = DATA.sessions.find(s => s.id === selectedSession);

  const addTraitement = (t) => setTraitements(prev => [t, ...prev]);

  if (!session) return (
    <div className="slide-in">
      <PageHeader title="Traitements" subtitle="Sélectionnez une session">
        <Btn onClick={() => setSection("sessions")}><ChevronLeft size={13} /> Retour</Btn>
      </PageHeader>
      <Card style={{ padding: 40, textAlign: "center" }}><p style={{ color: T.textMuted }}>Aucune session sélectionnée.</p></Card>
    </div>
  );

  return (
    <div className="slide-in">
      {showModal && <ModalCreerTraitement sessionId={selectedSession} onClose={() => setShowModal(false)} onSave={addTraitement} />}

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setSection("sessions")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <ChevronLeft size={13} /> Retour aux sessions
        </button>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em" }}>{session.titre}</h1>
            <div style={{ display: "flex", gap: 12, marginTop: 5, alignItems: "center" }}>
              <Badge type={session.statut} />
              <Badge type={session.typeCollecte} />
              <span style={{ fontSize: 12, color: T.textMuted }}>{session.lieu} · {session.dateDebut} → {session.dateFin}</span>
            </div>
          </div>
          {session.statut === "EN_COURS" && (
            <Btn variant="primary" onClick={() => setShowModal(true)}>
              <Plus size={13} /> Nouveau traitement
            </Btn>
          )}
        </div>
      </div>

      {traitements.length === 0 ? (
        <Card style={{ padding: 48, textAlign: "center" }}>
          <Cpu size={36} color={T.textMuted} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
          <p style={{ color: T.textMuted, fontSize: 13 }}>Aucun traitement pour cette session.</p>
          <Btn variant="primary" onClick={() => setShowModal(true)} style={{ margin: "16px auto 0" }}><Plus size={13} /> Créer le premier traitement</Btn>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
          {traitements.map(t => (
            <Card key={t.id} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Cpu size={18} color={T.blue} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t.nom}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{t.id}</div>
                  </div>
                </div>
                <Badge type={t.sensible ? "sensible" : "normal"} label={t.sensible ? "Sensible" : "Standard"} />
              </div>
              <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12, lineHeight: 1.55 }}>{t.description}</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, padding: "10px 12px", background: T.grayBg, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: "'DM Mono', monospace" }}>{t.nbDonnees}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Entrées</div>
                </div>
                <div style={{ flex: 1, padding: "10px 12px", background: T.grayBg, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary }}>{t.typeDonnee}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Type</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 12 }}>
                <Badge type={t.statut} />
                <div style={{ flex: 1 }} />
                <Btn onClick={() => { setSelectedTraitement(t.id); setSection("donnees"); }} style={{ fontSize: 11, padding: "5px 12px" }}>
                  <Database size={12} /> Données
                </Btn>
                <Btn variant="primary" onClick={() => { setSelectedTraitement(t.id); setSection("donnees"); }} style={{ fontSize: 11, padding: "5px 12px" }}>
                  <Plus size={12} /> Saisir
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DONNÉES + SAISIE MANUELLE
// ═══════════════════════════════════════════════════════
const SectionDonnees = ({ setSection }) => {
  const [tab, setTab] = useState("liste");
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", ville: "", dateNaissance: "" });
  const [rows, setRows] = useState(DATA.donneesExemple);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nom.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    const now = new Date().toISOString().split("T")[0];
    setRows(r => [{ id: r.length + 1, ...form, collecte: now }, ...r]);
    setForm({ nom: "", email: "", telephone: "", ville: "", dateNaissance: "" });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const filtered = rows.filter(r =>
    r.nom?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "liste",  label: "Liste des données",  Icon: Table2 },
    { id: "saisie", label: "Saisie manuelle",     Icon: PenLine },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Données collectées" subtitle={`${rows.length} entrées enregistrées dans ce traitement`}>
        <Btn onClick={() => setSection("import")} variant="outline"><Upload size={13} /> Importer fichier</Btn>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: T.grayBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: 4, marginBottom: 18, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", background: tab === t.id ? T.cardBg : "transparent", color: tab === t.id ? T.textPrimary : T.textMuted, boxShadow: tab === t.id ? T.cardShadow : "none", transition: "all 0.15s" }}>
            <t.Icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "liste" && (
        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
              <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", width: "100%", fontFamily: "inherit" }} />
            </div>
            <Btn><Download size={13} /> Exporter CSV</Btn>
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
                {["#", "Nom complet", "Email", "Téléphone", "Ville", "Date naissance", "Date collecte"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className="table-row-hover" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                  <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted }}>{row.id}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{row.nom}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary }}>{row.email}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary, fontFamily: "'DM Mono', monospace" }}>{row.telephone}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary }}>{row.ville}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary, fontFamily: "'DM Mono', monospace" }}>{row.dateNaissance}</td>
                  <td style={{ padding: "11px 14px", fontSize: 11, color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>{row.collecte}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucun résultat</div>}
        </Card>
      )}

      {tab === "saisie" && (
        <Card style={{ padding: 28, maxWidth: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.greenBg, border: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PenLine size={18} color={T.green} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Saisie manuelle d'une entrée</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Renseignez les champs puis enregistrez</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Input label="Nom complet" value={form.nom} onChange={e => upd("nom", e.target.value)} placeholder="Ex: Diallo Fatou" required />
            <Input label="Email" type="email" value={form.email} onChange={e => upd("email", e.target.value)} placeholder="email@exemple.bf" />
            <Input label="Téléphone" value={form.telephone} onChange={e => upd("telephone", e.target.value)} placeholder="+226 70 00 00 00" />
            <Input label="Ville" value={form.ville} onChange={e => upd("ville", e.target.value)} placeholder="Ex: Ouagadougou" />
            <Input label="Date de naissance" type="date" value={form.dateNaissance} onChange={e => upd("dateNaissance", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <Btn variant="primary" onClick={handleSave} disabled={saving || !form.nom.trim()} style={{ minWidth: 160 }}>
              {saving ? <><Spinner /> Enregistrement...</> : <><Check size={13} /> Enregistrer l'entrée</>}
            </Btn>
            {saved && <span style={{ fontSize: 12, color: T.green, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={14} /> Entrée ajoutée avec succès</span>}
          </div>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : IMPORT FICHIER EXCEL
// ═══════════════════════════════════════════════════════
const SectionImport = () => {
  const [step, setStep] = useState("upload"); // upload | preview | result
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewRows] = useState([
    { ligne: 1, nom: "Nikiema Albert", email: "a.nikiema@ex.bf", telephone: "+226 70 11 22 33", ville: "Ouaga", statut: "ok" },
    { ligne: 2, nom: "Traoré Mariam",  email: "m.traore@ex.bf",  telephone: "+226 76 44 55 66", ville: "Bobo",  statut: "ok" },
    { ligne: 3, nom: "Coulibaly Jean", email: "INVALIDE",         telephone: "+226 78 77 88 99", ville: "Banfora", statut: "erreur", erreur: "Email invalide" },
    { ligne: 4, nom: "Zongo Rasmata",  email: "r.zongo@ex.bf",   telephone: "+226 65 33 44 55", ville: "Ouaga", statut: "ok" },
    { ligne: 5, nom: "Barro Seydou",   email: "s.barro@ex.bf",   telephone: "+226 70 99 88 77", ville: "Koudougou", statut: "ok" },
  ]);
  const fileRef = useRef();

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setStep("preview"); } };
  const handleFile = (e) => { const f = e.target.files[0]; if (f) { setFile(f); setStep("preview"); } };
  const handleImport = async () => {
    setLoading(true);
    for (let i = 0; i <= 100; i += 10) { await new Promise(r => setTimeout(r, 120)); setProgress(i); }
    setLoading(false);
    setStep("result");
  };

  const okRows    = previewRows.filter(r => r.statut === "ok");
  const errRows   = previewRows.filter(r => r.statut === "erreur");

  return (
    <div className="slide-in">
      <PageHeader title="Import de fichier" subtitle="Importez des données via un fichier Excel ou CSV" />

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
        {[{ id: "upload", label: "Sélection du fichier" }, { id: "preview", label: "Aperçu & validation" }, { id: "result", label: "Résultat" }].map((s, i, arr) => {
          const done = (step === "preview" && i === 0) || (step === "result" && i <= 1);
          const active = step === s.id;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? T.green : active ? "#0D1F12" : T.grayBg, border: `2px solid ${done ? T.green : active ? "#0D1F12" : T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done ? <Check size={14} color="#fff" /> : <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : T.textMuted }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? T.textPrimary : done ? T.green : T.textMuted }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ width: 40, height: 1, background: done ? T.green : T.cardBorder, margin: "0 12px" }} />}
            </div>
          );
        })}
      </div>

      {step === "upload" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${dragging ? T.blue : T.cardBorder}`, borderRadius: 12, margin: 24, padding: "52px 32px", textAlign: "center", cursor: "pointer", background: dragging ? T.blueBg : "transparent", transition: "all 0.2s" }}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleFile} />
            <FileSpreadsheet size={48} color={dragging ? T.blue : T.textMuted} style={{ margin: "0 auto 16px", display: "block", opacity: 0.6 }} strokeWidth={1} />
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>Glisser-déposer un fichier ici</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>ou cliquez pour parcourir vos fichiers</div>
            <div style={{ display: "inline-flex", gap: 8 }}>
              {[".xlsx", ".xls", ".csv"].map(ext => (
                <span key={ext} style={{ background: T.grayBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{ext}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 24px 20px", background: T.goldLight, borderTop: `1px solid ${T.goldBorder}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Info size={15} color={T.gold} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: T.yellow, lineHeight: 1.6 }}>
                <strong>Format attendu :</strong> Colonnes requises : <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>nom</code>, <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>email</code>, <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>telephone</code>, <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>ville</code>. Maximum 5 000 lignes par import.
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileSpreadsheet size={20} color={T.green} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{file?.name || "donnees_agents.xlsx"}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{previewRows.length} lignes détectées · {okRows.length} valides · {errRows.length} erreur(s)</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Btn onClick={() => { setFile(null); setStep("upload"); }}>Changer de fichier</Btn>
                <Btn variant="primary" onClick={handleImport} disabled={loading}>
                  {loading ? <><Spinner /> Import en cours...</> : <><Upload size={13} /> Importer {okRows.length} lignes</>}
                </Btn>
              </div>
            </div>
            {loading && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 5 }}>
                  <span>Traitement en cours…</span><span>{progress}%</span>
                </div>
                <div style={{ height: 6, background: T.grayBg, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: T.green, borderRadius: 10, transition: "width 0.1s" }} />
                </div>
              </div>
            )}
          </Card>

          <Card style={{ overflow: "hidden" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
                  {["Ligne", "Nom", "Email", "Téléphone", "Ville", "Statut"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < previewRows.length - 1 ? `1px solid ${T.cardBorder}` : "none", background: row.statut === "erreur" ? T.redBg : "transparent" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.textMuted }}>{row.ligne}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: T.textPrimary }}>{row.nom}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: row.statut === "erreur" ? T.red : T.textSecondary }}>{row.email}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: T.textSecondary, fontFamily: "'DM Mono', monospace" }}>{row.telephone}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: T.textSecondary }}>{row.ville}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {row.statut === "ok"
                        ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.green, fontWeight: 600 }}><CheckCircle2 size={13} /> Valide</span>
                        : <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.red, fontWeight: 600 }}><XCircle size={13} /> {row.erreur}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {step === "result" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.greenBg, border: `2px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={32} color={T.green} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>Import terminé</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Le fichier a été traité avec succès</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 420, margin: "0 auto 24px" }}>
              {[
                { label: "Lignes importées", value: okRows.length, color: T.green, bg: T.greenBg },
                { label: "Lignes ignorées", value: errRows.length, color: T.red, bg: T.redBg },
                { label: "Total traité", value: previewRows.length, color: T.blue, bg: T.blueBg },
              ].map((stat, i) => (
                <div key={i} style={{ padding: "14px 12px", background: stat.bg, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: "'DM Mono', monospace" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={() => setStep("upload")}><RefreshCw size={13} /> Nouvel import</Btn>
              <Btn variant="primary"><Eye size={13} /> Voir les données</Btn>
            </div>
          </Card>

          {errRows.length > 0 && (
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <AlertCircle size={15} color={T.red} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{errRows.length} ligne(s) ignorée(s)</h3>
              </div>
              {errRows.map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.redBg, borderRadius: 8, marginBottom: 6 }}>
                  <XCircle size={13} color={T.red} />
                  <span style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500 }}>Ligne {row.ligne} — {row.nom}</span>
                  <span style={{ fontSize: 12, color: T.red }}>: {row.erreur}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════
export default function Tb_utilisateur_Metier() {
  const [section, setSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTraitement, setSelectedTraitement] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 4px; }
        .slide-in { animation: slideIn 0.22s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .row-hover:hover { background: ${T.grayBg} !important; }
        .table-row-hover:hover td { background: ${T.grayBg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <TopBar onToggle={() => setCollapsed(c => !c)} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar active={section} setActive={setSection} collapsed={collapsed} />
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: T.mainBg }}>
          {section === "dashboard"   && <SectionDashboard setSection={setSection} setSelectedSession={setSelectedSession} />}
          {section === "sessions"    && <SectionSessions setSection={setSection} setSelectedSession={setSelectedSession} />}
          {section === "traitements" && <SectionTraitements selectedSession={selectedSession} setSection={setSection} setSelectedTraitement={setSelectedTraitement} />}
          {section === "donnees"     && <SectionDonnees setSection={setSection} />}
          {section === "import"      && <SectionImport />}
        </main>
      </div>
    </div>
  );
}