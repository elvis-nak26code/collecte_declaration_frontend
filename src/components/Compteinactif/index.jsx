import { Link } from "react-router-dom";
import bg2 from "../../assets/bg2.png";

export default function CompteInactif() {
  return (
    <div
      style={{ backgroundImage: `url(${bg2})` }}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
    >
      {/* Carte */}
      <div
        className="relative z-10 w-full mx-4 border-2 border-white rounded-4xl"
        style={{ maxWidth: "430px" }}
      >
        <div className="rounded p-8 shadow-2xl bg-black/40 backdrop-blur-xs border border-white/30">

          {/* Icône cadenas */}
          <div className="flex justify-center mb-6">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 72,
                height: 72,
                background: "rgba(255,180,50,0.12)",
                border: "1px solid rgba(255,180,50,0.30)",
                animation: "ci-pulse 2.4s ease-in-out infinite",
              }}
            >
              <svg
                style={{ width: 32, height: 32, color: "#f5b731" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Badge statut */}
          <div className="flex justify-center mb-5">
            <span
              className="flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(245,183,49,0.12)",
                border: "1px solid rgba(245,183,49,0.30)",
                color: "#f5b731",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f5b731",
                  boxShadow: "0 0 6px #f5b731",
                  display: "inline-block",
                  animation: "ci-blink 1.8s ease-in-out infinite",
                }}
              />
              Accès restreint
            </span>
          </div>

          {/* Titre */}
          <h1
            className="text-xl font-bold mb-2 text-center"
            style={{ color: "white", fontFamily: "Georgia, serif" }}
          >
            Compte non disponible
          </h1>

          <p
            className="text-sm text-center mb-6"
            style={{ color: "rgba(220,215,255,0.65)", lineHeight: 1.7 }}
          >
            Votre compte n'a pas encore été validé par un administrateur,
            ou a été temporairement suspendu. Vous ne pouvez pas accéder
            à la plateforme pour le moment.
          </p>

          {/* Séparateur */}
          <div
            style={{
              height: "0.5px",
              background: "rgba(255,255,255,0.10)",
              marginBottom: "1.25rem",
            }}
          />

          {/* Cartes de statut */}
          <div className="space-y-3 mb-6">
            {/* Validation en attente */}
            <div
              className="flex items-start gap-3 rounded px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <span
                style={{
                  marginTop: 5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f5b731",
                  boxShadow: "0 0 6px #f5b731",
                  flexShrink: 0,
                  display: "inline-block",
                  animation: "ci-blink 1.8s ease-in-out infinite",
                }}
              />
              <div>
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "white", letterSpacing: "0.05em" }}
                >
                  VALIDATION EN ATTENTE
                </p>
                <p className="text-xs" style={{ color: "rgba(220,215,255,0.55)" }}>
                  Votre compte est en cours d'examen par l'équipe d'administration.
                </p>
              </div>
            </div>

            {/* Besoin d'aide */}
            <div
              className="flex items-start gap-3 rounded px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <span
                style={{
                  marginTop: 5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "rgba(0,255,255,0.8)",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <div>
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "white", letterSpacing: "0.05em" }}
                >
                  BESOIN D'AIDE ?
                </p>
                <p className="text-xs" style={{ color: "rgba(220,215,255,0.55)" }}>
                  Contactez l'administrateur à{" "}
                  <a
                    href="mailto:admin@sofitex.com"
                    style={{ color: "rgba(0,255,255,0.8)", textDecoration: "underline" }}
                  >
                    admin@sofitex.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bouton retour connexion */}
          <Link
            to="/connextion"
            className="w-full py-3.5 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm"
            style={{
              background: "linear-gradient(135deg, #2ea65a 0%, #1a7a3f 100%)",
              boxShadow: "0 4px 20px rgba(30,120,60,0.40), 0 1px 3px rgba(0,0,0,0.12)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Retourner à la connexion
          </Link>

          {/* Mention sécurité */}
          <div className="flex items-center justify-center gap-1.5 pt-4">
            <svg className="w-3 h-3" style={{ color: "#8aaa95" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs" style={{ color: "#8aaa95" }}>
              Système sécurisé · Accès restreint aux utilisateurs autorisés
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ci-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,180,50,0.25); }
          50%       { box-shadow: 0 0 0 12px rgba(255,180,50,0); }
        }
        @keyframes ci-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}