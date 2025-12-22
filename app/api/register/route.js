import { NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import validator from "validator";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { findUserByEmail, signSessionToken, setSessionCookie } from "@/app/utils/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    let { name, roll, number, email, password } = body;

   
    name = sanitize(name).trim();
    roll = sanitize(roll).trim();
    number = sanitize(number).trim();
    email = sanitize(email).trim().toLowerCase();
    password = sanitize(password).trim();

    
    if ([name, roll, number, email, password].some(v => validator.isEmpty(v))) {
      throw new Error("Please fill all fields!");
    }

    if (!validator.isLength(name, { min: 3, max: 50 })) {
      throw new Error("Name should be between 3 to 50 characters!");
    }

    if (number.length !== 10) {
      throw new Error("Please enter a valid 10-digit phone number!");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Please enter a valid email address!");
    }

    
    if (!email.endsWith("@stanley.edu.in")) {
      throw new Error("Please use your official college email (@stanley.edu.in)");
    }

    if (!validator.isLength(password, { min: 6 })) {
      throw new Error("Password must be at least 6 characters long!");
    }

    await connectToDatabase();

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error("User already registered! Please login.");
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = new User({
      name,
      roll,
      number,
      email,
      password: hashedPassword,
    });

    await user.save();

    
    const sessionToken = signSessionToken(email);
    setSessionCookie(sessionToken);

    return NextResponse.json(
      { message: "Registration successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error.message);
    return NextResponse.json(
      { message: error.message || "Something went wrong - please try again later!" },
      { status: 500 }
    );
  }
}





// import { NextResponse } from "next/server";
// import sanitize from "mongo-sanitize";
// import validator from "validator";
// import { connectToDatabase } from "@/app/lib/mongodb";
// import User from "@/app/models/User";
// import { cookies } from "next/headers";
// import Axios from "axios";
// import {
// 	findUserByEmail,
// 	signSessionToken,
// 	setSessionCookie,
// } from "@/app/utils/auth";
// import { instituteDetails } from "@/app/utils/institute";

// export async function GET(req) {
// 	const url = new URL(req.url);
// 	const email = url.searchParams.get("email");

// 	const checkUser = await findUserByEmail(email);
// 	if (checkUser) {
// 		const sessionToken = signSessionToken(email);
// 		setSessionCookie(sessionToken);
// 		return NextResponse.json(
// 			{ message: "User already registered!" },
// 			{ status: 201 }
// 		);
// 	}
// 	return NextResponse.json(
// 		{ message: "No Existing User found!" },
// 		{ status: 200 }
// 	);
// }

// export async function POST(req) {
// 	try {
// 		req = await req.json();

// 		// Form fields:
// 		// i)	name – (Full Name) - Text
// 		// ii)	roll – (Roll Number) – Text
// 		// iii)	number – (Mobile Number) – Text
// 		// iv)	email – (Institute Email) – Text
// 		// v)   instituteCode - (Institute Code) – Text

// 		let { name, roll, number, instituteCode } = req;

// 		const institute = await instituteDetails({ instituteCode });

// 		let { authCookie, verifyAuthLink } = institute;

// 		const cookieStore = cookies();

// 		const cookie = cookieStore.get(authCookie);
// 		if (!cookie) {
// 			return NextResponse.json(
// 				{ message: "You need to be logged in to register!" },
// 				{ status: 403 }
// 			);
// 		}

// 		const ssoToken = cookie.value;
// 		if (!ssoToken) {
// 			return NextResponse.json(
// 				{ message: "You need to be logged in to register!" },
// 				{ status: 403 }
// 			);
// 		}

// 		const response = await Axios.get(verifyAuthLink, {
// 			headers: {
// 				Cookie: Object.entries({ [authCookie]: ssoToken })
// 					.map(([key, value]) => `${key}=${value}`)
// 					.join("; "),
// 			},
// 		});
// 		const email = response.data.email;

// 		if (!email) {
// 			return NextResponse.json(
// 				{ message: "You need to be logged in to register!" },
// 				{ status: 403 }
// 			);
// 		}

// 		// ✅ Restrict registration to your college domain
// 		if (!email.endsWith("@stanley.edu.in")) {
// 			return NextResponse.json(
// 				{ message: "Please use your official college email (@yourcollege.ac.in) to register." },
// 				{ status: 400 }
// 			);
// 		}

// 		name = sanitize(name).trim();
// 		roll = sanitize(roll).trim();
// 		number = sanitize(number).trim();
// 		instituteCode = sanitize(instituteCode).trim();

// 		if (
// 			validator.isEmpty(name) ||
// 			validator.isEmpty(roll) ||
// 			validator.isEmpty(number) ||
// 			validator.isEmpty(instituteCode)
// 		) {
// 			throw new Error("Please fill all the fields!");
// 		}

// 		if (!validator.isLength(name, { min: 3, max: 50 })) {
// 			throw new Error("Name should be between 3 to 50 characters!");
// 		}

// 		if (number.length > 0 && number.length != 10) {
// 			throw new Error("Please enter a valid 10-digit phone number!");
// 		}

// 		await connectToDatabase();

// 		const checkUser = await findUserByEmail(email);

// 		if (checkUser) {
// 			return NextResponse.json(
// 				{ message: "User already registered! Please login." },
// 				{ status: 400 }
// 			);
// 		}

// 		const user = new User({
// 			name: name,
// 			roll: roll,
// 			number: number,
// 			email: email,
// 			instituteCode: instituteCode,
// 		});

// 		await user.save();

// 		const sessionToken = signSessionToken(email);
// 		setSessionCookie(sessionToken);

// 		return NextResponse.json(
// 			{ message: "Registration successful!" },
// 			{ status: 200 }
// 		);
// 	} catch (error) {
// 		console.log(error.message);
// 		return NextResponse.json(
// 			{
// 				message:
// 					error.message ||
// 					"Something went wrong - please try again later!",
// 			},
// 			{ status: 500 }
// 		);
// 	}
// }
