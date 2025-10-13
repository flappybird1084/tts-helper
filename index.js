import express from 'express'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { generateToken } from './auth.js'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import authRouter from './routers/protected_router.js'
import { connectDB } from './db.js'
import { addUser, authenticateUser, userExists, toPublicUser } from './util.js'

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

app.get('/login', (req, res) => res.render('login', { error: null }))

app.get('/signup', (req, res) =>
  res.render('signup', { error: null, values: { name: '' } })
)

app.post('/login', async (req, res) => {
  const { name, password } = req.body
  try {
    const user = await authenticateUser(name, password)
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid credentials' })
    }

    const token = generateToken(user)
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
    res.redirect('/homepage')
  } catch (error) {
    console.error('Login failed', error)
    res.status(500).render('login', {
      error: 'Something went wrong. Please try again.'
    })
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/login')
})

app.post('/signup', async (req, res) => {
  const { name = '', password = '', confirmPassword = '' } = req.body
  const trimmedName = name.trim()

  if (!trimmedName || !password) {
    return res.status(400).render('signup', {
      error: 'Name and password are required.',
      values: { name: trimmedName }
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).render('signup', {
      error: 'Passwords do not match.',
      values: { name: trimmedName }
    })
  }

  try {
    if (await userExists(trimmedName)) {
      return res.status(409).render('signup', {
        error: 'That name is already taken.',
        values: { name: trimmedName }
      })
    }

    const user = await addUser({ name: trimmedName, password })
    const token = generateToken(toPublicUser(user))

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
    res.redirect('/homepage')
  } catch (error) {
    console.error('Signup failed', error)
    res.status(500).render('signup', {
      error: 'Something went wrong. Please try again.',
      values: { name: trimmedName }
    })
  }
})

app.use((req, res) => res.status(404).send('404 – Page not found'))

app.listen(3000, () => console.log('Server running on port 3000'))
