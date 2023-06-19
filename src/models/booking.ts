import { Schema, model, Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Cinema, CinemaDoc } from './cinema';

export interface BookingAttributes {
  cinema: CinemaDoc
  seatNo: number
}

interface BookingDoc extends Document {

  cinema: CinemaDoc,
  seatNo: number;
  version: number;
  isReserved(): Promise<boolean>;
  isValidSeat(): Promise<number[]>;
}

interface BookingModel extends Model<BookingDoc> {
  build(attributes: BookingAttributes): BookingDoc;
}

const bookingSchema = new Schema(
  {
    cinema: {
      type: Schema.Types.ObjectId,
      ref: 'Cinema',
    },
    seatNo: {
      type: Number,
      required: true,
      min: 0,
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
//Create a index on the schema for making each booking unique based on cinema and seat number
bookingSchema.index({ cinema: 1, seatNo: 1}, { unique: true });
// Rename version key from __v to verison
bookingSchema.set('versionKey', 'version');

// Apply plugin to manage version control
bookingSchema.plugin(updateIfCurrentPlugin);

bookingSchema.statics.build = (attributes: BookingAttributes) =>
  new Booking(attributes);

bookingSchema.methods.isReserved = async function () {
  // 'this' : the booking document that we just called 'isReserved' on
  const existingOrder = await Booking.findOne({
    cinemaId: this.cinemaId,
    seatNo: this.seatNo
  });

  // Return a boolean
  return !!existingOrder;
};

bookingSchema.methods.isValidSeat = async function () {
  // 'this' : the booking document that we just called 'isReserved' on
  const cinemaExists = await Cinema.findById(this.cinemaId);

  // Check if  0 < this.seatNo <= Cinema.seats
  return cinemaExists && (this.seatNo >0 && this.seatNo<= cinemaExists.seats)
};
bookingSchema.methods.isReserved = async function () {
  // 'this' : the booking document that we just called 'isReserved' on
  const existingOrder = await Booking.findOne({
    cinemaId: this.cinemaId,
    seatNo: this.seatNo
  });

  // Return a boolean
  return !!existingOrder;
};


export const Booking = model<BookingDoc, BookingModel>('Booking', bookingSchema);