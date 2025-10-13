
import express from 'express'
import multer from 'multer'
import fs from 'fs'
import { verifyToken } from '../auth.js'
import {
  addDocumentToUser,
  getUserDocuments,
  getUserDocument,
  updateUserDocument,
  deleteUserDocument
} from '../util.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' }) // temporary folder

async function extractDocumentPayload(req) {
  let { textContent = '', title = '' } = req.body
  title = title.trim() || 'Untitled'

  let content = textContent
  const filePath = req.file?.path

  if (filePath) {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8')
      if (!content) {
        content = fileContent
      }
    } finally {
      if (filePath) {
        await fs.promises.unlink(filePath).catch(() => {})
      }
    }
  }

  return { title, content }
}

router.get('/documents', verifyToken, async (req, res) => {
  try {
    const documents = await getUserDocuments(req.user.name)
    res.render('documents/index', { user: req.user, documents })
  } catch (error) {
    console.error('Failed to list documents', error)
    res.status(500).send('Failed to load documents')
  }
})

router.get('/documents/create', verifyToken, (req, res) => {
  res.render('create-document')
})

const createDocumentHandler = async (req, res) => {
  try {
    const user = req.user
    const { title, content } = await extractDocumentPayload(req)

    await addDocumentToUser(user.name, content, title)

    res.redirect('/documents')
  } catch (error) {
    console.error('Failed to add document', error)
    res.status(500).send('Failed to save document')
  }
}

router.post(
  '/documents',
  verifyToken,
  upload.single('file'),
  createDocumentHandler
)

// legacy route support
router.post(
  '/documents/create',
  verifyToken,
  upload.single('file'),
  createDocumentHandler
)

router.get('/documents/:documentId', verifyToken, async (req, res) => {
  try {
    const document = await getUserDocument(
      req.user.name,
      req.params.documentId
    )

    if (!document) {
      return res.status(404).send('Document not found')
    }

    res.render('documents/show', { user: req.user, document })
  } catch (error) {
    console.error('Failed to fetch document', error)
    res.status(500).send('Failed to fetch document')
  }
})

router.get('/documents/:documentId/edit', verifyToken, async (req, res) => {
  try {
    const document = await getUserDocument(
      req.user.name,
      req.params.documentId
    )

    if (!document) {
      return res.status(404).send('Document not found')
    }

    res.render('documents/edit', { user: req.user, document })
  } catch (error) {
    console.error('Failed to load document editor', error)
    res.status(500).send('Failed to load document editor')
  }
})

router.post(
  '/documents/:documentId',
  verifyToken,
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, content } = await extractDocumentPayload(req)

      const updated = await updateUserDocument(
        req.user.name,
        req.params.documentId,
        { title, content }
      )

      if (!updated) {
        return res.status(404).send('Document not found')
      }

      res.redirect(`/documents/${req.params.documentId}`)
    } catch (error) {
      console.error('Failed to update document', error)
      res.status(500).send('Failed to update document')
    }
  }
)

router.post('/documents/:documentId/delete', verifyToken, async (req, res) => {
  try {
    const removed = await deleteUserDocument(
      req.user.name,
      req.params.documentId
    )

    if (!removed) {
      return res.status(404).send('Document not found')
    }

    res.redirect('/documents')
  } catch (error) {
    console.error('Failed to delete document', error)
    res.status(500).send('Failed to delete document')
  }
})

export default router
