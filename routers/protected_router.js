import express from 'express';
// import { verifyToken } from '../auth';
import { verifyToken } from '../auth.js';
import { getUserDocuments } from '../util.js';

const authRouter = express.Router();

import documentRouter from './document_router.js'
authRouter.use('/', documentRouter)

// authRouter.use((req, res, next) => {
//   verifyToken(req, res, next);
//   next();
//   // console.log(`req.user: ${req.user}`);
// });

authRouter.get('/protected-2', verifyToken, (req, res) => {
  res.send('Protected route 2');
});

authRouter.get('/homepage', verifyToken, (req, res) => {
  console.log('get homepage');
  const user = req.user;
  const documents = getUserDocuments(user);
  res.render('homepage', { user: req.user, documents: documents });
  // res.send('Homepage');
});

authRouter.get('/documents/create', verifyToken, (req, res) => {
  res.render('create-document');
});

export default authRouter;
