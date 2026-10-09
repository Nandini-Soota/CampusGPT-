"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  isVerified: boolean;
  _count: {
    members: number;
  };
}

export default function ClubsPage() {
  const router = useRouter();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showMyClubs, setShowMyClubs] = useState(false);

  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [myClubs, setMyClubs] = useState<string[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(false);

    useEffect(() => {
    const savedToken = localStorage.getItem("campusgpt_token");

    if (!savedToken) {
      router.replace("/");
    }
  }, [router]);
  
  async function fetchMyClubs(authToken: string) {
    setMembershipLoading(true);

    try {
      const response = await fetch("http://localhost:3001/clubs/my", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load your club memberships.");
      }

      const data = await response.json();

      console.log("My joined clubs:", data);

      setMyClubs(data.map((membership: { clubId: string }) => membership.clubId));
    } catch (err) {
      console.error("Membership error:", err);
    } finally {
      setMembershipLoading(false);
    }
  }  
  async function handleMembership(clubId: string) {
    if (!token) return;

    const isMember = myClubs.includes(clubId);

    try {
      const response = await fetch(
        `http://localhost:3001/clubs/${clubId}/${isMember ? "leave" : "join"}`,
        {
          method: isMember ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Membership update failed.");
      }

      await fetchMyClubs(token);
      alert(
        isMember
          ? "You have left the club successfully!"
          : "You have joined the club successfully!"
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update club membership."
      );
    }
  }
  useEffect(() => {
  const savedToken = localStorage.getItem("campusgpt_token");

  if (!savedToken) {
    setToken("");
    setIsLoggedIn(false);
    setMyClubs([]);
    setAuthLoading(false);
    return;
  }

  setToken(savedToken);
  setIsLoggedIn(true);

  fetchMyClubs(savedToken);

  setAuthLoading(false);
}, []);
  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("http://localhost:3001/clubs");

        if (!response.ok) {
          throw new Error("Unable to load clubs.");
        }

        const data: Club[] = await response.json();
        setClubs(data);
      } catch {
        setError("Could not connect to the campus server. Please check that the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter((club) => {
  const matchesSearch = `${club.name} ${club.category} ${club.description}`
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesMembership =
    !showMyClubs || myClubs.includes(club.id);

  return matchesSearch && matchesMembership;
});

return (
  <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
    <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            CampusGPT Community
          </p>
          <h1 className="mt-2 text-3xl font-bold">Clubs & Communities</h1>
          <p className="mt-2 text-slate-500">
            Discover student communities, explore interests, and get involved on campus.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <Search size={19} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clubs or categories..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mb-6 flex gap-3">
  <button
    onClick={() => setShowMyClubs(false)}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      !showMyClubs
        ? "bg-blue-600 text-white"
        : "border bg-white text-slate-600"
    }`}
  >
    All Clubs
  </button>

  <button
    onClick={() => setShowMyClubs(true)}
    disabled={!isLoggedIn || authLoading}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      showMyClubs
        ? "bg-blue-600 text-white"
        : "border bg-white text-slate-600"
    } disabled:opacity-50`}
  >
    My Clubs ({myClubs.length})
  </button>
</div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <Loader2 className="animate-spin" size={20} />
            Loading campus clubs...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
            No clubs found. Try another search.
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Showing {filteredClubs.length} of {clubs.length} clubs
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <article
                  key={club.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Users size={23} />
                  </div>

                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{club.name}</h2>
                    {club.isVerified && (
                      <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mb-4 text-sm leading-6 text-slate-500">
                    {club.description}
                  </p>

                  <div className="flex items-center justify-between border-t pt-4">
                   <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                     {club.category.replaceAll("_", " ")}
                   </span>

                   <span className="text-xs text-slate-500">
                     {club._count.members} members
                   </span>
                  </div>

                  {isLoggedIn ? (
  <button
    onClick={() => handleMembership(club.id)}
    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
  >
    {myClubs.includes(club.id) ? "Leave Club" : "Join Club"}
  </button>
) : (
  <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-500">
    Log in through CampusGPT to join this club.
  </p>
)}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
