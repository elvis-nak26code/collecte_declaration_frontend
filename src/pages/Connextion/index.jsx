import { useState } from "react";

import Logo from '../../assets/logosofitex.jpeg'
import Chargement from '../../components/Chargement'
import { Link } from "react-router-dom";

import bg2 from "../../assets/bg2.png";

import toast from 'react-hot-toast';

const API_BASE_URL = "http://localhost:8080/api";

// ── Modal "Mot de passe oublié" ─────────────────────────────────────────────
function ModalMotDePasseOublie({ visible, onClose }) {
    const [email, setEmail] = useState("");
    const [envoi, setEnvoi] = useState(false);

    if (!visible) return null;

    async function handleEnvoyer(e) {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Veuillez saisir votre adresse email.");
            return;
        }
        setEnvoi(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/mot-de-passe-oublie`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = null; }

            if (!response.ok) {
                const message = (data && (data.message || data.error)) || "Une erreur est survenue. Veuillez réessayer.";
                throw new Error(message);
            }

            toast.success((data && data.message) || "Un email de réinitialisation vient de vous être envoyé.");
            setEmail("");
            onClose();
        } catch (error) {
            toast.error(error.message || "Impossible d'envoyer l'email de réinitialisation. Vérifiez votre connexion.");
        } finally {
            setEnvoi(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(4,15,8,0.65)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
        >
            <div
                className="w-full rounded-2xl p-7 relative"
                style={{ maxWidth: "400px", background: "#0e2313", border: "1px solid rgba(255,255,255,0.14)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition"
                    aria-label="Fermer"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex items-center gap-2.5 mb-2">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(46,166,90,0.18)" }}
                    >
                        <svg className="w-4 h-4" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white">Mot de passe oublié</h2>
                </div>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Saisissez votre adresse email : nous vous enverrons un lien pour créer un nouveau mot de passe.
                </p>

                <form onSubmit={handleEnvoyer} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 text-white" style={{ letterSpacing: "0.1em" }}>
                            ADRESSE E-MAIL
                        </label>
                        <div
                            className="flex items-center gap-2.5 px-3.5 py-3 rounded"
                            style={{ border: "2px solid rgba(255,255,255,.4)" }}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm placeholder-white/40"
                                style={{ color: "white" }}
                                placeholder="vous@entreprise.com"
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={envoi}
                        className="w-full py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm"
                        style={{
                            background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)",
                            boxShadow: "0 4px 20px rgba(30,120,60,0.40)",
                            opacity: envoi ? 0.75 : 1,
                        }}
                    >
                        {envoi ? (
                            <>
                                <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" style={{ opacity: 0.25 }} />
                                    <path fill="white" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Envoi en cours…
                            </>
                        ) : "Envoyer le lien de réinitialisation"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Connextion() {
    const [email, setEmail] = useState("");
    const [motDePasse, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [showOublie, setShowOublie] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, motDePasse }),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = null; }

            if (!response.ok) {
                // On affiche le vrai message renvoyé par le serveur (désormais
                // explicite grâce à GlobalExceptionHandler) plutôt qu'un message
                // générique figé, sauf si le serveur ne renvoie vraiment rien.
                const message = (data && (data.message || data.error)) || "Email ou mot de passe incorrect.";
                throw new Error(message);
            }

            toast.success("Bienvenue !");

            localStorage.setItem("token", data.token);
            localStorage.setItem("email", email);

            setChargement(true);

        } catch (error) {
            // Erreur réseau (serveur injoignable, etc.) vs erreur métier :
            // on distingue les deux pour ne jamais afficher un message trompeur.
            if (error instanceof TypeError) {
                toast.error("Impossible de contacter le serveur. Vérifiez votre connexion réseau.");
            } else {
                toast.error(error.message || "Une erreur est survenue lors de la connexion.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (

        <div
            style={{ backgroundImage: `url(${bg2})` }}
            className=" min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat">

            {/* Carte */}
            <div className=" relative z-10 w-full mx-4 border-2 border-white rounded-4xl" style={{ maxWidth: "430px" }}>
                <div
                    className="rounded p-8 shadow-2xl bg-black/40 backdrop-blur-xs border border-white/30"

                >
                    {/* Logo + Nom */}
                    <div className="flex items-center gap-3 mb-7 rounded-2xl">
                        <img className="w-20 rounded-full" src={Logo} alt="Logo SOFITEX " />
                        <span className="text-xl font-bold" style={{ color: "white", fontFamily: "Georgia, serif" }}>
                            SOFITEX
                        </span>
                    </div>

                    {/* Titre */}
                    <h1 className="text-xl font-bold mb-1 " style={{ color: "white", fontFamily: "Georgia, serif" }}>
                        Patforme de collecte de données
                    </h1>
                    <p className="text-sm mb-7" style={{ color: "rgba(0,255,255,1)" }}>
                        Pas encore de compte ?{" "}
                        <Link to="/inscription" className="underline font-medium" style={{ color: "rgba(0,255,255,.7)" }}>
                            Inscrivez-vous
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label
                                className="block text-xs font-semibold mb-1.5 text-white"
                                style={{ letterSpacing: "0.1em" }}
                            >
                                ADRESSE E-MAIL
                            </label>
                            <div
                                className="flex items-center gap-2.5 px-3.5 py-3 rounded "
                                style={{
                                    border: focused === "email"
                                        ? "2px solid rgba(255,255,255,1)"
                                        : "2px solid rgba(255,255,255,.4)",
                                    boxShadow: focused === "email" ? "0 0 0 3px rgba(26,130,65,0.09)" : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused("email")}
                                    onBlur={() => setFocused(null)}
                                    className="flex-1 bg-transparent outline-none text-sm placeholder-white/80"
                                    style={{ color: "white" }}
                                    placeholder="vous@entreprise.com"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label
                                className="block text-xs font-semibold mb-1.5 text-white"
                                style={{ letterSpacing: "0.1em" }}
                            >
                                MOT DE PASSE
                            </label>
                            <div
                                className="flex items-center gap-2.5 px-3.5 py-3 rounded"
                                style={{
                                    border: focused === "password"
                                        ? "2px solid rgba(255,255,255,1)"
                                        : "2px solid rgba(255,255,255,.4)",
                                    boxShadow: focused === "password" ? "0 0 0 3px rgba(26,130,65,0.09)" : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={motDePasse}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused("password")}
                                    onBlur={() => setFocused(null)}
                                    className="flex-1 bg-transparent outline-none text-sm  placeholder-white/80"
                                    style={{ color: "white" }}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0">
                                    {showPassword ? (
                                        <svg className="w-4 h-4" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mot de passe oublié */}
                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                onClick={() => setShowOublie(true)}
                                className="text-xs font-medium"
                                style={{ color: "rgba(0,255,255,1)" }}
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        {/* Bouton Se connecter */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm mt-2"
                            style={{
                                background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)",
                                boxShadow: "0 4px 20px rgba(30,120,60,0.40), 0 1px 3px rgba(0,0,0,0.12)",
                                transition: "opacity 0.2s, transform 0.1s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            {loading ? (
                                <>
                                    <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" style={{ opacity: 0.25 }} />
                                        <path fill="white" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Connexion en cours…
                                </>
                            ) : (
                                <>
                                    Se connecter
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Mention sécurité entreprise */}
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                            <svg className="w-3 h-3" style={{ color: "#8aaa95" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p className="text-xs" style={{ color: "#8aaa95" }}>
                                Système sécurisé · Accès restreint aux utilisateurs autorisés
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <style>{` @keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <ModalMotDePasseOublie visible={showOublie} onClose={() => setShowOublie(false)} />

            {chargement && <Chargement texte={"BIEN VENUE : CHARGEMENT DU TABLEAU DE BORD . . ."} email={email} />}
        </div>
    );
}