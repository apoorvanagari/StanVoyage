import { NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import validator from "validator";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { signSessionToken, setSessionCookie } from "@/app/utils/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    let { email, password } = body;

    email = sanitize(email).trim().toLowerCase();
    password = sanitize(password).trim();

    if (validator.isEmpty(email) || validator.isEmpty(password)) {
      throw new Error("Please enter both email and password!");
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) throw new Error("No user found with that email!");

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Incorrect password!");

    // Create session
    const sessionToken = signSessionToken(email);
    setSessionCookie(sessionToken);

    return NextResponse.json(
      { message: "Login successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error.message);
    return NextResponse.json(
      { message: error.message || "Login failed. Please try again later." },
      { status: 500 }
    );
  }
}
