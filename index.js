import express from 'express'
import path from 'path'
import {dirname} from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static('public'))


app.get('/', (req, res) => {
  // res.render('index', { title: 'Express' })
  res.render('index.ejs')
})


app.listen(3000, () => {
  console.log('Server is running on port 3000')
})