import jwt from 'jsonwebtoken'

const SECRET = 'secret'

export function generateToken (user) {
  // return jwt.sign(payload, SECRET)
  return jwt.sign({id: user.id}, SECRET, {expiresIn: '12h'})
}

export function verifyToken (req, res, next) {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  console.log(`token: ${token}`);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}