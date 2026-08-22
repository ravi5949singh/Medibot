import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Header/Header'
import Home from './pages/Home'
import FindDoctors from './pages/FindDoctors'
import MedicineStores from './pages/MedicineStores'
import HealthTips from './pages/HealthTips'
import MyHistory from './pages/MyHistory'
import Appointments from './pages/Appointments'
import HealthRecords from './pages/HealthRecords'
import Settings from './pages/Settings'
import ChatPage from './pages/ChatPage'
import SymptomChecker from './pages/SymptomChecker'
import EmergencyHelp from './pages/EmergencyHelp'
import './App.css'

/* ── Global 3D Animated Background ── */
function AnimatedBackground() {
  return (
    <div className="global-bg" aria-hidden="true">
      {/* Big colorful gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      {/* Rotating 3D ring circles */}
      <div className="ring ring-1" />
      <div className="ring ring-2" />
      <div className="ring ring-3" />

      {/* Grid lines overlay */}
      <div className="bg-grid" />

      {/* Floating medical symbols */}
      {['💊','🧬','🩺','❤️','🧪','⚕️','💉','🔬','🩻','💡'].map((icon, i) => (
        <span key={i} className={`bg-particle bg-particle-${i}`}>{icon}</span>
      ))}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AnimatedBackground />
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/find-doctors" element={<FindDoctors />} />
            <Route path="/medicine-stores" element={<MedicineStores />} />
            <Route path="/health-tips" element={<HealthTips />} />
            <Route path="/history" element={<MyHistory />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/records" element={<HealthRecords />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/emergency" element={<EmergencyHelp />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App


