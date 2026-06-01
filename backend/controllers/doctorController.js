import Doctor from '../models/Doctor.js'

// GET /api/doctors/search?pincode=462001&area=Patel+Nagar&specialization=General
export const searchDoctors = async (req, res, next) => {
  try {
    const { pincode, area, specialization } = req.query
    const filter = {}
    if (pincode) filter.pincode = pincode
    if (area) {
      filter.$or = [
        { clinic_address: { $regex: area, $options: 'i' } },
        { name: { $regex: area, $options: 'i' } }
      ]
    }
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' }

    let doctors = await Doctor.find(filter).sort({ rating: -1 }).limit(20)

    // Auto-generate doctors if none exist for this pincode or area (for MVP demonstration)
    if (doctors.length === 0 && (pincode || area)) {
      const mockNames = ['Dr. Sharma', 'Dr. Verma', 'Dr. Patel', 'Dr. Singh', 'Dr. Gupta', 'Dr. Reddy']
      const mockSpecs = ['General Physician', 'Fever Specialist', 'Cardiologist', 'Dermatologist', 'ENT Specialist', 'Pediatrician']
      
      const newDoctors = []
      // Generate 4 random doctors
      for (let i = 0; i < 4; i++) {
        const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
        const randomSpec = mockSpecs[Math.floor(Math.random() * mockSpecs.length)]
        const resolvedPincode = pincode || (area && area.match(/\b\d{6}\b/)?.[0]) || '462001'
        const resolvedArea = area || `Pincode ${resolvedPincode}`
        
        newDoctors.push({
          name: `${randomName} (${resolvedArea})`,
          specialization: randomSpec,
          clinic_address: `Local Clinic, ${resolvedArea}`,
          phone: `+91 ${Math.floor(8000000000 + Math.random() * 1999999999)}`,
          pincode: resolvedPincode,
          latitude: 23.2599 + (Math.random() - 0.5) * 0.1, // Approximate random nearby lat
          longitude: 77.4126 + (Math.random() - 0.5) * 0.1, // Approximate random nearby lng
          rating: parseFloat((4 + Math.random()).toFixed(1))
        })
      }
      
      // Save to database
      await Doctor.insertMany(newDoctors)
      
      // Re-run the query to apply filters correctly
      doctors = await Doctor.find(filter).sort({ rating: -1 }).limit(20)
    }

    res.json({ count: doctors.length, doctors })
  } catch (error) {
    next(error)
  }
}

// GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })
    res.json(doctor)
  } catch (error) {
    next(error)
  }
}
