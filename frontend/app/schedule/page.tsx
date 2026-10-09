"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Plus,
  X,
} from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type Day = (typeof DAYS)[number];

const SLOTS = [
  {
    startTime: "08:30",
    endTime: "10:00",
    durationHours: 1.5,
  },
  {
    startTime: "10:05",
    endTime: "11:35",
    durationHours: 1.5,
  },
  {
    startTime: "11:40",
    endTime: "13:10",
    durationHours: 1.5,
  },
  {
    startTime: "13:15",
    endTime: "14:45",
    durationHours: 1.5,
  },
  {
    startTime: "14:50",
    endTime: "16:20",
    durationHours: 1.5,
  },
  {
    startTime: "16:25",
    endTime: "17:55",
    durationHours: 1.5,
  },
  {
    startTime: "18:00",
    endTime: "19:30",
    durationHours: 1.5,
  },
] as const;

const SLOT_CODES: Record<Day, Record<string, string>> = {
  Monday: {
    "08:30": "A11",
    "10:05": "B11",
    "11:40": "C11",
    "13:15": "A21",
    "14:50": "A14",
    "16:25": "B21",
    "18:00": "C21",
  },
  Tuesday: {
    "08:30": "D11",
    "10:05": "E11",
    "11:40": "F11",
    "13:15": "D21",
    "14:50": "E14",
    "16:25": "E21",
    "18:00": "F21",
  },
  Wednesday: {
    "08:30": "A12",
    "10:05": "B12",
    "11:40": "C12",
    "13:15": "A22",
    "14:50": "B14",
    "16:25": "B22",
    "18:00": "A24",
  },
  Thursday: {
    "08:30": "D12",
    "10:05": "E12",
    "11:40": "F12",
    "13:15": "D22",
    "14:50": "F14",
    "16:25": "E22",
    "18:00": "F22",
  },
  Friday: {
    "08:30": "A13",
    "10:05": "B13",
    "11:40": "C13",
    "13:15": "A23",
    "14:50": "C14",
    "16:25": "B23",
    "18:00": "B24",
  },
  Saturday: {
    "08:30": "D13",
    "10:05": "E13",
    "11:40": "F13",
    "13:15": "D23",
    "14:50": "D14",
    "16:25": "D24",
    "18:00": "E23",
  },
} as const;

type ScheduleCell = {
  courseName: string;
  courseCode: string;
  room: string;
  instructor: string;
};

type ScheduleData = Record<
  Day,
  Record<string, ScheduleCell>
>;

const emptySchedule = (): ScheduleData => ({
  Monday: {},
  Tuesday: {},
  Wednesday: {},
  Thursday: {},
  Friday: {},
  Saturday: {},
});

export default function SchedulePage() {
  const router = useRouter();

  const [schedule, setSchedule] = useState<ScheduleData>(emptySchedule());

  useEffect(() => {
    const token = localStorage.getItem("campusgpt_token");

    if (!token) {
      router.replace("/");
    }
  }, [router]);

    useEffect(() => {
    async function loadSchedule() {
      try {
        const token = localStorage.getItem("campusgpt_token");

        if (!token) {
          return;
        }

        const response = await fetch(
          "http://localhost:3001/schedule",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load schedule.");
        }

        const savedSchedule = await response.json();

        const loadedSchedule = emptySchedule();

        savedSchedule.forEach((entry: any) => {
          if (
            loadedSchedule[entry.day as Day] &&
            entry.startTime
          ) {
            loadedSchedule[entry.day as Day][entry.startTime] = {
              courseName: entry.courseName,
              courseCode: entry.courseCode || "",
              room: entry.room || "",
              instructor: entry.instructor || "",
            };
          }
        });

        setSchedule(loadedSchedule);
      } catch (error) {
        console.error("Error loading schedule:", error);
      }
    }

    loadSchedule();
  }, []);
  async function saveTimetable() {
  try {
    const token = localStorage.getItem("campusgpt_token");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    const timetableEntries = Object.entries(schedule).flatMap(
      ([day, daySchedule]) =>
        Object.entries(daySchedule).map(([startTime, classInfo]) => {
          const slot = SLOTS.find(
            (item) => item.startTime === startTime
          );

          if (!slot || !classInfo) {
            return null;
          }

          return {
            courseName: classInfo.courseName,
            courseCode: classInfo.courseCode || null,
            day,
            slotCode: SLOT_CODES[day as Day][startTime],
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: classInfo.room || null,
            instructor: classInfo.instructor || null,
          };
        })
    ).filter(Boolean);

    const response = await fetch(
      "http://localhost:3001/schedule/save",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(timetableEntries),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save timetable.");
    }

    const savedSchedule = await response.json();

    console.log("Saved timetable:", savedSchedule);

    alert("✓ Timetable saved successfully");
  } catch (error) {
    console.error("Error saving timetable:", error);
    alert("Unable to save timetable.");
  }
}

  const [selectedCell, setSelectedCell] = useState<{
    day: Day;
    startTime: string;
  } | null>(null);

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [room, setRoom] = useState("");
  const [instructor, setInstructor] = useState("");

  function openCell(day: Day, startTime: string) {
    const existing = schedule[day][startTime];

    setSelectedCell({
      day,
      startTime,
    });

    setCourseName(existing?.courseName || "");
    setCourseCode(existing?.courseCode || "");
    setRoom(existing?.room || "");
    setInstructor(existing?.instructor || "");
  }

  function closeModal() {
    setSelectedCell(null);
    setCourseName("");
    setCourseCode("");
    setRoom("");
    setInstructor("");
  }

function saveClass() {
  if (
    !selectedCell ||
    !courseName.trim() ||
    !courseCode.trim() ||
    !room.trim() ||
    !instructor.trim()
  ) {
    return;
  }

  const { day, startTime } = selectedCell;

  setSchedule((current) => ({
    ...current,
    [day]: {
      ...current[day],
      [startTime]: {
        courseName: courseName.trim(),
        courseCode: courseCode.trim(),
        room: room.trim(),
        instructor: instructor.trim(),
      },
    },
  }));

  closeModal();
}

  function removeClass(day: Day, startTime: string) {
    setSchedule((current) => {
      const updatedDay = { ...current[day] };

      delete updatedDay[startTime];

      return {
        ...current,
        [day]: updatedDay,
      };
    });
  }

  const totalClasses = Object.values(schedule).reduce(
    (total, day) => total + Object.keys(day).length,
    0,
  );

  const totalHours = totalClasses * 1.5;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1500px] px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <CalendarDays size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  My Weekly Schedule
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Build your weekly class timetable for CampusGPT.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="font-semibold">
              Weekly Timetable
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Click any time slot to add or edit a class.
            </p>
          </div>

          <div className="overflow-x-auto p-4">
            <div
              className="grid min-w-[1200px]"
              style={{
                gridTemplateColumns:
                  "110px repeat(7, minmax(145px, 1fr))",
              }}
            >
              {/* Empty corner */}
              <div className="border-b border-r bg-slate-50 p-3" />

              {/* Time headers */}
              {SLOTS.map((slot) => (
                <div
                  key={slot.startTime}
                  className="border-b border-r bg-slate-50 p-3 text-center"
                >
                  <p className="text-sm font-semibold">
                    {slot.startTime}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {slot.endTime}
                  </p>
                </div>
              ))}

              {/* Days */}
              {DAYS.map((day) => (
                <div key={day} className="contents">
                  <div className="flex items-center border-b border-r bg-slate-50 p-3">
                    <span className="text-sm font-semibold">
                      {day}
                    </span>
                  </div>

                  {SLOTS.map((slot) => {
                    const entry =
                      schedule[day][slot.startTime];

                    const slotCode =
                      SLOT_CODES[day][slot.startTime];

                    return (
                      <div
                        key={`${day}-${slot.startTime}`}
                        className="min-h-[125px] border-b border-r p-2"
                      >
                        {entry ? (
                          <div
                            className="group relative h-full cursor-pointer rounded-xl border border-blue-200 bg-blue-50 p-3 transition hover:border-blue-400 hover:bg-blue-100"
                            onClick={() =>
                              openCell(day, slot.startTime)
                            }
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeClass(
                                  day,
                                  slot.startTime,
                                );
                              }}
                              className="absolute right-2 top-2 hidden rounded-md p-1 text-slate-400 hover:bg-white hover:text-red-500 group-hover:block"
                              title="Remove class"
                            >
                              <X size={14} />
                            </button>

                            <p className="pr-5 text-sm font-semibold text-blue-900">
                              {entry.courseName}
                            </p>

                            {entry.courseCode && (
                              <p className="mt-1 text-xs font-medium text-blue-700">
                                {entry.courseCode}
                              </p>
                            )}

                            {entry.room && (
                              <p className="mt-2 text-xs text-slate-600">
                                {entry.room}
                              </p>
                            )}

                            {entry.instructor && (
                              <p className="mt-1 text-xs text-slate-500">
                                {entry.instructor}
                              </p>
                            )}

                            <div className="mt-3 inline-flex rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                              {slotCode}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openCell(day, slot.startTime)
                            }
                            className="flex h-full min-h-[105px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Plus size={20} />

                            <span className="mt-2 text-xs font-medium">
                              Add class
                            </span>

                            <span className="mt-1 text-[10px]">
                              {slotCode}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Save Timetable */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={saveTimetable}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            💾 Save Timetable
          </button>
        </div>

        {/* Summary */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Classes per week
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalClasses}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Weekly class hours
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalHours}
            </p>
          </div>
        </section>

        {/* Information */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">
            How your schedule works
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                1
              </div>

              <h3 className="text-sm font-semibold">
                Select a slot
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Click an empty timetable cell for the class
                you want to add.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                2
              </div>

              <h3 className="text-sm font-semibold">
                Enter course details
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Add the course name, code, room and instructor.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                3
              </div>

              <h3 className="text-sm font-semibold">
                CampusGPT uses it
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your weekly schedule will later power
                attendance calculations and predictions.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Add/Edit Class Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="font-semibold">
                  Add Class
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCell.day} ·{" "}
                  {selectedCell.startTime}–{" "}
                  {
                    SLOTS.find(
                      (slot) =>
                        slot.startTime ===
                        selectedCell.startTime,
                    )?.endTime
                  }
                </p>

                <p className="mt-1 text-xs font-semibold text-blue-600">
                  Slot Code:{" "}
                  {
                    SLOT_CODES[selectedCell.day][
                      selectedCell.startTime
                    ]
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">

              <div>
                <label className="text-sm font-medium">
                  Course Name *
                </label>

                <input
                  value={courseName}
                  onChange={(event) =>
                    setCourseName(event.target.value)
                  }
                  placeholder="e.g. Data Structures and Algorithms"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Course Code *
                </label>

                <input
                  value={courseCode}
                  onChange={(event) =>
                    setCourseCode(event.target.value)
                  }
                  placeholder="e.g. CSE2001"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Room *
                </label>

                <input
                  value={room}
                  onChange={(event) =>
                    setRoom(event.target.value)
                  }
                  placeholder="e.g. AB-413"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Instructor *
                </label>

                <input
                  value={instructor}
                  onChange={(event) =>
                    setInstructor(event.target.value)
                  }
                  placeholder="e.g. Dr. Sharma"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t p-6">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveClass}
                disabled={
  !courseName.trim() ||
  !courseCode.trim() ||
  !room.trim() ||
  !instructor.trim()
}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Class
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}