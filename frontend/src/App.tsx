import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WaybillPrints from './pages/WaybillPrints'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/waybills/prints" element={<WaybillPrints />} />
    </Routes>
  )
}

export default App
