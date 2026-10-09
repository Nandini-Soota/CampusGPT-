"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:3001";

type CampusEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  isPublished: boolean;
  _count: {
    registrations: number;
  };
};

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

    useEffect(() => {
    const savedToken = localStorage.getItem("campusgpt_token");

    if (!savedToken) {
      router.replace("/");
    }
  }, [router]);

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [registered, setRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("campusgpt_token");

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`${API_URL}/events/${eventId}`);

        if (!response.ok) {
          throw new Error("Unable to load event details.");
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  useEffect(() => {
    async function checkRegistration() {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/events/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        setRegistered(
          data.some(
            (registration: { eventId?: string; event?: { id: string } }) =>
              registration.eventId === eventId ||
              registration.event?.id === eventId
          )
        );
      } catch {
        console.error("Could not check registration status.");
      }
    }

    checkRegistration();
  }, [token, eventId]);

  async function handleRegistration() {
    if (!token) {
      setMessage("Please log in from the Events page to register.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setRegistered(true);
      setEvent((previous) =>
        previous
          ? {
              ...previous,
              _count: {
                registrations: previous._count.registrations + 1,
              },
            }
          : previous
      );

      setMessage("Successfully registered for this event!");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancellation() {
    if (!token) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}/register`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Cancellation failed.");
      }

      setRegistered(false);
      setEvent((previous) =>
        previous
          ? {
              ...previous,
              _count: {
                registrations: Math.max(
                  0,
                  previous._count.registrations - 1
                ),
              },
            }
          : previous
      );

      setMessage("Your registration has been cancelled.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Cancellation failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="mr-3 animate-spin" size={22} />
        Loading event details...
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-xl font-bold">Event unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "This event could not be found."}
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 font-medium text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const seatsLeft =
    event.capacity === null
      ? null
      : Math.max(
          0,
          event.capacity - event._count.registrations
        );

  const full = seatsLeft === 0;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Events
        </Link>

        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white md:p-10">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {event.category.replaceAll("_", " ")}
            </span>

            <h1 className="mt-5 text-3xl font-bold md:text-4xl">
              {event.title}
            </h1>

            <p className="mt-3 text-sm text-blue-100">
              CampusGPT Events & Opportunities
            </p>
          </div>

          <div className="space-y-8 p-6 md:p-10">
            <section>
              <h2 className="text-lg font-bold">About this event</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                {event.description || "No description available."}
              </p>
            </section>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex gap-4 rounded-xl bg-slate-50 p-4">
                <CalendarDays className="shrink-0 text-blue-600" size={22} />
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="mt-1 font-semibold">
                    {formatDate(event.startsAt)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-slate-50 p-4">
                <Clock className="shrink-0 text-blue-600" size={22} />
                <div>
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="mt-1 font-semibold">
                    {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-slate-50 p-4">
                <MapPin className="shrink-0 text-blue-600" size={22} />
                <div>
                  <p className="text-sm text-slate-500">Venue</p>
                  <p className="mt-1 font-semibold">{event.venue}</p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl bg-slate-50 p-4">
                <Users className="shrink-0 text-blue-600" size={22} />
                <div>
                  <p className="text-sm text-slate-500">Registrations</p>
                  <p className="mt-1 font-semibold">
                    {event._count.registrations}
                    {event.capacity !== null
                      ? ` / ${event.capacity}`
                      : " participants"}
                  </p>
                  {seatsLeft !== null && (
                    <p className="mt-1 text-xs text-slate-500">
                      {seatsLeft} seats remaining
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              {message && (
                <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  {message}
                </p>
              )}

              {registered ? (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle2 size={19} />
                    You are registered for this event.
                  </div>

                  <button
                    onClick={handleCancellation}
                    disabled={actionLoading}
                    className="w-full rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 sm:w-auto"
                  >
                    {actionLoading
                      ? "Please wait..."
                      : "Cancel Registration"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegistration}
                  disabled={actionLoading || full}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {actionLoading
                    ? "Please wait..."
                    : full
                      ? "Event Full"
                      : "Register for Event"}
                </button>
              )}

              {!token && (
                <p className="mt-3 text-xs text-slate-500">
                  Login is required to register. You can log in from the Events page.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
