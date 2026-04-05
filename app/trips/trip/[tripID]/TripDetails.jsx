"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/utils/Loading";

// ── Match Score Logic ──────────────────────────────────────────────
// Weights: same time slot = 50pts, date proximity = 50pts (max)
// Date score: 0 days apart = 50, 1 day = 30, 2 days = 10, 3+ = 0
const DATE_SCORES = [50, 30, 10, 0];

function computeMatchScore(baseTrip, similarTrip) {
  let score = 0;

  // 1. Time slot match (exact)
  if (baseTrip.time === similarTrip.time) score += 50;

  // 2. Date proximity
  const d1 = new Date(baseTrip.date);
  const d2 = new Date(similarTrip.date);
  const daysDiff = Math.round(Math.abs((d1 - d2) / (1000 * 60 * 60 * 24)));
  score += DATE_SCORES[Math.min(daysDiff, 3)];

  return score;
}

function MatchBadge({ score }) {
  const color =
    score >= 80 ? "bg-green-500" :
    score >= 50 ? "bg-yellow-400" :
                  "bg-orange-400";
  const label =
    score >= 80 ? "Excellent Match" :
    score >= 50 ? "Good Match" :
                  "Partial Match";

  return (
    <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full ${color}`}>
      {score}% · {label}
    </span>
  );
}
// ──────────────────────────────────────────────────────────────────

const TripDetails = ({ tripID }) => {
    const router = useRouter();
    const [data, setData] = useState(null);

    const getDetails = async () => {
        const res = await fetch("/api/trips/" + tripID, {
            method: "GET",
            credentials: "include",
        });
        const json = await res.json();
        if (res.ok) {
            setData(json);
        } else {
            alert(json.message);
            router.push("/trips");
        }
    };

    useEffect(() => {
        getDetails();
    }, [tripID]);

    const handleCall = (number) => {
        if (number) window.open(`tel:${number}`);
    };

    const handleWhatsApp = (number) => {
        if (number) window.open(`https://wa.me/+91${number}`);
    };

    const deleteTrip = async (tripID) => {
        if (!confirm("Are you sure you want to delete this trip?")) return;
        const res = await fetch("/api/trips/" + tripID, {
            method: "DELETE",
            credentials: "include",
        });
        const json = await res.json();
        if (res.ok) {
            alert(json.message);
            router.push("/trips/my-trips");
        } else {
            alert(json.message);
        }
    };

    return data ? (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
                Trip Details - {data.trip.tripID}
            </h2>

            {/* USER DETAILS */}
            <p><strong>Name:</strong> {data.user?.name || "Not Available"}</p>
            <p><strong>Roll Number:</strong> {data.user?.roll || "Not Available"}</p>
            <p><strong>Mobile Number:</strong> {data.user?.number || "Not Available"}</p>
            <p><strong>Email:</strong> {data.trip.email}</p>

            {/* TRIP DETAILS */}
            <p><strong>Source:</strong> {data.trip.source}</p>
            <p><strong>Destination:</strong> {data.trip.destination}</p>
            <p>
                <strong>Date:</strong> {new Date(data.trip.date).toDateString()}
                &nbsp;&nbsp;
                <strong>Time Slot:</strong> {data.trip.time}
            </p>

            {/* SIMILAR TRIPS */}
            <h3 className="text-lg font-semibold mt-4">
                Common Trips (within +/- 3 hours):
            </h3>

            <ul className="mt-2">
                {data.similar.length === 0 && (
                    <p>No common trips found! Please check again later.</p>
                )}

                {data.similar
                  .map((trip) => ({
                    ...trip,
                    _score: computeMatchScore(data.trip, trip),
                  }))
                  .sort((a, b) => b._score - a._score)
                  .map((trip, idx) => (
                    <li key={idx} className="border p-2 my-2">

                        {/* ── MATCH SCORE BADGE ── */}
                        <div className="mb-2">
                            <MatchBadge score={trip._score} />
                        </div>

                        <p><strong>Name:</strong> {trip.name || "Not Available"}</p>
                        <p><strong>Roll Number:</strong> {trip.roll || "Not Available"}</p>

                        <p>
                            <strong>Mobile Number:</strong> {trip.number || "Not Available"}
                            {trip.number && (
                                <>
                                    <button
                                        onClick={() => handleCall(trip.number)}
                                        className="ml-2 bg-blue-500 text-white p-1 px-2 rounded"
                                    >
                                        Call
                                    </button>
                                    <button
                                        onClick={() => handleWhatsApp(trip.number)}
                                        className="ml-2 bg-green-500 text-white p-1 px-2 rounded"
                                    >
                                        WhatsApp
                                    </button>
                                </>
                            )}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            <a href={`mailto:${trip.email}`}>{trip.email}</a>
                        </p>

                        <p><strong>Source:</strong> {trip.source}</p>
                        <p><strong>Destination:</strong> {trip.destination}</p>
                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(trip.date).toDateString()}
                            &nbsp;&nbsp;
                            <strong>Time Slot:</strong> {trip.time}
                        </p>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => router.push("/trips/my-trips")}
                className="mt-2 w-full btn btn-primary"
            >
                My Trips
            </button>
            <button
                onClick={() => deleteTrip(data.trip.tripID)}
                className="mt-2 w-full btn btn-danger"
            >
                Delete this Trip
            </button>
            <button
                onClick={() => router.push("/trips")}
                className="mt-2 w-full btn btn-secondary"
            >
                Back to Trips Page
            </button>
        </div>
    ) : (
        <Loading />
    );
};

export default TripDetails;