import express from 'express'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { verifyToken, generateToken } from './auth.js'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import fs from 'fs'
// import router from './routers/protected_router.js'
import authRouter from './routers/protected_router.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = path.join(__dirname, 'database.json')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())


app.get('/', (req, res) => {
  // res.render('index', { title: 'Express' })
  res.render('index.ejs')
})

// const users = [{ id: 1, name: "asd", password: "asd" }];
let users = []
try {
  const db_data = fs.readFileSync(dbPath, 'utf-8');
  users = JSON.parse(db_data);
}
catch (e) {
  console.log("tried to load db data, explode wheeee")
  users = [];
}
// const users = JSON.parse(fs.readFileSync(dbPath,'utf-8'));

function addUser(newUser) {
  if (users.find(u => u.name === newUser.name) === undefined) {
    console.log("user already exists")
    users.push(newUser);
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
  }
}

addUser({ id: 2, name: "asd", password: "asd" });

app.use("/", authRouter)

app.get('/login', (req, res) => {
  console.log('get login')
  res.render('login')
})
// Login route – returns a signed JWT on success
app.post('/login', (req, res) => {
  console.log('post login')
  const { name, password } = req.body;
  const user = users.find(u => u.name === name && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  console.log(`successfully authorized ${user.name}`)
  const token = generateToken(user);
  res.cookie('token', token, { httpOnly: true });
  // res.json({ token });
  // res.json({ message: 'Login successful', token });
  res.redirect('/homepage')
});

// Protected route – requires a valid JWT
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'You have accessed a protected route', user: req.user });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})