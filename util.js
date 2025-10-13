import crypto from 'crypto'
import User from './schemas/user.js'

const HASH_ALGORITHM = 'sha256'

function hashPassword(rawPassword) {
  if (typeof rawPassword !== 'string') {
    throw new Error('Password must be a string')
  }
  return crypto
    .createHash(HASH_ALGORITHM)
    .update(rawPassword)
    .digest('hex')
}

function normalizeId(rawId) {
  if (!rawId) return undefined
  if (typeof rawId === 'string') return rawId
  if (typeof rawId.toString === 'function') return rawId.toString()
  return undefined
}

export function toPublicUser(user) {
  if (!user) return null
  const plain =
    typeof user.toObject === 'function' ? user.toObject() : { ...user }
  const publicUser = {
    id: normalizeId(plain._id ?? plain.id),
    name: plain.name
  }
  return publicUser
}

// ---------- USERS ----------
export async function addUser(newUser) {
  const { name, password } = newUser
  if (!name || !password) {
    throw new Error('Name and password are required to create a user')
  }

  const existing = await User.findOne({ name })
  if (existing) {
    console.log('User already exists')
    return existing
  }

  const isPreHashed =
    typeof password === 'string' &&
    password.length === hashPassword('').length &&
    /^[a-f0-9]+$/i.test(password)
  const hashedPassword = isPreHashed ? password : hashPassword(password)

  const user = await User.create({ name, password: hashedPassword })
  console.log('✅  Created user', user.name)
  return user
}

export async function getUser(name) {
  return await User.findOne({ name })
}

export async function userExists(name) {
  return !!(await User.findOne({ name }))
}

export async function authenticateUser(name, password) {
  if (!name || !password) return null
  const user = await User.findOne({ name })
  if (!user) return null
  const hashed = hashPassword(password)
  if (user.password === hashed) {
    return toPublicUser(user)
  }

  const legacyPassword = user.password
  if (legacyPassword && legacyPassword !== hashed && legacyPassword === password) {
    user.password = hashed
    await user.save()
    return toPublicUser(user)
  }

  return null
}

export async function getUserById(id) {
  if (!id) return null
  const user = await User.findById(id).lean()
  if (!user) return null
  const { password, ...rest } = user
  return {
    ...rest,
    id: normalizeId(user._id),
    _id: normalizeId(user._id)
  }
}

// ---------- DOCUMENTS ----------
export async function addDocumentToUser(name, content, title) {
  const user = await User.findOne({ name })
  if (!user) return
  if (!Array.isArray(user.documents)) {
    user.documents = []
  }
  user.documents.push({ title, content })
  await user.save()
  console.log(`Added doc "${title}" for ${name}`)
}

export async function getUserDocuments(name) {
  const user = await User.findOne({ name }, 'documents').lean()
  if (!user || !Array.isArray(user.documents)) {
    return []
  }
  return user.documents.map(document => ({
    ...document,
    _id: document._id.toString()
  }))
}

export async function getUserDocument(name, documentId) {
  const user = await User.findOne(
    { name, 'documents._id': documentId },
    { 'documents.$': 1 }
  ).lean()
  if (!user || !Array.isArray(user.documents) || user.documents.length === 0) {
    return null
  }
  const document = user.documents[0]
  return { ...document, _id: document._id.toString() }
}

export async function updateUserDocument(name, documentId, updates) {
  const user = await User.findOne({ name })
  if (!user) return null
  const document = user.documents.id(documentId)
  if (!document) return null

  if (Object.prototype.hasOwnProperty.call(updates, 'title')) {
    document.title = updates.title
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'content')) {
    document.content = updates.content
  }

  await user.save()
  return document.toObject()
}

export async function deleteUserDocument(name, documentId) {
  const user = await User.findOne({ name })
  if (!user) return false
  const document = user.documents.id(documentId)
  if (!document) return false

  document.deleteOne()
  await user.save()
  return true
}
