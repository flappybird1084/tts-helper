
import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'
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

async function fileToText(file) {
  if (!file?.path) return ''

  const { path: filePath, mimetype, originalname } = file
  let buffer
  try {
    buffer = await fs.promises.readFile(filePath)
  } catch (error) {
    console.error('Failed to read uploaded file', error)
    return ''
  } finally {
    await fs.promises.unlink(filePath).catch(() => {})
  }

  const extension = path.extname(originalname || '').toLowerCase()
  const isPdf = mimetype === 'application/pdf' || extension === '.pdf'
  const isDocx =
    mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === '.docx'

  try {
    if (isPdf) {
      const result = await pdfParse(buffer)
      return result.text || ''
    }

    if (isDocx) {
      const { value } = await mammoth.extractRawText({ buffer })
      return value || ''
    }

    return buffer.toString('utf8')
  } catch (error) {
    console.error('Failed to parse uploaded file', error)
    return buffer.toString('utf8')
  }
}

async function extractDocumentPayload(req) {
  let { textContent = '', title = '' } = req.body
  title = title.trim() || 'Untitled'

  let content = textContent
  if (req.file) {
    const fileContent = await fileToText(req.file)
    if (!content) {
      content = fileContent
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
