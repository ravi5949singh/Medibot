import { useEffect, useRef } from 'react'
import './MapView.css'

export default function MapView() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    // Dynamic import of leaflet
    import('leaflet').then(mod => {
      const L = mod.default || mod
      const map = L.map(mapRef.current).setView([23.2599, 77.4126], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // Sample markers
      const markers = [
        { pos: [23.2599, 77.4126], type: 'hospital', name: 'City Hospital' },
        { pos: [23.2650, 77.4200], type: 'doctor', name: 'Dr. Ankit Sharma Clinic' },
        { pos: [23.2550, 77.4050], type: 'pharmacy', name: 'Apollo Pharmacy' },
        { pos: [23.2700, 77.4100], type: 'doctor', name: 'Dr. Neha Verma Clinic' },
        { pos: [23.2520, 77.4180], type: 'pharmacy', name: 'MedPlus' },
      ]

      const colors = { hospital: '#EF4444', doctor: '#22C55E', pharmacy: '#4F6BF6' }

      markers.forEach(m => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${colors[m.type]};width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          iconSize: [12, 12]
        })
        L.marker(m.pos, { icon }).addTo(map).bindPopup(`<b>${m.name}</b>`)
      })

      mapInstance.current = map

      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  return (
    <div className="panel-card map-panel">
      <div className="panel-header">
        <h2 className="panel-title">Nearby on Map</h2>
      </div>
      <div className="map-container" ref={mapRef} id="map-view"></div>
      <div className="map-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#EF4444' }}></span> Hospitals</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#22C55E' }}></span> Doctors/Clinics</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#4F6BF6' }}></span> Medicine Stores</span>
      </div>
    </div>
  )
}
