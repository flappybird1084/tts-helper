import jwt from 'jsonwebtoken'
import { getUserById, toPublicUser } from './util.js'

const SECRET = process.env.JWT_SECRET || 'secret'

export function generateToken(user) {
  const userId =
    user?.id ||
    (typeof user?._id === 'object' && user?._id !== null
      ? user._id.toString()
      : user?._id) ||
    null

  if (!userId || !user?.name) {
    throw new Error('Cannot generate token without user id and name')
  }

  return jwt.sign({ id: userId, name: user.name }, SECRET, {
    expiresIn: '12h'
  })
}

function respondUnauthorized(req, res, message = 'Unauthorized') {
  const acceptsJSON = req.headers.accept?.includes('application/json')
  if (!acceptsJSON) {
    return res.redirect('/login')
  }
  return res.status(401).json({ message })
}

export async function verifyToken(req, res, next) {
  try {
    let token = req.headers.authorization?.split(' ')[1]

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return respondUnauthorized(req, res)
    }

    const decoded = jwt.verify(token, SECRET)
    const user = await getUserById(decoded.id)
    if (!user) {
      return respondUnauthorized(req, res)
    }

    req.user = toPublicUser(user)
    next()
  } catch (error) {
    console.error('Token verification failed', error)
    return respondUnauthorized(req, res, 'Invalid token')
  }
}
