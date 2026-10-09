"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";

export default function SchedulePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a timetable image.");
      return;
    }

    setSelectedFile(file);
  }

  function removeFile() {
    setSelectedFile(null);
    setPreviewUrl("");
  }

async function analyzeTimetable() {
  if (!selectedFile) {
    return;
  }

  setOcrLoading(true);
  setOcrText("");

  try {
    const image = new Image();
    const imageUrl = URL.createObjectURL(selectedFile);

    image.src = imageUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    // Crop the timetable grid from the uploaded screenshot.
    // These values are percentages so they work with different image sizes.
    const cropLeft = 0.095;
    const cropTop = 0.08;
    const cropRight = 0.88;
    const cropBottom = 0.80;

    const sourceX = image.naturalWidth * cropLeft;
    const sourceY = image.naturalHeight * cropTop;
    const sourceWidth =
      image.naturalWidth * (cropRight - cropLeft);
    const sourceHeight =
      image.naturalHeight * (cropBottom - cropTop);

    // Enlarge the cropped timetable for better OCR.
    const scale = 3;

    const canvas = document.createElement("canvas");

    canvas.width = sourceWidth * scale;
    canvas.height = sourceHeight * scale;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create image processing canvas.");
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    URL.revokeObjectURL(imageUrl);

    const worker = await createWorker("eng");

    const result = await worker.recognize(canvas);

    setOcrText(result.data.text);

    await worker.terminate();
  } catch (error) {
    console.error("OCR error:", error);
    setOcrText("Unable to analyze the timetable image.");
  } finally {
    setOcrLoading(false);
  }
}

useEffect(() => {
  async function fetchSchedule() {
    const token = localStorage.getItem("campusgpt_token");

    if (!token) {
      setScheduleLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/schedule",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load your schedule.");
      }

      const data = await response.json();
      setScheduleEntries(data);
    } catch (error) {
      console.error("Error loading schedule:", error);
      setScheduleError("Unable to load your schedule.");
    } finally {
      setScheduleLoading(false);
    }
  }

  fetchSchedule();
}, []);

useEffect(() => {
  if (!selectedFile) {
    setPreviewUrl("");
    return;
  }

  const url = URL.createObjectURL(selectedFile);
  setPreviewUrl(url);

  return () => {
    URL.revokeObjectURL(url);
  };
}, [selectedFile]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-8">

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
                  Import My Schedule
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Upload your college timetable screenshot to build your
                  personal schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload card */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="font-semibold">Timetable Screenshot</h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload the timetable provided by your college portal.
              CampusGPT will use it to identify your weekly classes.
            </p>
          </div>

          <div className="p-6">

            {!selectedFile ? (
              <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-blue-400 hover:bg-blue-50/30">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Upload size={26} />
                </div>

                <h3 className="font-semibold">
                  Upload timetable screenshot
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Choose a clear screenshot containing your complete weekly
                  timetable.
                </p>

                <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  Choose Image
                </span>

                <p className="mt-3 text-xs text-slate-400">
                  PNG, JPG or JPEG
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div>
                {/* File information */}
                <div className="mb-5 flex items-center justify-between rounded-xl border bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <ImageIcon size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500"
                    title="Remove image"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Image preview */}
                <div className="overflow-hidden rounded-2xl border bg-slate-100">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Uploaded timetable preview"
                      className="max-h-[650px] w-full object-contain"
                    />
                  )}
                </div>

                <button
  type="button"
  onClick={analyzeTimetable}
  disabled={ocrLoading}
  className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {ocrLoading ? "Analyzing Timetable..." : "Analyze Timetable"}
</button>

                {/* Ready state */}
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 text-green-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Timetable uploaded successfully
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        The next step will analyze this timetable and identify
                        your registered classes.
                      </p>
                    </div>
                  </div>
                </div>
                {ocrText && (
  <div className="mt-5 rounded-xl border bg-slate-50 p-5">
    <h3 className="text-sm font-semibold text-slate-900">
      Detected Timetable Text
    </h3>

    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-xs leading-5 text-slate-700">
      {ocrText}
    </pre>
  </div>
)}v
              </div>
            )}

          </div>
        </section>

{/* Current Schedule */}
<section className="mt-6 rounded-2xl border bg-white shadow-sm">
  <div className="border-b p-6">
    <h2 className="font-semibold">My Current Schedule</h2>

    <p className="mt-1 text-sm text-slate-500">
      Classes currently stored in your CampusGPT schedule.
    </p>
  </div>

  <div className="p-6">
    {scheduleLoading ? (
      <p className="text-sm text-slate-500">
        Loading your schedule...
      </p>
    ) : scheduleError ? (
      <p className="text-sm text-red-600">
        {scheduleError}
      </p>
    ) : scheduleEntries.length === 0 ? (
      <p className="text-sm text-slate-500">
        No schedule entries found.
      </p>
    ) : (
      <div className="space-y-3">
        {scheduleEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-xl border bg-slate-50 p-4"
          >
            <div>
              <p className="text-sm font-semibold">
                {entry.courseName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {entry.day} • {entry.startTime}–{entry.endTime}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {entry.room || "Room not specified"}
              </p>
            </div>

            <div className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {entry.slotCode}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</section>

        {/* Information */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">
            How Schedule Import will work
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                1
              </div>

              <h3 className="text-sm font-semibold">
                Upload
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Upload the timetable screenshot from your college portal.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                2
              </div>

              <h3 className="text-sm font-semibold">
                Analyze
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                CampusGPT will identify days, time slots, courses and rooms.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                3
              </div>

              <h3 className="text-sm font-semibold">
                Confirm
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review the detected timetable before saving it to your
                schedule.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}