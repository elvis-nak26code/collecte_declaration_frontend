
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

const fonctionController = async (adresseEmail, navigate) => {
  const token = localStorage.getItem("token");
  // alert("Token récupéré : " + token);
  try {
    const response = await fetch(`http://localhost:8080/api/verification/fonction?email=${adresseEmail}`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
      },
    });

    // alert("Réponse reçue du serveur : " );
    if (!response.ok) throw new Error("Échec");

    const data = await response.json();
    // alert(JSON.stringify(data));
    if (data.fonction === "Administrateur Système") {
      navigate("/tableau-de-bord");
    }
    else {
      toast("Veuillez vous connecter");
      navigate("/connextion");
    }

  } catch (err) {
      toast("Veuillez vous connecter");
      navigate("/connextion");
    // console.error("Erreur :", err);
    // alert("Erreur lors de la vérification de la fonction : " + err.message);
    // alert("Erreur lors de la vérification de la fonction.");
    // alert(err.message);
    throw err;
  }
};

export default function Chargement({ texte = "Chargement" }) {
  const navigate = useNavigate();
  useEffect(() => {
    fonctionController("admin@cil.com", navigate);
  }, []);

  return (
    <div className=" w-full h-screen overflow-hidden absolute z-50">

      {/* Contenu derrière le flou */}
      <div className=" bg-black/50 absolute inset-0 p-8 flex flex-col gap-4 ">
        
      </div>

      {/* Overlay flouté */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md flex flex-col items-center justify-center gap-5">

        {/* Feuilles */}
        <div className="relative w-16 h-16">
          {/* Feuille A */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "spinA 1.6s linear infinite" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3C9 3 4 7 4 13C4 19 8 25 14 25C14 19 12 13 14 8C16 13 14 19 14 25C20 25 24 19 24 13C24 7 19 3 14 3Z"
                fill="white"
                opacity="0.95"
              />
              <line x1="10" y1="8" x2="14" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
            </svg>
          </div>

          {/* Feuille B (opposée) */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "spinB 1.6s linear infinite" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3C9 3 4 7 4 13C4 19 8 25 14 25C14 19 12 13 14 8C16 13 14 19 14 25C20 25 24 19 24 13C24 7 19 3 14 3Z"
                fill="rgba(255,255,255,0.55)"
                opacity="0.95"
                transform="rotate(180 14 14)"
              />
            </svg>
          </div>
        </div>

        {/* Label */}
        <span className="text-xs tracking-widest uppercase text-white font-bold">
          {texte}
        </span>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spinA {
          from { transform: rotate(0deg) translateY(-20px); }
          to   { transform: rotate(360deg) translateY(-20px); }
        }
        @keyframes spinB {
          from { transform: rotate(180deg) translateY(-20px); }
          to   { transform: rotate(540deg) translateY(-20px); }
        }
      `}</style>
    </div>
  );
}