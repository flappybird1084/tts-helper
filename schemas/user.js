import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
  title: String,
  content: String
})

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  password: String,
  documents: [documentSchema]
})

export default mongoose.model('User', userSchema)