import TableauDeBord from './pages/TableauDeBaordAdmin/index'
import Connextion from './pages/Connextion'
import TableauDeBoard from './pages/TableauDeBaordAdmin/index'
import Inscription from './pages/Inscription'
import { BrowserRouter , Route , Routes} from 'react-router-dom'

import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <BrowserRouter>
    <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Connextion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      </Routes>
    </BrowserRouter>
      // <div className='text-5xl '>
      //       <Inscription/>
      // </div>
  )
}

export default App
