"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed.");
      } else {
        router.push("/trips");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-1 text-white">Create an account</h1>
      <p className="text-gray-400 mb-8 text-sm">Start logging your trips.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white focus:outline-none focus:border-blue-500"/>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white focus:outline-none focus:border-blue-500"/>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input type="password" value={password}onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters"
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-transparent text-white focus:outline-none focus:border-blue-500"/>
        </div>

        <button type="submit" disabled={loading}className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition cursor-pointer">
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400"> Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}