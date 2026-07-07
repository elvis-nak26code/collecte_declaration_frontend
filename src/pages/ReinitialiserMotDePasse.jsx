// src/pages/ReinitialiserMotDePasse.jsx
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

import Logo from "../assets/logosofitex.jpeg";
import bg2 from "../assets/bg2.png";


const API_BASE_URL = "http://localhost:8080/api";

export default function ReinitialiserMotDePasse() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [succes, setSucces] = useState(false);
    const [focused, setFocused] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!token) {
            toast.error("Ce lien de réinitialisation est invalide : le jeton est manquant.");
            return;
        }
        if (nouveauMotDePasse.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (nouveauMotDePasse !== confirmation) {
            toast.error("Les deux mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reinitialiser-mot-de-passe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, nouveauMotDePasse }),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = null; }

            if (!response.ok) {
                const message = (data && (data.message || data.error)) || "Impossible de réinitialiser le mot de passe.";
                throw new Error(message);
            }

            toast.success((data && data.message) || "Mot de passe réinitialisé avec succès.");
            setSucces(true);
        } catch (error) {
            toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{ backgroundImage: `url(${bg2})` }}
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
        >
            <div className="relative z-10 w-full mx-4 border-2 border-white rounded-4xl" style={{ maxWidth: "430px" }}>
                <div className="rounded p-8 shadow-2xl bg-black/40 backdrop-blur-xs border border-white/30">

                    <div className="flex items-center gap-3 mb-7 rounded-2xl">
                        <img className="w-20 rounded-full" src={Logo} alt="Logo SOFITEX" />
                        <span className="text-xl font-bold" style={{ color: "white", fontFamily: "Georgia, serif" }}>
                            SOFITEX
                        </span>
                    </div>

                    {succes ? (
                        <>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(46,166,90,0.22)" }}
                                >
                                    <svg className="w-5 h-5" style={{ color: "#4ade80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-bold" style={{ color: "white", fontFamily: "Georgia, serif" }}>
                                    Mot de passe réinitialisé
                                </h1>
                            </div>
                            <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Votre mot de passe a bien été mis à jour. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
                            </p>
                            <Link
                                to="/"
                                className="w-full py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm"
                                style={{
                                    background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)",
                                    boxShadow: "0 4px 20px rgba(30,120,60,0.40)",
                                }}
                            >
                                Aller à la connexion
                            </Link>
                        </>
                    ) : !token ? (
                        <>
                            <h1 className="text-xl font-bold mb-2" style={{ color: "white", fontFamily: "Georgia, serif" }}>
                                Lien invalide
                            </h1>
                            <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Ce lien de réinitialisation est incomplet ou invalide. Merci de refaire une demande de
                                mot de passe oublié depuis la page de connexion.
                            </p>
                            <Link to="/" className="underline text-sm font-medium" style={{ color: "rgba(0,255,255,.8)" }}>
                                Retour à la connexion
                            </Link>
                        </>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold mb-1" style={{ color: "white", fontFamily: "Georgia, serif" }}>
                                Choisir un nouveau mot de passe
                            </h1>
                            <p className="text-sm mb-7" style={{ color: "rgba(0,255,255,1)" }}>
                                Ce lien est valable 30 minutes.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-white" style={{ letterSpacing: "0.1em" }}>
                                        NOUVEAU MOT DE PASSE
                                    </label>
                                    <div
                                        className="flex items-center gap-2.5 px-3.5 py-3 rounded"
                                        style={{
                                            border: focused === "mdp" ? "2px solid rgba(255,255,255,1)" : "2px solid rgba(255,255,255,.4)",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={nouveauMotDePasse}
                                            onChange={(e) => setNouveauMotDePasse(e.target.value)}
                                            onFocus={() => setFocused("mdp")}
                                            onBlur={() => setFocused(null)}
                                            className="flex-1 bg-transparent outline-none text-sm placeholder-white/80"
                                            style={{ color: "white" }}
                                            placeholder="Au moins 6 caractères"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0">
                                            <svg className="w-4 h-4" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                {showPassword ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                ) : (
                                                    <>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-white" style={{ letterSpacing: "0.1em" }}>
                                        CONFIRMER LE MOT DE PASSE
                                    </label>
                                    <div
                                        className="flex items-center gap-2.5 px-3.5 py-3 rounded"
                                        style={{
                                            border: focused === "confirm" ? "2px solid rgba(255,255,255,1)" : "2px solid rgba(255,255,255,.4)",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#6aaa80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmation}
                                            onChange={(e) => setConfirmation(e.target.value)}
                                            onFocus={() => setFocused("confirm")}
                                            onBlur={() => setFocused(null)}
                                            className="flex-1 bg-transparent outline-none text-sm placeholder-white/80"
                                            style={{ color: "white" }}
                                            placeholder="Retapez le mot de passe"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm mt-2"
                                    style={{
                                        background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)",
                                        boxShadow: "0 4px 20px rgba(30,120,60,0.40)",
                                        opacity: loading ? 0.75 : 1,
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" style={{ opacity: 0.25 }} />
                                                <path fill="white" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Mise à jour…
                                        </>
                                    ) : "Réinitialiser le mot de passe"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <style>{` @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
