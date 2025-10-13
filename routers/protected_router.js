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

// authRouter.get('/homepage', verifyToken, (req, res) => {
//   // console.log('get homepage');
//   let user = req.user;
//   const userdocuments = getUserDocuments(user.name);
//   console.log('/homepage route before render docs:', JSON.stringify(userdocuments))
//   console.log(`document len ${userdocuments.length}`)
//   res.render('homepage', { user: req.user, documents: userdocuments });
//   // res.send('Homepage');
// });
authRouter.get('/homepage', verifyToken, async (req, res) => {
  const user = req.user
  let userDocuments = await getUserDocuments(user.name)

  // fallback to an empty array if undefined/null
  userDocuments = Array.isArray(userDocuments) ? userDocuments : []

  console.log(
    '/homepage route before render docs:',
    JSON.stringify(userDocuments)
  )
  console.log(`document len ${userDocuments.length}`)

  res.render('homepage', { user, documents: userDocuments })
})


export default authRouter;
