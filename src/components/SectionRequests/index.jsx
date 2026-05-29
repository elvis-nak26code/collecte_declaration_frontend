import { useState, useEffect } from 'react';
import { FileText, Clock, Check, X, ChevronDown, Mail, Briefcase, MapPin, Phone, Building, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════
//  THÈME
// ═══════════════════════════════════════════════════════
const T = {
  cardBg: '#FFFFFF',        cardBorder: '#E4E8EE',      cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  textPrimary: '#0F1923',   textSecondary: '#4A5568',   textMuted: '#9AA5B4',
  gold: '#B8860B',          goldLight: '#FEF7E6',        goldBorder: '#E6B84A',
  green: '#16A34A',         greenBg: '#F0FDF4',          greenBorder: '#BBF7D0',
  red: '#DC2626',           redBg: '#FEF2F2',            redBorder: '#FECACA',
  yellow: '#D97706',        yellowBg: '#FFFBEB',         yellowBorder: '#FDE68A',
  blue: '#2563EB',          blueBg: '#EFF6FF',           blueBorder: '#BFDBFE',
  purple: '#7C3AED',        purpleBg: '#F5F3FF',         purpleBorder: '#DDD6FE',
  gray: '#374151',          grayBg: '#F9FAFB',           grayBorder: '#E5E7EB',
  border: '#E4E8EE',
};

// ═══════════════════════════════════════════════════════
//  COMPOSANTS ATOMIQUES
// ═══════════════════════════════════════════════════════

const Avatar = ({ initials, size = 36, bg = T.goldLight, color = T.gold, border = T.goldBorder }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.34, color, flexShrink: 0, letterSpacing: '0.03em', fontFamily: "'DM Mono', monospace" }}>
    {initials}
  </div>
);

const Badge = ({ type }) => {
  const map = {
    pending:  { bg: T.purpleBg, color: T.purple, border: T.purpleBorder, label: 'En attente' },
    active:   { bg: T.greenBg,  color: T.green,  border: T.greenBorder,  label: 'Actif' },
    inactive: { bg: T.grayBg,   color: T.gray,   border: T.grayBorder,   label: 'Inactif' },
  };
  const s = map[type] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  );
};

const Card = ({ children, style = {}, className = '' }) => (
  <div className={`sofitex-card ${className}`} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 12, boxShadow: T.cardShadow, ...style }}>
    {children}
  </div>
);

const PageHeader = ({ title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 3, letterSpacing: '-0.02em' }}>{title}</h1>
      <p style={{ fontSize: 13, color: T.textMuted }}>{subtitle}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
//  MODALE DE REJET
// ═══════════════════════════════════════════════════════

const ModalRejet = ({ demande, onConfirm, onCancel, loading }) => {
  const [motif, setMotif] = useState('');
  const nomComplet = `${demande?.prenom ?? ''} ${demande?.nom ?? ''}`.trim() || demande?.email || '—';

  if (!demande) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 900, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.18s ease' }}
      />

      {/* Fenêtre */}
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
            {loading ? (
              <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Envoi...</>
            ) : (
              <><X size={13} /> Confirmer le refus</>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

const getStatus    = (s) => s === 'EN_ATTENTE' ? 'pending' : s === 'APPROUVEE' ? 'approved' : 'rejected';
const getInitiales = (p, n) => ((p?.charAt(0) ?? '') + (n?.charAt(0) ?? '')).toUpperCase() || '?';
const formatDate   = (iso) => !iso ? '—' : new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const getRoleLabel = (t) => ({ Usager: 'Usager', DPO: 'DPO', UtilisateurMetier: 'Utilisateur Métier', Administrateur: 'Administrateur', CIL: 'CIL' })[t] ?? t ?? '—';

// ═══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════

/**
 * SectionRequests
 * Props :
 *  - onApprove(id)            : callback appelé quand l'admin approuve une demande
 *  - onReject(id)             : callback appelé quand l'admin refuse une demande
 *  - onPendingCountChange(n)  : callback appelé dès que le nombre de demandes EN_ATTENTE change
 *                               → permet à TableauDeBoard de mettre à jour le badge sidebar
 *
 * Fetch automatique → GET  /api/admin/demandes          (toutes les 30s)
 * Approuver         → PUT  /api/admin/demandes/{id}/valider  { decision: 'APPROUVEE' }
 * Rejeter           → PUT  /api/admin/demandes/{id}/rejeter  { motif }
 */
const SectionRequests = ({ onApprove, onReject, onPendingCountChange }) => {
  const [openIds,      setOpenIds]      = useState({});
  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [rejetModal,   setRejetModal]   = useState(null);
  const [rejetLoading, setRejetLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res   = await fetch('http://localhost:8080/api/admin/demandes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        setRequests(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── CORRECTION : notifier le parent dès que requests change ─────
  // Recalcule le nombre de demandes EN_ATTENTE et remonte la valeur
  // via onPendingCountChange → la Sidebar affiche toujours le bon badge
  useEffect(() => {
    const count = requests.filter(r => r.statutDemandeAcces === 'EN_ATTENTE').length;
    onPendingCountChange?.(count);
  }, [requests]);
  // ────────────────────────────────────────────────────────────────

  // ── Handlers ─────────────────────────────────────────────────────
  const toggle = (id) => setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // Approuver → PUT /api/admin/demandes/{id}/valider
  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    // Optimistic update
    setRequests((r) => r.map((x) => x.idDemande === id ? { ...x, statutDemandeAcces: 'APPROUVEE' } : x));
    try {
      const res = await fetch(`http://localhost:8080/api/admin/demandes/${id}/valider`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision: 'APPROUVEE' }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const updated = await res.json().catch(() => null);
      if (updated) setRequests((r) => r.map((x) => x.idDemande === id ? { ...x, ...updated } : x));
      toast.success('Demande approuvée avec succès ✓');
      onApprove?.(id);
    } catch (err) {
      // Rollback en cas d'erreur
      setRequests((r) => r.map((x) => x.idDemande === id ? { ...x, statutDemandeAcces: 'EN_ATTENTE' } : x));
      toast.error('Échec de l\'approbation');
      console.error(err.message);
    }
  };

  // Ouvrir la modale de rejet
  const handleRejectClick = (req) => setRejetModal(req);

  // Confirmer le rejet avec motif → PUT /api/admin/demandes/{id}/rejeter
  const handleRejectConfirm = async (motif) => {
    const id    = rejetModal.idDemande;
    const token = localStorage.getItem('token');
    setRejetLoading(true);
    // Optimistic update
    setRequests((r) => r.map((x) => x.idDemande === id ? { ...x, statutDemandeAcces: 'REJETEE' } : x));
    try {
      const res = await fetch(`http://localhost:8080/api/admin/demandes/${id}/rejeter`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ motif }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const updated = await res.json().catch(() => null);
      if (updated) setRequests((r) => r.map((x) => x.idDemande === id ? { ...x, ...updated } : x));
      toast.error('Demande refusée');
      onReject?.(id);
      setRejetModal(null);
    } catch (err) {
      // Rollback en cas d'erreur
      setRequests((r) => r.map((x) => x.idDemande === id ? { ...x, statutDemandeAcces: 'EN_ATTENTE' } : x));
      toast.error('Échec du refus');
      console.error(err.message);
    } finally {
      setRejetLoading(false);
    }
  };

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="slide-in">
      <PageHeader title="Demandes de connexion" subtitle="Chargement en cours..." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.border, animation: 'pulse 1.4s ease-in-out infinite' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: '40%', height: 14, borderRadius: 6, background: T.border, animation: 'pulse 1.4s ease-in-out infinite' }} />
                <div style={{ width: '25%', height: 11, borderRadius: 6, background: T.border, animation: 'pulse 1.4s ease-in-out infinite' }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── Erreur ───────────────────────────────────────────────────────
  if (error) return (
    <div className="slide-in">
      <PageHeader title="Demandes de connexion" subtitle="Erreur de chargement" />
      <Card style={{ padding: '16px 18px', borderLeft: `3px solid ${T.red}` }}>
        <span style={{ color: T.red, fontSize: 13 }}>Impossible de charger les demandes : {error}</span>
      </Card>
    </div>
  );

  const pendingCount = requests.filter((r) => r.statutDemandeAcces === 'EN_ATTENTE').length;

  // ── Rendu principal ──────────────────────────────────────────────
  return (
    <>
      {/* Modale rejet (hors du flux) */}
      <ModalRejet
        demande={rejetModal}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejetModal(null)}
        loading={rejetLoading}
      />

      <div className="slide-in">
        <PageHeader
          title="Demandes de connexion"
          subtitle={`${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente de validation`}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {requests.map((req) => {
            const status     = getStatus(req.statutDemandeAcces);
            const isPending  = status === 'pending';
            const isApproved = status === 'approved';
            const isOpen     = !!openIds[req.idDemande];
            const initiales  = getInitiales(req.prenom, req.nom);
            const nomComplet = `${req.prenom ?? ''} ${req.nom ?? ''}`.trim() || req.email;

            const details = [
              { icon: <Mail size={11} />,      value: req.email },
              { icon: <Briefcase size={11} />, value: getRoleLabel(req.typeUtilisateur) },
              req.ville     && { icon: <MapPin size={11} />,    value: req.ville },
              req.telephone && { icon: <Phone size={11} />,     value: req.telephone },
              req.organisme && { icon: <Building size={11} />,  value: req.organisme },
              req.fonction  && { icon: <Briefcase size={11} />, value: req.fonction },
              { icon: <Clock size={11} />, value: formatDate(req.dateDemande) },
            ].filter(Boolean);

            const avatarBg     = isPending || isApproved ? T.greenBg      : T.redBg;
            const avatarColor  = isPending || isApproved ? T.green        : T.red;
            const avatarBorder = isPending || isApproved ? T.greenBorder  : T.redBorder;
            const accentColor  = isPending ? T.green : isApproved ? T.green : T.red;

            return (
              <Card key={req.idDemande} className={isPending ? 'card-hover' : ''} style={{ padding: '14px 18px', opacity: isPending ? 1 : 0.65, borderLeft: `3px solid ${accentColor}` }}>

                {/* ── Ligne principale ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar initials={initiales} size={44} bg={avatarBg} color={avatarColor} border={avatarBorder} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{nomComplet}</span>
                      <Badge type={isPending ? 'pending' : isApproved ? 'active' : 'inactive'} />
                    </div>
                    <span style={{ fontSize: 12, color: T.textSecondary }}>{getRoleLabel(req.typeUtilisateur)}</span>
                  </div>

                  {/* Boutons / statut */}
                  {isPending ? (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleApprove(req.idDemande)} style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 8, padding: '8px 16px', color: T.green, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Check size={13} /> Approuver
                      </button>
                      <button onClick={() => handleRejectClick(req)} style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8, padding: '8px 16px', color: T.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <X size={13} /> Refuser
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, color: isApproved ? T.green : T.red, background: isApproved ? T.greenBg : T.redBg, border: `1px solid ${isApproved ? T.greenBorder : T.redBorder}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {isApproved ? <Check size={13} /> : <X size={13} />}
                      {isApproved ? 'Approuvé' : 'Refusé'}
                    </div>
                  )}
                </div>

                {/* ── Toggle accordéon ── */}
                <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 10, paddingTop: 8 }}>
                  <button onClick={() => toggle(req.idDemande)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: T.textSecondary, fontSize: 12, padding: 0 }}>
                    <FileText size={13} />
                    <span>Détails de la demande</span>
                    <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }} />
                  </button>
                </div>

                {/* ── Panneau accordéon ── */}
                <div style={{ maxHeight: isOpen ? 300 : 0, overflow: 'hidden', opacity: isOpen ? 1 : 0, transition: 'max-height 0.3s ease, opacity 0.3s ease' }}>
                  <div style={{ marginTop: 10, padding: '10px 14px', background: T.greenBg, borderRadius: 8, borderLeft: `3px solid ${T.greenBorder}`, lineHeight: 1.6 }}>

                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: T.green, marginBottom: 6 }}>Informations</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${T.greenBorder}` }}>
                      {details.map(({ icon, value }, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.textSecondary }}>
                          <span style={{ color: T.green }}>{icon}</span>
                          {value}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: T.green, marginBottom: 6 }}>Motif</div>
                    <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.65 }}>
                      {req.motif ? req.motif : <span style={{ color: T.textMuted, fontStyle: 'italic' }}>Aucun motif renseigné</span>}
                    </div>

                    {req.adminTraitantNom && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.greenBorder}`, fontSize: 12, color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                        Traité par <strong style={{ marginLeft: 4 }}>{req.adminTraitantNom}</strong>
                        {req.dateValidation && <span style={{ marginLeft: 6 }}>· {formatDate(req.dateValidation)}</span>}
                      </div>
                    )}
                  </div>
                </div>

              </Card>
            );
          })}

          {requests.length === 0 && (
            <Card style={{ padding: '24px 18px', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: T.textSecondary, fontStyle: 'italic' }}>Aucune demande enregistrée.</span>
            </Card>
          )}
        </div>

        {/* Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .slide-in { animation: slideIn 0.22s ease; }
          @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
          @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes spin    { to { transform: rotate(360deg); } }
          .sofitex-card { transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; }
          .card-hover:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important; transform: translateY(-1px); }
        `}</style>
      </div>
    </>
  );
};

export default SectionRequests;