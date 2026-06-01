import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, pincode } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'User already exists' })

    const user = await User.create({ name, email, password, phone, pincode })
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  } catch (error) {
    next(error)
  }
}
