"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AttendanceSubject {
  courseName: string;
  classesConducted: number;
  classesAttended: number;
  classesMissed: number;
  attendancePercentage: number;
  eligible: boolean;
}

interface AttendancePrediction {
  courseName: string;
  current: {
    classesConducted: number;
    classesAttended: number;
    attendancePercentage: number;
  };
  prediction: {
    futureClasses: number;
    classesToAttend: number;
    classesCanMiss: number;
    futureClassesMissed: number;
    futureAttendancePercentage: number;
    predictedClassesConducted: number;
    predictedClassesAttended: number;
    predictedOverallAttendancePercentage: number;
  };
  eligibility: {
    currentlyEligible: boolean;
    predictedEligible: boolean;
    classesNeededFor75: number;
  };
}

interface DateWiseClass {
  date: string;
  day: string;
  scheduleEntryId: string;
  courseName: string;
  courseCode: string | null;
  slotCode: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceSubject[]>([]);
  const [predictions, setPredictions] = useState<
  Record<string, AttendancePrediction>
>({});
  const [classesToAttend, setClassesToAttend] = useState<
  Record<string, number>
>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateWise, setDateWise] = useState<DateWiseClass[]>([]);
  const [dateWiseLoading, setDateWiseLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2026-10-06");
  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 9, 1)
  );
  const [semesterStartDate, setSemesterStartDate] = useState("");
  const [lastInstructionDate, setLastInstructionDate] = useState("");
  const [semesterLoading, setSemesterLoading] = useState(true);
  const [semesterSaving, setSemesterSaving] = useState(false);
  const [semesterMessage, setSemesterMessage] = useState("");

  useEffect(() => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    router.replace("/");
  }
}, [router]);

  useEffect(() => {
    const token = localStorage.getItem("campusgpt_token");

    if (!token) {
      setError("Please log in to view attendance.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:3001/attendance/current", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load attendance.");
        }

        return response.json();
      })
      .then((data) => {
        setAttendance(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load attendance.");
        setLoading(false);
      });
  }, []);

useEffect(() => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token || attendance.length === 0) {
    return;
  }

  const loadPredictions = async () => {
    try {
      const predictionResults: Record<
        string,
        AttendancePrediction
      > = {};

      for (const subject of attendance) {
  setClassesToAttend((previous) => ({
    ...previous,
    [subject.courseName]: 0,
  }));

  const response = await fetch(
          `http://localhost:3001/attendance/predict?courseName=${encodeURIComponent(
            subject.courseName
          )}&classesToAttend=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          continue;
        }

        const data: AttendancePrediction =
          await response.json();

        predictionResults[subject.courseName] = data;
      }

      setPredictions(predictionResults);
    } catch (error) {
      console.error(
        "Failed to load attendance predictions:",
        error
      );
    }
  };

  loadPredictions();
}, [attendance]);

const loadPrediction = async (
  courseName: string,
  numberOfClassesToAttend: number
) => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/attendance/predict?courseName=${encodeURIComponent(
        courseName
      )}&classesToAttend=${numberOfClassesToAttend}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load prediction."
      );
    }

    setPredictions((previous) => ({
      ...previous,
      [courseName]: data,
    }));
  } catch (error) {
    console.error(
      `Failed to load prediction for ${courseName}:`,
      error
    );
  }
};

useEffect(() => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    setDateWiseLoading(false);
    return;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const lastDay = new Date(year, month + 1, 0).getDate();

  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  setDateWiseLoading(true);

  fetch(
    `http://localhost:3001/attendance/date-wise?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          "Failed to load date-wise attendance."
        );
      }

      return response.json();
    })
    .then((data) => {
      setDateWise(data);
      setDateWiseLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setDateWiseLoading(false);
    });
}, [currentMonth]);

useEffect(() => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    return;
  }

  fetch("http://localhost:3001/semester", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load semester settings.");
      }

      return res.json();
    })
    .then((data) => {
      if (data.semesterStartDate) {
        setSemesterStartDate(
          data.semesterStartDate.split("T")[0]
        );
      }

      if (data.lastInstructionDate) {
        setLastInstructionDate(
          data.lastInstructionDate.split("T")[0]
        );
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSemesterLoading(false);
    });
}, []);

const handleSaveSemester = async () => {
  if (!semesterStartDate || !lastInstructionDate) {
    setSemesterMessage(
      "Please enter both semester dates."
    );
    return;
  }

  if (semesterStartDate > lastInstructionDate) {
    setSemesterMessage(
      "Semester start date must be before the last instruction date."
    );
    return;
  }

  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    return;
  }

  setSemesterSaving(true);
  setSemesterMessage("");

  try {
    const response = await fetch(
      "http://localhost:3001/semester/save",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          semesterStartDate,
          lastInstructionDate,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to save semester dates."
      );
    }

    setSemesterMessage("Semester dates saved successfully.");
  } catch (err) {
    setSemesterMessage(
      err instanceof Error
        ? err.message
        : "Failed to save semester dates."
    );
  } finally {
    setSemesterSaving(false);
  }
};

const [markingAttendanceId, setMarkingAttendanceId] =
  useState<string | null>(null);

const getTodayKey = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
};

const markAttendance = async (
  classItem: DateWiseClass,
  status: "PRESENT" | "ABSENT"
) => {
  const token = localStorage.getItem("campusgpt_token");

  if (!token) {
    return;
  }

  setMarkingAttendanceId(classItem.scheduleEntryId);

  try {
    const response = await fetch(
      "http://localhost:3001/attendance/mark",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleEntryId:
            classItem.scheduleEntryId,
          date: classItem.date,
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to mark attendance."
      );
    }

    setDateWise((previous) =>
      previous.map((item) =>
        item.scheduleEntryId ===
          classItem.scheduleEntryId &&
        item.date === classItem.date
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    const attendanceResponse = await fetch(
      "http://localhost:3001/attendance/current",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (attendanceResponse.ok) {
      const attendanceData =
        await attendanceResponse.json();

      setAttendance(attendanceData);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setMarkingAttendanceId(null);
  }
};

const calendarYear = currentMonth.getFullYear();
const calendarMonth = currentMonth.getMonth();

const daysInMonth = new Date(
  calendarYear,
  calendarMonth + 1,
  0
).getDate();

const monthName = currentMonth.toLocaleDateString(
  "en-US",
  {
    month: "long",
    year: "numeric",
  }
);

const isWithinSemester = (dateKey: string) => {
  if (
    !semesterStartDate ||
    !lastInstructionDate
  ) {
    return false;
  }

  return (
    dateKey >= semesterStartDate &&
    dateKey <= lastInstructionDate
  );
};

const visibleCalendarDays = Array.from(
  { length: daysInMonth },
  (_, index) => index + 1
).filter((day) => {
  const date = new Date(
    calendarYear,
    calendarMonth,
    day
  );

  // Sunday is not part of the college timetable.
  return date.getDay() !== 0;
});

const firstVisibleDate = visibleCalendarDays[0];

const firstVisibleDay = new Date(
  calendarYear,
  calendarMonth,
  firstVisibleDate
).getDay();

const calendarOffset =
  firstVisibleDay === 0
    ? 0
    : firstVisibleDay - 1;

const calendarCells = [
  ...Array(calendarOffset).fill(null),
  ...visibleCalendarDays,
];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-2xl font-bold">
          Attendance
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your subject-wise attendance and attendance predictions.
        </p>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-gray-900">
      Semester Settings
    </h2>
    <p className="text-sm text-gray-500">
      Set the period in which your weekly timetable applies.
    </p>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <label
        htmlFor="semesterStartDate"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Semester Start Date
      </label>

      <input
        id="semesterStartDate"
        type="date"
        value={semesterStartDate}
        onChange={(e) =>
          setSemesterStartDate(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        disabled={semesterLoading || semesterSaving}
      />
    </div>

    <div>
      <label
        htmlFor="lastInstructionDate"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Last Instruction Date
      </label>

      <input
        id="lastInstructionDate"
        type="date"
        value={lastInstructionDate}
        onChange={(e) =>
          setLastInstructionDate(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        disabled={semesterLoading || semesterSaving}
      />
    </div>
  </div>

  <div className="mt-4 flex items-center gap-4">
    <button
      type="button"
      onClick={handleSaveSemester}
      disabled={semesterLoading || semesterSaving}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {semesterSaving ? "Saving..." : "Save Semester Dates"}
    </button>

    {semesterMessage && (
      <p className="text-sm text-gray-600">
        {semesterMessage}
      </p>
    )}
  </div>
</div>

        {loading && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading attendance...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-red-500">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && attendance.length === 0 && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              No attendance records found.
            </p>
          </div>
        )}

        {!loading && !error && attendance.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {attendance.map((subject) => (
              <div
                key={subject.courseName}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {subject.courseName}
                  </h2>

<span
  className={`rounded-full px-3 py-1 text-xs font-medium ${
    subject.classesConducted === 0
      ? "bg-slate-100 text-slate-600"
      : subject.eligible
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {subject.classesConducted === 0
    ? "No attendance yet"
    : subject.eligible
    ? "Eligible"
    : "Below 75%"}
</span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
  {/* LEFT: CURRENT ATTENDANCE */}
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Current Attendance
    </p>

    <div className="mt-2">
      <p className="text-3xl font-bold text-slate-900">
        {subject.attendancePercentage}%
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Overall attendance
      </p>
    </div>

    <div className="mt-5 grid grid-cols-3 gap-2">
      <div className="rounded-lg bg-white p-3 text-center">
        <p className="text-lg font-semibold text-slate-800">
          {subject.classesConducted}
        </p>

        <p className="text-xs text-slate-500">
          Conducted
        </p>
      </div>

      <div className="rounded-lg bg-white p-3 text-center">
        <p className="text-lg font-semibold text-green-600">
          {subject.classesAttended}
        </p>

        <p className="text-xs text-slate-500">
          Attended
        </p>
      </div>

      <div className="rounded-lg bg-white p-3 text-center">
        <p className="text-lg font-semibold text-red-600">
          {subject.classesMissed}
        </p>

        <p className="text-xs text-slate-500">
          Missed
        </p>
      </div>
    </div>
  </div>

  {/* RIGHT: ATTENDANCE PREDICTION */}
  {predictions[subject.courseName] && (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Attendance Prediction
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {predictions[subject.courseName].prediction.futureClasses}{" "}
            future class
            {predictions[subject.courseName].prediction.futureClasses !== 1
              ? "es"
              : ""}{" "}
            remaining
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            predictions[subject.courseName].eligibility
              .predictedEligible
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {predictions[subject.courseName].eligibility
            .predictedEligible
            ? "Eligible"
            : "Below 75%"}
        </span>
      </div>

      {/* Classes you can miss */}
      <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-blue-100">
        <p className="text-xs text-slate-500">
          Classes you can miss
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-blue-600">
            {
              predictions[subject.courseName].prediction
                .classesCanMiss
            }
          </p>

          <p className="text-xs text-slate-500">
            class
            {predictions[subject.courseName].prediction
              .classesCanMiss !== 1
              ? "es"
              : ""}
          </p>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          You can miss this many and still maintain at least 75%.
        </p>
      </div>

      {/* Planned attendance */}
      <div className="mt-4">
        <label
          htmlFor={`classes-${subject.courseName}`}
          className="block text-xs font-medium text-slate-600"
        >
          Classes you plan to attend
        </label>

        <input
          id={`classes-${subject.courseName}`}
          type="number"
          min={0}
          max={
            predictions[subject.courseName].prediction
              .futureClasses
          }
          value={
            classesToAttend[subject.courseName] ?? 0
          }
          onChange={(e) => {
            const value = Number(e.target.value);

            const maxClasses =
              predictions[subject.courseName].prediction
                .futureClasses;

            const safeValue = Math.max(
              0,
              Math.min(value, maxClasses)
            );

            setClassesToAttend((previous) => ({
              ...previous,
              [subject.courseName]: safeValue,
            }));

            loadPrediction(
              subject.courseName,
              safeValue
            );
          }}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Prediction results */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs text-slate-500">
            Future attendance
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-800">
            {
              predictions[subject.courseName].prediction
                .futureAttendancePercentage
            }
            %
          </p>
        </div>

        <div className="rounded-lg bg-white p-3">
          <p className="text-xs text-slate-500">
            Predicted overall
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-800">
            {
              predictions[subject.courseName].prediction
                .predictedOverallAttendancePercentage
            }
            %
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {
          predictions[subject.courseName].prediction
            .futureClassesMissed
        }{" "}
        future class
        {predictions[subject.courseName].prediction
          .futureClassesMissed !== 1
          ? "es"
          : ""}{" "}
        missed in this scenario.
      </p>
    </div>
  )}
</div>

              </div>
            ))}
          </div>
        )}
<section className="mt-8">
  <h2 className="text-xl font-bold">
    Attendance Calendar
  </h2>

  <p className="mt-1 text-sm text-slate-500">
    Select a date to view your scheduled classes and attendance.
  </p>

  <div className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() => {
      setCurrentMonth(
        new Date(
          calendarYear,
          calendarMonth - 1,
          1
        )
      );
    }}
    className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
  >
    ←
  </button>

  <h3 className="text-lg font-semibold">
    {monthName}
  </h3>

  <button
    type="button"
    onClick={() => {
      setCurrentMonth(
        new Date(
          calendarYear,
          calendarMonth + 1,
          1
        )
      );
    }}
    className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
  >
    →
  </button>
</div>

      <div className="flex gap-2 text-xs">
        <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
          Present
        </span>

        <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
          Absent
        </span>

        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
          Not marked
        </span>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-6 gap-2 text-center text-xs font-medium text-slate-500">
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>

<div
  className="mt-2 w-full gap-2"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  }}
>
  {calendarCells.map((day, index) => {
    if (day === null) {
      return (
        <div
          key={`empty-${index}`}
          className="min-h-16 w-full rounded-xl"
        />
      );
    }

    const date = `${calendarYear}-${String(
      calendarMonth + 1
    ).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

    const classesForDate = dateWise.filter(
      (item) => item.date === date
    );

    const hasPresent = classesForDate.some(
      (item) => item.status === "PRESENT"
    );

    const hasAbsent = classesForDate.some(
      (item) => item.status === "ABSENT"
    );

    const hasClasses = classesForDate.length > 0;

    const insideSemester = isWithinSemester(date);

    const isSelected = selectedDate === date;

    return (
      <button
        key={date}
        type="button"
        disabled={!insideSemester}
        onClick={() => {
          if (insideSemester) {
            setSelectedDate(date);
          }
        }}
        className={`min-h-16 w-full rounded-xl border p-2 text-left transition ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : insideSemester
              ? "border-slate-100 bg-slate-50 hover:bg-slate-100"
              : "cursor-not-allowed border-slate-100 bg-slate-100 opacity-40"
        }`}
      >
        <p className="text-sm font-semibold text-slate-800">
          {day}
        </p>

        {hasClasses && insideSemester && (
          <div className="mt-2 flex gap-1">
            {hasPresent && (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            )}

            {hasAbsent && (
              <span className="h-2 w-2 rounded-full bg-red-500" />
            )}

            {!hasPresent && !hasAbsent && (
              <span className="h-2 w-2 rounded-full bg-slate-400" />
            )}
          </div>
        )}
      </button>
    );
  })}
</div>
</div>

  <div className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">
    <h3 className="text-lg font-semibold">
      {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      )}
    </h3>

    {dateWise.filter(
      (item) => item.date === selectedDate
    ).length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">
        No classes scheduled for this date.
      </p>
    ) : (
      <div className="mt-4 space-y-3">

        {dateWise
          .filter((item) => item.date === selectedDate)
          .map((classItem) => (
            <div
              key={`${classItem.scheduleEntryId}-${classItem.date}`}
              className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >

              <div>
                <p className="font-semibold">
                  {classItem.courseName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {classItem.startTime} – {classItem.endTime}
                  {" • "}
                  Slot {classItem.slotCode}
                </p>
              </div>

              <div className="flex items-center gap-2">
  {classItem.status === "PRESENT" ? (
    <span className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
      Present
    </span>
  ) : classItem.status === "ABSENT" ? (
    <span className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700">
      Absent
    </span>
  ) : (
    <>
      <button
        type="button"
        disabled={
          selectedDate > getTodayKey() ||
          markingAttendanceId ===
            classItem.scheduleEntryId
        }
        onClick={() =>
          markAttendance(
            classItem,
            "PRESENT"
          )
        }
        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {markingAttendanceId ===
        classItem.scheduleEntryId
          ? "Saving..."
          : "Present"}
      </button>

      <button
        type="button"
        disabled={
          selectedDate > getTodayKey() ||
          markingAttendanceId ===
            classItem.scheduleEntryId
        }
        onClick={() =>
          markAttendance(
            classItem,
            "ABSENT"
          )
        }
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Absent
      </button>
    </>
  )}
</div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                  classItem.status === "PRESENT"
                    ? "bg-green-100 text-green-700"
                    : classItem.status === "ABSENT"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {classItem.status === "PRESENT"
                  ? "Present"
                  : classItem.status === "ABSENT"
                  ? "Absent"
                  : "Not marked"}
              </span>

            </div>
          ))}

      </div>
    )}
  </div>
</section>

      </div>
    </main>
  );
}