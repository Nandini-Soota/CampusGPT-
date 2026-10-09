
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Users,
  Loader2,
  Ticket,
} from "lucide-react";

interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  isPublished: boolean;
  _count: {
    registrations: number;
  };
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [myEvents, setMyEvents] = useState<string[]>([]);

  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [showMyEvents, setShowMyEvents] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  async function fetchEvents() {
    try {
      const response = await fetch("http://localhost:3001/events");

      if (!response.ok) {
        throw new Error("Unable to load events.");
      }

      const data: CampusEvent[] = await response.json();
      setEvents(data);
      setError("");
    } catch {
      setError(
        "Could not connect to the campus server. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyEvents(authToken: string) {
    const response = await fetch("http://localhost:3001/events/my", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to load your event registrations.");
    }

    const data = await response.json();

    setMyEvents(
      data.map(
        (registration: { eventId: string }) => registration.eventId
      )
    );
  }

  useEffect(() => {
  fetchEvents();
}, []);

useEffect(() => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    router.replace("/");
  }
}, [router]);

useEffect(() => {
  const savedToken = localStorage.getItem("campusgpt_token");

  if (!savedToken) {
    setToken("");
    setIsLoggedIn(false);
    setMyEvents([]);
    setAuthLoading(false);
    return;
  }

  setToken(savedToken);
  setIsLoggedIn(true);

  fetchMyEvents(savedToken)
    .catch((err) => {
      console.error("Unable to load registered events:", err);
      setError("Unable to load your event registrations.");
    })
    .finally(() => {
      setAuthLoading(false);
    });
}, []);

  async function handleRegistration(eventId: string) {
    if (!token) return;

    const alreadyRegistered = myEvents.includes(eventId);

    setActionId(eventId);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3001/events/${eventId}/register`,
        {
          method: alreadyRegistered ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration update failed.");
      }

      await fetchMyEvents(token);
      await fetchEvents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update registration."
      );
    } finally {
      setActionId("");
    }
  }

  const categories = [
    "ALL",
    "TECHNICAL",
    "CULTURAL",
    "SPORTS",
    "WORKSHOP",
    "SEMINAR",
    "COMPETITION",
    "OTHER",
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        `${event.title} ${event.description} ${event.venue}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "ALL" || event.category === category;

      const matchesMyEvents =
        !showMyEvents || myEvents.includes(event.id);

      return (
        event.isPublished &&
        matchesSearch &&
        matchesCategory &&
        matchesMyEvents
      );
    });
  }, [events, search, category, showMyEvents, myEvents]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

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
            CampusGPT Opportunities
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Events & Opportunities
          </h1>

          <p className="mt-2 text-slate-500">
            Discover campus events, workshops, competitions, and activities.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <Search size={19} className="text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events, venues, or descriptions..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-blue-600 text-white"
                  : "border bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item === "ALL" ? "All Events" : item.replaceAll("_", " ")}
            </button>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setShowMyEvents(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              !showMyEvents
                ? "bg-blue-600 text-white"
                : "border bg-white text-slate-600"
            }`}
          >
            All Events
          </button>

          <button
            onClick={() => setShowMyEvents(true)}
            disabled={!isLoggedIn || authLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              showMyEvents
                ? "bg-blue-600 text-white"
                : "border bg-white text-slate-600"
            } disabled:opacity-50`}
          >
            My Events ({myEvents.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <Loader2 className="animate-spin" size={20} />
            Loading campus events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <CalendarDays className="mx-auto mb-4 text-slate-400" size={36} />
            <h2 className="font-semibold">No events found</h2>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or category filter.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Showing {filteredEvents.length} of {events.length} events
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const registered = myEvents.includes(event.id);
                const seatsLeft =
                  event.capacity === null
                    ? null
                    : Math.max(
                        0,
                        event.capacity - event._count.registrations
                      );

                const full = seatsLeft === 0;

                return (
                  <article
                    key={event.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CalendarDays size={23} />
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {event.category.replaceAll("_", " ")}
                    </span>

                    <Link
                      href={`/events/${event.id}`}
                      className="mt-4 block text-lg font-semibold hover:text-blue-600"
                    >
                      {event.title}
                    </Link>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                      {event.description}
                    </p>

                    <div className="mt-5 space-y-3 border-t pt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-blue-600" />
                        {formatDate(event.startsAt)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 size={16} className="text-blue-600" />
                        {formatTime(event.startsAt)}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-600" />
                        {event.venue}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-600" />
                        {event._count.registrations} registered
                        {seatsLeft !== null && ` • ${seatsLeft} seats left`}
                      </div>
                    </div>

                    {isLoggedIn ? (
                      <button
                        onClick={() => handleRegistration(event.id)}
                        disabled={
                          actionId === event.id || (!registered && full)
                        }
                        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          registered
                            ? "bg-slate-600 hover:bg-slate-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {actionId === event.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Ticket size={16} />
                        )}

                        {actionId === event.id
                          ? "Updating..."
                          : registered
                            ? "Cancel Registration"
                            : full
                              ? "Event Full"
                              : "Register Now"}
                      </button>
                    ) : (
                      <p className="mt-5 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
                        Log in through CampusGPT to register for this event.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-4 border-t pt-6">
          <Link
            href="/clubs"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Explore Clubs →
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
