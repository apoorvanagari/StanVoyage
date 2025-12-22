import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();

    cookieStore.set({
      name: "travelbuddy",
      value: "",
      maxAge: 0,
      path: "/", 
    });

    return NextResponse.json({ message: "Logged out successfully!" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
