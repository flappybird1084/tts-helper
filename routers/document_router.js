
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { verifyToken } from '../auth.js'
import { addDocumentToUser } from '../util.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })   // temporary folder

router.get('/create-document', verifyToken, (req, res) => {
  res.render('create-document')
})

// handle file+text form submission
router.post(
  '/create-document',
  verifyToken,
  upload.single('file'),
  (req, res) => {
    const user = req.user
    const { textContent } = req.body
    const filePath = req.file?.path

    let documentText = textContent || ''
    if (filePath && !documentText) {
      // read uploaded file if provided, simple UTF-8 assumption
      documentText = fs.readFileSync(filePath, 'utf8')
      fs.unlinkSync(filePath) // optional: remove after reading
    }

    // store the document text under this user
    addDocumentToUser(user.name || user.id, documentText)

    res.redirect('/homepage')
  }
)

export default router
