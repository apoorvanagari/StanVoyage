"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/utils/Loading";

export default function RegForm({ redirectUrl = "/" }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    number: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, roll, number, email, password } = formData;

    // ✅ Basic client-side validation
    if (!name || !roll || !number || !email || !password) {
      alert("Please fill all the fields!");
      return;
    }

    if (!/^\d{10}$/.test(number)) {
      alert("Invalid mobile number! Please enter a valid 10-digit number.");
      return;
    }

    if (!email.endsWith("@stanley.edu.in")) {
      alert("Please use your official college email (@stanley.edu.in)");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok) {
        alert(json.message);
        router.push(redirectUrl);
        return;
      }

      alert(json.message);
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <Loading />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

      {/* Full Name */}
      <div className="mb-4">
        <label className="block text-gray-700">Full Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border rounded-md p-2 w-full"
        />
      </div>

      {/* Roll Number */}
      <div className="mb-4">
        <label className="block text-gray-700">Roll Number:</label>
        <input
          type="text"
          name="roll"
          value={formData.roll}
          onChange={handleChange}
          required
          className="border rounded-md p-2 w-full"
        />
      </div>

      {/* Mobile Number */}
      <div className="mb-4">
        <label className="block text-gray-700">Mobile Number:</label>
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleChange}
          required
          className="border rounded-md p-2 w-full"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-gray-700">College Email Address:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="yourname@stanley.edu.in"
          className="border rounded-md p-2 w-full"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label className="block text-gray-700">Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="At least 6 characters"
          className="border rounded-md p-2 w-full"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
        >
          Register
        </button>
      </div>
    </form>
  );
}
