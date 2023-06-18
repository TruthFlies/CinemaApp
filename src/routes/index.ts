import { Router } from 'express';
import { cinemaRouter } from './cinema';

const mainRouter = Router();

//Import all the sub routes and add apporpriate middleware functions for rate limiting/authentication/etc.
mainRouter.use('/cinema', cinemaRouter);

export { mainRouter };