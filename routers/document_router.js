
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { verifyToken } from '../auth.js'
import { addDocumentToUser, getUserDocuments, updateDatabase } from '../util.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })   // temporary folder

// router.get('/create-document', verifyToken, (req, res) => {
//   res.render('create-document')
// })
router.get('/documents/create', verifyToken, (req, res) => {
  res.render('create-document');
});

// handle file+text form submission
router.post(
  '/documents/create',
  verifyToken,
  upload.single('file'),
  (req, res) => {
    console.log(`post create document`)
    const user = req.user
    let { textContent, title } = req.body
    const filePath = req.file?.path

    console.log(`received document create with name ${title}`)
    title=title || "Untitled"
    
    let documentText = textContent || ''
    if (filePath && !documentText) {
      // read uploaded file if provided, simple UTF-8 assumption
      documentText = fs.readFileSync(filePath, 'utf8')
      fs.unlinkSync(filePath) // optional: remove after reading
    }

    // store the document text under this user
    addDocumentToUser(user.name, documentText, title)
    updateDatabase()

    res.redirect('/homepage')
  }
)

router.get('/documents/:documentTitle', verifyToken, (req, res) => {
  let documentTitle = req.params.documentTitle
  let user = req.user
  // let document = getDocumentFromUser(user.name, documentTitle)
  let userDocuments = getUserDocuments(user.name)
  console.log(`userDocuments: ${JSON.stringify(userDocuments)}`)
  let document= userDocuments.find(d => d[0] === documentTitle)
  console.log(`found document: ${document.title} with content: ${document.content}`)
  if (!document) {
    return res.status(404).json({ message: 'Document not found' })
  }
  res.json(document)
  }
)

export default router
