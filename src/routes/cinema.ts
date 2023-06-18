import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { Cinema } from '../models/cinema';

import logger from "../utils/logging";

const cinemaRouter = Router();

// Function that checks if title and Seats are valid
const validateTitleAndSeats = [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('seats').isInt({ gt: 0 }).withMessage('Seats must be greater than 0'),
];

/**
 * Create a new Cinema
 * @route POST /api/cinema/create
 */
cinemaRouter.post(
    '/create',
    validateTitleAndSeats,
    async (req: Request, res: Response) => {
        try {
            /**
             * Using UserId from Request object to start with.
             * This can be changed later to fetch from session instead after authorization/authentication is implemented
             * 
             * @param
             * title:string Name of the Cinema
             * seats:number Number of seats in Cinema
             * 
             * 
             **/
            const { title, seats } = req.body;

            // Build new Cinema
            const newCinema = Cinema.build({
                title,
                seats,
            });

            // Save in the database
            await newCinema.save();
            res.status(201).send(newCinema.id);
        } catch (e) {
            let result;
            if (typeof e === "string") {
                result=e.toUpperCase()
            } else if (e instanceof Error) {
                result=e.message
            }
            logger.info(`Error creating Cinema. ${result}`)
            res.status(500).send('Error creating Cinema');
        }
    }
);

export { cinemaRouter };