import express from 'express';
// import { verifyToken } from '../auth';
import { verifyToken } from "../auth.js";

const authRouter = express.Router();

// authRouter.use((req, res, next) => {
//   verifyToken(req, res, next);
//   next();
//   // console.log(`req.user: ${req.user}`);
// });

authRouter.get('/protected-2',verifyToken, (req, res) => {
  res.send('Protected route 2');
});

authRouter.get('/homepage', verifyToken, (req, res) => {
  console.log('get homepage')
  res.render('homepage', { user: req.user });
  // res.send('Homepage');
});

export default authRouter;