import Pharmacy from '../models/Pharmacy.js'

// GET /api/pharmacies?pincode=462001&area=Patel+Nagar&medicine=Paracetamol
export const searchPharmacies = async (req, res, next) => {
  try {
    const { pincode, area, medicine } = req.query
    const filter = {}
    if (pincode) filter.pincode = pincode
    if (area) {
      filter.$or = [
        { address: { $regex: area, $options: 'i' } },
        { name: { $regex: area, $options: 'i' } }
      ]
    }
    if (medicine) {
      filter.medicines = { $regex: medicine, $options: 'i' }
    }

    let pharmacies = await Pharmacy.find(filter).limit(20)

    // Auto-generate pharmacies if none exist for this search (for MVP demonstration)
    if (pharmacies.length === 0 && (pincode || area || medicine)) {
      const mockStorePrefixes = ['Apollo Pharmacy', 'MedPlus', 'Netmeds Store', 'Wellness Forever', 'Local Medical Hall', 'Janta Medicos']
      const standardMedicines = ['Paracetamol', 'Aspirin', 'Ibuprofen', 'Metformin', 'Amoxicillin', 'Cetirizine', 'Pantoprazole', 'Azithromycin', 'Vitamin C', 'Cough Syrup', 'Insulin', 'Atorvastatin', 'Omeprazole', 'Albuterol']
      
      const newPharmacies = []
      // Generate 4 pharmacies
      for (let i = 0; i < 4; i++) {
        const randomPrefix = mockStorePrefixes[Math.floor(Math.random() * mockStorePrefixes.length)]
        const resolvedPincode = pincode || (area && area.match(/\b\d{6}\b/)?.[0]) || (medicine && medicine.match(/\b\d{6}\b/)?.[0]) || '462001'
        const resolvedArea = area || `Pincode ${resolvedPincode}`
        
        // Build list of medicines, ensuring searched medicine is included
        const storeMedicines = new Set()
        if (medicine) {
          storeMedicines.add(medicine)
        }
        
        // Pick 5 random standard medicines
        while (storeMedicines.size < 6) {
          const randMed = standardMedicines[Math.floor(Math.random() * standardMedicines.length)]
          storeMedicines.add(randMed)
        }

        newPharmacies.push({
          name: `${randomPrefix} (${resolvedArea})`,
          address: `Local Store, ${resolvedArea}`,
          pincode: resolvedPincode,
          phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
          latitude: 23.2599 + (Math.random() - 0.5) * 0.1, // Approximate random nearby lat
          longitude: 77.4126 + (Math.random() - 0.5) * 0.1, // Approximate random nearby lng
          medicines: Array.from(storeMedicines)
        })
      }

      // Save to database
      await Pharmacy.insertMany(newPharmacies)

      // Re-run the query to apply filters correctly
      pharmacies = await Pharmacy.find(filter).limit(20)
    }

    res.json({ count: pharmacies.length, pharmacies })
  } catch (error) {
    next(error)
  }
}
