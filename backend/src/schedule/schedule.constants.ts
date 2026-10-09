export const TIMETABLE_SLOTS = [
  {
    startTime: '08:30',
    endTime: '10:00',
    durationHours: 1.5,
  },
  {
    startTime: '10:05',
    endTime: '11:35',
    durationHours: 1.5,
  },
  {
    startTime: '11:40',
    endTime: '13:10',
    durationHours: 1.5,
  },
  {
    startTime: '13:15',
    endTime: '14:45',
    durationHours: 1.5,
  },
  {
    startTime: '14:50',
    endTime: '16:20',
    durationHours: 1.5,
  },
  {
    startTime: '16:25',
    endTime: '17:55',
    durationHours: 1.5,
  },
  {
    startTime: '18:00',
    endTime: '19:30',
    durationHours: 1.5,
  },
] as const;

export const TIMETABLE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WEEKLY_SLOT_CODES = {
  Monday: {
    '08:30': 'A11',
    '10:05': 'B11',
    '11:40': 'C11',
    '13:15': 'A21',
    '14:50': 'A14',
    '16:25': 'B21',
    '18:00': 'C21',
  },

  Tuesday: {
    '08:30': 'D11',
    '10:05': 'E11',
    '11:40': 'F11',
    '13:15': 'D21',
    '14:50': 'E14',
    '16:25': 'E21',
    '18:00': 'F21',
  },

  Wednesday: {
    '08:30': 'A12',
    '10:05': 'B12',
    '11:40': 'C12',
    '13:15': 'A22',
    '14:50': 'B14',
    '16:25': 'B22',
    '18:00': 'A24',
  },

  Thursday: {
    '08:30': 'D12',
    '10:05': 'E12',
    '11:40': 'F12',
    '13:15': 'D22',
    '14:50': 'F14',
    '16:25': 'E22',
    '18:00': 'F22',
  },

  Friday: {
    '08:30': 'A13',
    '10:05': 'B13',
    '11:40': 'C13',
    '13:15': 'A23',
    '14:50': 'C14',
    '16:25': 'B23',
    '18:00': 'B24',
  },

  Saturday: {
    '08:30': 'D13',
    '10:05': 'E13',
    '11:40': 'F13',
    '13:15': 'D23',
    '14:50': 'D14',
    '16:25': 'D24',
    '18:00': 'E23',
  },
} as const;

export interface ExtractedScheduleEntry {
  day: (typeof TIMETABLE_DAYS)[number];
  slotCode: string;
  startTime: string;
  endTime: string;
  rawText: string;
  courseCode?: string;
  courseName?: string;
  room?: string;
}