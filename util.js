import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, generateToken } from './auth.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fs from 'fs';
// import router from './routers/protected_router.js'
import authRouter from './routers/protected_router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = path.join(__dirname, 'database.json');
let users = [];
try {
  const db_data = fs.readFileSync(dbPath, 'utf-8');
  users = JSON.parse(db_data);
} catch (e) {
  console.log(`error loading db: ${e}`);
  users = [];
}

export function addUser(newUser) {
  if (users.find(u => u.name === newUser.name) === undefined) {
    console.log('user already exists');
    users.push(newUser);
    // fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
  }
}

export function userExists(name) {
  return users.find(u => u.name === name) !== undefined;
}

export function addDocumentToUser(name, document, title) {
  console.log('addDocumentToUser', name)
  // const user = users.find(u => u.name === name);
  const user= getUser(name);
  // console.log('user', user)
  if (user) {
    console.log('adddocument to user user exists')
    // ensure the key exists
    if (!Array.isArray(user.documents)) {
      console.log(`user.documents is not an array, making one`)
      user.documents = [];
    }
    const combined = [title, document]
    // user.documents.push(document);
    user.documents.push(combined);
    console.log(`user documents ${user.documents}`)
    // console.log(`user json: ${JSON.stringify(user, null, 2)}`)
    console.log(`all users ${JSON.stringify(users, null, 2)}`)
    // fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    updateDatabase()
  }
}

export function updateDatabase() {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}


export function getUser(name) {
  console.log('getUser', name);
  const user = users.find(u => u.name === name);
  if (user) {
    return user;
  }
  return null;
}

export function getUserDocuments(name) {
  const user = getUser(name);
  console.log(`util.js -> getUserDocuments`, JSON.stringify(user.documents))
  // const user = users.find(u => u.name === name);
  if (user) {
    return user.documents;
  }
  return [];
}
