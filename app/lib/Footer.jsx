import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="mt-6 sm:mt-8">
			<p className="mx-auto max-w-3xl text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
				Please note that this application is made to help students who
				wish to share thier ride with someone with similiar travel
				plans. Any data submitted here will be visible to others who
				input a similiar time slot. Please consider before submitting
				any personal information.
			</p>
			
		</footer>
	);
}
