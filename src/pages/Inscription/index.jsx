import { useState } from "react";
import Logo from "../../assets/logosofitex.jpeg";
import { Link } from "react-router-dom";
import bg2 from "../../assets/bg2.png";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   COMPOSANTS UI
───────────────────────────────────────────── */
function InputWrap({ focused, children }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-3 rounded"
      style={{
        border: focused ? "2px solid rgba(255,255,255,1)" : "2px solid rgba(255,255,255,.4)",
        boxShadow: focused ? "0 0 0 3px rgba(26,130,65,0.09)" : "none",
        transition: "all 0.2s ease",
      }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3 pb-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,255,255,1)" }} />
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(0,255,255,1)", letterSpacing: "0.12em" }}>{children}</span>
    </div>
  );
}

const ic = "w-4 h-4 flex-shrink-0";
const icStyle = { color: "#6aaa80" };
function IconUser()     { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function IconMail()     { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function IconPhone()    { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
function IconLock()     { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>; }
function IconBuilding() { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>; }
function IconPin()      { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconDoc()      { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function IconHash()     { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" /></svg>; }
function IconBriefcase(){ return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function IconShield()   { return <svg className={ic} style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function IconEyeOn()    { return <svg className="w-4 h-4" style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>; }
function IconEyeOff()   { return <svg className="w-4 h-4" style={icStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>; }
function IconCheck()    { return <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>; }

const USER_TYPES = [
  { value: "UTILISATEUR_METIER", label: "Utilisateur Métier", desc: "Accès aux traitements métier",            Icon: IconBriefcase },
  { value: "CIL",                label: "CIL",                desc: "Correspondant Informatique & Libertés",  Icon: IconShield },
  { value: "DPO",                label: "DPO",                desc: "Délégué à la Protection des Données",    Icon: IconDoc },
  { value: "DG",                 label: "DG",                 desc: "Direction Générale",                     Icon: IconBuilding },
];

function TypeCard({ type, selected, onClick }) {
  const { label, desc, Icon } = type;
  return (
    <button type="button" onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded text-center transition-all"
      style={{
        border: selected ? "1px solid rgba(0,255,0,0.4)" : "1.5px solid rgba(255,255,255,0.30)",
        background: selected ? "rgba(46,166,90,0.1)" : "rgba(255,255,255,0.08)",
        boxShadow: selected ? "0 0 0 3px rgba(26,130,65,0.1)" : "none",
        transition: "all 0.18s ease",
      }}>
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full"
        style={{ background: selected ? "rgba(46,166,90,0.30)" : "rgba(255,255,255,0.10)" }}>
        <Icon />
      </span>
      <span className="text-xs font-bold" style={{ color: selected ? "rgba(0,255,0,0.9)" : "white" }}>{label}</span>
      <span className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</span>
    </button>
  );
}

export default function Inscription() {
  const [step, setStep]               = useState(1);
  const [focused, setFocused]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});

  const [nom, setNom]               = useState("");
  const [prenom, setPrenom]         = useState("");
  const [email, setEmail]           = useState("");
  const [telephone, setTelephone]   = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [typeUtilisateur, setTypeUtilisateur] = useState("");
  const [fonction, setFonction]       = useState("");
  const [departement, setDepartement] = useState("");
  const [telMetier, setTelMetier]     = useState("");
  const [service, setService]         = useState("");
  const [niveauResp, setNiveauResp]   = useState("");
  const [telCil, setTelCil]           = useState(""); // ✅ nouveau : tél CIL
  const [organisme, setOrganisme]     = useState("");
  const [adressePro, setAdressePro]   = useState("");
  const [telDg, setTelDg]             = useState(""); // ✅ nouveau : tél DG
  const [motif, setMotif]             = useState("");

  const fb = (name) => ({ onFocus: () => setFocused(name), onBlur: () => setFocused(null) });
  const inputClass = "flex-1 bg-transparent outline-none text-sm placeholder-white/60";
  const inputStyle = { color: "white" };
  const labelClass = "block text-xs font-semibold mb-1.5 text-white";
  const labelStyle = { letterSpacing: "0.1em" };
  const errStyle   = { color: "#ff6b6b", fontSize: "0.7rem", marginTop: "2px" };

  const validateStep1 = () => {
    const e = {};
    if (!nom.trim())        e.nom = "Requis";
    if (!prenom.trim())     e.prenom = "Requis";
    if (!email.trim() || !email.includes("@")) e.email = "Email invalide";
    if (motDePasse.length < 8) e.motDePasse = "8 caractères min.";
    if (motDePasse !== confirmation) e.confirmation = "Ne correspond pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!typeUtilisateur) { e.type = "Choisissez un type"; }
    else {
      if (typeUtilisateur === "UTILISATEUR_METIER") {
        if (!fonction.trim())    e.fonction    = "Requis";
        if (!departement.trim()) e.departement = "Requis";
      }
      if (typeUtilisateur === "CIL") {
        if (!service.trim())  e.service    = "Requis";
        if (!niveauResp)      e.niveauResp = "Requis";
        if (!telCil.trim())   e.telCil     = "Requis"; // ✅
      }
      if (typeUtilisateur === "DPO") {
        if (!organisme.trim())  e.organisme  = "Requis";
        if (!adressePro.trim()) e.adressePro = "Requis";
      }
      if (typeUtilisateur === "DG") {
        if (!telDg.trim()) e.telDg = "Requis"; // ✅
      }
    }
    if (!motif.trim()) e.motif = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const commonPayload = {
        nom, prenom, email, telephone, motDePasse,
        typeUtilisateur,
        motifDemande: motif,
        dateDemande: new Date().toISOString(),
      };
      const specificPayload =
        typeUtilisateur === "UTILISATEUR_METIER" ? { fonction, departement, telephone: telMetier || telephone } :
        typeUtilisateur === "CIL"                ? { service, niveauResponsabilite: niveauResp, telephone: telCil } :
        typeUtilisateur === "DPO"                ? { organisme, adresseProfessionnelle: adressePro } :
        typeUtilisateur === "DG"                 ? { telephone: telDg } :
        {};
      const payload = { ...commonPayload, ...specificPayload };
      const response = await fetch("http://localhost:8080/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Erreur lors de l'inscription");
      }
      setStep(3);
      toast.success("Votre demande d'accès a été envoyée avec succès !");
    } catch (err) {
      // alert("Erreur : " + err.message);
      toast.error("Échec de l'inscription : " + err.message);
      console.error(err);
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const textareaWrapStyle = (f) => ({
    border: focused === f ? "2px solid rgba(255,255,255,1)" : "2px solid rgba(255,255,255,.4)",
    boxShadow: focused === f ? "0 0 0 3px rgba(26,130,65,0.09)" : "none",
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ backgroundImage: `url(${bg2})` }}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat py-8">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="relative z-10 w-full mx-4 border-2 border-white rounded-4xl" style={{ maxWidth: "580px" }}>
        <div className="rounded p-8 shadow-2xl bg-black/40 backdrop-blur-xs border border-white/30">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-5">
            <img className="w-20 rounded-full" src={Logo} alt="Logo SOFITEX" />
            <span className="text-xl font-bold" style={{ color: "white", fontFamily: "Georgia, serif" }}>SOFITEX</span>
          </div>

          <h1 className="text-xl font-bold mb-1" style={{ color: "white", fontFamily: "Georgia, serif" }}>
            Créer un compte &amp; demande d'accès
          </h1>
          <p className="text-sm mb-5" style={{ color: "rgba(0,255,255,1)" }}>
            Déjà inscrit ?{" "}
            <Link to="/" className="underline font-medium" style={{ color: "rgba(0,255,255,1)" }}>Se connecter</Link>
          </p>

          {/* Indicateur d'étapes */}
          {step < 3 && (
            <div className="flex gap-0 mb-6 rounded overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.20)" }}>
              {[
                { n: 1, label: "Informations personnelles" },
                { n: 2, label: "Type & demande d'accès" },
              ].map(({ n, label }) => (
                <button key={n} type="button" onClick={() => n < step && setStep(n)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all"
                  style={{
                    background: step === n ? "rgba(46,166,90,0.25)" : "transparent",
                    color: step === n ? "rgba(0,255,255,1)" : "rgba(255,255,255,0.45)",
                    borderBottom: step === n ? "2px solid #2ea65a" : "2px solid transparent",
                    cursor: n < step ? "pointer" : "default",
                  }}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold"
                    style={{
                      background: step === n ? "white" : "rgba(255,255,255,0.12)",
                      color: step === n ? "black" : "rgba(255,255,255,0.45)",
                    }}>{n}</span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ═══ ÉTAPE 1 ═══ */}
          {step === 1 && (
            <div>
              <SectionLabel>Identité</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={labelStyle}>NOM</label>
                  <InputWrap focused={focused === "nom"}>
                    <IconUser />
                    <input type="text" value={nom} onChange={e => setNom(e.target.value)} {...fb("nom")} className={inputClass} style={inputStyle} placeholder="SAWADOGO" />
                  </InputWrap>
                  {errors.nom && <p style={errStyle}>{errors.nom}</p>}
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>PRÉNOM</label>
                  <InputWrap focused={focused === "prenom"}>
                    <IconUser />
                    <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} {...fb("prenom")} className={inputClass} style={inputStyle} placeholder="Moussa" />
                  </InputWrap>
                  {errors.prenom && <p style={errStyle}>{errors.prenom}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelClass} style={labelStyle}>ADRESSE E-MAIL</label>
                  <InputWrap focused={focused === "email"}>
                    <IconMail />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} {...fb("email")} className={inputClass} style={inputStyle} placeholder="vous@sofitex.bf" />
                  </InputWrap>
                  {errors.email && <p style={errStyle}>{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>TÉLÉPHONE</label>
                  <InputWrap focused={focused === "tel"}>
                    <IconPhone />
                    <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} {...fb("tel")} className={inputClass} style={inputStyle} placeholder="+226 70 00 00 00" />
                  </InputWrap>
                </div>
              </div>

              <SectionLabel>Sécurité</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={labelStyle}>MOT DE PASSE</label>
                  <InputWrap focused={focused === "pwd"}>
                    <IconLock />
                    <input type={showPwd ? "text" : "password"} value={motDePasse} onChange={e => setMotDePasse(e.target.value)} {...fb("pwd")} className={inputClass} style={inputStyle} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="flex-shrink-0">{showPwd ? <IconEyeOn /> : <IconEyeOff />}</button>
                  </InputWrap>
                  {errors.motDePasse && <p style={errStyle}>{errors.motDePasse}</p>}
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>CONFIRMER</label>
                  <InputWrap focused={focused === "confirm"}>
                    <IconLock />
                    <input type={showConfirm ? "text" : "password"} value={confirmation} onChange={e => setConfirmation(e.target.value)} {...fb("confirm")} className={inputClass} style={inputStyle} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="flex-shrink-0">{showConfirm ? <IconEyeOn /> : <IconEyeOff />}</button>
                  </InputWrap>
                  {errors.confirmation && <p style={errStyle}>{errors.confirmation}</p>}
                </div>
              </div>

              <button type="button" onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm mt-4"
                style={{ background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)", boxShadow: "0 4px 20px rgba(30,120,60,0.40)", transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Continuer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          )}

          {/* ═══ ÉTAPE 2 ═══ */}
          {step === 2 && (
            <div>
              <SectionLabel>Type d'utilisateur</SectionLabel>
              <div className="grid grid-cols-4 gap-2">
                {USER_TYPES.map(t => (
                  <TypeCard key={t.value} type={t} selected={typeUtilisateur === t.value}
                    onClick={() => { setTypeUtilisateur(t.value); setErrors(prev => ({ ...prev, type: undefined })); }} />
                ))}
              </div>
              {errors.type && <p style={errStyle} className="mt-1">{errors.type}</p>}

              {/* ── Utilisateur Métier ── */}
              {typeUtilisateur === "UTILISATEUR_METIER" && (
                <>
                  <SectionLabel>Informations professionnelles</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} style={labelStyle}>FONCTION</label>
                      <InputWrap focused={focused === "fonction"}>
                        <IconBriefcase />
                        <input type="text" value={fonction} onChange={e => setFonction(e.target.value)} {...fb("fonction")} className={inputClass} style={inputStyle} placeholder="Ex : Analyste" />
                      </InputWrap>
                      {errors.fonction && <p style={errStyle}>{errors.fonction}</p>}
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>DÉPARTEMENT</label>
                      <InputWrap focused={focused === "dept"}>
                        <IconBuilding />
                        <input type="text" value={departement} onChange={e => setDepartement(e.target.value)} {...fb("dept")} className={inputClass} style={inputStyle} placeholder="Ex : DSI" />
                      </InputWrap>
                      {errors.departement && <p style={errStyle}>{errors.departement}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass} style={labelStyle}>TÉL. PROFESSIONNEL</label>
                      <InputWrap focused={focused === "telm"}>
                        <IconPhone />
                        <input type="tel" value={telMetier} onChange={e => setTelMetier(e.target.value)} {...fb("telm")} className={inputClass} style={inputStyle} placeholder="+226 70 00 00 00" />
                      </InputWrap>
                    </div>
                  </div>
                </>
              )}

              {/* ── CIL ── */}
              {typeUtilisateur === "CIL" && (
                <>
                  <SectionLabel>Informations CIL</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} style={labelStyle}>SERVICE</label>
                      <InputWrap focused={focused === "service"}>
                        <IconBuilding />
                        <input type="text" value={service} onChange={e => setService(e.target.value)} {...fb("service")} className={inputClass} style={inputStyle} placeholder="Ex : Service informatique" />
                      </InputWrap>
                      {errors.service && <p style={errStyle}>{errors.service}</p>}
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>NIVEAU DE RESPONSABILITÉ</label>
                      <InputWrap focused={focused === "niveau"}>
                        <IconHash />
                        <select value={niveauResp} onChange={e => setNiveauResp(e.target.value)} {...fb("niveau")} className={inputClass} style={{ ...inputStyle, background: "transparent" }}>
                          <option value="" style={{ background: "#0d2b1a" }}>Sélectionner...</option>
                          <option value="junior" style={{ background: "#0d2b1a" }}>Junior</option>
                          <option value="senior" style={{ background: "#0d2b1a" }}>Senior</option>
                          <option value="chef_service" style={{ background: "#0d2b1a" }}>Chef de service</option>
                        </select>
                      </InputWrap>
                      {errors.niveauResp && <p style={errStyle}>{errors.niveauResp}</p>}
                    </div>
                    {/* ✅ Téléphone professionnel CIL */}
                    <div className="col-span-2">
                      <label className={labelClass} style={labelStyle}>TÉL. PROFESSIONNEL</label>
                      <InputWrap focused={focused === "telcil"}>
                        <IconPhone />
                        <input type="tel" value={telCil} onChange={e => setTelCil(e.target.value)} {...fb("telcil")} className={inputClass} style={inputStyle} placeholder="+226 70 00 00 00" />
                      </InputWrap>
                      {errors.telCil && <p style={errStyle}>{errors.telCil}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* ── DPO ── */}
              {typeUtilisateur === "DPO" && (
                <>
                  <SectionLabel>Informations DPO</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={labelClass} style={labelStyle}>ORGANISME</label>
                      <InputWrap focused={focused === "organisme"}>
                        <IconBuilding />
                        <input type="text" value={organisme} onChange={e => setOrganisme(e.target.value)} {...fb("organisme")} className={inputClass} style={inputStyle} placeholder="Nom de l'organisme" />
                      </InputWrap>
                      {errors.organisme && <p style={errStyle}>{errors.organisme}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass} style={labelStyle}>ADRESSE PROFESSIONNELLE</label>
                      <InputWrap focused={focused === "adressepro"}>
                        <IconPin />
                        <input type="text" value={adressePro} onChange={e => setAdressePro(e.target.value)} {...fb("adressepro")} className={inputClass} style={inputStyle} placeholder="Adresse complète" />
                      </InputWrap>
                      {errors.adressePro && <p style={errStyle}>{errors.adressePro}</p>}
                    </div>
                    {/* ✅ date de nomination supprimée */}
                  </div>
                </>
              )}

              {/* ── DG ── */}
              {typeUtilisateur === "DG" && (
                <>
                  <SectionLabel>Informations Direction Générale</SectionLabel>
                  {/* ✅ idDg supprimé, remplacé par tél. professionnel */}
                  <div>
                    <label className={labelClass} style={labelStyle}>TÉL. PROFESSIONNEL</label>
                    <InputWrap focused={focused === "teldg"}>
                      <IconPhone />
                      <input type="tel" value={telDg} onChange={e => setTelDg(e.target.value)} {...fb("teldg")} className={inputClass} style={inputStyle} placeholder="+226 70 00 00 00" />
                    </InputWrap>
                    {errors.telDg && <p style={errStyle}>{errors.telDg}</p>}
                  </div>
                </>
              )}

              {/* ── Motif ── */}
              <SectionLabel>Justification</SectionLabel>
              <div>
                <label className={labelClass} style={labelStyle}>MOTIF DE LA DEMANDE</label>
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded" style={textareaWrapStyle("motif")}>
                  <IconDoc />
                  <textarea value={motif} onChange={e => setMotif(e.target.value)}
                    onFocus={() => setFocused("motif")} onBlur={() => setFocused(null)}
                    rows={3} className="flex-1 bg-transparent outline-none text-sm resize-none placeholder-white/60"
                    style={{ color: "white", lineHeight: "1.5" }}
                    placeholder="Décrivez brièvement votre besoin d'accès à cette plateforme..." />
                </div>
                {errors.motif && <p style={errStyle}>{errors.motif}</p>}
              </div>

              {errors.submit && (
                <div className="mt-3 px-3.5 py-2.5 rounded text-xs"
                  style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(255,100,100,0.30)", color: "#ff6b6b" }}>
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded text-sm font-semibold"
                  style={{ background: "transparent", color: "rgba(0,255,255,1)", border: "2px solid rgba(255,255,255,0.40)", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                  Retour
                </button>
                <button type="button" disabled={loading} onClick={handleSubmit}
                  className="flex-1 py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)", boxShadow: "0 4px 20px rgba(30,120,60,0.40)", transition: "opacity 0.2s", opacity: loading ? 0.7 : 1 }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}>
                  {loading ? (
                    <>
                      <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" style={{ opacity: 0.25 }} />
                        <path fill="white" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Soumettre la demande
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═══ ÉTAPE 3 — Succès ═══ */}
          {step === 3 && (
  <div className="flex flex-col items-center py-4 text-center">

    {/* Icône succès */}
    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
      style={{ background: "rgba(46,166,90,0.20)", border: "1.5px solid rgba(46,166,90,0.50)" }}>
      <IconCheck />
    </div>

    {/* Titre */}
    <h2 className="text-lg font-bold mb-1.5" style={{ color: "white", fontFamily: "Georgia, serif" }}>
      Demande envoyée !
    </h2>
    <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
      Votre compte a bien été créé. Votre demande d'accès est en attente de validation.
    </p>

    {/* Badge statut */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
      style={{
        background: "rgba(243,156,18,0.12)",
        border: "1px solid rgba(243,156,18,0.35)"
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f39c12" }} />
      <span className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#f8c471", letterSpacing: "0.12em" }}>
        En attente
      </span>
    </div>

    {/* Récapitulatif */}
    <div className="w-full rounded overflow-hidden mb-5"
      style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
      <div className="px-4 py-2.5"
        style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <p className="text-xs font-bold uppercase tracking-wider text-left m-0"
          style={{ color: "rgba(0,255,0,0.65)", letterSpacing: "0.10em" }}>
          Récapitulatif
        </p>
      </div>
      {[
        ["Nom",             `${prenom} ${nom}`],
        ["Email",           email],
        ["Type",            USER_TYPES.find(t => t.value === typeUtilisateur)?.label || typeUtilisateur],
        ["Date de demande", new Date().toLocaleDateString("fr-FR")],
      ].map(([k, v], i, arr) => (
        <div key={k} className="flex justify-between items-center px-4 py-2.5 text-sm"
          style={{
            background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
            borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}>
          <span style={{ color: "rgba(255,255,255,0.50)" }}>{k}</span>
          <span className="font-semibold" style={{ color: "white" }}>{v}</span>
        </div>
      ))}
    </div>

    {/* Note bas */}
    <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
      Un administrateur traitera votre demande et vous notifiera par e-mail.
    </p>

    {/* Bouton retour */}
    <button type="button"
      onClick={() => {
        setStep(1);
        setTypeUtilisateur(""); setNom(""); setPrenom("");
        setEmail(""); setMotif("");
      }}
      className="flex items-center gap-1.5 text-sm font-medium underline"
      style={{ color: "rgba(0,255,255,1)", background: "none", border: "none", cursor: "pointer" }}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
      </svg>
      Retour à l'accueil
    </button>

  </div>
)}

          {/* Pied de carte */}
          <div className="flex items-center justify-center gap-1.5 pt-4 mt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <svg className="w-3 h-3" style={{ color: "rgba(255,255,255,0.35)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Système sécurisé · Accès restreint aux utilisateurs autorisés
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}