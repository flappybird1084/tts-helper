import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://100.64.0.25:27017/tts-helper'

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('mongodb connected')
  } catch (err) {
    console.log(`error while connecting to mongodb: ${err}`)
    process.exit(1)
  }
}