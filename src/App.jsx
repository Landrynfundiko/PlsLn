import './App.css'
import Corps from './pages/Corps'
import Navbar from './pages/Navbar'
import Pieds from './pages/Pieds'
import Gestpub from './pages/Gestpub'

import Btq from './pages/btq'




function App() {
  return (
    <>
      <Navbar />
      <div className="main-wrapper">
        <Corps />
        <Btq />
        <Gestpub />
         
      </div>
      <Pieds />
      
    </>


  )
}

export default App
