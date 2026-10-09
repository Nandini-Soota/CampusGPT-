"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Home,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Users,
  ShieldCheck,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  eventDate: string;
  notifyBefore: number;
  notificationAt: string;
  isCompleted: boolean;
}

interface CalendarNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  scheduledAt: string;
  sentAt?: string | null;
}

export default function HomePage() {
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [followedClubs, setFollowedClubs] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [overallAttendance, setOverallAttendance] = useState<number | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<
  CalendarEvent[]
>([]);
  const [calendarMonth, setCalendarMonth] = useState(
  new Date()
);
const [showReminderForm, setShowReminderForm] =
  useState(false);
const [reminderTitle, setReminderTitle] = useState("");
const [reminderDescription, setReminderDescription] =
  useState("");
const [reminderType, setReminderType] =
  useState("ASSIGNMENT");
const [reminderDate, setReminderDate] = useState("");
const [reminderNotifyBefore, setReminderNotifyBefore] =
  useState(60);
const [reminderSaving, setReminderSaving] =
  useState(false);
const [notifications, setNotifications] = useState<
  CalendarNotification[]
>([]);
const unreadNotifications = notifications.filter(
  (notification) => !notification.isRead
).length;
const [showNotifications, setShowNotifications] =
  useState(false);

  function handleLogout() {
  localStorage.removeItem("campusgpt_token");
  window.location.replace("/");
}

  useEffect(() => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    window.location.replace("/");
    return;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.role) {
      localStorage.removeItem("campusgpt_token");
      window.location.replace("/");
      return;
    }

    setRole(payload.role);
    setUserEmail(payload.email || "");
  } catch {
    localStorage.removeItem("campusgpt_token");
    window.location.replace("/");
    return;
  }

  setAuthChecking(false);
}, []);

useEffect(() => {
  async function fetchEvents() {
    try {
      const response = await fetch("http://localhost:3001/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);

    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setEventsLoading(false);
    }
  }

  fetchEvents();
}, []);

useEffect(() => {
  async function fetchSchedule() {
    try {
      const token = localStorage.getItem("campusgpt_token");

      if (!token) {
        return;
      }

      const response = await fetch("http://localhost:3001/schedule", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const data = await response.json();
      console.log("Dashboard schedule:", data);
      setSchedule(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setScheduleLoading(false);
    }
  }

  fetchSchedule();
}, []);

useEffect(() => {
  async function fetchFollowedClubs() {
    try {
      const token = localStorage.getItem("campusgpt_token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:3001/clubs/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch followed clubs");
      }

      const data = await response.json();

      console.log("Dashboard followed clubs:", data);
      setFollowedClubs(data);
    } catch (error) {
      console.error("Error fetching followed clubs:", error);
    }
  }

  fetchFollowedClubs();
}, []);

useEffect(() => {
  async function fetchAttendance() {
    try {
      const token = localStorage.getItem("campusgpt_token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:3001/attendance/current",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await response.json();

      const conducted = data.reduce(
        (total: number, subject: any) =>
          total + subject.classesConducted,
        0
      );

      const attended = data.reduce(
        (total: number, subject: any) =>
          total + subject.classesAttended,
        0
      );

      const overall =
        conducted === 0
          ? 0
          : Number(((attended / conducted) * 100).toFixed(2));

      setOverallAttendance(overall);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }

  fetchAttendance();
}, []);

useEffect(() => {
  async function fetchCalendarEvents() {
    try {
      const token = localStorage.getItem("campusgpt_token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:3001/calendar",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch calendar events"
        );
      }

      const data = await response.json();

      setCalendarEvents(data);
    } catch (error) {
      console.error(
        "Error fetching calendar events:",
        error
      );
    }
  }

  fetchCalendarEvents();
}, []);

useEffect(() => {
  async function fetchNotifications() {
    try {
      const token =
        localStorage.getItem("campusgpt_token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:3001/calendar/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch notifications"
        );
      }

      const data = await response.json();

      setNotifications(data);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );
    }
  }

  fetchNotifications();
}, []);

if (authChecking) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      Checking your CampusGPT session...
    </div>
  );
}

const todayName = new Date().toLocaleDateString("en-US", {
  weekday: "long",
});

const todayClasses = schedule.filter(
  (item) => item.day === todayName
);

const currentTime = new Date().toTimeString().slice(0, 5);

const remainingClasses = todayClasses.filter(
  (item) => item.startTime > currentTime
).length;

function getDaysInMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
}

function getFirstDayOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getDay();
}

function hasEventOnDate(day: number) {
  return calendarEvents.some((event) => {
    const eventDate = new Date(event.eventDate);

    return (
      eventDate.getFullYear() ===
        calendarMonth.getFullYear() &&
      eventDate.getMonth() ===
        calendarMonth.getMonth() &&
      eventDate.getDate() === day
    );
  });
}

async function handleSaveReminder() {
  if (!reminderTitle.trim()) {
    alert("Please enter a reminder title.");
    return;
  }

  if (!reminderDate) {
    alert("Please select a date and time.");
    return;
  }

  try {
    setReminderSaving(true);

    const token = localStorage.getItem("campusgpt_token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    const response = await fetch(
      "http://localhost:3001/calendar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: reminderTitle,
          description: reminderDescription,
          type: reminderType,
          eventDate: reminderDate,
          notifyBefore: reminderNotifyBefore,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create reminder");
    }

    const newEvent = await response.json();

    setCalendarEvents((currentEvents) => [
      ...currentEvents,
      newEvent,
    ]);

    setReminderTitle("");
    setReminderDescription("");
    setReminderType("ASSIGNMENT");
    setReminderDate("");
    setReminderNotifyBefore(60);

    setShowReminderForm(false);
  } catch (error) {
    console.error("Error creating reminder:", error);
    alert("Failed to create reminder.");
  } finally {
    setReminderSaving(false);
  }
}

async function handleMarkNotificationRead(
  notificationId: string
) {
  try {
    const token =
      localStorage.getItem("campusgpt_token");

    if (!token) {
      return;
    }

    const response = await fetch(
      `http://localhost:3001/calendar/notifications/${notificationId}/read`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to mark notification as read"
      );
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );
  } catch (error) {
    console.error(
      "Error marking notification as read:",
      error
    );
  }
}

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-white md:flex md:flex-col">
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <GraduationCap size={21} />
            </div>

            <div>
              <h1 className="font-bold">CampusGPT</h1>
              <p className="text-xs text-slate-500">Smart Campus</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <SidebarItem icon={<Home size={18} />} label="Dashboard" active />
            <SidebarItem icon={<Sparkles size={18} />} label="CampusGPT AI" />
            <Link href="/events" className="block">
           <SidebarItem
            icon={<CalendarDays size={18} />}
            label="Events"
           />
          </Link>
            <Link href="/schedule" className="block">
  <SidebarItem
    icon={<Clock3 size={18} />}
    label="My Schedule"
  />
</Link>
            <Link href="/attendance" className="block">
  <SidebarItem
    icon={<CheckCircle2 size={18} />}
    label="Attendance"
  />
</Link>
            <Link href="/clubs" className="block">
          <SidebarItem
            icon={<Users size={18} />}
            label="Clubs & Communities"
           />
         </Link>

        {(role === "CLUB_ADMIN" || role === "ADMIN") && (
         <Link href="/organizer" className="block">
           <SidebarItem
             icon={<CalendarDays size={18} />}
             label="Organizer Dashboard"
            />
         </Link>
        )}

{role === "ADMIN" && (
  <Link href="/organizer" className="block">
    <SidebarItem
      icon={<ShieldCheck size={18} />}
      label="Admin Event Management"
    />
  </Link>
)}

<SidebarItem icon={<Bell size={18} />} label="Announcements" />
          </nav>

          <div className="border-t p-4">
            <SidebarItem icon={<Settings size={18} />} label="Settings" />
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">

          {/* Top bar */}
          <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
              <h2 className="font-semibold">Welcome to CampusGPT 👋</h2>

              <p className="text-xs text-slate-500">
                {userEmail || "Logged-in user"} • {role.replaceAll("_", " ")}
             </p>
           </div>

            <div className="flex items-center gap-3">
              <button className="rounded-lg border p-2 hover:bg-slate-50">
                <Search size={18} />
              </button>

<div className="relative">
  <button
    type="button"
    onClick={() =>
      setShowNotifications((current) => !current)
    }
    className="relative rounded-lg border p-2 hover:bg-slate-50"
    title="Notifications"
  >
    <Bell size={18} />

    {unreadNotifications > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
        {unreadNotifications > 9
          ? "9+"
          : unreadNotifications}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-white shadow-lg">
      <div className="border-b p-4">
        <h3 className="font-semibold">
          Notifications
        </h3>

        <p className="text-xs text-slate-500">
          Your upcoming reminders
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-5 text-center text-sm text-slate-500">
            No notifications.
          </div>
        ) : (
          notifications.map((notification) => (
<div
  key={notification.id}
  onClick={() =>
    handleMarkNotificationRead(notification.id)
  }
  className={`cursor-pointer border-b p-4 last:border-b-0 hover:bg-slate-50 ${
    !notification.isRead
      ? "bg-blue-50/40"
      : ""
  }`}
>
              <p className="text-sm font-medium">
                {notification.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {notification.message}
              </p>

              <p className="mt-2 text-[11px] text-slate-400">
                {new Date(
                  notification.scheduledAt
                ).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>

              <button
                onClick={handleLogout}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="space-y-6 p-6">

            {/* AI Assistant */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/15 p-3">
                  <Sparkles size={25} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-100">
                    CAMPUSGPT AI ASSISTANT
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    How can I help you today?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm text-blue-100">
                    Ask about your schedule, attendance, events, clubs,
                    campus services, or university information.
                  </p>

                  <div className="mt-5 flex max-w-2xl items-center rounded-xl bg-white p-2">
                    <MessageCircle
                      size={19}
                      className="ml-2 text-slate-400"
                    />

                    <input
                      placeholder="Ask CampusGPT anything..."
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                    />

                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                      Ask
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

<StatCard
  title="Attendance"
  value={
    overallAttendance === null
      ? "..."
      : `${overallAttendance}%`
  }
  subtitle="Overall attendance"
  icon={<CheckCircle2 size={20} />}
/>

<StatCard
  title="Today's Classes"
  value={String(todayClasses.length)}
  subtitle={`${remainingClasses} classes remaining`}
  icon={<Clock3 size={20} />}
/>

<StatCard
  title="Upcoming Events"
  value={String(events.length)}
  subtitle="Available events"
  icon={<CalendarDays size={20} />}
/>

<StatCard
  title="Clubs Followed"
  value={String(followedClubs.length)}
  subtitle="Clubs you're following"
  icon={<Users size={20} />}
/>

            </section>

            {/* Two-column section */}
            <section className="grid gap-6 lg:grid-cols-2">

              {/* Schedule */}
              <DashboardCard
  title="Today's Schedule"
  subtitle={new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}
>
  {scheduleLoading ? (
    <div className="p-4 text-sm text-slate-500">
      Loading today's schedule...
    </div>
  ) : (() => {
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });

      const todaySchedule = schedule
        .filter((item) => item.day === today)
        .sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

      if (todaySchedule.length === 0) {
        return (
          <div className="p-4 text-sm text-slate-500">
            No classes scheduled for today.
          </div>
        );
      }

      return todaySchedule.map((item) => (
        <ScheduleItem
          key={item.id}
          time={`${item.startTime} - ${item.endTime}`}
          title={item.courseName}
          room={`${item.room || "Room not specified"} • ${item.slotCode}`}
        />
      ));
    })()}
  
  <div className="border-t p-4">
    <Link
      href="/schedule"
      className="flex items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
    >
      View Full Schedule
      <ChevronRight size={16} />
    </Link>
  </div>
</DashboardCard>

              {/* Events */}
              <DashboardCard
                title="Recommended Events"
                subtitle="Based on your interests"
              >
                {eventsLoading ? (
  <div className="p-4 text-sm text-slate-500">
    Loading events...
  </div>
) : events.length > 0 ? (
  events.slice(0, 3).map((event) => (
    <EventItem
  key={event.id}
  id={event.id}
  title={event.title}
  date={new Date(event.startsAt).toLocaleDateString()}
  location={event.venue}
/>
  ))
) : (
  <div className="p-4 text-sm text-slate-500">
    No upcoming events.
  </div>
)}
              </DashboardCard>

            </section>

{/* Personal Calendar & Reminders */}
<section className="mt-6 rounded-2xl border bg-white shadow-sm">
  <div className="flex items-center justify-between border-b p-5">
    <div>
      <h2 className="font-semibold">
        Personal Calendar & Reminders
      </h2>
      <p className="text-sm text-slate-500">
        Keep track of assignments, deadlines, and important tasks
      </p>
    </div>

    <button
      onClick={() => setShowReminderForm(true)}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      + Add Reminder
    </button>
  </div>

  {showReminderForm && (
  <div className="border-b bg-slate-50 p-5">
    <div className="mx-auto max-w-2xl rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold">
          Add Reminder
        </h3>

        <p className="text-sm text-slate-500">
          Create a reminder for an assignment, exam, or important task.
        </p>
      </div>

      <div className="space-y-4">

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Title
          </label>

          <input
            type="text"
            value={reminderTitle}
            onChange={(e) =>
              setReminderTitle(e.target.value)
            }
            placeholder="e.g. DBMS Assignment Submission"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Description
          </label>

          <textarea
            value={reminderDescription}
            onChange={(e) =>
              setReminderDescription(e.target.value)
            }
            placeholder="Optional description"
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Type
          </label>

          <select
            value={reminderType}
            onChange={(e) =>
              setReminderType(e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="ASSIGNMENT">
              Assignment
            </option>

            <option value="EXAM">
              Exam
            </option>

            <option value="PROJECT">
              Project
            </option>

            <option value="PERSONAL">
              Personal
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>
        </div>

        {/* Date and time */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Date & Time
          </label>

          <input
            type="datetime-local"
            value={reminderDate}
            onChange={(e) =>
              setReminderDate(e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Notification time */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Notify me
          </label>

          <select
            value={reminderNotifyBefore}
            onChange={(e) =>
              setReminderNotifyBefore(
                Number(e.target.value)
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value={5}>5 minutes before</option>
            <option value={10}>10 minutes before</option>
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={60}>1 hour before</option>
            <option value={120}>2 hours before</option>
            <option value={1440}>1 day before</option>
            <option value={2880}>2 days before</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            onClick={() => setShowReminderForm(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveReminder}
            disabled={reminderSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reminderSaving
              ? "Saving..."
              : "Save Reminder"}
          </button>

        </div>
      </div>
    </div>
  </div>
)}

  <div className="grid gap-6 p-5 lg:grid-cols-2">

    {/* Calendar */}
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() =>
            setCalendarMonth(
              new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() - 1,
                1
              )
            )
          }
          className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50"
        >
          ←
        </button>

        <h3 className="font-semibold">
          {calendarMonth.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          onClick={() =>
            setCalendarMonth(
              new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() + 1,
                1
              )
            )
          }
          className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day) => (
            <div key={day} className="p-2">
              {day}
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({
          length: getFirstDayOfMonth(calendarMonth),
        }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({
          length: getDaysInMonth(calendarMonth),
        }).map((_, index) => {
          const day = index + 1;
          const hasEvent = hasEventOnDate(day);

          return (
            <div
              key={day}
              className={`relative flex h-10 items-center justify-center rounded-lg text-sm ${
                hasEvent
                  ? "bg-blue-100 font-semibold text-blue-700"
                  : "hover:bg-slate-100"
              }`}
            >
              {day}

              {hasEvent && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Upcoming reminders */}
    <div>
      <h3 className="mb-3 font-semibold">
        Upcoming Reminders
      </h3>

      {calendarEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
          No reminders added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {calendarEvents
            .filter(
              (event) =>
                !event.isCompleted &&
                new Date(event.eventDate) >= new Date()
            )
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {event.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(
                        event.eventDate
                      ).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {event.type}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Notify {event.notifyBefore} minutes before
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  </div>
</section>

            {/* Announcements */}
            <section className="rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="font-semibold">Important Announcements</h2>
                  <p className="text-sm text-slate-500">
                    Recent updates from your campus
                  </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  View all
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="divide-y">
                <Announcement
                  title="Mid-semester examination schedule released"
                  category="Academic"
                />

                <Announcement
                  title="Last date for course registration extended"
                  category="Important"
                />

                <Announcement
                  title="Inter-college hackathon registrations are open"
                  category="Events"
                />
              </div>
            </section>

          </div>
        </section>
      </div>
    </main>
  );
}


/* Sidebar item */

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* Statistics card */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}


/* Dashboard card */

function DashboardCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="divide-y">{children}</div>
    </div>
  );
}


/* Schedule item */

function ScheduleItem({
  time,
  title,
  room,
}: {
  time: string;
  title: string;
  room: string;
}) {
  return (
    <div className="flex gap-4 p-4">
      <div className="w-20 text-xs font-medium text-slate-500">
        {time}
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{room}</p>
      </div>
    </div>
  );
}


/* Event item */

function EventItem({
  id,
  title,
  date,
  location,
}: {
  id: string;
  title: string;
  date: string;
  location: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs text-slate-500">
          {date} • {location}
        </p>
      </div>

      <Link
        href={`/events/${id}`}
        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
      >
        View
      </Link>
    </div>
  );
}

/* Announcement */

function Announcement({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{category}</p>
      </div>

      <ChevronRight size={18} className="text-slate-400" />
    </div>
  );
}