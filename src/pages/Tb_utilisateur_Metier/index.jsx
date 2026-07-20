import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  Database, Layers, Plus, FileSpreadsheet, LayoutDashboard,
  ChevronDown, ChevronRight, Eye, Upload, PenLine, X, Check,
  Clock, AlertCircle, Activity, Menu, Bell, LogOut, Search,
  Filter, Download, RefreshCw, Table2, FolderOpen, Cpu,
  BarChart2, Info, Calendar, Hash, Globe, Lock, Unlock,
  ChevronLeft, FileText, Trash2, Edit3, MoreHorizontal,
  ArrowUpRight, CheckCircle2, XCircle, Loader2,
  User, UserPlus, UserCheck, Users, ListPlus, Archive,
  BookOpen, PackageOpen, MoveRight, CheckSquare, Square,
  MessageSquare, AlertTriangle, ClipboardList, Pencil,
  MapPin, ShieldCheck, FileDown, FileSpreadsheet as FileXls
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ═══════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════
const API = "http://localhost:8080";

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const getUsagerIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || null;
  } catch { return null; }
};

// ═══════════════════════════════════════════════════════
//  THÈME
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
  orange: "#EA580C", orangeBg: "#FFF7ED", orangeBorder: "#FED7AA",
  navAccentBg: "rgba(52,168,103,0.12)", navAccentBorder: "rgba(52,168,103,0.3)",
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
    EN_COURS:   { bg: T.blueBg,    color: T.blue,   border: T.blueBorder,   text: label || "En cours" },
    TERMINEE:   { bg: T.greenBg,   color: T.green,  border: T.greenBorder,  text: label || "Terminée" },
    TERMINE:    { bg: T.greenBg,   color: T.green,  border: T.greenBorder,  text: label || "Terminé" },
    ANNULEE:    { bg: T.grayBg,    color: T.gray,   border: T.grayBorder,   text: label || "Annulée" },
    SUSPENDU:   { bg: T.yellowBg,  color: T.yellow, border: T.yellowBorder, text: label || "Suspendu" },
    EN_ATTENTE: { bg: T.yellowBg,  color: T.yellow, border: T.yellowBorder, text: label || "En attente" },
    ACCEPTEE:   { bg: T.greenBg,   color: T.green,  border: T.greenBorder,  text: label || "Acceptée" },
    REJETEE:    { bg: T.redBg,     color: T.red,    border: T.redBorder,    text: label || "Rejetée" },
    sensible:   { bg: T.redBg,     color: T.red,    border: T.redBorder,    text: "Sensible" },
    normal:     { bg: T.greenBg,   color: T.green,  border: T.greenBorder,  text: "Standard" },
    EN_LIGNE:   { bg: T.tealBg,    color: T.teal,   border: T.tealBorder,   text: "En ligne" },
    TERRAIN:    { bg: T.purpleBg,  color: T.purple, border: T.purpleBorder, text: "Terrain" },
    entrepot:   { bg: T.orangeBg,  color: T.orange, border: T.orangeBorder, text: "Entrepôt" },
    MODIFICATION: { bg: T.blueBg,  color: T.blue,   border: T.blueBorder,   text: "Modification" },
    SUPPRESSION:  { bg: T.redBg,   color: T.red,    border: T.redBorder,    text: "Suppression" },
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

const Btn = ({ children, onClick, variant = "outline", style = {}, disabled = false }) => {
  const base = { borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, border: "none", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", ...style };
  if (variant === "primary")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "#1A5C2A", color: "#fff" }}>{children}</button>;
  if (variant === "danger")   return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` }}>{children}</button>;
  if (variant === "success")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` }}>{children}</button>;
  if (variant === "orange")   return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.orangeBg, color: T.orange, border: `1px solid ${T.orangeBorder}` }}>{children}</button>;
  if (variant === "blue")     return <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.blueBg, color: T.blue, border: `1px solid ${T.blueBorder}` }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: T.textSecondary, border: `1px solid ${T.cardBorder}` }}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.03em" }}>{label}{required && <span style={{ color: T.red }}> *</span>}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
  </div>
);

const Spinner = ({ dark = false }) => (
  <span style={{ width: 14, height: 14, border: `2px solid ${dark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.3)"}`, borderTopColor: dark ? "#0D1F12" : "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
);

const EmptyState = ({ icon: Icon, message, action }) => (
  <Card style={{ padding: 48, textAlign: "center" }}>
    <Icon size={36} color={T.textMuted} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
    <p style={{ color: T.textMuted, fontSize: 13 }}>{message}</p>
    {action}
  </Card>
);

const ErrorBanner = ({ message }) => (
  <Card style={{ padding: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.red }}>
      <AlertCircle size={14} /> {message}
    </div>
  </Card>
);

// ═══════════════════════════════════════════════════════
//  EXPORT PDF / EXCEL — utilitaires
// ═══════════════════════════════════════════════════════
const exportEntetePdf = (doc, titre, sousLignes = []) => {
  doc.setFillColor(13, 43, 31);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("SOFITEX — Conformité des données", 14, 10);
  doc.setFontSize(15);
  doc.text(titre, 14, 18);
  doc.setTextColor(30, 30, 30);
  let y = 30;
  sousLignes.forEach(l => { doc.setFontSize(10); doc.text(l, 14, y); y += 6; });
  return y + 2;
};

const exportSessionPdf = (session, traitements) => {
  const doc = new jsPDF();
  const y = exportEntetePdf(doc, session.nomSession || `Session #${session.idSession}`, [
    `Statut : ${session.statutSession || "-"}   |   Type : ${session.typeCollecte || "-"}`,
    `Lieu : ${session.lieu || "-"}   |   DPO : ${session.dpoNomComplet || "-"}`,
    `Période : ${session.dateDebut?.split("T")[0] || "-"} → ${session.dateFin?.split("T")[0] || "en cours"}`,
  ]);
  autoTable(doc, {
    startY: y,
    head: [["#", "Traitement", "Département", "Entrées", "Conservation", "Envoyé DPO"]],
    body: traitements.map(t => [
      t.idTraitement, t.nom || t.description || "-", t.department || "-",
      t.nombreDonnee ?? 0, t.dureeConservation ? `${t.dureeConservation} mois` : "-", t.envoyeAuDpo ? "Oui" : "Non",
    ]),
    styles: { fontSize: 9 }, headStyles: { fillColor: [26, 92, 42] },
  });
  doc.save(`session_${session.idSession}.pdf`);
};

const exportSessionExcel = (session, traitements) => {
  const wb = XLSX.utils.book_new();
  const wsInfo = XLSX.utils.json_to_sheet([{
    Session: session.nomSession || `Session #${session.idSession}`, Statut: session.statutSession,
    Type: session.typeCollecte, Lieu: session.lieu, DPO: session.dpoNomComplet,
    Debut: session.dateDebut?.split("T")[0] || "-", Fin: session.dateFin?.split("T")[0] || "en cours",
  }]);
  XLSX.utils.book_append_sheet(wb, wsInfo, "Session");
  const wsT = XLSX.utils.json_to_sheet(traitements.map(t => ({
    ID: t.idTraitement, Nom: t.nom || t.description || "-", Departement: t.department || "-",
    Entrees: t.nombreDonnee ?? 0, ConservationMois: t.dureeConservation ?? "-", EnvoyeDPO: t.envoyeAuDpo ? "Oui" : "Non",
  })));
  XLSX.utils.book_append_sheet(wb, wsT, "Traitements");
  XLSX.writeFile(wb, `session_${session.idSession}.xlsx`);
};

const exportTraitementPdf = (traitement, donnees) => {
  const doc = new jsPDF();
  const y = exportEntetePdf(doc, traitement.nom || traitement.description || `Traitement #${traitement.idTraitement}`, [
    `Département : ${traitement.department || "-"}   |   Conservation : ${traitement.dureeConservation ? `${traitement.dureeConservation} mois` : "-"}`,
    `Envoyé au DPO : ${traitement.envoyeAuDpo ? "Oui" : "Non"}   |   Nombre de données : ${donnees.length}`,
  ]);
  autoTable(doc, {
    startY: y,
    head: [["#", "Personne", "Type de donnée", "Valeur", "Sensible", "Date"]],
    body: donnees.map(d => [
      d.idDonnee, d.personneNomComplet || d.usagerNomComplet || "-", d.typeDonneeNom || "-",
      d.valeur, d.typeDonneeSensible ? "Oui" : "Non", d.dateCollecte?.split("T")[0] || "-",
    ]),
    styles: { fontSize: 8 }, headStyles: { fillColor: [26, 92, 42] },
  });
  doc.save(`traitement_${traitement.idTraitement}.pdf`);
};

const exportTraitementExcel = (traitement, donnees) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(donnees.map(d => ({
    ID: d.idDonnee, Personne: d.personneNomComplet || d.usagerNomComplet || "-", Type: d.typeDonneeNom || "-",
    Valeur: d.valeur, Sensible: d.typeDonneeSensible ? "Oui" : "Non", Date: d.dateCollecte?.split("T")[0] || "-",
  })));
  XLSX.utils.book_append_sheet(wb, ws, "Données");
  XLSX.writeFile(wb, `traitement_${traitement.idTraitement}.xlsx`);
};

const exportDemandesPdf = (demandes) => {
  const doc = new jsPDF();
  const y = exportEntetePdf(doc, "Demandes citoyens", [`Nombre de demandes : ${demandes.length}`]);
  autoTable(doc, {
    startY: y,
    head: [["#", "Type", "Statut", "Citoyen", "Donnée", "Date"]],
    body: demandes.map(d => [
      d.idDemande, d.typeDemande, d.statutDemande, d.usagerNomComplet || d.personneNomComplet || "-",
      d.donneeValeur || "-", d.dateDemande || "-",
    ]),
    styles: { fontSize: 9 }, headStyles: { fillColor: [26, 92, 42] },
  });
  doc.save(`demandes.pdf`);
};

const exportDemandesExcel = (demandes) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(demandes.map(d => ({
    ID: d.idDemande, Type: d.typeDemande, Statut: d.statutDemande,
    Citoyen: d.usagerNomComplet || d.personneNomComplet || "-", Donnee: d.donneeValeur || "-", Date: d.dateDemande || "-",
  })));
  XLSX.utils.book_append_sheet(wb, ws, "Demandes");
  XLSX.writeFile(wb, `demandes.xlsx`);
};

// ═══════════════════════════════════════════════════════
//  PANNEAU NOTIFICATIONS — bug compteur corrigé
// ═══════════════════════════════════════════════════════
const PanneauNotifications = ({ userId, onClose, onCountChange }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const init = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const data = await apiFetch(`/api/notifications/${userId}`);
        const sorted = [...data].sort((a, b) => b.idNotification - a.idNotification);
        setNotifs(sorted);

        // Marquer comme lues PUIS mettre le compteur à 0
        await apiFetch(`/api/notifications/${userId}/lire-tout`, { method: "PATCH" })
          .catch(() => {});
        onCountChange(0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeColor = {
    ALERTE: T.red, RAPPEL: T.yellow, CONFIRMATION: T.green,
    RELANCE: T.yellow, DEMANDE_MODIFICATION: T.blue,
    DEMANDE_SUPPRESSION: T.red, PLAINTE: T.purple,
  };
  const typeLabel = {
    ALERTE: "Alerte", RAPPEL: "Rappel", CONFIRMATION: "Confirmation",
    RELANCE: "Relance", DEMANDE_MODIFICATION: "Modif.",
    DEMANDE_SUPPRESSION: "Suppression", PLAINTE: "Plainte",
  };

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 10px)", right: 0, width: 380,
      background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 14,
      boxShadow: "0 20px 50px rgba(0,0,0,0.22)", zIndex: 300, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.grayBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} color={T.gold} />
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Notifications</div>
          {notifs.length > 0 && (
            <span style={{ fontSize: 10, background: T.goldLight, color: T.gold, border: `1px solid ${T.goldBorder}`, padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>
              {notifs.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", padding: 4, borderRadius: 6 }}>
          <X size={15} />
        </button>
      </div>
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {loading && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <Spinner dark />
            <div style={{ marginTop: 8, fontSize: 12, color: T.textMuted }}>Chargement…</div>
          </div>
        )}
        {!loading && notifs.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>
            <Bell size={28} color={T.cardBorder} style={{ display: "block", margin: "0 auto 10px" }} />
            Aucune notification
          </div>
        )}
        {!loading && notifs.map((n, i) => {
          const col = typeColor[n.typeNotification] || T.textMuted;
          return (
            <div key={n.idNotification} style={{
              padding: "12px 16px",
              borderBottom: i < notifs.length - 1 ? `1px solid ${T.cardBorder}` : "none",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: `${col}20`, color: col, padding: "1px 6px", borderRadius: 4 }}>
                    {typeLabel[n.typeNotification] || n.typeNotification}
                  </span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{n.dateEnvoi}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>{n.contenu}</div>
                {n.dateEcheance && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Échéance : {n.dateEcheance}</div>}
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
const Sidebar = ({ active, setActive, collapsed, userName, userService, userInitials }) => {
  const navigate = useNavigate();
  const nav = [
    { id: "dashboard",   label: "Tableau de bord",        Icon: LayoutDashboard },
    { id: "sessions",    label: "Sessions de collecte",   Icon: FolderOpen },
    { id: "traitements", label: "Traitements",            Icon: Cpu },
    { id: "donnees",     label: "Données collectées",     Icon: Database },
    { id: "entrepot",    label: "Entrepôt de données",    Icon: Archive },
    { id: "import",      label: "Import fichier",         Icon: Upload },
    { id: "demandes",    label: "Demandes citoyens",      Icon: ClipboardList },
  ];

  return (
    <aside style={{ width: collapsed ? 64 : 220, flexShrink: 0, background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={userInitials} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
              <div style={{ fontSize: 10, color: T.sidebarText, marginTop: 1 }}>{userService}</div>
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
          <button
            onClick={() => { localStorage.removeItem("token"); toast.success("Déconnecté avec succès !"); navigate("/"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", borderRadius: 8, padding: "9px 10px", color: "#EF4444", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
//  LOGO SOFITEX
// ═══════════════════════════════════════════════════════
const LogoMark = ({ size = 30 }) => (
  <div style={{
    width: size, height: size, borderRadius: 8, flexShrink: 0,
    background: "linear-gradient(135deg, #1A5C2A 0%, #0D2B1F 100%)",
    border: `1px solid ${T.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
  }}>
    <ShieldCheck size={size * 0.6} color={T.gold} strokeWidth={2} />
  </div>
);

// ═══════════════════════════════════════════════════════
//  TOPBAR — sans rectangle utilisateur, cloche corrigée
// ═══════════════════════════════════════════════════════
const TopBar = ({ onToggle, userId }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    // Charger le compteur de non-lues au montage
    apiFetch(`/api/notifications/${userId}/non-lues`)
      .then(data => setUnreadCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, [userId]);

  const handleBellClick = () => {
    setShowNotifs(v => !v);
  };

  return (
    <header style={{ height: 56, background: T.sidebarBg, borderBottom: `1px solid ${T.sidebarBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onToggle} style={{ background: "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
          <Menu size={18} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", letterSpacing: "0.04em" }}>
            SOFITEX — Espace Utilisateur Métier
          </div>
        </div>
      </div>

      {/* Cloche uniquement, sans rectangle utilisateur */}
      <div style={{ position: "relative" }}>
        <button
          onClick={handleBellClick}
          style={{ background: showNotifs ? "rgba(52,168,103,0.15)" : "transparent", border: "none", color: T.sidebarText, cursor: "pointer", padding: 7, borderRadius: 7, display: "flex", position: "relative" }}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 3, right: 3,
              minWidth: 16, height: 16, padding: "0 3px",
              background: T.red, borderRadius: 10,
              fontSize: 9, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${T.sidebarBg}`,
            }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        {showNotifs && (
          <PanneauNotifications
            userId={userId}
            onClose={() => setShowNotifs(false)}
            onCountChange={setUnreadCount}
          />
        )}
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TABLEAU DE BORD
// ═══════════════════════════════════════════════════════
const SectionDashboard = ({ setSection, setSelectedSession, userId, userName }) => {
  const [sessions,    setSessions]    = useState([]);
  const [traitements, setTraitements] = useState([]);
  const [entrepot,    setEntrepot]    = useState([]);
  const [demandes,    setDemandes]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const allSessions = await apiFetch("/api/sessions");
        setSessions(allSessions);
        if (userId) {
          const t = await apiFetch(`/api/traitements/utilisateur-metier/${userId}`);
          setTraitements(t);
          const d = await apiFetch(`/api/demandes/en-attente?umId=${userId}`);
          setDemandes(d);
        }
        const e = await apiFetch("/api/entrepot");
        setEntrepot(e);
      } catch { /* silencieux */ }
      finally { setLoading(false); }
    };
    load();
  }, [userId]);

  const sessionsActives = sessions.filter(s => s.statutSession === "EN_COURS");
  const totalDonnees    = traitements.reduce((acc, t) => acc + (t.nombreDonnee || 0), 0);

  const stats = [
    { label: "Sessions actives",    value: sessionsActives.length,         sub: "en cours",                    color: T.blue,   bg: T.blueBg,   border: T.blueBorder,   Icon: FolderOpen,    action: null },
    { label: "Mes traitements",     value: traitements.length,             sub: "tous statuts",                color: T.teal,   bg: T.tealBg,   border: T.tealBorder,   Icon: Cpu,           action: null },
    { label: "Données collectées",  value: totalDonnees.toLocaleString("fr"), sub: "rattachées à un traitement", color: T.green, bg: T.greenBg, border: T.greenBorder,  Icon: Database,      action: null },
    { label: "Entrepôt",            value: entrepot.length,                sub: "en attente d'affectation",   color: T.orange, bg: T.orangeBg, border: T.orangeBorder, Icon: Archive,       action: "entrepot" },
    { label: "Demandes en attente", value: demandes.length,                sub: "modifications / suppressions",color: T.red,   bg: T.redBg,   border: T.redBorder,    Icon: ClipboardList, action: "demandes" },
  ];

  const prenomUser = userName?.split(" ")[0] || "Utilisateur";

  return (
    <div className="slide-in">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bonjour ${prenomUser} — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ padding: "16px 18px", position: "relative", overflow: "hidden", cursor: s.action ? "pointer" : "default" }}
            onClick={() => s.action && setSection(s.action)}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "12px 12px 0 0" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                <s.Icon size={17} strokeWidth={1.8} />
              </div>
              {s.action && <ArrowUpRight size={13} color={s.color} style={{ opacity: 0.4, marginTop: 4 }} />}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 3 }}>{s.label}</div>
            {loading
              ? <div style={{ height: 24, width: 50, background: T.grayBg, borderRadius: 6, marginBottom: 3 }} />
              : <div style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
            }
            <div style={{ fontSize: 10, color: s.color, marginTop: 4, fontWeight: 500 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FolderOpen size={15} color={T.textSecondary} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Sessions actives</h3>
            </div>
            <button onClick={() => setSection("sessions")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          {loading
            ? <div style={{ padding: 24, textAlign: "center" }}><Spinner dark /></div>
            : sessionsActives.length === 0
              ? <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucune session active</div>
              : sessionsActives.slice(0, 4).map((s, i, arr) => (
                <div key={s.idSession} onClick={() => { setSelectedSession(String(s.idSession)); setSection("traitements"); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.cardBorder}` : "none", cursor: "pointer" }}
                  className="row-hover">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nomSession || `Session #${s.idSession}`}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.lieu || "—"} · {s.nombreTraitements} traitement(s)</div>
                  </div>
                  <Badge type={s.typeCollecte} />
                </div>
              ))
          }
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ClipboardList size={15} color={T.red} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Demandes en attente</h3>
              {demandes.length > 0 && <span style={{ fontSize: 10, background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}`, padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>{demandes.length}</span>}
            </div>
            <button onClick={() => setSection("demandes")} style={{ fontSize: 12, color: T.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Traiter →</button>
          </div>
          {loading
            ? <div style={{ padding: 24, textAlign: "center" }}><Spinner dark /></div>
            : demandes.length === 0
              ? <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucune demande en attente</div>
              : demandes.slice(0, 4).map((d, i, arr) => (
                <div key={d.idDemande} onClick={() => setSection("demandes")}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.cardBorder}` : "none", cursor: "pointer" }}
                  className="row-hover">
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: d.typeDemande === "SUPPRESSION" ? T.redBg : T.blueBg, border: `1px solid ${d.typeDemande === "SUPPRESSION" ? T.redBorder : T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {d.typeDemande === "SUPPRESSION" ? <Trash2 size={13} color={T.red} /> : <Pencil size={13} color={T.blue} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.usagerNomComplet || d.personneNomComplet || "—"}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{d.typeDemande} · {d.donneeValeur}</div>
                  </div>
                  <Badge type={d.typeDemande} />
                </div>
              ))
          }
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : SESSIONS DE COLLECTE — cards distinctes (accent latéral + icônes rondes)
// ═══════════════════════════════════════════════════════
const SectionSessions = ({ setSection, setSelectedSession }) => {
  const [sessions, setSessions] = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try { setSessions(await apiFetch("/api/sessions")); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = filter === "all" ? sessions : sessions.filter(s => s.statutSession === filter);

  const statutInfo = {
    EN_COURS: { color: T.blue,  bg: T.blueBg,  border: T.blueBorder },
    TERMINEE: { color: T.green, bg: T.greenBg, border: T.greenBorder },
    ANNULEE:  { color: T.gray,  bg: T.grayBg,  border: T.grayBorder },
  };

  const typeIcon = { EN_LIGNE: Globe, TERRAIN: MapPin, entrepot: Archive };

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

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><Spinner dark /><p style={{ color: T.textMuted, fontSize: 13, marginTop: 12 }}>Chargement des sessions…</p></Card>}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
          {filtered.map(s => {
            const si = statutInfo[s.statutSession] || statutInfo.ANNULEE;
            const TypeIcon = typeIcon[s.typeCollecte] || FolderOpen;
            return (
              <Card key={s.idSession} style={{ padding: 0, overflow: "hidden", display: "flex" }}>
                {/* Accent latéral — différencie visuellement des cartes "traitement" */}
                <div style={{ width: 5, flexShrink: 0, background: si.color }} />
                <div style={{ padding: "18px 20px", flex: 1, minWidth: 0 }}>
                  {/* En-tête de la card */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: si.bg, border: `1.5px solid ${si.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <TypeIcon size={19} color={si.color} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.nomSession || `Session #${s.idSession}`}
                        </div>
                        <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>#{s.idSession}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                        <Badge type={s.statutSession} />
                        {s.typeCollecte && <Badge type={s.typeCollecte} />}
                      </div>
                    </div>
                  </div>

                  {/* Bandeau de stats — pilules horizontales (distinct de la grille 2x2 des traitements) */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[
                      { label: "Lieu",         value: s.lieu || "—" },
                      { label: "DPO",          value: s.dpoNomComplet || "—" },
                      { label: "Traitements",  value: `${s.nombreTraitements ?? 0}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ flex: 1, padding: "8px 10px", background: T.grayBg, borderRadius: 9, textAlign: "center", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                        <div style={{ fontSize: 9.5, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {s.description && (
                    <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 14, lineHeight: 1.6, padding: "8px 12px", background: `${si.color}08`, borderRadius: 8, borderLeft: `3px solid ${si.color}` }}>
                      {s.description}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 12 }}>
                    <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "'DM Mono', monospace", alignSelf: "center" }}>{s.dateDebut?.split("T")[0] || ""}</span>
                    <div style={{ flex: 1 }} />
                    <Btn onClick={() => exportSessionPdf(s, [])} style={{ fontSize: 11, padding: "5px 10px" }} title="Export PDF"><FileDown size={12} /> PDF</Btn>
                    <Btn onClick={() => exportSessionExcel(s, [])} style={{ fontSize: 11, padding: "5px 10px" }} title="Export Excel"><FileXls size={12} /> Excel</Btn>
                    {s.statutSession !== "ANNULEE" ? (
                      <Btn variant="success" onClick={() => { setSelectedSession(String(s.idSession)); setSection("traitements"); }} style={{ fontSize: 11, padding: "5px 12px" }}>
                        <Eye size={12} /> Traitements
                      </Btn>
                    ) : (
                      <span style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic", alignSelf: "center" }}>Annulée</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState icon={FolderOpen} message="Aucune session pour ce filtre." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  MODALE : CRÉER/MODIFIER TRAITEMENT (wizard 7 étapes)
// ═══════════════════════════════════════════════════════
const WIZARD_STEPS = [
  { id: 1, label: "Identification",      Icon: FileText },
  { id: 2, label: "Personnes & données", Icon: Database },
  { id: 3, label: "Responsable",         Icon: PenLine },
  { id: 4, label: "Conservation",        Icon: Clock },
  { id: 5, label: "Sécurité",            Icon: Lock },
  { id: 6, label: "Entreprise",          Icon: Globe },
  { id: 7, label: "Récapitulatif",       Icon: CheckCircle2 },
];

const wizardInitialForm = {
  nom: "", description: "", denominationTraitement: "", finaliteTraitement: "", typeTraitement: "",
  categoriesPersonnesConcernees: "", nombrePersonnesConcernees: "", categoriesDonnees: "", origineDonnees: "",
  nomPrenomResponsable: "", fonctionResponsable: "", contactConfidentialite: "", natureDemande: "PREMIERE", department: "",
  dureeConservation: "", dureeConservationDeclaration: "", lieuStockage: "", dateMiseEnOeuvre: "", secteur: "",
  transfertEtranger: false, sousTraitance: false, communicationTiers: false, destinataireConformeCil: false,
  mesuresSensibilisation: false, politiqueAccesBatiments: false, mesuresSecurite: "", categoriesPersonnesAcces: "", certificationSecurite: "",
  nomRaisonSociale: "", rccm: "", secteurActivite: "", adresse: "", boitePostale: "", ville: "", telephone: "", adresseEmail: "", activitePrincipale: "",
  texte: "",
};

const WizField = ({ label, value, onChange, type = "text", placeholder, required, full }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: full ? "1 / -1" : "auto" }}>
    <label style={{ fontSize: 11.5, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.02em" }}>
      {label}{required && <span style={{ color: T.red }}> *</span>}
    </label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 12.5, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", width: "100%" }} />
  </div>
);

const WizTextArea = ({ label, value, onChange, placeholder, required, rows = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1 / -1" }}>
    <label style={{ fontSize: 11.5, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.02em" }}>
      {label}{required && <span style={{ color: T.red }}> *</span>}
    </label>
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 12.5, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", width: "100%", resize: "none" }} />
  </div>
);

const WizSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11.5, fontWeight: 600, color: T.textSecondary, letterSpacing: "0.02em" }}>{label}</label>
    <select value={value} onChange={onChange}
      style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 12.5, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", width: "100%", cursor: "pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const WizToggle = ({ label, hint, checked, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", background: T.grayBg, borderRadius: 9, border: `1px solid ${T.cardBorder}` }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{label}</div>
      {hint && <div style={{ fontSize: 10.5, color: T.textMuted, marginTop: 1 }}>{hint}</div>}
    </div>
    <button type="button" onClick={() => onChange(!checked)}
      style={{ width: 38, height: 21, borderRadius: 20, border: "none", background: checked ? T.green : "#D7DCE2", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0, padding: 0 }}>
      <span style={{ position: "absolute", top: 2, left: checked ? 19 : 2, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
    </button>
  </div>
);

const RecapRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
    <span style={{ fontSize: 11.5, color: T.textMuted, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
  </div>
);

const StepIntro = ({ title, subtitle }) => (
  <div>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 3 }}>{title}</h3>
    <p style={{ fontSize: 12, color: T.textMuted }}>{subtitle}</p>
  </div>
);

const ModalCreerTraitement = ({ sessionId, userId, onClose, onSave, traitementExistant = null }) => {
  const isEdit = !!traitementExistant;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(traitementExistant ? {
    ...wizardInitialForm,
    nom: traitementExistant.nom || "",
    description: traitementExistant.description || "",
    department: traitementExistant.department || "",
    texte: traitementExistant.texte || "",
    certificationSecurite: traitementExistant.certificationSecurite || "",
    dureeConservation: traitementExistant.dureeConservation ? String(traitementExistant.dureeConservation) : "",
  } : wizardInitialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalSteps = WIZARD_STEPS.length;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const step1Valid = form.description.trim() && form.denominationTraitement.trim();
  const goNext = () => { if (step === 1 && !isEdit && !step1Valid) { setError("La description et la dénomination sont obligatoires."); return; } setError(""); setStep(s => Math.min(s + 1, totalSteps)); };
  const goBack = () => { setError(""); setStep(s => Math.max(s - 1, 1)); };
  const goToStep = (n) => { setError(""); setStep(n); };

  const handleSave = async () => {
    setLoading(true); setError("");
    try {
      if (isEdit) {
        // Mode modification — PUT simple
        const payload = {
          nom: form.nom.trim() || form.description.trim(),
          description: form.description.trim(),
          department: form.department.trim() || null,
          texte: form.texte.trim() || null,
          certificationSecurite: form.certificationSecurite.trim() || null,
          dureeConservation: form.dureeConservation ? parseInt(form.dureeConservation, 10) : null,
          utilisateurMetierId: parseInt(userId, 10),
          sessionCollecteId: sessionId ? parseInt(sessionId, 10) : null,
        };
        const updated = await apiFetch(`/api/traitements/${traitementExistant.idTraitement}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        onSave(updated); onClose(); toast.success("Traitement modifié avec succès !");
      } else {
        // Mode création
        if (!step1Valid) { setError("La description et la dénomination sont obligatoires."); setStep(1); setLoading(false); return; }
        if (!userId) { setError("Identifiant utilisateur manquant. Reconnectez-vous."); setLoading(false); return; }
        const traitementPayload = {
          nom: form.nom.trim() || form.description.trim(), description: form.description.trim(),
          department: form.department.trim() || null, texte: form.texte.trim() || null,
          certificationSecurite: form.certificationSecurite.trim() || null,
          dureeConservation: form.dureeConservation ? parseInt(form.dureeConservation, 10) : null,
          utilisateurMetierId: parseInt(userId, 10),
          sessionCollecteId: sessionId ? parseInt(sessionId, 10) : null,
          secteur: form.secteur.trim() || null, lieuStockage: form.lieuStockage.trim() || null,
          dureeConservationDeclaration: form.dureeConservationDeclaration.trim() || null,
          dateMiseEnOeuvre: form.dateMiseEnOeuvre || null,
          transfertEtranger: form.transfertEtranger, sousTraitance: form.sousTraitance,
          communicationTiers: form.communicationTiers,
          nomPrenomResponsable: form.nomPrenomResponsable.trim() || null,
          fonctionResponsable: form.fonctionResponsable.trim() || null,
          contactConfidentialite: form.contactConfidentialite.trim() || null,
          natureDemande: form.natureDemande || null,
          categoriesDonnees: form.categoriesDonnees.trim() || null,
          origineDonnees: form.origineDonnees.trim() || null,
          destinataireConformeCil: form.destinataireConformeCil,
          mesuresSecurite: form.mesuresSecurite.trim() || null,
          mesuresSensibilisation: form.mesuresSensibilisation,
          politiqueAccesBatiments: form.politiqueAccesBatiments,
          categoriesPersonnesAcces: form.categoriesPersonnesAcces.trim() || null,
          denominationTraitement: form.denominationTraitement.trim(),
          finaliteTraitement: form.finaliteTraitement.trim() || null,
          categoriesPersonnesConcernees: form.categoriesPersonnesConcernees.trim() || null,
          nombrePersonnesConcernees: form.nombrePersonnesConcernees ? parseInt(form.nombrePersonnesConcernees, 10) : null,
          typeTraitement: form.typeTraitement.trim() || null,
          nomRaisonSociale: form.nomRaisonSociale.trim() || null, rccm: form.rccm.trim() || null,
          secteurActivite: form.secteurActivite.trim() || null, adresse: form.adresse.trim() || null,
          boitePostale: form.boitePostale.trim() || null, ville: form.ville.trim() || null,
          telephone: form.telephone.trim() || null, adresseEmail: form.adresseEmail.trim() || null,
          activitePrincipale: form.activitePrincipale.trim() || null,
        };
        const declarationPayload = { traitementId: null };
        const formData = new FormData();
        formData.append("traitement", new Blob([JSON.stringify(traitementPayload)], { type: "application/json" }));
        formData.append("declaration", new Blob([JSON.stringify(declarationPayload)], { type: "application/json" }));
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/traitements/normale`, {
          method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData,
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Erreur ${res.status}`); }
        const data = await res.json();
        onSave(data); onClose(); toast.success("Traitement créé avec succès !");
      }
    } catch (e) { setError(e.message || "Erreur lors de la sauvegarde."); }
    finally { setLoading(false); }
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(8,15,11,0.55)", zIndex: 900, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 680, maxWidth: "92vw", height: isEdit ? 420 : 600, maxHeight: "90vh", background: T.cardBg, borderRadius: 18, boxShadow: "0 30px 70px rgba(0,0,0,0.28)", border: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${T.cardBorder}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isEdit ? 0 : 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: isEdit ? T.orangeBg : T.blueBg, border: `1px solid ${isEdit ? T.orangeBorder : T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {isEdit ? <Pencil size={17} color={T.orange} /> : <Plus size={17} color={T.blue} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                {isEdit ? "Modifier le traitement" : "Nouveau traitement"}
              </div>
              {!isEdit && <div style={{ fontSize: 11.5, color: T.textMuted }}>{sessionId ? `Session #${sessionId}` : "Sans session"} · Étape {step}/{totalSteps} — {WIZARD_STEPS[step - 1].label}</div>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 4 }}><X size={18} /></button>
          </div>
          {!isEdit && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {WIZARD_STEPS.map((s, i) => {
                const done = s.id < step; const active = s.id === step;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < WIZARD_STEPS.length - 1 ? 1 : "0 0 auto" }}>
                    <div onClick={() => goToStep(s.id)} title={s.label}
                      style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? T.green : active ? "#1A5C2A" : T.grayBg, border: `1.5px solid ${done ? T.green : active ? "#1A5C2A" : T.cardBorder}`, cursor: "pointer", transition: "all 0.18s" }}>
                      {done ? <Check size={13} color="#fff" /> : <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : T.textMuted }}>{s.id}</span>}
                    </div>
                    {i < WIZARD_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? T.green : T.cardBorder, margin: "0 4px", borderRadius: 2, transition: "background 0.25s" }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isEdit ? (
          // Mode modification simplifié
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <WizField label="Nom" value={form.nom} onChange={e => upd("nom", e.target.value)} placeholder="Nom du traitement" full />
              <WizTextArea label="Description" value={form.description} onChange={e => upd("description", e.target.value)} placeholder="Description" required rows={2} />
              <WizField label="Département" value={form.department} onChange={e => upd("department", e.target.value)} placeholder="Direction des RH..." />
              <WizField label="Durée conservation (mois)" type="number" value={form.dureeConservation} onChange={e => upd("dureeConservation", e.target.value)} placeholder="24" />
              <WizField label="Certification sécurité" value={form.certificationSecurite} onChange={e => upd("certificationSecurite", e.target.value)} placeholder="ISO 27001" />
              <WizTextArea label="Notes" value={form.texte} onChange={e => upd("texte", e.target.value)} placeholder="Informations complémentaires..." rows={2} />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{ display: "flex", height: "100%", width: `${totalSteps * 100}%`, transform: `translateX(-${(step - 1) * (100 / totalSteps)}%)`, transition: "transform 0.35s cubic-bezier(.4,0,.2,1)" }}>
              {/* Étape 1 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Identification du traitement" subtitle="Décrivez l'objet de ce traitement de données." />
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <WizField label="Nom du traitement" value={form.nom} onChange={e => upd("nom", e.target.value)} placeholder="Ex: Identification des agents" />
                  <WizTextArea label="Description" value={form.description} onChange={e => upd("description", e.target.value)} placeholder="Objectif et périmètre du traitement" required rows={3} />
                  <div style={grid2}>
                    <WizField label="Dénomination du traitement" value={form.denominationTraitement} onChange={e => upd("denominationTraitement", e.target.value)} placeholder="Ex: Gestion des ressources humaines" required />
                    <WizField label="Type de traitement" value={form.typeTraitement} onChange={e => upd("typeTraitement", e.target.value)} placeholder="Ex: Automatisé, Manuel..." />
                  </div>
                  <WizTextArea label="Finalité du traitement" value={form.finaliteTraitement} onChange={e => upd("finaliteTraitement", e.target.value)} placeholder="Ex: Gestion de la paie et des congés" rows={2} />
                </div>
              </div>
              {/* Étape 2 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Personnes & données concernées" subtitle="Qui est concerné et quelles données sont collectées ?" />
                <div style={{ ...grid2, marginTop: 16 }}>
                  <WizField label="Catégories de personnes concernées" value={form.categoriesPersonnesConcernees} onChange={e => upd("categoriesPersonnesConcernees", e.target.value)} placeholder="Ex: Agents, Prestataires..." />
                  <WizField label="Nombre de personnes concernées" type="number" value={form.nombrePersonnesConcernees} onChange={e => upd("nombrePersonnesConcernees", e.target.value)} placeholder="Ex: 500" />
                  <WizField label="Catégories de données" value={form.categoriesDonnees} onChange={e => upd("categoriesDonnees", e.target.value)} placeholder="Ex: Identité, contact, RH..." />
                  <WizField label="Origine des données" value={form.origineDonnees} onChange={e => upd("origineDonnees", e.target.value)} placeholder="Ex: Collecte directe, formulaire..." />
                </div>
              </div>
              {/* Étape 3 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Responsable du traitement" subtitle="Qui est responsable et quel est le contexte de la demande ?" />
                <div style={{ ...grid2, marginTop: 16 }}>
                  <WizField label="Nom et prénom du responsable" value={form.nomPrenomResponsable} onChange={e => upd("nomPrenomResponsable", e.target.value)} placeholder="Ex: Marc Nacanabo" />
                  <WizField label="Fonction du responsable" value={form.fonctionResponsable} onChange={e => upd("fonctionResponsable", e.target.value)} placeholder="Ex: Chef de service RH" />
                  <WizField label="Contact (confidentialité)" value={form.contactConfidentialite} onChange={e => upd("contactConfidentialite", e.target.value)} placeholder="Email ou téléphone" />
                  <WizSelect label="Nature de la demande" value={form.natureDemande} onChange={e => upd("natureDemande", e.target.value)} options={[
                    { value: "PREMIERE", label: "Première déclaration" },
                    { value: "MODIFICATION", label: "Modification" },
                    { value: "SUPPRESSION", label: "Suppression" },
                  ]} />
                  <WizField label="Département / Service" value={form.department} onChange={e => upd("department", e.target.value)} placeholder="Ex: Direction des Ressources Humaines" full />
                </div>
              </div>
              {/* Étape 4 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Conservation & mise en œuvre" subtitle="Durée de conservation et modalités pratiques." />
                <div style={{ ...grid2, marginTop: 16 }}>
                  <WizField label="Durée conservation (mois)" type="number" value={form.dureeConservation} onChange={e => upd("dureeConservation", e.target.value)} placeholder="Ex: 24" />
                  <WizField label="Durée conservation (déclaration)" value={form.dureeConservationDeclaration} onChange={e => upd("dureeConservationDeclaration", e.target.value)} placeholder="Ex: 24 mois" />
                  <WizField label="Lieu de stockage" value={form.lieuStockage} onChange={e => upd("lieuStockage", e.target.value)} placeholder="Ex: Serveur SOFITEX Bobo-Dioulasso" />
                  <WizField label="Date de mise en œuvre" type="date" value={form.dateMiseEnOeuvre} onChange={e => upd("dateMiseEnOeuvre", e.target.value)} />
                  <WizField label="Secteur" value={form.secteur} onChange={e => upd("secteur", e.target.value)} placeholder="Ex: Privé, Public, Parapublic" full />
                </div>
              </div>
              {/* Étape 5 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Sécurité & transferts" subtitle="Mesures de sécurité et flux de données vers des tiers." />
                <div style={{ ...grid2, marginTop: 16, marginBottom: 14 }}>
                  <WizToggle label="Transfert à l'étranger" hint="Données transférées hors du pays" checked={form.transfertEtranger} onChange={v => upd("transfertEtranger", v)} />
                  <WizToggle label="Recours à un sous-traitant" hint="Traitement délégué à un tiers" checked={form.sousTraitance} onChange={v => upd("sousTraitance", v)} />
                  <WizToggle label="Communication à des tiers" hint="Partage avec d'autres organismes" checked={form.communicationTiers} onChange={v => upd("communicationTiers", v)} />
                  <WizToggle label="Destinataire conforme CIL" hint="Conformité du destinataire validée" checked={form.destinataireConformeCil} onChange={v => upd("destinataireConformeCil", v)} />
                  <WizToggle label="Sensibilisation du personnel" hint="Mesures de sensibilisation en place" checked={form.mesuresSensibilisation} onChange={v => upd("mesuresSensibilisation", v)} />
                  <WizToggle label="Politique d'accès aux bâtiments" hint="Accès physique réglementé" checked={form.politiqueAccesBatiments} onChange={v => upd("politiqueAccesBatiments", v)} />
                </div>
                <div style={grid2}>
                  <WizField label="Certification sécurité" value={form.certificationSecurite} onChange={e => upd("certificationSecurite", e.target.value)} placeholder="Ex: ISO 27001" />
                  <WizField label="Catégories de personnes ayant accès" value={form.categoriesPersonnesAcces} onChange={e => upd("categoriesPersonnesAcces", e.target.value)} placeholder="Ex: Admins RH, IT" />
                  <WizTextArea label="Mesures de sécurité" value={form.mesuresSecurite} onChange={e => upd("mesuresSecurite", e.target.value)} placeholder="Ex: Chiffrement, contrôle d'accès, sauvegardes..." rows={2} />
                </div>
              </div>
              {/* Étape 6 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Entreprise responsable" subtitle="Informations légales — optionnel." />
                <div style={{ ...grid3, marginTop: 16 }}>
                  <WizField label="Nom / Raison sociale" value={form.nomRaisonSociale} onChange={e => upd("nomRaisonSociale", e.target.value)} placeholder="SOFITEX" />
                  <WizField label="RCCM" value={form.rccm} onChange={e => upd("rccm", e.target.value)} placeholder="Ex: BF-BOB-..." />
                  <WizField label="Secteur d'activité" value={form.secteurActivite} onChange={e => upd("secteurActivite", e.target.value)} placeholder="Ex: Textile" />
                  <WizField label="Adresse" value={form.adresse} onChange={e => upd("adresse", e.target.value)} placeholder="Adresse du siège" />
                  <WizField label="Boîte postale" value={form.boitePostale} onChange={e => upd("boitePostale", e.target.value)} placeholder="Ex: 01 BP 100" />
                  <WizField label="Ville" value={form.ville} onChange={e => upd("ville", e.target.value)} placeholder="Ex: Bobo-Dioulasso" />
                  <WizField label="Téléphone" value={form.telephone} onChange={e => upd("telephone", e.target.value)} placeholder="+226 70 00 00 00" />
                  <WizField label="Adresse e-mail" type="email" value={form.adresseEmail} onChange={e => upd("adresseEmail", e.target.value)} placeholder="contact@sofitex.bf" />
                  <WizField label="Activité principale" value={form.activitePrincipale} onChange={e => upd("activitePrincipale", e.target.value)} placeholder="Ex: Égrenage du coton" />
                </div>
              </div>
              {/* Étape 7 */}
              <div style={{ width: `${100 / totalSteps}%`, padding: "20px 24px", overflowY: "auto" }}>
                <StepIntro title="Récapitulatif" subtitle="Vérifiez les informations avant de créer le traitement." />
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Card style={{ padding: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Identification</div>
                    <RecapRow label="Dénomination" value={form.denominationTraitement} />
                    <RecapRow label="Finalité" value={form.finaliteTraitement} />
                    <RecapRow label="Type" value={form.typeTraitement} />
                    <RecapRow label="Personnes concernées" value={form.categoriesPersonnesConcernees} />
                  </Card>
                  <Card style={{ padding: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Responsable & conservation</div>
                    <RecapRow label="Responsable" value={form.nomPrenomResponsable} />
                    <RecapRow label="Conservation" value={form.dureeConservation ? `${form.dureeConservation} mois` : ""} />
                    <RecapRow label="Lieu de stockage" value={form.lieuStockage} />
                    <RecapRow label="Nature de la demande" value={form.natureDemande} />
                  </Card>
                </div>
                <div style={{ marginTop: 14 }}>
                  <WizTextArea label="Notes complémentaires" value={form.texte} onChange={e => upd("texte", e.target.value)} placeholder="Informations additionnelles (optionnel)" rows={3} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: "14px 24px 18px", borderTop: `1px solid ${T.cardBorder}`, flexShrink: 0 }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, color: T.red, marginBottom: 12 }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Btn onClick={step === 1 || isEdit ? onClose : goBack}>
              {step === 1 || isEdit ? "Annuler" : <><ChevronLeft size={13} /> Précédent</>}
            </Btn>
            {!isEdit && step < totalSteps
              ? <Btn variant="primary" onClick={goNext}>Suivant <ChevronRight size={13} /></Btn>
              : <Btn variant="primary" onClick={handleSave} disabled={loading}>
                  {loading ? <><Spinner /> Sauvegarde...</> : <><Check size={13} /> {isEdit ? "Enregistrer" : "Créer le traitement"}</>}
                </Btn>
            }
          </div>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : TRAITEMENTS (avec bouton modifier + export PDF/Excel)
// ═══════════════════════════════════════════════════════
const SectionTraitements = ({ selectedSession, setSection, setSelectedTraitement, userId }) => {
  const [showModal,       setShowModal]       = useState(false);
  const [traitementEdit,  setTraitementEdit]  = useState(null);
  const [traitements,     setTraitements]     = useState([]);
  const [session,         setSession]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [exportingId,     setExportingId]     = useState(null);

  useEffect(() => {
    if (!selectedSession) return;
    const load = async () => {
      setLoading(true); setError("");
      try {
        const s = await apiFetch(`/api/sessions/${selectedSession}`);
        setSession(s);
        const t = await apiFetch(`/api/traitements/session/${selectedSession}`);
        setTraitements(t);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedSession]);

  const handleSave = (t) => {
    if (traitementEdit) {
      setTraitements(prev => prev.map(x => x.idTraitement === t.idTraitement ? t : x));
    } else {
      setTraitements(prev => [t, ...prev]);
    }
    setTraitementEdit(null);
  };

  const handleEnvoyerDpo = async (traitementId) => {
    try {
      const updated = await apiFetch(`/api/traitements/${traitementId}/envoyer-dpo`, { method: "PATCH" });
      setTraitements(prev => prev.map(t => t.idTraitement === traitementId ? updated : t));
      toast.success("Traitement envoyé au DPO !");
    } catch (e) { toast.error(e.message || "Erreur"); }
  };

  const handleExportTraitement = async (t, format) => {
    setExportingId(`${t.idTraitement}-${format}`);
    try {
      const donnees = await apiFetch(`/api/donnees/par-traitement?traitementId=${t.idTraitement}`);
      if (format === "pdf") exportTraitementPdf(t, donnees);
      else exportTraitementExcel(t, donnees);
    } catch (e) { toast.error(e.message || "Erreur lors de l'export"); }
    finally { setExportingId(null); }
  };

  if (!selectedSession) return (
    <div className="slide-in">
      <PageHeader title="Traitements" subtitle="Sélectionnez une session">
        <Btn onClick={() => setSection("sessions")}><ChevronLeft size={13} /> Retour</Btn>
      </PageHeader>
      <EmptyState icon={FolderOpen} message="Aucune session sélectionnée." />
    </div>
  );

  const sessionCloturee = session && session.statutSession !== "EN_COURS";

  return (
    <div className="slide-in">
      {(showModal || traitementEdit) && (
        <ModalCreerTraitement
          sessionId={selectedSession}
          userId={userId}
          onClose={() => { setShowModal(false); setTraitementEdit(null); }}
          onSave={handleSave}
          traitementExistant={traitementEdit}
        />
      )}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setSection("sessions")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <ChevronLeft size={13} /> Retour aux sessions
        </button>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em" }}>
              {session ? (session.nomSession || `Session #${session.idSession}`) : `Session #${selectedSession}`}
            </h1>
            {session && (
              <div style={{ display: "flex", gap: 12, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                <Badge type={session.statutSession} />
                <Badge type={session.typeCollecte} />
                <span style={{ fontSize: 12, color: T.textMuted }}>{session.lieu} · {session.dateDebut?.split("T")[0]}{session.dateFin ? ` → ${session.dateFin.split("T")[0]}` : ""}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {session && (
              <>
                <Btn onClick={() => exportSessionPdf(session, traitements)}><FileDown size={13} /> Export PDF</Btn>
                <Btn onClick={() => exportSessionExcel(session, traitements)}><FileXls size={13} /> Export Excel</Btn>
              </>
            )}
            {session?.statutSession === "EN_COURS" && (
              <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={13} /> Nouveau traitement</Btn>
            )}
          </div>
        </div>
      </div>

      {sessionCloturee && (
        <Card style={{ padding: "10px 16px", marginBottom: 16, background: T.yellowBg, border: `1px solid ${T.yellowBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.yellow }}>
            <Lock size={14} /> Cette session est clôturée ({session?.statutSession}) — les traitements ne peuvent plus être modifiés ni recevoir de nouvelles données.
          </div>
        </Card>
      )}

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><Spinner dark /></Card>}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && traitements.length === 0 && (
        <EmptyState icon={Cpu} message="Aucun traitement pour cette session."
          action={session?.statutSession === "EN_COURS" && (
            <Btn variant="primary" onClick={() => setShowModal(true)} style={{ margin: "16px auto 0" }}>
              <Plus size={13} /> Créer le premier traitement
            </Btn>
          )}
        />
      )}
      {!loading && !error && traitements.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
          {traitements.map(t => {
            const peutModifier = !t.envoyeAuDpo && !sessionCloturee;
            return (
              <Card key={t.idTraitement} style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Cpu size={18} color={T.blue} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t.nom || t.description || "—"}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>#{t.idTraitement} · {t.department || "Aucun dpt"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {t.envoyeAuDpo && (
                      <span style={{ fontSize: 10, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBorder}`, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>
                        ✓ DPO
                      </span>
                    )}
                    {peutModifier && (
                      <button onClick={() => setTraitementEdit(t)}
                        title="Modifier ce traitement"
                        style={{ background: T.orangeBg, border: `1px solid ${T.orangeBorder}`, borderRadius: 7, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.orange, fontWeight: 600 }}>
                        <Pencil size={11} /> Modifier
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, padding: "10px 12px", background: T.grayBg, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: "'DM Mono', monospace" }}>{t.nombreDonnee ?? 0}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Entrées</div>
                  </div>
                  <div style={{ flex: 1, padding: "10px 12px", background: T.grayBg, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary }}>{t.dureeConservation ? `${t.dureeConservation} mois` : "—"}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conservation</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "'DM Mono', monospace", alignSelf: "center" }}>{t.dateCreation?.split("T")[0] ?? ""}</span>
                  <div style={{ flex: 1 }} />
                  <Btn onClick={() => handleExportTraitement(t, "pdf")} disabled={exportingId === `${t.idTraitement}-pdf`} style={{ fontSize: 11, padding: "5px 10px" }} title="Export PDF">
                    {exportingId === `${t.idTraitement}-pdf` ? <Spinner dark /> : <FileDown size={12} />} PDF
                  </Btn>
                  <Btn onClick={() => handleExportTraitement(t, "excel")} disabled={exportingId === `${t.idTraitement}-excel`} style={{ fontSize: 11, padding: "5px 10px" }} title="Export Excel">
                    {exportingId === `${t.idTraitement}-excel` ? <Spinner dark /> : <FileXls size={12} />} Excel
                  </Btn>
                  {!t.envoyeAuDpo && !sessionCloturee && <Btn onClick={() => handleEnvoyerDpo(t.idTraitement)} style={{ fontSize: 11, padding: "5px 12px" }}><ArrowUpRight size={12} /> Envoyer DPO</Btn>}
                  <Btn onClick={() => { setSelectedTraitement(t.idTraitement); setSection("donnees"); }} style={{ fontSize: 11, padding: "5px 12px" }}><Database size={12} /> Données</Btn>
                  {!sessionCloturee && <Btn variant="success" onClick={() => { setSelectedTraitement(t.idTraitement); setSection("donnees"); }} style={{ fontSize: 11, padding: "5px 12px" }}><Plus size={12} /> Saisir</Btn>}
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
//  PERSONNE PICKER
// ═══════════════════════════════════════════════════════
const PersonnePicker = ({ selectedPersonne, onSelect, onClear }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newP, setNewP] = useState({ nom: "", prenom: "", telephone: "", email: "" });
  const boxRef = useRef();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try { setResults(await apiFetch(`/api/personnes?q=${encodeURIComponent(query.trim())}`)); }
      catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fn = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleCreate = async () => {
    if (!newP.nom.trim() || !newP.prenom.trim()) { toast.error("Nom et prénom requis."); return; }
    setCreating(true);
    try {
      const created = await apiFetch("/api/personnes", { method: "POST", body: JSON.stringify({ nom: newP.nom.trim(), prenom: newP.prenom.trim(), telephone: newP.telephone.trim() || null, email: newP.email.trim() || null }) });
      onSelect(created); setShowCreate(false); setOpen(false); setQuery(""); setNewP({ nom: "", prenom: "", telephone: "", email: "" });
      toast.success(`${created.nomComplet} ajouté(e) !`);
    } catch (e) { toast.error(e.message || "Erreur"); }
    finally { setCreating(false); }
  };

  if (selectedPersonne) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.cardBg, border: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <UserCheck size={17} color={T.green} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{selectedPersonne.nomComplet}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>{selectedPersonne.telephone || selectedPersonne.email || `#${selectedPersonne.id}`}</div>
      </div>
      <Btn onClick={onClear} style={{ fontSize: 11, padding: "5px 10px" }}>Changer</Btn>
    </div>
  );

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
        <input type="text" value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Rechercher une personne (nom, téléphone, email)…"
          style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: 9, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,0.12)", zIndex: 30, maxHeight: 280, overflowY: "auto" }}>
          {searching && <div style={{ padding: 14, textAlign: "center" }}><Spinner dark /></div>}
          {!searching && query.trim() && results.length === 0 && !showCreate && (
            <div style={{ padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>Aucune personne trouvée pour « {query.trim()} ».</p>
              <Btn variant="primary" onClick={() => { setShowCreate(true); setNewP(p => ({ ...p, nom: "", prenom: query.trim() })); }} style={{ margin: "0 auto", fontSize: 12 }}>
                <UserPlus size={13} /> Créer cette personne
              </Btn>
            </div>
          )}
          {!searching && results.map(p => (
            <div key={p.id} onClick={() => { onSelect(p); setOpen(false); setQuery(""); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${T.grayBg}` }}
              className="row-hover-light">
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={14} color={T.blue} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.textPrimary }}>{p.nomComplet}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{p.telephone || p.email || `#${p.id}`}</div>
              </div>
            </div>
          ))}
          {!searching && !showCreate && (
            <div onClick={() => setShowCreate(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer", color: T.gold, fontSize: 12, fontWeight: 600, borderTop: results.length ? `1px solid ${T.cardBorder}` : "none" }}>
              <UserPlus size={14} /> Nouvelle personne…
            </div>
          )}
          {showCreate && (
            <div style={{ padding: 14, borderTop: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.textSecondary, marginBottom: 10 }}>Nouvelle personne</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input placeholder="Prénom *" value={newP.prenom} onChange={e => setNewP(p => ({ ...p, prenom: e.target.value }))} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.cardBorder}`, fontSize: 12, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
                <input placeholder="Nom *" value={newP.nom} onChange={e => setNewP(p => ({ ...p, nom: e.target.value }))} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.cardBorder}`, fontSize: 12, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <input placeholder="Téléphone" value={newP.telephone} onChange={e => setNewP(p => ({ ...p, telephone: e.target.value }))} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.cardBorder}`, fontSize: 12, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
                <input placeholder="Email" value={newP.email} onChange={e => setNewP(p => ({ ...p, email: e.target.value }))} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.cardBorder}`, fontSize: 12, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn onClick={() => setShowCreate(false)} style={{ fontSize: 11, padding: "6px 10px" }}>Annuler</Btn>
                <Btn variant="primary" onClick={handleCreate} disabled={creating} style={{ fontSize: 11, padding: "6px 12px" }}>
                  {creating ? <><Spinner /> Création...</> : <><Check size={12} /> Créer & sélectionner</>}
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  ONGLET : SÉLECTION DEPUIS L'ENTREPÔT
// ═══════════════════════════════════════════════════════
const DepuisEntrepot = ({ selectedTraitement, onDonneeAjoutee, disabled }) => {
  const [entrepot,   setEntrepot]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [selection,  setSelection]  = useState(new Set());
  const [attaching,  setAttaching]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setEntrepot(await apiFetch("/api/entrepot")); }
    catch (e) { toast.error(e.message || "Impossible de charger l'entrepôt"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = entrepot.filter(d => {
    if (!search.trim()) return true;
    const lq = search.toLowerCase();
    return (
      (d.valeur || "").toLowerCase().includes(lq) ||
      (d.personneNomComplet || "").toLowerCase().includes(lq) ||
      (d.typeDonneeNom || "").toLowerCase().includes(lq)
    );
  });

  const toggleSelect = (id) => { if (disabled) return; setSelection(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }); };

  const toggleAll = () => {
    if (disabled) return;
    if (selection.size === filtered.length) setSelection(new Set());
    else setSelection(new Set(filtered.map(d => d.idDonnee)));
  };

  const handleAttacher = async () => {
    if (disabled || selection.size === 0 || !selectedTraitement) return;
    setAttaching(true);
    try {
      const result = await apiFetch(
        `/api/entrepot/attacher-lot?traitementId=${selectedTraitement}`,
        { method: "POST", body: JSON.stringify([...selection]) }
      );
      result.forEach(d => onDonneeAjoutee(d));
      await load();
      setSelection(new Set());
      toast.success(`${result.length} donnée(s) ajoutée(s) au traitement !`);
    } catch (e) {
      toast.error(e.message || "Erreur lors de l'attachement");
    } finally { setAttaching(false); }
  };

  return (
    <Card style={{ overflow: "hidden" }}>
      {disabled && (
        <div style={{ padding: "10px 16px", background: T.yellowBg, borderBottom: `1px solid ${T.yellowBorder}`, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.yellow }}>
          <Lock size={13} /> Session clôturée — impossible d'attacher de nouvelles données à ce traitement.
        </div>
      )}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Archive size={15} color={T.orange} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Entrepôt de données</span>
          <span style={{ fontSize: 11, background: T.orangeBg, border: `1px solid ${T.orangeBorder}`, padding: "2px 8px", borderRadius: 10, fontWeight: 600, color: T.orange }}>{entrepot.length} entrée(s)</span>
        </div>
        <div style={{ flex: 1, position: "relative", maxWidth: 280 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
          <input type="text" placeholder="Filtrer…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 12, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
        </div>
        <Btn onClick={load} style={{ fontSize: 12, padding: "7px 10px" }}><RefreshCw size={12} /></Btn>
        {selection.size > 0 && !disabled && (
          <Btn variant="success" onClick={handleAttacher} disabled={attaching} style={{ fontSize: 12, padding: "7px 14px" }}>
            {attaching ? <><Spinner /> Attachement...</> : <><MoveRight size={13} /> Ajouter {selection.size} au traitement</>}
          </Btn>
        )}
      </div>
      {loading && <div style={{ padding: 32, textAlign: "center" }}><Spinner dark /></div>}
      {!loading && entrepot.length === 0 && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <PackageOpen size={36} color={T.textMuted} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
          <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>L'entrepôt est vide.</p>
          <p style={{ color: T.textMuted, fontSize: 12 }}>Importez un fichier Excel dans la section <strong>Import fichier</strong>.</p>
        </div>
      )}
      {!loading && entrepot.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 1fr 80px", gap: 0, padding: "8px 16px", background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button onClick={toggleAll} disabled={disabled} style={{ background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 0, display: "flex", color: T.textMuted, opacity: disabled ? 0.4 : 1 }}>
                {selection.size === filtered.length && filtered.length > 0 ? <CheckSquare size={15} color={T.green} /> : <Square size={15} />}
              </button>
            </div>
            {["Personne", "Valeur", "Type de donnée", "Sensible"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto", opacity: disabled ? 0.6 : 1 }}>
            {filtered.map((d, i) => {
              const selected = selection.has(d.idDonnee);
              return (
                <div key={d.idDonnee} onClick={() => toggleSelect(d.idDonnee)}
                  style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 1fr 80px", gap: 0, padding: "10px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.cardBorder}` : "none", background: selected ? T.greenBg : "transparent", cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.1s" }}
                  className="row-hover">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {selected ? <CheckSquare size={15} color={T.green} /> : <Square size={15} color={T.textMuted} />}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: T.textPrimary }}>{d.personneNomComplet || "—"}</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.valeur}</div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>{d.typeDonneeNom || "—"}</div>
                  <div>{d.typeDonneeSensible ? <Badge type="sensible" /> : <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Non</span>}</div>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucun résultat</div>}
          </div>
          {selection.size > 0 && !disabled && (
            <div style={{ padding: "10px 16px", background: T.greenBg, borderTop: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>{selection.size} donnée(s) sélectionnée(s)</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => setSelection(new Set())} style={{ fontSize: 11, padding: "5px 10px" }}>Désélectionner tout</Btn>
                <Btn variant="success" onClick={handleAttacher} disabled={attaching} style={{ fontSize: 11, padding: "5px 12px" }}>
                  {attaching ? <><Spinner /> ...</> : <><MoveRight size={12} /> Ajouter au traitement #{selectedTraitement}</>}
                </Btn>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  SAISIE MANUELLE — dans un traitement
// ═══════════════════════════════════════════════════════
const SaisieManuelle = ({ selectedTraitement, onDonneeAjoutee, disabled }) => {
  const [typesDonnee, setTypesDonnee]   = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [personne, setPersonne]         = useState(null);
  const [typeDonneeId, setTypeDonneeId] = useState("");
  const [valeur, setValeur]             = useState("");
  const [panier, setPanier]             = useState([]);
  const [envoi, setEnvoi]               = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingTypes(true);
      try {
        const t = await apiFetch("/api/types-donnee");
        setTypesDonnee(t);
        if (t.length > 0) setTypeDonneeId(String(t[0].idTypeDonnee));
      } catch { toast.error("Impossible de charger les types de données"); }
      finally { setLoadingTypes(false); }
    };
    load();
  }, []);

  const typeSelectionne = typesDonnee.find(t => String(t.idTypeDonnee) === String(typeDonneeId));

  const ajouterAuPanier = () => {
    if (disabled || !valeur.trim() || !typeDonneeId) return;
    // Vérification doublon local dans le panier
    const existeDeja = panier.some(l => l.typeDonneeId === typeDonneeId && l.valeur.toLowerCase() === valeur.trim().toLowerCase());
    if (existeDeja) { toast.error("Cette donnée est déjà dans le panier."); return; }
    setPanier(prev => [...prev, { tempId: Date.now() + Math.random(), typeDonneeId, typeDonneeNom: typeSelectionne?.nom || "—", sensible: typeSelectionne?.sensible || false, valeur: valeur.trim() }]);
    setValeur("");
  };

  const handleEnregistrerTout = async () => {
    if (disabled || !personne || panier.length === 0) return;
    setEnvoi(true);
    let succes = 0; const erreurs = [];
    for (const ligne of panier) {
      try {
        const newDonnee = await apiFetch("/api/donnees", {
          method: "POST",
          body: JSON.stringify({ valeur: ligne.valeur, personneId: personne.id, typeDonneeId: parseInt(ligne.typeDonneeId, 10), traitementId: parseInt(selectedTraitement, 10) }),
        });
        onDonneeAjoutee(newDonnee); succes++;
      } catch (e) { erreurs.push(`${ligne.typeDonneeNom} : ${e.message}`); }
    }
    setEnvoi(false);
    if (succes > 0) { toast.success(`${succes} donnée(s) enregistrée(s) et copiée(s) dans l'entrepôt !`); setPanier(erreurs.length ? panier.filter((_, i) => i >= succes) : []); }
    if (erreurs.length > 0) toast.error(`${erreurs.length} ligne(s) en échec : ${erreurs[0]}`);
  };

  return (
    <Card style={{ padding: 28, maxWidth: 620 }}>
      {disabled && (
        <div style={{ padding: "10px 14px", background: T.yellowBg, border: `1px solid ${T.yellowBorder}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.yellow, marginBottom: 18 }}>
          <Lock size={13} /> Session clôturée — la saisie est désactivée pour ce traitement.
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, opacity: disabled ? 0.5 : 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.greenBg, border: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PenLine size={18} color={T.green} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Saisie manuelle d'une donnée</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Traitement #{selectedTraitement} — copie automatique dans l'entrepôt</div>
        </div>
      </div>
      <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6, display: "block" }}>1. Personne concernée <span style={{ color: T.red }}>*</span></label>
          <PersonnePicker selectedPersonne={personne} onSelect={setPersonne} onClear={() => { setPersonne(null); setPanier([]); }} />
        </div>
        <div style={{ opacity: personne ? 1 : 0.45, pointerEvents: personne ? "auto" : "none", transition: "opacity 0.15s" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6, display: "block" }}>2. Donnée à enregistrer</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <select value={typeDonneeId} onChange={e => setTypeDonneeId(e.target.value)} disabled={loadingTypes}
              style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 12.5, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", minWidth: 170, cursor: "pointer" }}>
              {loadingTypes && <option>Chargement…</option>}
              {typesDonnee.map(t => <option key={t.idTypeDonnee} value={t.idTypeDonnee}>{t.nom}{t.sensible ? " ⚠ sensible" : ""}</option>)}
            </select>
            <input type="text" value={valeur} onChange={e => setValeur(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); ajouterAuPanier(); } }}
              placeholder="Ex: jean@email.com, +226 70 00 00 00..."
              style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
            <Btn variant="primary" onClick={ajouterAuPanier} disabled={!valeur.trim() || !typeDonneeId}><ListPlus size={14} /> Ajouter</Btn>
          </div>
          {panier.length > 0 && (
            <div style={{ border: `1px solid ${T.cardBorder}`, borderRadius: 9, overflow: "hidden", marginBottom: 16 }}>
              {panier.map((l, i) => (
                <div key={l.tempId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: i < panier.length - 1 ? `1px solid ${T.cardBorder}` : "none", background: T.grayBg }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{l.valeur}</span>
                    <span style={{ fontSize: 10, color: T.textMuted }}>· {l.typeDonneeNom}</span>
                    {l.sensible && <Badge type="sensible" />}
                  </div>
                  <button onClick={() => setPanier(prev => prev.filter(x => x.tempId !== l.tempId))} style={{ background: "none", border: "none", cursor: "pointer", color: T.red, padding: 4, display: "flex" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Btn variant="primary" onClick={handleEnregistrerTout} disabled={envoi || panier.length === 0} style={{ minWidth: 220 }}>
            {envoi ? <><Spinner /> Enregistrement...</> : <><Check size={13} /> Enregistrer {panier.length > 0 ? `${panier.length} donnée(s)` : ""}</>}
          </Btn>
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  SAISIE MANUELLE — directement dans l'entrepôt (sans traitement)
// ═══════════════════════════════════════════════════════
const SaisieManuelleEntrepot = ({ onDonneeAjoutee }) => {
  const [typesDonnee, setTypesDonnee]   = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [personne, setPersonne]         = useState(null);
  const [typeDonneeId, setTypeDonneeId] = useState("");
  const [valeur, setValeur]             = useState("");
  const [panier, setPanier]             = useState([]);
  const [envoi, setEnvoi]               = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingTypes(true);
      try {
        const t = await apiFetch("/api/types-donnee");
        setTypesDonnee(t);
        if (t.length > 0) setTypeDonneeId(String(t[0].idTypeDonnee));
      } catch { toast.error("Impossible de charger les types de données"); }
      finally { setLoadingTypes(false); }
    };
    load();
  }, []);

  const typeSelectionne = typesDonnee.find(t => String(t.idTypeDonnee) === String(typeDonneeId));

  const ajouterAuPanier = () => {
    if (!valeur.trim() || !typeDonneeId) return;
    const existeDeja = panier.some(l => l.typeDonneeId === typeDonneeId && l.valeur.toLowerCase() === valeur.trim().toLowerCase());
    if (existeDeja) { toast.error("Cette donnée est déjà dans le panier."); return; }
    setPanier(prev => [...prev, { tempId: Date.now() + Math.random(), typeDonneeId, typeDonneeNom: typeSelectionne?.nom || "—", sensible: typeSelectionne?.sensible || false, valeur: valeur.trim() }]);
    setValeur("");
  };

  const handleEnregistrerTout = async () => {
    if (!personne || panier.length === 0) return;
    setEnvoi(true);
    let succes = 0; const erreurs = [];
    for (const ligne of panier) {
      try {
        const newDonnee = await apiFetch("/api/entrepot", {
          method: "POST",
          body: JSON.stringify({ valeur: ligne.valeur, personneId: personne.id, typeDonneeId: parseInt(ligne.typeDonneeId, 10) }),
        });
        onDonneeAjoutee(newDonnee); succes++;
      } catch (e) { erreurs.push(`${ligne.typeDonneeNom} : ${e.message}`); }
    }
    setEnvoi(false);
    if (succes > 0) { toast.success(`${succes} donnée(s) ajoutée(s) à l'entrepôt !`); setPanier(erreurs.length ? panier.filter((_, i) => i >= succes) : []); }
    if (erreurs.length > 0) toast.error(`${erreurs.length} ligne(s) en échec : ${erreurs[0]}`);
  };

  return (
    <Card style={{ padding: 28, maxWidth: 620 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.orangeBg, border: `1px solid ${T.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PenLine size={18} color={T.orange} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Saisie manuelle vers l'entrepôt</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Donnée disponible pour tous les utilisateurs métier, sans traitement associé</div>
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6, display: "block" }}>1. Personne concernée <span style={{ color: T.red }}>*</span></label>
        <PersonnePicker selectedPersonne={personne} onSelect={setPersonne} onClear={() => { setPersonne(null); setPanier([]); }} />
      </div>
      <div style={{ opacity: personne ? 1 : 0.45, pointerEvents: personne ? "auto" : "none", transition: "opacity 0.15s" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6, display: "block" }}>2. Donnée à enregistrer</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <select value={typeDonneeId} onChange={e => setTypeDonneeId(e.target.value)} disabled={loadingTypes}
            style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 12.5, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", minWidth: 170, cursor: "pointer" }}>
            {loadingTypes && <option>Chargement…</option>}
            {typesDonnee.map(t => <option key={t.idTypeDonnee} value={t.idTypeDonnee}>{t.nom}{t.sensible ? " ⚠ sensible" : ""}</option>)}
          </select>
          <input type="text" value={valeur} onChange={e => setValeur(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); ajouterAuPanier(); } }}
            placeholder="Ex: jean@email.com, +226 70 00 00 00..."
            style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit" }} />
          <Btn variant="primary" onClick={ajouterAuPanier} disabled={!valeur.trim() || !typeDonneeId}><ListPlus size={14} /> Ajouter</Btn>
        </div>
        {panier.length > 0 && (
          <div style={{ border: `1px solid ${T.cardBorder}`, borderRadius: 9, overflow: "hidden", marginBottom: 16 }}>
            {panier.map((l, i) => (
              <div key={l.tempId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: i < panier.length - 1 ? `1px solid ${T.cardBorder}` : "none", background: T.grayBg }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{l.valeur}</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>· {l.typeDonneeNom}</span>
                  {l.sensible && <Badge type="sensible" />}
                </div>
                <button onClick={() => setPanier(prev => prev.filter(x => x.tempId !== l.tempId))} style={{ background: "none", border: "none", cursor: "pointer", color: T.red, padding: 4, display: "flex" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <Btn variant="primary" onClick={handleEnregistrerTout} disabled={envoi || panier.length === 0} style={{ minWidth: 220 }}>
          {envoi ? <><Spinner /> Enregistrement...</> : <><Check size={13} /> Ajouter à l'entrepôt {panier.length > 0 ? `(${panier.length})` : ""}</>}
        </Btn>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  IMPORT EXCEL DIRECT DANS TRAITEMENT — avec info CNIB
// ═══════════════════════════════════════════════════════
const ImportDirectTraitement = ({ selectedTraitement, onDonneesAjoutees, disabled }) => {
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [dragging,setDragging]= useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (disabled) return;
    if (f && f.name.toLowerCase().endsWith(".xlsx")) setFile(f);
    else toast.error("Fichier .xlsx requis");
  };

  const handleImport = async () => {
    if (disabled || !file || !selectedTraitement) return;
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("fichier", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/donnees/import-excel?traitementId=${selectedTraitement}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `Erreur ${res.status}`); }
      const data = await res.json();
      setResult(data);
      toast.success(`${data.lignesImportees} donnée(s) importée(s) dans le traitement !`);
    } catch (e) { setError(e.message || "Erreur lors de l'import"); }
    finally { setLoading(false); }
  };

  if (result) return (
    <Card style={{ padding: 32, textAlign: "center", maxWidth: 560 }}>
      <CheckCircle2 size={48} color={T.green} style={{ display: "block", margin: "0 auto 14px" }} />
      <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>Import terminé !</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 360, margin: "0 auto 24px" }}>
        {[
          { label: "Importées", value: result.lignesImportees, color: T.green, bg: T.greenBg },
          { label: "Ignorées",  value: result.lignesEchouees ?? result.lignesEnErreur ?? (result.totalLignes - result.lignesImportees), color: T.red, bg: T.redBg },
          { label: "Total",     value: result.totalLignes, color: T.blue, bg: T.blueBg },
        ].map((s, i) => (
          <div key={i} style={{ padding: 14, background: s.bg, borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <Btn onClick={() => { setResult(null); setFile(null); }}><RefreshCw size={13} /> Nouvel import</Btn>
        <Btn variant="success" onClick={() => onDonneesAjoutees()}><Check size={13} /> Voir la liste</Btn>
      </div>
    </Card>
  );

  return (
    <Card style={{ padding: 28, maxWidth: 580 }}>
      {disabled && (
        <div style={{ padding: "10px 14px", background: T.yellowBg, border: `1px solid ${T.yellowBorder}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.yellow, marginBottom: 18 }}>
          <Lock size={13} /> Session clôturée — l'import est désactivé pour ce traitement.
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, opacity: disabled ? 0.5 : 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Upload size={18} color={T.blue} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Import Excel direct dans le traitement</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Données rattachées directement au traitement #{selectedTraitement}</div>
        </div>
      </div>

      <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {/* Info formats — maintenant avec CNIB explicite */}
      <div style={{ padding: "12px 14px", background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 9, marginBottom: 18, fontSize: 12, color: T.textSecondary, lineHeight: 1.7 }}>
        <strong style={{ color: T.blue }}>3 formats acceptés :</strong><br />
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ padding: "6px 10px", background: T.cardBg, borderRadius: 7, border: `1px solid ${T.cardBorder}` }}>
            <span style={{ fontWeight: 600, color: T.blue }}>Format A (SOFITEX standard) :</span><br />
            <code style={{ fontSize: 11 }}>NOM | PRENOM | EMAIL | TELEPHONE | DATE_NAISSANCE | NUMERO_CNIB | PROFESSION</code>
          </div>
          <div style={{ padding: "6px 10px", background: T.cardBg, borderRadius: 7, border: `1px solid ${T.cardBorder}` }}>
            <span style={{ fontWeight: 600, color: T.teal }}>Format B (type explicite) :</span><br />
            <code style={{ fontSize: 11 }}>nom | prenom | email | telephone | type_donnee | valeur</code>
          </div>
          <div style={{ padding: "6px 10px", background: T.goldLight, borderRadius: 7, border: `1px solid ${T.goldBorder}` }}>
            <span style={{ fontWeight: 600, color: T.gold }}>💡 Astuce CNIB :</span> Le numéro CNIB (carte nationale d'identité burkinabè) est automatiquement reconnu via la colonne <code>NUMERO_CNIB</code> du Format A, ou en saisissant <code>Numéro CNIB</code> comme type_donnee dans le Format B.
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>La ligne 1 est l'en-tête (ignorée). Le format est détecté automatiquement. Les doublons sont ignorés.</div>
      </div>

      {!file ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !disabled && fileRef.current.click()}
          style={{ border: `2px dashed ${dragging ? T.blue : T.cardBorder}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: disabled ? "not-allowed" : "pointer", background: dragging ? T.blueBg : "transparent", transition: "all 0.2s" }}>
          <input ref={fileRef} type="file" accept=".xlsx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <FileSpreadsheet size={44} color={dragging ? T.blue : T.textMuted} style={{ display: "block", margin: "0 auto 12px", opacity: dragging ? 0.9 : 0.4 }} strokeWidth={1} />
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>Glisser un fichier .xlsx ici</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>ou cliquer pour parcourir</div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: T.grayBg, borderRadius: 9, marginBottom: 14 }}>
            <FileSpreadsheet size={22} color={T.green} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{file.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{(file.size / 1024).toFixed(1)} Ko</div>
            </div>
            <Btn onClick={() => { setFile(null); setError(""); }} style={{ fontSize: 11, padding: "5px 10px" }}>Changer</Btn>
          </div>
          {error && (
            <div style={{ marginBottom: 12, padding: "10px 12px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, color: T.red, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
          <Btn variant="primary" onClick={handleImport} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? <><Spinner /> Import en cours...</> : <><Upload size={13} /> Importer dans le traitement #{selectedTraitement}</>}
          </Btn>
        </div>
      )}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
//  SÉLECTEUR DE COLONNES (types de données à afficher)
// ═══════════════════════════════════════════════════════
const SelecteurColonnes = ({ typesDisponibles, colonnesAffichees, onToggle, onToutCocher, onToutDecocher }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Btn onClick={() => setOpen(v => !v)} style={{ fontSize: 12, padding: "7px 12px" }}>
        <Layers size={12} /> Colonnes ({colonnesAffichees.size}/{typesDisponibles.length}) <ChevronDown size={12} />
      </Btn>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 260, background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,0.14)", zIndex: 40, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.grayBg }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.textPrimary }}>Types de données à afficher</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onToutCocher} style={{ background: "none", border: "none", color: T.gold, fontSize: 10.5, fontWeight: 600, cursor: "pointer" }}>Tout</button>
              <button onClick={onToutDecocher} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 10.5, fontWeight: 600, cursor: "pointer" }}>Aucun</button>
            </div>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {typesDisponibles.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Aucun type de donnée</div>
            )}
            {typesDisponibles.map(t => {
              const checked = colonnesAffichees.has(t.id);
              return (
                <div key={t.id} onClick={() => onToggle(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", cursor: "pointer" }}
                  className="row-hover-light">
                  {checked ? <CheckSquare size={15} color={T.green} /> : <Square size={15} color={T.textMuted} />}
                  <span style={{ fontSize: 12, color: T.textPrimary, flex: 1 }}>{t.nom}</span>
                  {t.sensible && <span title="Sensible" style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DONNÉES — vue pivotée par personne (colonnes = types de données)
// ═══════════════════════════════════════════════════════
const SectionDonnees = ({ selectedTraitement, setSection }) => {
  const [tab,     setTab]     = useState("liste");
  const [donnees, setDonnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [traitementInfo, setTraitementInfo] = useState(null);
  const [sessionCloturee, setSessionCloturee] = useState(false);
  const [colonnesAffichees, setColonnesAffichees] = useState(new Set());
  const colonnesInitRef = useRef(false);
  const [exportingFormat, setExportingFormat] = useState(null);

  const loadDonnees = useCallback(async () => {
    if (!selectedTraitement) { setLoading(false); return; }
    setLoading(true); setError("");
    try { setDonnees(await apiFetch(`/api/donnees/par-traitement?traitementId=${selectedTraitement}`)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [selectedTraitement]);

  useEffect(() => { loadDonnees(); }, [loadDonnees]);

  // Vérifie si la session parente du traitement est clôturée, pour bloquer l'ajout de données
  useEffect(() => {
    if (!selectedTraitement) return;
    colonnesInitRef.current = false;
    const checkSession = async () => {
      try {
        const t = await apiFetch(`/api/traitements/${selectedTraitement}`);
        setTraitementInfo(t);
        const sessionId = t.sessionCollecteId || t.session?.idSession;
        if (sessionId) {
          const s = await apiFetch(`/api/sessions/${sessionId}`);
          setSessionCloturee(s.statutSession !== "EN_COURS");
        } else {
          setSessionCloturee(false);
        }
      } catch { setSessionCloturee(false); }
    };
    checkSession();
  }, [selectedTraitement]);

  const handleDonneeAjoutee = (d) => {
    if (d) setDonnees(prev => [d, ...prev]);
    setTab("liste");
  };

  const handleImportDirect = async () => {
    await loadDonnees();
    setTab("liste");
  };

  // ─── Types de données disponibles (pour le sélecteur de colonnes) ───
  const typesDisponibles = (() => {
    const map = new Map();
    donnees.forEach(d => { if (d.typeDonneeId != null && !map.has(d.typeDonneeId)) map.set(d.typeDonneeId, { id: d.typeDonneeId, nom: d.typeDonneeNom || "—", sensible: d.typeDonneeSensible }); });
    return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  })();

  useEffect(() => {
    if (!colonnesInitRef.current && typesDisponibles.length > 0) {
      setColonnesAffichees(new Set(typesDisponibles.map(t => t.id)));
      colonnesInitRef.current = true;
    }
  }, [typesDisponibles]);

  const toggleColonne = (id) => setColonnesAffichees(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ─── Pivot : une ligne par personne, une colonne par type de donnée sélectionné ───
  const personnesPivot = (() => {
    const map = new Map();
    donnees.forEach(d => {
      const pid = d.personneId ?? `p-${d.personneNomComplet || d.usagerNomComplet || "inconnu"}`;
      if (!map.has(pid)) map.set(pid, { id: pid, nom: d.personneNomComplet || d.usagerNomComplet || "—", valeurs: {} });
      const entry = map.get(pid);
      if (d.typeDonneeId == null) return;
      if (!entry.valeurs[d.typeDonneeId]) entry.valeurs[d.typeDonneeId] = [];
      entry.valeurs[d.typeDonneeId].push(d.valeur);
    });
    return [...map.values()];
  })();

  const colonnesSelectionnees = typesDisponibles.filter(t => colonnesAffichees.has(t.id));

  const filteredPersonnes = personnesPivot.filter(p => {
    if (!search.trim()) return true;
    const lq = search.toLowerCase();
    if ((p.nom || "").toLowerCase().includes(lq)) return true;
    return Object.values(p.valeurs).some(vals => vals.some(v => (v || "").toLowerCase().includes(lq)));
  });

  const handleExport = async (format) => {
    if (!traitementInfo) return;
    setExportingFormat(format);
    try {
      if (format === "pdf") exportTraitementPdf(traitementInfo, donnees);
      else exportTraitementExcel(traitementInfo, donnees);
    } finally { setExportingFormat(null); }
  };

  const tabs = [
    { id: "liste",    label: "Liste des données",      Icon: Table2,          disabled: false },
    { id: "saisie",   label: "Saisie manuelle",        Icon: PenLine,         disabled: sessionCloturee },
    { id: "entrepot", label: "Depuis l'entrepôt",      Icon: Archive,         disabled: sessionCloturee },
    { id: "import",   label: "Import Excel direct",    Icon: FileSpreadsheet, disabled: sessionCloturee },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Données collectées" subtitle={selectedTraitement ? `Traitement #${selectedTraitement} — ${personnesPivot.length} personne(s), ${donnees.length} entrée(s)` : "Sélectionnez un traitement"}>
        {selectedTraitement && (
          <>
            <Btn onClick={() => handleExport("pdf")} disabled={exportingFormat === "pdf"}>{exportingFormat === "pdf" ? <Spinner dark /> : <FileDown size={13} />} Export PDF</Btn>
            <Btn onClick={() => handleExport("excel")} disabled={exportingFormat === "excel"}>{exportingFormat === "excel" ? <Spinner dark /> : <FileXls size={13} />} Export Excel</Btn>
          </>
        )}
        <Btn onClick={() => setSection("import")}><Upload size={13} /> Import entrepôt</Btn>
      </PageHeader>

      {!selectedTraitement && (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <Database size={36} color={T.textMuted} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
          <p style={{ color: T.textMuted, fontSize: 13 }}>Aucun traitement sélectionné.<br />Allez dans Traitements et cliquez sur "Données".</p>
          <Btn onClick={() => setSection("traitements")} style={{ margin: "16px auto 0" }}><ChevronLeft size={13} /> Voir les traitements</Btn>
        </Card>
      )}

      {selectedTraitement && (
        <>
          {sessionCloturee && (
            <Card style={{ padding: "10px 16px", marginBottom: 16, background: T.yellowBg, border: `1px solid ${T.yellowBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.yellow }}>
                <Lock size={14} /> La session de ce traitement est clôturée — l'ajout de nouvelles données est désactivé. Vous pouvez toujours consulter et exporter les données existantes.
              </div>
            </Card>
          )}

          <div style={{ display: "flex", gap: 4, background: T.grayBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: 4, marginBottom: 18, width: "fit-content", flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => !t.disabled && setTab(t.id)} disabled={t.disabled}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: t.disabled ? "not-allowed" : "pointer", background: tab === t.id ? T.cardBg : "transparent", color: t.disabled ? T.textMuted : tab === t.id ? T.textPrimary : T.textMuted, opacity: t.disabled ? 0.5 : 1, boxShadow: tab === t.id ? T.cardShadow : "none", transition: "all 0.15s" }}>
                {t.disabled ? <Lock size={13} /> : <t.Icon size={14} />}
                {t.label}
                {t.id === "entrepot" && <span style={{ fontSize: 10, background: T.orangeBg, color: T.orange, border: `1px solid ${T.orangeBorder}`, padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>Stock</span>}
                {t.id === "import" && <span style={{ fontSize: 10, background: T.blueBg, color: T.blue, border: `1px solid ${T.blueBorder}`, padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>XLSX</span>}
              </button>
            ))}
          </div>

          {tab === "liste" && (
            <Card style={{ overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                  <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
                  <input type="text" placeholder="Rechercher une personne ou une valeur…" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", width: "100%", fontFamily: "inherit" }} />
                </div>
                <SelecteurColonnes
                  typesDisponibles={typesDisponibles}
                  colonnesAffichees={colonnesAffichees}
                  onToggle={toggleColonne}
                  onToutCocher={() => setColonnesAffichees(new Set(typesDisponibles.map(t => t.id)))}
                  onToutDecocher={() => setColonnesAffichees(new Set())}
                />
                <Btn onClick={loadDonnees} style={{ fontSize: 12, padding: "7px 12px" }}><RefreshCw size={12} /> Actualiser</Btn>
              </div>
              {loading && <div style={{ padding: 32, textAlign: "center" }}><Spinner dark /></div>}
              {!loading && error && <div style={{ padding: 16 }}><ErrorBanner message={error} /></div>}
              {!loading && !error && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                      <tr style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
                        <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase", position: "sticky", left: 0, background: T.grayBg }}>Personne</th>
                        {colonnesSelectionnees.map(c => (
                          <th key={c.id} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {c.nom} {c.sensible && <span title="Sensible" style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: T.red, marginLeft: 4 }} />}
                          </th>
                        ))}
                        <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonnes.map((p, i) => (
                        <tr key={p.id} className="table-row-hover" style={{ borderBottom: i < filteredPersonnes.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                          <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: T.textPrimary, position: "sticky", left: 0, background: T.cardBg, whiteSpace: "nowrap" }}>{p.nom}</td>
                          {colonnesSelectionnees.map(c => {
                            const vals = p.valeurs[c.id];
                            return (
                              <td key={c.id} style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary, whiteSpace: "nowrap" }}>
                                {vals && vals.length > 0 ? vals.join(", ") : <span style={{ color: T.textMuted }}>—</span>}
                              </td>
                            );
                          })}
                          <td style={{ padding: "11px 14px", fontSize: 11, color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>
                            {Object.values(p.valeurs).reduce((a, v) => a + v.length, 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPersonnes.length === 0 && <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucun résultat</div>}
                  {colonnesSelectionnees.length === 0 && typesDisponibles.length > 0 && (
                    <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Aucune colonne sélectionnée — utilisez le bouton "Colonnes" pour en afficher.</div>
                  )}
                </div>
              )}
            </Card>
          )}

          {tab === "saisie" && <SaisieManuelle selectedTraitement={selectedTraitement} onDonneeAjoutee={handleDonneeAjoutee} disabled={sessionCloturee} />}
          {tab === "entrepot" && <DepuisEntrepot selectedTraitement={selectedTraitement} onDonneeAjoutee={handleDonneeAjoutee} disabled={sessionCloturee} />}
          {tab === "import" && <ImportDirectTraitement selectedTraitement={selectedTraitement} onDonneesAjoutees={handleImportDirect} disabled={sessionCloturee} />}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : ENTREPÔT — liste + saisie manuelle
// ═══════════════════════════════════════════════════════
const SectionEntrepot = ({ setSection }) => {
  const [tab, setTab] = useState("liste");
  const [entrepot, setEntrepot] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filtreType, setFiltreType] = useState("all");
  const [types, setTypes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, t] = await Promise.all([apiFetch("/api/entrepot"), apiFetch("/api/types-donnee")]);
      setEntrepot(e);
      setTypes(t);
    } catch (e) { toast.error(e.message || "Erreur"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDonneeAjoutee = () => { load(); setTab("liste"); };

  const filtered = entrepot.filter(d => {
    const lq = search.toLowerCase();
    const matchSearch = !search.trim() ||
      (d.valeur || "").toLowerCase().includes(lq) ||
      (d.personneNomComplet || "").toLowerCase().includes(lq) ||
      (d.typeDonneeNom || "").toLowerCase().includes(lq);
    const matchType = filtreType === "all" || String(d.typeDonneeId) === filtreType;
    return matchSearch && matchType;
  });

  const stats = [
    { label: "Total entrepôt",       value: entrepot.length,                                    color: T.orange, bg: T.orangeBg, Icon: Archive },
    { label: "Données sensibles",    value: entrepot.filter(d => d.typeDonneeSensible).length,  color: T.red,    bg: T.redBg,    Icon: Lock },
    { label: "Personnes distinctes", value: new Set(entrepot.map(d => d.personneId).filter(Boolean)).size, color: T.blue, bg: T.blueBg, Icon: Users },
    { label: "Types différents",     value: new Set(entrepot.map(d => d.typeDonneeId).filter(Boolean)).size, color: T.teal, bg: T.tealBg, Icon: Layers },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Entrepôt de données" subtitle="Données importées — visibles par tous les utilisateurs métier">
        <Btn onClick={() => setSection("import")} variant="orange"><Upload size={13} /> Alimenter par Excel</Btn>
        <Btn onClick={load}><RefreshCw size={13} /></Btn>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.Icon size={16} color={s.color} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                {loading ? "—" : s.value}
              </div>
              <div style={{ fontSize: 10.5, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "12px 16px", marginBottom: 16, background: T.orangeBg, border: `1px solid ${T.orangeBorder}` }}>
        <div style={{ display: "flex", gap: 10, fontSize: 12, color: T.orange }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Ces données sont accessibles à <strong>tous les utilisateurs métier</strong>. Elles peuvent être rattachées à n'importe quel traitement via l'onglet <strong>Depuis l'entrepôt</strong>, ou ajoutées ici directement par saisie manuelle.</span>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 4, background: T.grayBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: 4, marginBottom: 16, width: "fit-content" }}>
        {[
          { id: "liste",  label: "Liste de l'entrepôt", Icon: Table2 },
          { id: "saisie", label: "Saisie manuelle",     Icon: PenLine },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", background: tab === t.id ? T.cardBg : "transparent", color: tab === t.id ? T.textPrimary : T.textMuted, boxShadow: tab === t.id ? T.cardShadow : "none", transition: "all 0.15s" }}>
            <t.Icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "saisie" && <SaisieManuelleEntrepot onDonneeAjoutee={handleDonneeAjoutee} />}

      {tab === "liste" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
              <input type="text" placeholder="Rechercher dans l'entrepôt..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.cardBg, outline: "none", fontFamily: "inherit" }} />
            </div>
            <select value={filtreType} onChange={e => setFiltreType(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textSecondary, background: T.cardBg, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
              <option value="all">Tous les types</option>
              {types.map(t => <option key={t.idTypeDonnee} value={String(t.idTypeDonnee)}>{t.nom}</option>)}
            </select>
          </div>

          <Card style={{ overflow: "hidden" }}>
            {loading && <div style={{ padding: 32, textAlign: "center" }}><Spinner dark /></div>}
            {!loading && entrepot.length === 0 && (
              <div style={{ padding: 48, textAlign: "center" }}>
                <PackageOpen size={40} color={T.textMuted} style={{ margin: "0 auto 14px", display: "block", opacity: 0.35 }} />
                <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 16 }}>L'entrepôt est vide pour le moment.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <Btn variant="primary" onClick={() => setSection("import")}><Upload size={13} /> Importer un fichier Excel</Btn>
                  <Btn onClick={() => setTab("saisie")}><PenLine size={13} /> Saisie manuelle</Btn>
                </div>
              </div>
            )}
            {!loading && entrepot.length > 0 && (
              <>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr style={{ background: T.grayBg, borderBottom: `1px solid ${T.cardBorder}` }}>
                      {["#", "Personne", "Valeur", "Type de donnée", "Sensible", "Date d'import"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <tr key={row.idDonnee} className="table-row-hover" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                        <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted }}>{row.idDonnee}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{row.personneNomComplet || "—"}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary }}>{row.valeur}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: T.textSecondary }}>{row.typeDonneeNom || "—"}</td>
                        <td style={{ padding: "11px 14px" }}>{row.typeDonneeSensible ? <Badge type="sensible" /> : <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Non</span>}</td>
                        <td style={{ padding: "11px 14px", fontSize: 11, color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>{row.dateCollecte?.split("T")[0] || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Aucun résultat pour « {search} »</div>}
                <div style={{ padding: "10px 16px", background: T.grayBg, borderTop: `1px solid ${T.cardBorder}`, fontSize: 12, color: T.textMuted, display: "flex", justifyContent: "space-between" }}>
                  <span>{filtered.length} entrée(s) sur {entrepot.length}</span>
                  <span style={{ color: T.orange, fontWeight: 600 }}>Partagé entre tous les utilisateurs métier</span>
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : IMPORT FICHIER EXCEL → ENTREPÔT
// ═══════════════════════════════════════════════════════
const SectionImport = ({ setSection }) => {
  const [step,     setStep]     = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const fileRef = useRef();

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setStep("preview"); } };
  const handleFile = (e) => { const f = e.target.files[0]; if (f) { setFile(f); setStep("preview"); } };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true); setError(""); setProgress(10);
    try {
      const formData = new FormData();
      formData.append("fichier", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/entrepot/import-excel`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      setProgress(80);
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Erreur ${res.status}`); }
      const data = await res.json();
      setProgress(100); setResult(data); setStep("result");
      toast.success(`Import terminé : ${data.lignesImportees} entrées ajoutées à l'entrepôt !`);
    } catch (e) { setError(e.message || "Erreur lors de l'import"); setProgress(0); }
    finally { setLoading(false); }
  };

  const stepsDef = [
    { id: "upload",  label: "Sélection du fichier" },
    { id: "preview", label: "Aperçu & validation" },
    { id: "result",  label: "Résultat" },
  ];

  return (
    <div className="slide-in">
      <PageHeader title="Import vers l'entrepôt" subtitle="Importez des données personnelles depuis Excel — partagées avec tous les utilisateurs métier" />

      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {stepsDef.map((s, i, arr) => {
          const done   = (step === "preview" && i === 0) || (step === "result" && i <= 1);
          const active = step === s.id;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? T.green : active ? "#1A5C2A" : T.grayBg, border: `2px solid ${done ? T.green : active ? "#1A5C2A" : T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Info size={15} color={T.gold} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.7 }}>
                <strong style={{ color: T.textPrimary }}>Formats acceptés</strong>
                <div style={{ marginTop: 10, fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ padding: "8px 12px", background: T.grayBg, borderRadius: 8 }}>
                    <strong style={{ color: T.blue }}>Format A (standard SOFITEX) — en-têtes :</strong><br />
                    <code style={{ fontSize: 11 }}>NOM | PRENOM | EMAIL | TELEPHONE | DATE_NAISSANCE | NUMERO_CNIB | PROFESSION</code>
                  </div>
                  <div style={{ padding: "8px 12px", background: T.grayBg, borderRadius: 8 }}>
                    <strong style={{ color: T.teal }}>Format B (type explicite) — en-têtes :</strong><br />
                    <code style={{ fontSize: 11 }}>nom | prenom | email | telephone | type_donnee | valeur</code>
                  </div>
                  <div style={{ padding: "8px 12px", background: T.goldLight, border: `1px solid ${T.goldBorder}`, borderRadius: 8 }}>
                    <strong style={{ color: T.gold }}>💡 Numéro CNIB pris en charge :</strong> Utilisez la colonne <code>NUMERO_CNIB</code> (Format A) ou saisissez <code>Numéro CNIB</code> comme type_donnee (Format B). Les doublons sont automatiquement ignorés.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragging ? T.orange : T.cardBorder}`, borderRadius: 12, margin: 24, padding: "52px 32px", textAlign: "center", cursor: "pointer", background: dragging ? T.orangeBg : "transparent", transition: "all 0.2s" }}>
              <input ref={fileRef} type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleFile} />
              <Archive size={52} color={dragging ? T.orange : T.textMuted} style={{ margin: "0 auto 16px", display: "block", opacity: dragging ? 0.9 : 0.4 }} strokeWidth={1} />
              <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>
                {dragging ? "Déposez le fichier ici" : "Glisser-déposer un fichier .xlsx"}
              </div>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>ou cliquez pour parcourir</div>
              <span style={{ background: T.orangeBg, border: `1px solid ${T.orangeBorder}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: T.orange }}>.xlsx uniquement</span>
            </div>
          </Card>
        </div>
      )}

      {step === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Archive size={22} color={T.orange} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{file?.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{(file?.size / 1024).toFixed(1)} Ko → Import vers l'entrepôt</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Btn onClick={() => { setFile(null); setStep("upload"); }}>Changer de fichier</Btn>
                <Btn variant="primary" onClick={handleImport} disabled={loading}>
                  {loading ? <><Spinner /> Import en cours...</> : <><Upload size={13} /> Importer vers l'entrepôt</>}
                </Btn>
              </div>
            </div>
            {loading && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 5 }}>
                  <span>Envoi au serveur…</span><span>{progress}%</span>
                </div>
                <div style={{ height: 6, background: T.grayBg, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: T.orange, borderRadius: 10, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
            {error && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, color: T.red }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}
          </Card>
        </div>
      )}

      {step === "result" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: result.lignesImportees > 0 ? T.greenBg : T.yellowBg, border: `2px solid ${result.lignesImportees > 0 ? T.greenBorder : T.yellowBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={32} color={result.lignesImportees > 0 ? T.green : T.yellow} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Import dans l'entrepôt terminé</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Données disponibles pour tous les utilisateurs métier</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 420, margin: "0 auto 24px" }}>
              {[
                { label: "Importées", value: result.lignesImportees,  color: T.green,  bg: T.greenBg },
                { label: "Ignorées",  value: result.lignesEchouees ?? (result.totalLignes - result.lignesImportees), color: T.red, bg: T.redBg },
                { label: "Total",     value: result.totalLignes,      color: T.orange, bg: T.orangeBg },
              ].map((s, i) => (
                <div key={i} style={{ padding: "14px 12px", background: s.bg, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={() => { setFile(null); setResult(null); setProgress(0); setStep("upload"); }}><RefreshCw size={13} /> Nouvel import</Btn>
              <Btn variant="orange" onClick={() => setSection("entrepot")}><Archive size={13} /> Voir l'entrepôt</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  SECTION : DEMANDES DE MODIFICATION / SUPPRESSION
// ═══════════════════════════════════════════════════════
const SectionDemandes = ({ userId }) => {
  const [demandes,   setDemandes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtre,     setFiltre]     = useState("EN_COURS");
  const [motifRejet, setMotifRejet] = useState("");
  const [demandeEnTraitement, setDemandeEnTraitement] = useState(null);
  const [showRejetModal,      setShowRejetModal]      = useState(false);
  const [loadingAction,       setLoadingAction]       = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/demandes/par-um?umId=${userId}`);
      setDemandes(data);
    } catch (e) { toast.error(e.message || "Erreur"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filtre === "all" ? demandes : demandes.filter(d => d.statutDemande === filtre);

  const handleAccepter = async (demande) => {
    setLoadingAction(true);
    try {
      await apiFetch(`/api/demandes/${demande.idDemande}/accepter`, { method: "PUT" });
      toast.success("Demande acceptée et traitée !");
      await load();
    } catch (e) { toast.error(e.message || "Erreur"); }
    finally { setLoadingAction(false); }
  };

  const handleRejeter = async () => {
    if (!demandeEnTraitement) return;
    setLoadingAction(true);
    try {
      await apiFetch(`/api/demandes/${demandeEnTraitement.idDemande}/rejeter`, {
        method: "PUT",
        body: JSON.stringify({ motifRejet: motifRejet.trim() || "Aucun motif fourni." }),
      });
      toast.success("Demande rejetée.");
      setShowRejetModal(false); setMotifRejet(""); setDemandeEnTraitement(null);
      await load();
    } catch (e) { toast.error(e.message || "Erreur"); }
    finally { setLoadingAction(false); }
  };

  const counts = {
    EN_COURS: demandes.filter(d => d.statutDemande === "EN_COURS").length,
    ACCEPTEE: demandes.filter(d => d.statutDemande === "ACCEPTEE").length,
    REJETEE:  demandes.filter(d => d.statutDemande === "REJETEE").length,
  };

  return (
    <div className="slide-in">
      {/* Modale rejet */}
      {showRejetModal && (
        <>
          <div onClick={() => { setShowRejetModal(false); setMotifRejet(""); }} style={{ position: "fixed", inset: 0, background: "rgba(8,15,11,0.5)", zIndex: 900, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: 440, background: T.cardBg, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.22)", border: `1px solid ${T.cardBorder}`, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.redBg, border: `1px solid ${T.redBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XCircle size={18} color={T.red} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Rejeter la demande</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Demande #{demandeEnTraitement?.idDemande} · {demandeEnTraitement?.typeDemande}</div>
              </div>
              <button onClick={() => { setShowRejetModal(false); setMotifRejet(""); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textMuted }}><X size={17} /></button>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 6 }}>Motif du rejet (optionnel)</label>
              <textarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)} rows={3} placeholder="Expliquez pourquoi cette demande est rejetée…"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, fontSize: 13, color: T.textPrimary, background: T.grayBg, outline: "none", fontFamily: "inherit", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => { setShowRejetModal(false); setMotifRejet(""); }}>Annuler</Btn>
              <Btn variant="danger" onClick={handleRejeter} disabled={loadingAction}>
                {loadingAction ? <><Spinner /> Rejet...</> : <><XCircle size={13} /> Confirmer le rejet</>}
              </Btn>
            </div>
          </div>
        </>
      )}

      <PageHeader title="Demandes citoyens" subtitle="Demandes de modification ou suppression de données personnelles">
        <Btn onClick={() => exportDemandesPdf(filtered)}><FileDown size={13} /> Export PDF</Btn>
        <Btn onClick={() => exportDemandesExcel(filtered)}><FileXls size={13} /> Export Excel</Btn>
        <Btn onClick={load}><RefreshCw size={13} /></Btn>
      </PageHeader>

      {/* Statistiques rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "En attente",  value: counts.EN_COURS, color: T.yellow, bg: T.yellowBg, border: T.yellowBorder, id: "EN_COURS" },
          { label: "Acceptées",   value: counts.ACCEPTEE, color: T.green,  bg: T.greenBg,  border: T.greenBorder,  id: "ACCEPTEE" },
          { label: "Rejetées",    value: counts.REJETEE,  color: T.red,    bg: T.redBg,    border: T.redBorder,    id: "REJETEE" },
        ].map(s => (
          <Card key={s.id} style={{ padding: "14px 16px", cursor: "pointer", border: filtre === s.id ? `2px solid ${s.color}` : `1px solid ${T.cardBorder}` }} onClick={() => setFiltre(s.id)}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{loading ? "—" : s.value}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filtre */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["all", "Toutes"], ["EN_COURS", "En attente"], ["ACCEPTEE", "Acceptées"], ["REJETEE", "Rejetées"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setFiltre(val)}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filtre === val ? T.green : T.cardBorder}`, background: filtre === val ? T.greenBg : "transparent", color: filtre === val ? T.green : T.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {lbl}
          </button>
        ))}
      </div>

      {loading && <Card style={{ padding: 40, textAlign: "center" }}><Spinner dark /></Card>}
      {!loading && filtered.length === 0 && (
        <EmptyState icon={ClipboardList} message="Aucune demande pour ce filtre." />
      )}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(d => {
            const isSuppression = d.typeDemande === "SUPPRESSION";
            const isEnCours = d.statutDemande === "EN_COURS";
            return (
              <Card key={d.idDemande} style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Icône type */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isSuppression ? T.redBg : T.blueBg, border: `1.5px solid ${isSuppression ? T.redBorder : T.blueBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isSuppression ? <Trash2 size={20} color={T.red} /> : <Pencil size={20} color={T.blue} />}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <Badge type={d.typeDemande} />
                      <Badge type={d.statutDemande} />
                      <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>#{d.idDemande} · {d.dateDemande}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 20px", fontSize: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Citoyen</div>
                        <div style={{ fontWeight: 600, color: T.textPrimary }}>{d.usagerNomComplet || d.personneNomComplet || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Donnée concernée</div>
                        <div style={{ fontWeight: 600, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.donneeValeur || "—"}</div>
                      </div>
                      {!isSuppression && d.nouvelleValeur && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Nouvelle valeur demandée</div>
                          <div style={{ fontWeight: 600, color: T.blue }}>{d.nouvelleValeur}</div>
                        </div>
                      )}
                    </div>

                    {d.descriptionDemande && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: T.grayBg, borderRadius: 8, fontSize: 12, color: T.textSecondary, fontStyle: "italic" }}>
                        « {d.descriptionDemande} »
                      </div>
                    )}

                    {/* Réponse / motif si traité */}
                    {d.reponse && (
                      <div style={{ marginTop: 8, padding: "7px 12px", background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 8, fontSize: 12, color: T.green }}>
                        ✓ {d.reponse}
                      </div>
                    )}
                    {d.motifRejet && (
                      <div style={{ marginTop: 8, padding: "7px 12px", background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, color: T.red }}>
                        ✗ Rejet : {d.motifRejet}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isEnCours && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                      <Btn variant="success" onClick={() => handleAccepter(d)} disabled={loadingAction} style={{ fontSize: 12, padding: "7px 14px" }}>
                        <CheckCircle2 size={13} /> Accepter
                      </Btn>
                      <Btn variant="danger" onClick={() => { setDemandeEnTraitement(d); setShowRejetModal(true); }} disabled={loadingAction} style={{ fontSize: 12, padding: "7px 14px" }}>
                        <XCircle size={13} /> Rejeter
                      </Btn>
                    </div>
                  )}
                  {!isEnCours && d.dateTraitement && (
                    <div style={{ fontSize: 11, color: T.textMuted, flexShrink: 0, textAlign: "right" }}>
                      Traité le<br />{d.dateTraitement}
                    </div>
                  )}
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
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════
export default function Tb_utilisateur_Metier() {
  const [section,            setSection]            = useState("dashboard");
  const [collapsed,          setCollapsed]          = useState(false);
  const [selectedSession,    setSelectedSession]    = useState(null);
  const [selectedTraitement, setSelectedTraitement] = useState(null);

  const userId = getUsagerIdFromToken();
  const [userInfo, setUserInfo] = useState({ name: "Utilisateur", initials: "U", service: "Utilisateur Métier" });

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const name = payload.nom ? `${payload.prenom || ""} ${payload.nom}`.trim() : payload.sub || "Utilisateur";
      const parts = name.split(" ");
      const initials = parts.map(p => p[0]?.toUpperCase() || "").join("").slice(0, 2) || "U";
      setUserInfo({ name, initials, service: payload.role || "Utilisateur Métier" });
    } catch {}
  }, []);

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
        .row-hover-light:hover { background: ${T.grayBg}; }
        .table-row-hover:hover td { background: ${T.grayBg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <TopBar
        onToggle={() => setCollapsed(c => !c)}
        userId={userId}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          active={section}
          setActive={setSection}
          collapsed={collapsed}
          userName={userInfo.name}
          userService={userInfo.service}
          userInitials={userInfo.initials}
        />
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: T.mainBg }}>
          {section === "dashboard"   && <SectionDashboard    setSection={setSection} setSelectedSession={setSelectedSession} userId={userId} userName={userInfo.name} />}
          {section === "sessions"    && <SectionSessions     setSection={setSection} setSelectedSession={setSelectedSession} />}
          {section === "traitements" && <SectionTraitements  selectedSession={selectedSession} setSection={setSection} setSelectedTraitement={setSelectedTraitement} userId={userId} />}
          {section === "donnees"     && <SectionDonnees      selectedTraitement={selectedTraitement} setSection={setSection} />}
          {section === "entrepot"    && <SectionEntrepot     setSection={setSection} />}
          {section === "import"      && <SectionImport       setSection={setSection} />}
          {section === "demandes"    && <SectionDemandes     userId={userId} />}
        </main>
      </div>
    </div>
  );
}