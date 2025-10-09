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

export default authRouter;