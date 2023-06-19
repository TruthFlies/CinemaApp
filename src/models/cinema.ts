import { Schema, model, Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CinemaAttributes {
  title: string;
  seats: number;
}

export interface CinemaDoc extends Document {
  title: string;
  seats: number;
  version: number;
}

interface CinemaModel extends Model<CinemaDoc> {
  build(attributes: CinemaAttributes): CinemaDoc;
}

const cinemaSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
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
//Create a index on the schema for making eache cinema unique based on title
cinemaSchema.index({ title: 1}, { unique: true });
// Rename version key from __v to verison
cinemaSchema.set('versionKey', 'version');

// Apply plugin to manage version control
cinemaSchema.plugin(updateIfCurrentPlugin);

cinemaSchema.statics.build = (attributes: CinemaAttributes) =>
  new Cinema(attributes);

export const Cinema = model<CinemaDoc, CinemaModel>('Cinema', cinemaSchema);