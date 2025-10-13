import User from './schemas/user.js'

// ---------- USERS ----------
export async function addUser(newUser) {
  const existing = await User.findOne({ name: newUser.name })
  if (existing) {
    console.log('User already exists')
    return existing
  }
  const user = await User.create(newUser)
  console.log('✅  Created user', user.name)
  return user
}

export async function getUser(name) {
  return await User.findOne({ name })
}

export async function userExists(name) {
  return !!(await User.findOne({ name }))
}

// ---------- DOCUMENTS ----------
export async function addDocumentToUser(name, content, title) {
  const user = await User.findOne({ name })
  if (!user) return
  user.documents.push({ title, content })
  await user.save()
  console.log(`Added doc "${title}" for ${name}`)
}

export async function getUserDocuments(name) {
  const user = await User.findOne({ name }, 'documents')
  return user ? user.documents : []
}
