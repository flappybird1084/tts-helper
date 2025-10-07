import jwt from 'jsonwebtoken'

const SECRET = 'secret'

export function generateToken (user) {
  // return jwt.sign(payload, SECRET)
  return jwt.sign({id: user.id}, SECRET, {expiresIn: '12h'})
}

export function verifyToken (req, res, next) {
  const token = req.headers.authorization
  console.log(`token: ${token}`)
  token = token.split(' ')[1]
  console.log(`token: ${token}`)
  if (!token) {
    return res.status(401).json({message: 'No token provided'})
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({message: 'Invalid token'})
      // return res.status(401).json({message: 'Invalid token'})
    }
    req.user = decoded
    next()
  });
}