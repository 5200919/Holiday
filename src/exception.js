export class HolidayError extends Error {
    constructor(message, code = 'HOLIDAY_ERROR') {
        super(message);
        this.name = 'HolidayError';
        this.code = code;
    }
}

export class InvalidDateError extends HolidayError {
    constructor(message) {
        super(message, 'INVALID_DATE');
        this.name = 'InvalidDateError';
    }
}
