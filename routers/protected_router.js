import express from 'express';
// import { verifyToken } from '../auth';
import { verifyToken } from '../auth.js';
import { getUser, getUserDocuments } from '../util.js';

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
  // console.log('get homepage');
  let user = req.user;
  const userdocuments = getUserDocuments(user.name);
  console.log('/homepage route before render docs:', JSON.stringify(userdocuments))
  console.log(`document len ${userdocuments.length}`)
  res.render('homepage', { user: req.user, documents: userdocuments });
  // res.send('Homepage');
});


export default authRouter;
