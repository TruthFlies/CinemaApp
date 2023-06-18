import { Router } from 'express';
import { cinemaRouter } from './cinema';
import { bookingRouter } from './booking';

const mainRouter = Router();

//Import all the sub routes and add apporpriate middleware functions for rate limiting/authentication/etc.
mainRouter.use('/cinema', cinemaRouter);
mainRouter.use('/booking', bookingRouter);

export { mainRouter };