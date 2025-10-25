import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/home/page'

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </main>
  )
}

export default App
