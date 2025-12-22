"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "@/app/utils/Loading";
import Link from "next/link";
import { today } from "@/app/utils/date";

const TripForm = ({ email }) => {
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suggestionsSrc, setSuggestionsSrc] = useState([]);
    const [suggestionsDest, setSuggestionsDest] = useState([]);

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        source: "",
        destination: "",
    });

    // ---------- AUTOCOMPLETE USING PHOTON ----------
    async function fetchSuggestions(query, setter) {
        if (!query || query.length < 3) {
            setter([]);
            return;
        }

        try {
            const res = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await res.json();

            const names = data.features.map(
                (f) => f.properties.name || f.properties.city || ""
            );

            setter(names.filter((v) => v));
        } catch (e) {
            console.error("Photon error:", e);
            setter([]);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "source") fetchSuggestions(value, setSuggestionsSrc);
        if (name === "destination") fetchSuggestions(value, setSuggestionsDest);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.time || !formData.source || !formData.destination) {
            alert("Please fill all the fields!");
            return;
        }

        if (formData.source === formData.destination) {
            alert("Source and destination cannot be same!");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const json = await res.json();

            if (res.ok) {
                alert(json.message);
                router.push(`/trips/trip/${json.tripID}`);
            } else {
                alert(json.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <Loading />;

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Create New Trip</h2>

            <div className="mb-4">
                <label className="block text-gray-700">Email Address:</label>
                <input type="text" value={email} disabled className="border rounded-md p-2 w-full" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Departure Date:</label>
                <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    min={today().toISOString().slice(0, 10)}
                    onChange={handleChange}
                    className="border rounded-md p-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Time Slot:</label>
                <select
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="border rounded-md p-2 w-full"
                >
                    <option value="">Select Time Slot</option>
                    <option value="Morning (6am–12pm)">Morning (6am–12pm)</option>
                    <option value="Afternoon (12pm–5pm)">Afternoon (12pm–5pm)</option>
                    <option value="Evening (5pm–9pm)">Evening (5pm–9pm)</option>
                    <option value="Night (9pm–12am)">Night (9pm–12am)</option>
                </select>
            </div>

            {/* SOURCE AUTOCOMPLETE */}
            <div className="mb-4">
                <label className="block text-gray-700">Source:</label>
                <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="border rounded-md p-2 w-full"
                    placeholder="Enter source location"
                />

                {suggestionsSrc.length > 0 && (
                    <ul className="border rounded bg-gray-100 mt-1 max-h-32 overflow-y-auto">
                        {suggestionsSrc.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => {
                                    setFormData({ ...formData, source: s });
                                    setSuggestionsSrc([]);
                                }}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* DESTINATION AUTOCOMPLETE */}
            <div className="mb-4">
                <label className="block text-gray-700">Destination:</label>
                <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="border rounded-md p-2 w-full"
                    placeholder="Enter destination location"
                />

                {suggestionsDest.length > 0 && (
                    <ul className="border rounded bg-gray-100 mt-1 max-h-32 overflow-y-auto">
                        {suggestionsDest.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => {
                                    setFormData({ ...formData, destination: s });
                                    setSuggestionsDest([]);
                                }}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button type="submit" className="w-full btn btn-primary">
                Submit
            </button>

            <Link href="/trips">
                <button className="mt-4 w-full btn btn-secondary">Back to Trips Page</button>
            </Link>
        </form>
    );
};

export default TripForm;
