import express from 'express'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { verifyToken, generateToken } from './auth.js'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import authRouter from './routers/protected_router.js'
import { connectDB } from './db.js'
import { addUser, getUser } from './util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

await connectDB()                 // <‑‑ connect to Mongo before routes
await addUser({ name: 'asd', password: 'asd' })

app.use('/', authRouter)

app.get('/', (req, res) => res.render('index'))

app.get('/login', (req, res) => res.render('login'))

app.post('/login', async (req, res) => {
  const { name, password } = req.body
  const user = await getUser(name)
  if (!user || user.password !== password)
    return res.status(401).json({ message: 'Invalid credentials' })

  const token = generateToken(user)
  res.cookie('token', token, { httpOnly: true })
  res.redirect('/homepage')
})

app.use((req, res) => res.status(404).send('404 – Page not found'))

app.listen(3000, () => console.log('Server running on port 3000'))