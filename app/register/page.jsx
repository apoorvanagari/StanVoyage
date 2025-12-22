import { redirect } from "next/navigation";
import RegForm from "./RegForm";
import { getSession } from "@/app/utils/auth";

export const metadata = {
  title: "Register",
};

const Page = async ({ searchParams }) => {
  // ✅ Check if user is already logged in
  const session = await getSession();
  if (session?.email) {
    redirect(searchParams.redirect_url || "/");
  }

  // ✅ No SSO, just render the registration form
  return (
    <RegForm />
  );
};

export default Page;
