import registry from '../../data/holidays/index.js';
import { YearConfig } from '../YearConfig.js';

export class ModuleConfigLoader {
    constructor(years = registry) {
        this.years = years;
        this.cache = new Map();
    }

    load(year) {
        if (this.cache.has(year)) {
            return this.cache.get(year);
        }

        const raw = this.years[year];
        const config = raw ? new YearConfig(year, raw.holidays ?? {}, raw.workdays ?? {}) : null;

        this.cache.set(year, config);

        return config;
    }
}
