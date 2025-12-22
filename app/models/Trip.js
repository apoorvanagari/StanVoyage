import { Schema, model, models } from "mongoose";

const tripSchema = new Schema({
    email: {
        type: String,
        required: [true, "Please provide an email"],
    },
    date: {
        type: String,
        required: [true, "Please provide a date"],
    },
    time: {
        type: String,
        required: [true, "Please provide a time"],
    },
    source: {
        type: String,
        required: [true, "Please provide a source"],
    },
    destination: {
        type: String,
        required: [true, "Please provide a destination"],
    },
    tripID: {
        type: Number,
        required: [true, "Please provide a trip ID"],
        unique: true,
    },
});

// Indexes
tripSchema.index({ source: 1, destination: 1, date: 1, time: 1 });
tripSchema.index({ email: 1 });

// 🔥 CRITICAL LINE TO FORCE RECOMPILATION OF MODEL
delete models.Trip;

const Trip = model("Trip", tripSchema);
export default Trip;
