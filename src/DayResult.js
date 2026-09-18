export const DAY_TYPE = Object.freeze({
    WORKDAY: 'workday',
    WEEKEND: 'weekend',
    HOLIDAY: 'holiday',
    MAKEUP_WORKDAY: 'makeup_workday',
});

export class DayResult {
    constructor(date, dayType, isWorkday, holidayName, makeupWorkday = false, fallback = false) {
        this.date = date;
        this.dayType = dayType;
        this.isWorkday = isWorkday;
        this.isHoliday = !isWorkday;
        this.holidayName = holidayName;
        this.makeupWorkday = makeupWorkday;
        this.fallback = fallback;
    }

    toObject() {
        return {
            date: this.date,
            is_workday: this.isWorkday,
            is_holiday: this.isHoliday,
            day_type: this.dayType,
            holiday_name: this.holidayName,
            makeup_workday: this.makeupWorkday,
            fallback: this.fallback,
        };
    }

    toJSON() {
        return this.toObject();
    }
}
