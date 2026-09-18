export class YearConfig {
    constructor(year, holidays = {}, workdays = {}) {
        this.year = year;
        this.holidays = holidays;
        this.workdays = workdays;
    }

    isHoliday(date) {
        return Object.prototype.hasOwnProperty.call(this.holidays, date);
    }

    holidayName(date) {
        return this.holidays[date] ?? null;
    }

    isMakeupWorkday(date) {
        return Object.prototype.hasOwnProperty.call(this.workdays, date);
    }

    makeupName(date, fallback = '调休补班') {
        return this.workdays[date] ?? fallback;
    }
}
