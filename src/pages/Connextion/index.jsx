import { useState } from "react";

// Feuille SVG simple — forme naturelle de feuille avec nervure
function Leaf({ x, y, size, rotation, opacity }) {
    return (
        <g transform={`translate(${x},${y}) rotate(${rotation}) scale(${size})`} style={{ opacity }}>
            {/* Corps de la feuille */}
            <path
                d="M0,-1 C0.6,-0.7 1,0 0.5,0.8 C0.2,1.2 -0.2,1.2 -0.5,0.8 C-1,0 -0.6,-0.7 0,-1 Z"
                fill="none"
                stroke="rgba(80,220,120,0.55)"
                strokeWidth="0.08"
            />
            {/* Nervure centrale */}
            <line x1="0" y1="-0.9" x2="0" y2="1.0" stroke="rgba(80,220,120,0.40)" strokeWidth="0.05" />
            {/* Nervures latérales */}
            <line x1="0" y1="-0.3" x2="0.38" y2="0.15" stroke="rgba(80,220,120,0.22)" strokeWidth="0.04" />
            <line x1="0" y1="-0.3" x2="-0.38" y2="0.15" stroke="rgba(80,220,120,0.22)" strokeWidth="0.04" />
            <line x1="0" y1="0.2" x2="0.28" y2="0.55" stroke="rgba(80,220,120,0.18)" strokeWidth="0.03" />
            <line x1="0" y1="0.2" x2="-0.28" y2="0.55" stroke="rgba(80,220,120,0.18)" strokeWidth="0.03" />
        </g>
    );
}

function Background() {
    const glowSquares = [
        { top: "12%", left: "8%",   size: 36, op: 0.13 },
        { top: "22%", left: "18%",  size: 24, op: 0.09 },
        { top: "60%", left: "5%",   size: 28, op: 0.10 },
        { top: "75%", left: "15%",  size: 20, op: 0.08 },
        { top: "10%", right: "10%", size: 32, op: 0.12 },
        { top: "30%", right: "6%",  size: 22, op: 0.08 },
        { top: "55%", right: "12%", size: 30, op: 0.10 },
        { top: "80%", right: "8%",  size: 18, op: 0.07 },
        { top: "45%", left: "3%",   size: 16, op: 0.06 },
        { top: "88%", left: "25%",  size: 26, op: 0.08 },
        { top: "5%",  right: "30%", size: 20, op: 0.07 },
        { top: "68%", right: "28%", size: 14, op: 0.06 },
    ];



  return (
    <>
      {/* Base — légèrement plus claire qu'avant */}
      <div className="absolute inset-0" style={{ background: "#081a0c" }} />

      {/* Grille SVG de petits carrés + feuilles */}


      {/* Zone lumineuse — haut gauche */}
      <div className="absolute" style={{
        top: "-140px", left: "-100px",
        width: "540px", height: "540px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,170,75,0.16) 0%, rgba(20,120,55,0.06) 55%, transparent 72%)",
        filter: "blur(6px)",
        pointerEvents: "none",
      }} />

      {/* Zone lumineuse — bas droite */}
      <div className="absolute" style={{
        bottom: "-140px", right: "-80px",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(18,150,65,0.18) 0%, rgba(10,90,40,0.06) 55%, transparent 70%)",
        filter: "blur(8px)",
        pointerEvents: "none",
      }} />

      {/* Zone lumineuse centre — très subtile */}
      <div className="absolute" style={{
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", height: "280px",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(40,210,100,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Carrés lumineux épars */}
      {glowSquares.map((s, i) => (
        <div key={i} className="absolute rounded" style={{
          top: s.top, left: s.left, right: s.right,
          width: s.size, height: s.size,
          border: `1px solid rgba(50,220,100,${s.op * 1.3})`,
          background: `rgba(30,170,80,${s.op * 0.30})`,
          boxShadow: `0 0 12px rgba(40,200,90,${s.op * 0.8})`,
          pointerEvents: "none",
        }} />
      ))}
    </>
  );
}



import Logo from '../../assets/logosofitex.jpeg'
// import toast from "react-hot-toast";
import Chargement from '../../components/Chargement'
import { Link } from "react-router-dom";

import bg2 from "../../assets/bg2.jpg";
import bg1 from "../../assets/bg1.jpg";
import bg3 from "../../assets/bg3.jpg";

import toast from 'react-hot-toast';


export default function Connextion() {
    const [email, setEmail] = useState("");
    const [motDePasse, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(null);
    const [chargement, setChargement] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setTimeout(() => setLoading(false), 2000);
//   };

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:8080/api/auth/login",
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            email: email,
            motDePasse: motDePasse,
        }),
      }
    );

    // Vérifie si la connexion a échoué
    if (!response.ok) {
        throw new Error("Email ou mot de passe incorrect");
    }
     toast.success("Bienvenue !"); // ✅
    // Récupère les données envoyées par Spring Boot
    const data = await response.json();

    // console.log(data);

    // Sauvegarde du token JWT
    localStorage.setItem("token", data.token);
    
    // Redirection après connexion
    // window.location.href = "/dashboard";
    // toast.success("Connexion réussie !");
    // console.log(JSON.stringify(data));
    setChargement(true);

  } catch (error) {
    toast.error("Email ou mot de passe incorrect"); // ✅
    console.error(error);
    // toast.error(error.message);
    console.error("il ya une erreur suis dans catch");
    console.error(error.message);
  } finally {
    setLoading(false);
  }
};


// const handleChange = (e) => {
//   const { name, value } = e.target;

//   if (name === "email") setEmail(value);
//   if (name === "password") setPassword(value);
// };

  return (
    
    <div 
    style={{ backgroundImage: `url(${bg2})` }}
    className=" min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat">
      {/* <Background /> */}

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
                style={{  letterSpacing: "0.1em" }}
              >
                ADRESSE E-MAIL
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded "
                style={{
                  background: focused === "email" ? "": "",
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
                style={{  letterSpacing: "0.1em" }}
              >
                MOT DE PASSE
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded"
                style={{
                  background: focused === "password" ? "": "",
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
             
             {/* En tant que */}
            {/* <div>
              <label
                className="block text-xs font-semibold mb-1.5 text-white"
                style={{  letterSpacing: "0.1em" }}
              >
                EN TANT QUE
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded"
                style={{
                  background: focused === "email" ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.62)",
                  border: focused === "email"
                    ? "1.5px solid rgba(26,130,65,0.40)"
                    : "1px solid rgba(30,120,70,0.14)",
                  boxShadow: focused === "email" ? "0 0 0 3px rgba(26,130,65,0.09)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                
              </div>
            </div> */}

            {/* Se souvenir + Mot de passe oublié */}
            <div className="flex items-center justify-between pt-1">

                
              <button type="button" className="text-xs font-medium" style={{ color: "rgba(0,255,255,1)" }}>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      
    {chargement && <Chargement texte={"BIEN VENUE : CHARGEMENT DU TABLEAU DE BORD . . ."}/>}
    {/* <Chargement texte={"BIEN VENUE : CHARGEMENT DU TABLEAU DE BORD . . ."}/> */}
    </div>
  );
}