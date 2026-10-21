/**
 * Utility functions for date, time, and timezone calculations (Asia/Colombo: UTC+05:30)
 */

const TIMEZONE_OFFSET = '+05:30';

/**
 * Parses dateStr (YYYY-MM-DD) and timeStr (HH:mm) into a JavaScript Date object in Asia/Colombo
 */
export const getSlotDateTime = (dateStr, timeStr) => {
  // Construct ISO with Asia/Colombo offset
  const isoString = `${dateStr}T${timeStr}:00${TIMEZONE_OFFSET}`;
  return new Date(isoString);
};

/**
 * Checks whether the slot's start time is in the past compared to current time
 */
export const isSlotInPast = (dateStr, timeStr) => {
  const slotStart = getSlotDateTime(dateStr, timeStr);
  return slotStart.getTime() <= Date.now();
};

/**
 * Converts HH:mm (24-hour) string to integer minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if two time intervals on the same day overlap
 * Two intervals [A_start, A_end] and [B_start, B_end] overlap if:
 * max(A_start, B_start) < min(A_end, B_end)
 */
export const doTimesOverlap = (startA, endA, startB, endB) => {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
};

/**
 * Validates that endTime is strictly greater than startTime and duration is reasonable (e.g. 5 min to 8 hours)
 */
export const isValidTimeRange = (startTime, endTime) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return endMin > startMin && endMin - startMin >= 5 && endMin - startMin <= 480;
};

/**
 * Checks if cancellation deadline has passed
 * e.g. If deadline is 2 hours, user cannot cancel within 2 hours of slot start
 */
export const isPastCancellationDeadline = (dateStr, startTime, deadlineHours = 2) => {
  const slotStart = getSlotDateTime(dateStr, startTime);
  const deadlineMillis = deadlineHours * 60 * 60 * 1000;
  return Date.now() > slotStart.getTime() - deadlineMillis;
};
