import express from 'express'
import path from 'path'
import {dirname} from 'path'
import { fileURLToPath } from 'url'
import { verifyToken, generateToken } from './auth.js'
import bodyParser from 'body-parser'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  // res.render('index', { title: 'Express' })
  res.render('index.ejs')
})

const users = [{ id: 1, email: 'user@example.com', password: 'secret' }];

app.get('/login', (req, res) => {
  res.render('login')
})
// Login route – returns a signed JWT on success
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token });
});

// Protected route – requires a valid JWT
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'You have accessed a protected route', user: req.user });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})