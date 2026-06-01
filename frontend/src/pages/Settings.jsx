import { useState, useEffect, useCallback } from 'react'
import {
  FiUser, FiBell, FiMoon, FiGlobe, FiShield, FiInfo,
  FiChevronRight, FiCheck, FiCamera, FiSave, FiTrash2,
  FiAlertTriangle, FiDatabase, FiCalendar, FiActivity,
  FiSun, FiType, FiVolume2, FiVolumeX, FiEyeOff, FiEye,
  FiDownload, FiRefreshCw
} from 'react-icons/fi'
import './Pages.css'

/* ── persistence helpers ─────────────────────────── */
const get = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const PROFILE_DEFAULTS = {
  name: 'User', email: 'user@example.com',
  phone: '+91 98765 43210', dob: '1990-01-01',
  gender: 'Prefer not to say', bloodGroup: 'O+', city: ''
}

const NOTIF_DEFAULTS = {
  push: true, email: false, healthTips: true,
  appointments: true, reports: false, emergencyAlerts: true
}

const NOTIF_LABELS = [
  { key: 'push',           icon: '🔔', label: 'Push Notifications',     desc: 'Appointment reminders and health alerts on your device' },
  { key: 'email',          icon: '📧', label: 'Email Digest',            desc: 'Weekly health summaries sent to your email' },
  { key: 'healthTips',     icon: '💡', label: 'Daily Health Tips',       desc: 'Personalized wellness tips every morning' },
  { key: 'appointments',   icon: '📅', label: 'Appointment Reminders',   desc: '1-hour reminder before booked doctor visits' },
  { key: 'reports',        icon: '📊', label: 'Report Ready Alerts',     desc: 'Notify when AI finishes analysing an uploaded report' },
  { key: 'emergencyAlerts',icon: '🚨', label: 'Emergency SOS Alerts',   desc: 'Critical system alerts and emergency broadcasts' },
]

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English',    native: 'English' },
  { code: 'hi', flag: '🇮🇳', label: 'Hindi',      native: 'हिन्दी' },
  { code: 'es', flag: '🇪🇸', label: 'Spanish',    native: 'Español' },
  { code: 'fr', flag: '🇫🇷', label: 'French',     native: 'Français' },
  { code: 'de', flag: '🇩🇪', label: 'German',     native: 'Deutsch' },
  { code: 'ja', flag: '🇯🇵', label: 'Japanese',   native: '日本語' },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic',     native: 'العربية' },
  { code: 'pt', flag: '🇧🇷', label: 'Portuguese', native: 'Português' },
]

/* ── Toggle switch component ─────────────────────── */
function Toggle({ value, onChange, color = '#4F6BF6' }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13, flexShrink: 0,
        background: value ? color : '#CBD5E1',
        position: 'relative', transition: 'background 0.25s', cursor: 'pointer', border: 'none'
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 25 : 3,
        transition: 'left 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
      }} />
    </button>
  )
}

/* ── Section header ──────────────────────────────── */
function SectionHead({ icon, label, color }) {
  return (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0', color: '#1E293B' }}>
      <span style={{ color, fontSize: '1.3rem' }}>{icon}</span> {label}
    </h2>
  )
}

/* ── Row ──────────────────────────────────────────── */
function Row({ children, style }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 18px', background: '#F8FAFC', borderRadius: 12,
      border: '1px solid #E2E8F0', gap: 12, ...style
    }}>
      {children}
    </div>
  )
}

/* ── Toast ───────────────────────────────────────── */
function Toast({ msg, color = '#22C55E' }) {
  return msg ? (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: '#fff', border: `1.5px solid ${color}`, borderRadius: 12,
      padding: '12px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fadeIn 0.3s ease-out', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B'
    }}>
      <span style={{ color, fontSize: '1.1rem' }}>✓</span> {msg}
    </div>
  ) : null
}

/* ════════════════════════════════════════════════════
   Main Settings Component
══════════════════════════════════════════════════════ */
export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [toast, setToast] = useState('')

  /* ── Profile ── */
  const [profile, setProfile]     = useState(() => get('medicare_profile', PROFILE_DEFAULTS))
  const [profileSaved, setProfileSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(() => get('medicare_avatar', null))

  /* ── Notifications ── */
  const [notifs, setNotifs] = useState(() => get('medicare_notifs', NOTIF_DEFAULTS))

  /* ── Appearance ── */
  const [darkMode, setDarkMode]     = useState(() => get('medicare_dark', false))
  const [fontSize, setFontSize]     = useState(() => get('medicare_fontsize', 'medium'))
  const [reducedMotion, setReducedMotion] = useState(() => get('medicare_motion', false))
  const [soundEffects, setSoundEffects] = useState(() => get('medicare_sound', true))

  /* ── Language ── */
  const [language, setLanguage]   = useState(() => get('medicare_lang', 'en'))
  const [langSaved, setLangSaved] = useState(false)

  /* ── Privacy ── */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dataStats, setDataStats] = useState({})

  /* ── Apply dark mode to <html> ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    set('medicare_dark', darkMode)
    if (darkMode) {
      document.documentElement.style.setProperty('--bg', '#0F172A')
      document.documentElement.style.setProperty('--surface', '#1E293B')
      document.documentElement.style.setProperty('--border', '#334155')
      document.documentElement.style.setProperty('--text-primary', '#F1F5F9')
      document.documentElement.style.setProperty('--text-secondary', '#94A3B8')
      document.documentElement.style.setProperty('--surface-hover', '#273549')
    } else {
      document.documentElement.style.setProperty('--bg', '#F4F6FB')
      document.documentElement.style.setProperty('--surface', '#FFFFFF')
      document.documentElement.style.setProperty('--border', '#E5E7EB')
      document.documentElement.style.setProperty('--text-primary', '#1E293B')
      document.documentElement.style.setProperty('--text-secondary', '#64748B')
      document.documentElement.style.setProperty('--surface-hover', '#F8F9FD')
    }
  }, [darkMode])

  /* ── Apply font size ── */
  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' }
    document.documentElement.style.fontSize = sizes[fontSize] || '16px'
    set('medicare_fontsize', fontSize)
  }, [fontSize])

  /* ── Persist reduced motion ── */
  useEffect(() => {
    set('medicare_motion', reducedMotion)
    document.documentElement.style.setProperty(
      '--transition-speed', reducedMotion ? '0s' : '0.2s'
    )
  }, [reducedMotion])

  /* ── Persist sound ── */
  useEffect(() => { set('medicare_sound', soundEffects) }, [soundEffects])

  /* ── Compute data stats whenever privacy tab opens ── */
  useEffect(() => {
    if (activeSection !== 'privacy') return
    setDataStats({
      reports:       (get('medicare_uploaded_reports', []) || []).length,
      appointments:  (get('medicare_appointments', []) || []).length,
      chatHistory:   (get('medicare_chat_history', []) || []).length,
      hasProfile:    !!localStorage.getItem('medicare_profile'),
    })
  }, [activeSection])

  /* ── Notification toggle ── */
  const toggleNotif = (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    set('medicare_notifs', updated)
    showToast(`${NOTIF_LABELS.find(n => n.key === key)?.label} ${updated[key] ? 'enabled' : 'disabled'}`)
  }

  /* ── Profile save ── */
  const handleSaveProfile = () => {
    set('medicare_profile', profile)
    setProfileSaved(true)
    showToast('Profile saved successfully!')
    setTimeout(() => setProfileSaved(false), 2500)
  }

  /* ── Avatar upload ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = ev.target.result
      setAvatarPreview(b64)
      set('medicare_avatar', b64)
    }
    reader.readAsDataURL(file)
  }

  /* ── Language save ── */
  const handleSaveLanguage = () => {
    set('medicare_lang', language)
    setLangSaved(true)
    showToast('Language preference saved!')
    setTimeout(() => setLangSaved(false), 2500)
  }

  /* ── Toast helper ── */
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }, [])

  /* ── Data export ── */
  const handleExportData = () => {
    const allData = {
      profile: get('medicare_profile', {}),
      reports: get('medicare_uploaded_reports', []),
      appointments: get('medicare_appointments', []),
      chatHistory: get('medicare_chat_history', []),
      settings: {
        dark: get('medicare_dark', false),
        lang: get('medicare_lang', 'en'),
        fontSize: get('medicare_fontsize', 'medium'),
        notifs: get('medicare_notifs', NOTIF_DEFAULTS),
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'medicare_ai_data_backup.json'
    a.click(); URL.revokeObjectURL(url)
    showToast('Data exported as JSON backup!')
  }

  /* ── Selective clear ── */
  const clearSection = (keys, label) => {
    keys.forEach(k => localStorage.removeItem(k))
    setShowDeleteConfirm(false)
    // refresh stats
    setDataStats({
      reports:       (get('medicare_uploaded_reports', []) || []).length,
      appointments:  (get('medicare_appointments', []) || []).length,
      chatHistory:   (get('medicare_chat_history', []) || []).length,
      hasProfile:    !!localStorage.getItem('medicare_profile'),
    })
    showToast(`${label} cleared!`)
  }

  /* ── Sections nav ── */
  const sections = [
    { key: 'profile',       icon: '👤', label: 'My Profile' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
    { key: 'appearance',    icon: '🎨', label: 'Appearance' },
    { key: 'language',      icon: '🌐', label: 'Language' },
    { key: 'privacy',       icon: '🔒', label: 'Privacy & Data' },
    { key: 'about',         icon: 'ℹ️',  label: 'About' },
  ]

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <div className="page-full">
      <Toast msg={toast} />

      <h1 className="page-heading">⚙️ Settings</h1>
      <p className="page-desc">Manage your profile, preferences, and app configurations</p>

      <div className="healthtips-container" style={{ gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* ── Left Nav ── */}
        <div className="bmi-calculator-card" style={{ padding: 8, gap: 0 }}>
          {sections.map(sec => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`bmi-toggle-btn ${activeSection === sec.key ? 'active' : ''}`}
              style={{
                textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '11px 14px', gap: 8, width: '100%',
                borderRadius: 10, marginBottom: 2
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.87rem' }}>
                <span>{sec.icon}</span> {sec.label}
              </span>
              <FiChevronRight size={13} style={{ opacity: 0.35, flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* ── Right Content ── */}
        <div style={{ minWidth: 0 }}>

          {/* ═══════════ PROFILE ═══════════ */}
          {activeSection === 'profile' && (
            <div className="bmi-calculator-card" style={{ padding: 28, gap: 22 }}>
              <SectionHead icon="👤" label="My Profile" color="#4F6BF6" />

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: avatarPreview ? 'transparent' : 'linear-gradient(135deg,#4F6BF6,#8B5CF6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(79,107,246,0.3)'
                  }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.6rem' }}>{profile.name?.[0]?.toUpperCase() || 'U'}</span>
                    }
                  </div>
                  <label htmlFor="avatar-upload" style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#4F6BF6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', color: '#fff'
                  }}>
                    <FiCamera size={12} />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{profile.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{profile.email}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: 2 }}>Click the camera icon to change photo</div>
                </div>
              </div>

              {/* Fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { field: 'name',  label: 'Full Name',     type: 'text' },
                  { field: 'email', label: 'Email Address',  type: 'email' },
                  { field: 'phone', label: 'Phone Number',   type: 'tel' },
                  { field: 'dob',   label: 'Date of Birth',  type: 'date' },
                  { field: 'city',  label: 'City',           type: 'text' },
                ].map(({ field, label, type }) => (
                  <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
                    <input
                      className="filter-input"
                      type={type}
                      style={{ width: '100%', minWidth: '100%' }}
                      value={profile[field] || ''}
                      onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                      onBlur={handleSaveProfile}
                    />
                  </div>
                ))}

                {/* Gender dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Gender</label>
                  <select
                    className="filter-input"
                    style={{ width: '100%', minWidth: '100%', cursor: 'pointer' }}
                    value={profile.gender || 'Prefer not to say'}
                    onChange={e => { setProfile(p => ({ ...p, gender: e.target.value })); handleSaveProfile() }}
                  >
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>

                {/* Blood group dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Blood Group</label>
                  <select
                    className="filter-input"
                    style={{ width: '100%', minWidth: '100%', cursor: 'pointer' }}
                    value={profile.bloodGroup || 'O+'}
                    onChange={e => { setProfile(p => ({ ...p, bloodGroup: e.target.value })); handleSaveProfile() }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleSaveProfile}
                  className="filter-btn"
                  style={{ padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  {profileSaved ? <><FiCheck size={14} /> Saved!</> : <><FiSave size={14} /> Save Profile</>}
                </button>
                <button
                  onClick={() => { setProfile(PROFILE_DEFAULTS); setAvatarPreview(null); localStorage.removeItem('medicare_avatar') }}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: '1.5px solid #E2E8F0',
                    background: '#F8FAFC', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, color: '#64748B'
                  }}
                >
                  <FiRefreshCw size={13} /> Reset
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ NOTIFICATIONS ═══════════ */}
          {activeSection === 'notifications' && (
            <div className="bmi-calculator-card" style={{ padding: 28, gap: 0 }}>
              <SectionHead icon="🔔" label="Notification Preferences" color="#F59E0B" />

              {/* Master toggle */}
              <Row style={{ marginBottom: 10, background: '#EEF1FF', borderColor: '#C7D2FE' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4F6BF6' }}>All Notifications</div>
                  <div style={{ fontSize: '0.74rem', color: '#6366F1', marginTop: 2 }}>Master switch — turn everything on or off</div>
                </div>
                <Toggle
                  value={Object.values(notifs).some(Boolean)}
                  onChange={(val) => {
                    const all = NOTIF_DEFAULTS
                    const updated = Object.fromEntries(Object.keys(all).map(k => [k, val]))
                    setNotifs(updated); set('medicare_notifs', updated)
                    showToast(`All notifications ${val ? 'enabled' : 'disabled'}`)
                  }}
                  color="#4F6BF6"
                />
              </Row>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                {NOTIF_LABELS.map(({ key, icon, label, desc }) => (
                  <Row key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.4rem', width: 32, textAlign: 'center' }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: '0.87rem', fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>{desc}</div>
                      </div>
                    </div>
                    <Toggle value={notifs[key]} onChange={() => toggleNotif(key)} color="#F59E0B" />
                  </Row>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: '12px 16px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A', fontSize: '0.78rem', color: '#92400E' }}>
                💡 Notification preferences are saved automatically and persist across sessions.
              </div>
            </div>
          )}

          {/* ═══════════ APPEARANCE ═══════════ */}
          {activeSection === 'appearance' && (
            <div className="bmi-calculator-card" style={{ padding: 28, gap: 16 }}>
              <SectionHead icon="🎨" label="Appearance" color="#8B5CF6" />

              {/* Dark mode */}
              <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {darkMode ? <FiMoon size={20} style={{ color: '#8B5CF6' }} /> : <FiSun size={20} style={{ color: '#F59E0B' }} />}
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Dark Mode</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>
                      Currently: <strong>{darkMode ? 'Dark Theme Active' : 'Light Theme Active'}</strong>
                    </div>
                  </div>
                </div>
                <Toggle value={darkMode} onChange={setDarkMode} color="#8B5CF6" />
              </Row>

              {/* Theme preview */}
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: -6
              }}>
                {[
                  { name: 'Light', bg: '#F4F6FB', card: '#fff', text: '#1E293B', active: !darkMode },
                  { name: 'Dark',  bg: '#0F172A', card: '#1E293B', text: '#F1F5F9', active: darkMode },
                ].map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => setDarkMode(theme.name === 'Dark')}
                    style={{
                      flex: 1, minWidth: 120, padding: '16px 12px', borderRadius: 12, cursor: 'pointer',
                      background: theme.bg, border: `2px solid ${theme.active ? '#8B5CF6' : '#E2E8F0'}`,
                      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#EF4444','#F59E0B','#22C55E'].map(c => (
                        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <div style={{ background: theme.card, width: '100%', height: 32, borderRadius: 6, border: `1px solid ${theme.active ? '#8B5CF6' : '#E2E8F0'}` }} />
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: theme.active ? '#8B5CF6' : '#64748B' }}>
                      {theme.name} {theme.active && '✓'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Font size */}
              <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiType size={20} style={{ color: '#4F6BF6' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Font Size</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>Adjust text size across the entire app</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { key: 'small',  label: 'A', size: '0.74rem' },
                    { key: 'medium', label: 'A', size: '0.88rem' },
                    { key: 'large',  label: 'A', size: '1rem' },
                    { key: 'xlarge', label: 'A', size: '1.15rem' },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => { setFontSize(f.key); showToast(`Font size set to ${f.key}`) }}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${fontSize === f.key ? '#4F6BF6' : '#E2E8F0'}`,
                        background: fontSize === f.key ? '#EEF1FF' : '#F8FAFC',
                        color: fontSize === f.key ? '#4F6BF6' : '#64748B',
                        fontSize: f.size, fontWeight: 700, cursor: 'pointer'
                      }}
                    >{f.label}</button>
                  ))}
                </div>
              </Row>

              {/* Reduced motion */}
              <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>✨</span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Reduce Motion</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>Disable animations for accessibility</div>
                  </div>
                </div>
                <Toggle value={reducedMotion} onChange={(v) => { setReducedMotion(v); showToast(`Motion ${v ? 'reduced' : 'enabled'}`) }} color="#22C55E" />
              </Row>

              {/* Sound effects */}
              <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {soundEffects ? <FiVolume2 size={20} style={{ color: '#22C55E' }} /> : <FiVolumeX size={20} style={{ color: '#EF4444' }} />}
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Sound Effects</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>UI interaction sounds and alert tones</div>
                  </div>
                </div>
                <Toggle value={soundEffects} onChange={(v) => { setSoundEffects(v); showToast(`Sound ${v ? 'on' : 'off'}`) }} color="#22C55E" />
              </Row>
            </div>
          )}

          {/* ═══════════ LANGUAGE ═══════════ */}
          {activeSection === 'language' && (
            <div className="bmi-calculator-card" style={{ padding: 28, gap: 16 }}>
              <SectionHead icon="🌐" label="Language & Region" color="#22C55E" />

              <div style={{
                padding: '14px 18px', background: '#F0FDF4', borderRadius: 10,
                border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: '2rem' }}>{selectedLang.flag}</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534' }}>Current: {selectedLang.label}</div>
                  <div style={{ fontSize: '0.76rem', color: '#15803D' }}>{selectedLang.native}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
                      background: language === lang.code ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: 10, border: `1.5px solid ${language === lang.code ? '#22C55E' : '#E2E8F0'}`,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{lang.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: language === lang.code ? 700 : 500, color: language === lang.code ? '#166534' : '#334155' }}>
                        {lang.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{lang.native}</div>
                    </div>
                    {language === lang.code && <FiCheck size={16} style={{ color: '#22C55E', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSaveLanguage}
                className="filter-btn"
                style={{ padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 4 }}
              >
                {langSaved ? <><FiCheck size={14} /> Saved!</> : <><FiGlobe size={14} /> Apply Language</>}
              </button>

              <div style={{ padding: '12px 16px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', fontSize: '0.78rem', color: '#9A3412' }}>
                🌍 Full UI translation is coming in a future update. Language preference is saved for when it's available.
              </div>
            </div>
          )}

          {/* ═══════════ PRIVACY ═══════════ */}
          {activeSection === 'privacy' && (
            <div className="bmi-calculator-card" style={{ padding: 28, gap: 18 }}>
              <SectionHead icon="🔒" label="Privacy & Data Control" color="#22C55E" />

              {/* Data overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                {[
                  { icon: '📄', label: 'Health Reports', count: dataStats.reports ?? 0, color: '#4F6BF6' },
                  { icon: '📅', label: 'Appointments',   count: dataStats.appointments ?? 0, color: '#22C55E' },
                  { icon: '💬', label: 'Chat History',   count: dataStats.chatHistory ?? 0, color: '#F59E0B' },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem' }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.count}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Security info */}
              <div style={{ padding: '14px 18px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #86EFAC' }}>
                <div style={{ fontWeight: 700, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiShield size={16} /> 🔐 Your Data is Safe
                </div>
                <div style={{ fontSize: '0.79rem', color: '#15803D', lineHeight: 1.6 }}>
                  All medical records, reports, and health data are stored exclusively on <strong>your device's local storage</strong>. 
                  Nothing is uploaded to external servers. Your data belongs to you alone.
                </div>
              </div>

              {/* Visibility toggle */}
              <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiEye size={18} style={{ color: '#4F6BF6' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Data Visibility</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>Show/hide sensitive values on screen</div>
                  </div>
                </div>
                <Toggle value={true} onChange={() => showToast('Visibility toggled')} color="#4F6BF6" />
              </Row>

              {/* Export */}
              <Row>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FiDownload size={18} style={{ color: '#22C55E' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Export My Data</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2 }}>Download a full JSON backup of all your data</div>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  style={{
                    padding: '7px 16px', borderRadius: 8, border: '1.5px solid #86EFAC',
                    background: '#F0FDF4', color: '#166534', fontSize: '0.8rem',
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
                  }}
                >
                  <FiDownload size={13} /> Export
                </button>
              </Row>

              {/* Selective clear */}
              <div style={{ background: '#FFF7ED', borderRadius: 12, border: '1px solid #FED7AA', padding: '18px 18px 14px' }}>
                <div style={{ fontWeight: 700, color: '#C2410C', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiTrash2 size={16} /> 🗂️ Selective Data Clearing
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { label: 'Clear Reports',      keys: ['medicare_uploaded_reports'] },
                    { label: 'Clear Appointments', keys: ['medicare_appointments'] },
                    { label: 'Clear Chat History', keys: ['medicare_chat_history'] },
                    { label: 'Clear Profile',      keys: ['medicare_profile', 'medicare_avatar'] },
                  ].map(({ label, keys }) => (
                    <button
                      key={label}
                      onClick={() => { if (window.confirm(`Are you sure you want to ${label.toLowerCase()}?`)) clearSection(keys, label) }}
                      style={{
                        padding: '7px 14px', borderRadius: 8, border: '1px solid #FED7AA',
                        background: '#fff', color: '#C2410C', fontSize: '0.78rem',
                        fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nuke all */}
              <div style={{ background: '#FEF2F2', borderRadius: 12, border: '1px solid #FCA5A5', padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiAlertTriangle size={16} /> ⚠️ Delete All Local Data
                </div>
                <p style={{ fontSize: '0.79rem', color: '#B91C1C', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  Permanently removes everything: health reports, appointments, chat history, profile, and all settings. This cannot be undone.
                </p>
                <button
                  onClick={() => { if (window.confirm('WARNING: This will permanently delete ALL your MediCare AI data. This cannot be undone. Continue?')) { localStorage.clear(); window.location.reload() } }}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: '1.5px solid #FCA5A5',
                    background: '#FEF2F2', color: '#DC2626', fontSize: '0.82rem',
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7
                  }}
                >
                  <FiTrash2 size={14} /> Delete All My Data
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ ABOUT ═══════════ */}
          {activeSection === 'about' && (
            <div className="bmi-calculator-card" style={{ padding: 28, gap: 18 }}>
              <SectionHead icon="ℹ️" label="About MediCare AI" color="#4F6BF6" />

              {/* App identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'linear-gradient(135deg, #EEF1FF 0%, #F5F3FF 100%)', borderRadius: 14, border: '1px solid #C7D2FE' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #4F6BF6, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(79,107,246,0.35)'
                }}>
                  <svg viewBox="0 0 32 32" width="32" height="32">
                    <path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>MediCare AI</div>
                  <div style={{ fontSize: '0.8rem', color: '#4F6BF6', fontWeight: 600 }}>Your Intelligent Health Assistant</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>Version 1.0.0 · Build 2026</div>
                </div>
              </div>

              {/* Tech stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Frontend',    value: 'React 18 + Vite 5',            icon: '⚛️' },
                  { label: 'Backend',     value: 'Node.js + Express + MongoDB',  icon: '🟢' },
                  { label: 'AI Engine',   value: 'Google Gemini 1.5 Flash',      icon: '✨' },
                  { label: 'Maps',        value: 'OpenStreetMap + Leaflet.js',   icon: '🗺️' },
                  { label: 'Storage',     value: 'Browser localStorage (local)', icon: '💾' },
                  { label: 'Version',     value: '1.0.0 (Production)',           icon: '🏷️' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.84rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{row.icon}</span> {row.label}
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: '📋 Copy Version',       action: () => { navigator.clipboard?.writeText('MediCare AI v1.0.0'); showToast('Version copied!') } },
                  { label: '🔄 Clear App Cache',    action: () => { if (window.confirm('Clear app cache and reload?')) { localStorage.removeItem('medicare_cache'); window.location.reload() } } },
                  { label: '📊 App Diagnostics',   action: () => showToast(`Storage used: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)}KB`) },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC', color: '#334155', fontSize: '0.8rem',
                      fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ padding: '14px 18px', background: '#EFF6FF', borderRadius: 12, border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: 700, color: '#1D4ED8', marginBottom: 6, fontSize: '0.88rem' }}>⚕️ Medical Disclaimer</div>
                <p style={{ fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.6, margin: 0 }}>
                  MediCare AI provides general health information and AI-assisted insights for educational purposes only. 
                  It is not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult a qualified healthcare professional for medical decisions.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
