import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { Booking } from '../models/booking';

import logger from "../utils/logging";
import { Cinema } from '../models/cinema';

const bookingRouter = Router();

// Function that checks if title and Seats are valid
const validateSeatNo = body('seatNo').isInt({ gt: 0 }).withMessage('SeatNo must be greater than 0');

// Function that checks if title and Seats are valid
const validateCinema = body('cinemaId').not().isEmpty().custom((input: string) => Types.ObjectId.isValid(input)).withMessage('Cinema Id is required');

/**
 * Create a new booking
 * @route POST /api/booking/single
 * 
 * To book a single ticket to a cinema
 * @param
 * cinemaId
 * seatNo
 */
bookingRouter.post(
  '/single',
  [validateCinema, validateSeatNo],
  async (req: Request, res: Response) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        logger.info(`Error booking a ticket. ${result.array().join(',')}`)
        return res.status(400).send({ errors: result.array() });
      }

      /**
       * Not using any UserId from Request object to start with.
       * This can be changed later to fetch from session instead after authorization/authentication is implemented
       * 
       * @param
       * cinemaId:string Id of the Cinema
       * seatsNo:number Seat To be booked in cinema
       * 
       * 
       **/
      const { cinemaId, seatNo } = req.body;

      const cinema = await Cinema.findById(cinemaId);
      if (!cinema) {
        return res.status(400).send({ errors: 'Cinema not found' });
      }
      // Build new booking
      const newBooking = Booking.build({
        cinema,
        seatNo,
      });
      // Make sure the seat is valid
      const isValid = await newBooking.isValidSeat();
      if (isValid) {
        return res.status(400).send({ errors: 'SeatNo is invalid' });
      }
      // Make sure the ticket has not yet been reserved
      const isReserved = await newBooking.isReserved();
      if (isReserved) {
        return res.status(400).send({ errors: 'Seat already Reserved' });
      }

      // Save in the database
      await newBooking.save();

      logger.info(`Booking created: ${newBooking.id} , Seat Reserved : ${newBooking.seatNo} `)
      res.status(201).send({ id: newBooking.id, seatNo: newBooking.seatNo });
    } catch (e) {
      let result;
      if (typeof e === "string") {
        result = e.toUpperCase()
      } else if (e instanceof Error) {
        result = e.message
      }
      logger.info(`Error creating booking. ${result}`)
      res.status(500).send({ errors: 'Error booking ticket' });
    }
  }
);



/**
 * Create a new booking
 * @route POST /api/booking/double
 * 
 * To book first two consecutive seats in a cinema
 * @param
 * cinemaId
 * seatNo
 */
bookingRouter.post(
  '/double',
  [validateCinema],
  async (req: Request, res: Response) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        logger.info(`Error booking a ticket. ${result.array().join(',')}`)
        return res.status(400).send({ errors: result.array() });
      }

      /**
       * Not using any UserId from Request object to start with.
       * This can be changed later to fetch from session instead after authorization/authentication is implemented
       * 
       * @param
       * cinemaId:string Id of the Cinema
       * seatsNo:number Seat To be booked in cinema
       * 
       * 
       **/
      const { cinemaId } = req.body;

      const cinema = await Cinema.findById(cinemaId);
      if (!cinema) {
        return res.status(400).send({ errors: 'Cinema not found' });
      }

      const allBookedSeats = await Booking.find({ "cinema": cinema });
      if (allBookedSeats.length === cinema.seats) {
        return res.status(400).send({ errors: 'All seats booked' });
      }
      // get only the list of seatNo
      const bookedSeats = allBookedSeats.map((booking) => booking.seatNo).sort();
      let startIndex = -99

      // If No Seats booked and Cinema has more than 1 seats
      if (bookedSeats.length === 0 && cinema.seats >= 1) {
        startIndex = 1
      } else {
        for (let curr = 1; curr < cinema.seats-1; curr++) {
          //Check if current (curr) is already Booked
          if (bookedSeats.indexOf(curr) != -1){
            continue;
          }
          else {
            if (bookedSeats.indexOf(++curr) != -1) {
              //Cuurent is not booked, But Next is so skip and continue with next
              continue
            }
            else {
              
              logger.debug(`Booked Seats `, bookedSeats)
              //curent already incremented so current-1,current is free
              startIndex = curr - 1;
              logger.debug(`startIndex `,startIndex,  )
              break;
            }
          }
        }
      }
      if (startIndex < 0) {
        logger.debug(`Total Seats in Cinema ${cinema.seats}`);
        return res.status(400).send({ errors: 'Internal Error' });
      }
      // Build new booking
      const newBooking = Booking.build({
        cinema,
        seatNo: startIndex
      });

      // Save in the database
      await newBooking.save();
      // Build new booking
      const newBooking2 = Booking.build({
        cinema,
        seatNo: startIndex + 1
      });
      // Save in the database
      await newBooking2.save();

      logger.info(`Booking created: ${newBooking.id} , Seat Reserved : ${newBooking.seatNo} `)
      logger.info(`Booking created: ${newBooking2.id} , Seat Reserved : ${newBooking2.seatNo} `)

      res.status(201).send({ id: [newBooking.id, newBooking2.id], seatNo: [newBooking.seatNo, newBooking2.seatNo] });
    } catch (e) {
      let result;
      if (typeof e === "string") {
        result = e.toUpperCase()
      } else if (e instanceof Error) {
        result = e.message
      }
      logger.info(`Error creating booking. ${result}`)
      res.status(500).send({ errors: 'Error booking ticket' });
    }
  }
);


export { bookingRouter };