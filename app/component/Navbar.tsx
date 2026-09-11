"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User { name: string; email: string }

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { setUser(data); setChecked(true); })
      .catch(() => setChecked(true));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-6 px-6 py-3 border-b border-gray-800 mb-6">
      <Link href="/" className="flex items-center gap-3 font-bold text-xl text-white hover:opacity-90 transition">
        <img src="/logo.png" alt="Trip Log Logo" className="w-14 h-14 rounded-xl object-contain shadow-md" />
        <span>Trip Log</span>
      </Link>
      <Link href="/trips" className="text-gray-300 hover:text-white transition text-sm">
        My Trips
      </Link>

      <div className="flex-1" />

      {checked && (
        user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">Hi, {user.name}</span>
            <button onClick={handleLogout} className="text-sm px-3 py-1 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition cursor-pointer" >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition">
              Log in
            </Link>
            <Link href="/signup" className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
              Sign up
            </Link>
          </div>
        )
      )}
    </nav>
  );
}