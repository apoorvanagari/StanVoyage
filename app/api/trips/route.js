import { connectToDatabase } from "@/app/lib/mongodb";
import Trip from "@/app/models/Trip";
import { checkAuth } from "@/app/utils/auth";

export async function GET() {
    try {
        const email = await checkAuth();
        await connectToDatabase();

        const trips = await Trip.find({ email }).sort({ date: 1, time: 1 });

        return Response.json(
            {
                message: "Your trips fetched successfully",
                trips,
            },
            { status: 200 }
        );
    } catch (err) {
        console.log("Error fetching trips:", err.message);
        return Response.json(
            { message: "Error fetching trips" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const email = await checkAuth();
        await connectToDatabase();

        const body = await req.json();
        let { date, time, source, destination } = body;

        if (!date || !time || !source || !destination) {
            return Response.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        if (source === destination) {
            return Response.json(
                { message: "Source and destination cannot be the same." },
                { status: 400 }
            );
        }

        let tripID, exists = true;

        while (exists) {
            tripID = Math.floor(Math.random() * 900000) + 100000;
            const check = await Trip.findOne({ tripID });
            if (!check) exists = false;
        }

        const trip = await Trip.create({
            email,
            date,
            time,
            source,
            destination,
            tripID,
        });

        return Response.json(
            { message: "Trip created successfully!", tripID },
            { status: 200 }
        );
    } catch (err) {
        console.log("Trip creation error:", err.message);
        return Response.json(
            { message: "Error creating trip" },
            { status: 500 }
        );
    }
}
