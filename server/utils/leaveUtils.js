const Vacation = require("../models/Vacation");

/**
 * Helper function to check if a date falls within a holiday period
 */
const isHoliday = (date, holidaysList) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return holidaysList.some(holiday => {
        const holidayStartDate = new Date(holiday.date);
        holidayStartDate.setHours(0, 0, 0, 0);
        const holidayEndDate = new Date(holidayStartDate);
        holidayEndDate.setDate(holidayEndDate.getDate() + holiday.numberOfDays - 1);
        holidayEndDate.setHours(23, 59, 59, 999);

        return checkDate >= holidayStartDate && checkDate <= holidayEndDate;
    });
};

/**
 * Calculate matching weekdays in a range, excluding sat/sun and holidays
 */
const calculateWeekdays = async (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const allHolidays = await Vacation.find({
        date: { $lte: end }
    });

    const holidays = allHolidays.filter(holiday => {
        const holidayStart = new Date(holiday.date);
        holidayStart.setHours(0, 0, 0, 0);
        const holidayEnd = new Date(holidayStart);
        holidayEnd.setDate(holidayEnd.getDate() + holiday.numberOfDays - 1);
        holidayEnd.setHours(23, 59, 59, 999);
        return holidayStart <= end && holidayEnd >= start;
    });

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(current, holidays)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
};

/**
 * Calculates how many days of a leave fall within a specific period
 */
const calculateOverlapDays = async (leaveStart, leaveEnd, periodStart, periodEnd) => {
    // Find intersection of [leaveStart, leaveEnd] and [periodStart, periodEnd]
    const intersectionStart = new Date(Math.max(new Date(leaveStart), new Date(periodStart)));
    const intersectionEnd = new Date(Math.min(new Date(leaveEnd), new Date(periodEnd)));

    if (intersectionStart > intersectionEnd) return 0;

    return await calculateWeekdays(intersectionStart, intersectionEnd);
};

module.exports = {
    isHoliday,
    calculateWeekdays,
    calculateOverlapDays
};
