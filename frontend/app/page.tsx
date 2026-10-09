"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";

const API_URL = "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("campusgpt_token", data.accessToken);

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">

        {/* Left branding panel */}
        <section className="flex flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-10 text-white">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap size={32} />
            </div>

            <h1 className="mt-8 text-4xl font-bold tracking-tight">
              CampusGPT
            </h1>

            <p className="mt-3 text-lg text-blue-100">
              Your intelligent campus companion.
            </p>

            <p className="mt-6 max-w-sm text-sm leading-7 text-blue-100">
              Discover campus events, explore communities, manage your
              academic activities, and access university information
              from one place.
            </p>
          </div>

          <div className="mt-12">
            <p className="text-sm text-blue-100">
              One campus. One intelligent experience.
            </p>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your CampusGPT dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  University Email
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <Mail size={18} className="text-slate-400" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@campusgpt.com"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <Lock size={18} className="text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure campus access powered by CampusGPT
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}