
import express from 'express'
import multer from 'multer'
import fs from 'fs'
import { verifyToken } from '../auth.js'
import { addDocumentToUser, getUserDocuments } from '../util.js'

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
  async (req, res) => {
    try {
      console.log(`post create document`)
      const user = req.user
      let { textContent, title } = req.body
      const filePath = req.file?.path

      title = title || 'Untitled'
      console.log(`received document create with name ${title}`)

      let documentText = textContent || ''
      if (filePath && !documentText) {
        // read uploaded file if provided, simple UTF-8 assumption
        documentText = fs.readFileSync(filePath, 'utf8')
        fs.unlinkSync(filePath) // optional: remove after reading
      }

      // store the document text under this user
      await addDocumentToUser(user.name, documentText, title)

      res.redirect('/homepage')
    } catch (error) {
      console.error('Failed to add document', error)
      res.status(500).send('Failed to save document')
    }
  }
)

router.get('/documents/:documentTitle', verifyToken, async (req, res) => {
  try {
    const documentTitle = req.params.documentTitle
    const user = req.user
    const userDocuments = await getUserDocuments(user.name)
    console.log(`userDocuments: ${JSON.stringify(userDocuments)}`)
    const document = userDocuments.find(d => d.title === documentTitle)
    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }
    console.log(
      `found document: ${document.title} with content: ${document.content}`
    )
    res.json(document)
  } catch (error) {
    console.error('Failed to fetch document', error)
    res.status(500).json({ message: 'Failed to fetch document' })
  }
})

export default router
