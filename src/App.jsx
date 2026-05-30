import TableauDeBord from './pages/TableauDeBaordAdmin/index'
import Connextion from './pages/Connextion'
import Inscription from './pages/Inscription'
import Chargement from './components/Chargement'
import { BrowserRouter , Route , Routes} from 'react-router-dom'
import Compteinactif from './components/Compteinactif'

import Tb_Dg from './pages/Tb_Dg'
import Tb_Dpo from './pages/Tb_Dpo'
import Tb_Cil from './pages/Tb_Cil'
import Tb_Usager from './pages/Tb_Usager'
import Tb_utilisateur_Metier from './pages/Tb_utilisateur_Metier'

import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <BrowserRouter>
    <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Chargement />} />
        <Route path="/connextion" element={<Connextion />} />
        <Route path="/inscription" element={<Inscription />} />
        
        <Route path="/tableau-de-bord" element={<TableauDeBord />} />
        <Route path="/tableau-de-bord/dg" element={<Tb_Dg />} />
        <Route path="/tableau-de-bord/dpo" element={<Tb_Dpo />} />
        <Route path="/tableau-de-bord/cil" element={<Tb_Cil />} />
        <Route path="/tableau-de-bord/usager" element={<Tb_Usager />} />
        <Route path="/tableau-de-bord/utilisateur-metier" element={<Tb_utilisateur_Metier />} />
        <Route path="/compte-inactif" element={<Compteinactif />} />
      </Routes>
    </BrowserRouter>
      // <div className='text-5xl '>
      //       <Inscription/>
      // </div>
  )
}

export default App
