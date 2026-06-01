import { useEffect, useRef } from 'react'

export default function DirectionModal({ doctor, onClose }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current || !doctor) return

    import('leaflet').then(mod => {
      const L = mod.default || mod
      
      // Default user location (e.g., center of Bhopal or user's actual location)
      const userLoc = [23.2599, 77.4126]
      const docLoc = [doctor.latitude || 23.2650, doctor.longitude || 77.4200]

      const map = L.map(mapRef.current).setView(userLoc, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // User Marker
      const userIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#3B82F6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14]
      })
      L.marker(userLoc, { icon: userIcon }).addTo(map).bindPopup(`<b>Your Location</b>`).openPopup()

      // Doctor Marker
      const docIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#22C55E;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14]
      })
      L.marker(docLoc, { icon: docIcon }).addTo(map).bindPopup(`<b>${doctor.name}</b><br/>${doctor.clinic_address || doctor.address}`)

      // Simple straight line for direction (since full routing requires external API/plugin)
      const latlngs = [userLoc, docLoc]
      L.polyline(latlngs, {color: '#3B82F6', weight: 4, dashArray: '10, 10'}).addTo(map)
      
      map.fitBounds(L.polyline(latlngs).getBounds(), { padding: [50, 50] })

      mapInstance.current = map
      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [doctor])

  if (!doctor) return null

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: '#fff', padding: '20px', borderRadius: '12px', 
        width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Directions to {doctor.name}</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>&times;</button>
        </div>
        <div ref={mapRef} style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', background: '#e5e7eb' }}></div>
      </div>
    </div>
  )
}
