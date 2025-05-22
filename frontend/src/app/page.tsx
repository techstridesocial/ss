import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function RoleSelectionPage() {
  return (
    <div className="flex h-screen w-screen">
      {/* Influencer Section */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-200 text-black p-10 cursor-pointer hover:opacity-90 transition-opacity duration-300">
        {/* Placeholder for background image - to be added */}
        <h1 className="text-4xl font-bold mb-4">Log in as Influencer</h1>
        <p>Access your campaign dashboard, connect your socials, and manage payments.</p>
        {/* This div will act as the clickable area leading to influencer sign-in */}
      </div>

      {/* Brand Section */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 text-white p-10 cursor-pointer hover:opacity-90 transition-opacity duration-300">
        {/* Placeholder for background image - to be added */}
        <h1 className="text-4xl font-bold mb-4">Log in as Brand</h1>
        <p>Discover influencers, manage shortlists, and track campaign performance.</p>
        {/* This div will act as the clickable area leading to brand sign-in */}
      </div>

      {/* Hidden Staff/Admin Access - to be styled and positioned */}
      {/* 
      <div className="absolute bottom-5 right-5">
        <Link href="/staff-login"> 
          <svg // Placeholder for a cog or key icon (e.g., from lucide-react)
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-500 hover:text-gray-700"
          >
            <title>Team Access</title>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /> 
          </svg>
        </Link>
      </div>
      */}
    </div>
  );
}
