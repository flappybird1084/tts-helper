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

export function addDocumentToUser(name, document) {
  console.log('addDocumentToUser', name)
  const user = users.find(u => u.name === name);
  if (user) {
    // ensure the key exists
    if (!Array.isArray(user.documents)) {
      user.documents = [];
    }
    user.documents.push(document);
    // fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
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
  const user = users.find(u => u.name === name);
  if (user) {
    return user.documents;
  }
  return [];
}
