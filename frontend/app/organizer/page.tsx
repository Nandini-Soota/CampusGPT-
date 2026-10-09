"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

const categories = [
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "WORKSHOP",
  "SEMINAR",
  "COMPETITION",
  "OTHER",
];

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
  _count?: {
    registrations: number;
  };
}

export default function OrganizerPage() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "TECHNICAL",
    venue: "",
    startsAt: "",
    endsAt: "",
    capacity: "100",
  });

  useEffect(() => {
  const savedToken = localStorage.getItem("campusgpt_token");

  if (!savedToken) {
    window.location.replace("/");
    return;
  }

  try {
    const payload = JSON.parse(
      atob(
        savedToken
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    const userRole = payload.role;

    if (userRole !== "ADMIN" && userRole !== "CLUB_ADMIN") {
      window.location.replace("/");
      return;
    }

    setToken(savedToken);
    setRole(userRole);
    setAuthorized(true);

    loadEvents(savedToken);
  } catch {
    localStorage.removeItem("campusgpt_token");
    window.location.replace("/");
  }
}, []);

  async function loadEvents(authToken: string) {
    try {
      const response = await fetch(`${API_URL}/events/my`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load your events.");
      }

      const data = await response.json();

      setEvents(
        data.map((registration: any) => registration.event),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? Number(form.capacity) : null,
          endsAt: form.endsAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create event.",
        );
      }

      setMessage(
        "Event created successfully! It is currently saved as a draft.",
      );

      setForm({
        title: "",
        description: "",
        category: "TECHNICAL",
        venue: "",
        startsAt: "",
        endsAt: "",
        capacity: "100",
      });

    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!authorized) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-600">
        Verifying organizer permissions...
      </p>
    </main>
  );
}

return (
  <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            CampusGPT / {role === "ADMIN" ? "Administrator" : "Club Organizer"}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Organizer Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Create and manage campus events and opportunities.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Create Event Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-semibold">
              Create New Event
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Title
                </label>

                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter event name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the event..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Venue
                </label>

                <input
                  required
                  value={form.venue}
                  onChange={(e) =>
                    setForm({ ...form, venue: e.target.value })
                  }
                  placeholder="e.g. Main Auditorium"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start Date and Time
                </label>

                <input
                  required
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End Date and Time
                </label>

                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm({ ...form, endsAt: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Maximum Participants
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !token}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating Event..." : "Create Event"}
              </button>

              <p className="text-xs text-slate-500">
                New events are saved as drafts and are not visible to students yet.
              </p>

            </form>
          </section>

          {/* My Events */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                My Events
              </h2>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {events.length} events
              </span>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading events...</p>
            ) : events.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <p className="font-medium">No registered events found.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Events you register for will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">
                        {event.title}
                      </h3>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                        {event.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {event.category} · {event.venue}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {new Date(event.startsAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </section>

        </div>
      </div>
    </main>
  );
}