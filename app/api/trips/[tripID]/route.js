import { connectToDatabase } from "@/app/lib/mongodb";
import Trip from "@/app/models/Trip";
import { checkAuth } from "@/app/utils/auth";
import User from "@/app/models/User";  

export async function GET(req, { params }) {
    try {
        await checkAuth();
        await connectToDatabase();

        const numericID = Number(params.tripID);
        if (isNaN(numericID)) {
            return Response.json(
                { message: "Invalid trip ID format" },
                { status: 400 }
            );
        }

        // Fetch the trip
        const trip = await Trip.findOne({ tripID: numericID });
        if (!trip) {
            return Response.json(
                { message: "Trip not found" },
                { status: 404 }
            );
        }

        // ⭐ Fetch user info (the missing piece)
        const user = await User.findOne({ email: trip.email }).lean();

        // Fetch similar trips
        const similar = await Trip.find({
            tripID: { $ne: numericID },
            source: trip.source,
            destination: trip.destination,
            date: trip.date,
        });

        return Response.json(
            {
                trip,
                user,      // <-- REQUIRED BY TripDetails.jsx
                similar,
            },
            { status: 200 }
        );
    } catch (err) {
        console.log("Trip fetch error:", err.message);
        return Response.json(
            { message: "Error fetching trip" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        await checkAuth();
        await connectToDatabase();

        // tripID from URL → convert to number
        const numericID = Number(params.tripID);
        if (isNaN(numericID)) {
            return Response.json(
                { message: "Invalid trip ID" },
                { status: 400 }
            );
        }

        // Delete by tripID (NOT _id)
        const deleted = await Trip.findOneAndDelete({ tripID: numericID });

        if (!deleted) {
            return Response.json(
                { message: "Trip not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { message: "Trip deleted successfully" },
            { status: 200 }
        );
    } catch (err) {
        console.log("Delete error:", err.message);
        return Response.json(
            { message: "Error deleting trip" },
            { status: 500 }
        );
    }
}

