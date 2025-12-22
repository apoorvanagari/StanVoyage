"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        alert("Logged out successfully!");
        router.push("/login");
      } else {
        alert("Logout failed.");
      }
    } catch (err) {
      alert("Something went wrong.");
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="btn btn-secondary mt-4 bg-red-500 text-white p-2 rounded"
    >
      Logout
    </button>
  );
}
