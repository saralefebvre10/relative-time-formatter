/**
 * Default English locale strings.
 *
 * The structure is deliberately flat: each unit has singular and plural forms,
 * plus the three template positions (past, now, future). Keeping it data-driven
 * means a caller can supply a completely different language without subclassing.
 */
const DEFAULT_LOCALE = {
  units: {
    second: { one: '1 second', other: '{n} seconds' },
    minute: { one: '1 minute', other: '{n} minutes' },
    hour:   { one: '1 hour',   other: '{n} hours' },
    day:    { one: '1 day',    other: '{n} days' },
    week:   { one: '1 week',   other: '{n} weeks' },
    month:  { one: '1 month',  other: '{n} months' },
    year:   { one: '1 year',   other: '{n} years' },
  },
  templates: {
    past: '{p} ago',
    now:  'just now',
    future: 'in {p}',
  },
};

/**
 * Ordered list of unit descriptors. Each entry gives the unit name (matching a
 * key in locale.units), the number of milliseconds in one such unit, and the
 * threshold below which we round down to the previous unit. Thresholds are
 * slightly less than the next unit's full size so that, for example, 59 seconds
 * is still '59 seconds ago' rather than jumping to '1 minute ago' early.
 */
const UNITS = [
  { name: 'year',  ms: 365 * 24 * 60 * 60 * 1000, threshold: 365 * 24 * 60 * 60 * 1000 },
  { name: 'month', ms: 30 * 24 * 60 * 60 * 1000,  threshold: 30 * 24 * 60 * 60 * 1000 },
  { name: 'week',  ms: 7 * 24 * 60 * 60 * 1000,   threshold: 7 * 24 * 60 * 60 * 1000 },
  { name: 'day',   ms: 24 * 60 * 60 * 1000,       threshold: 24 * 60 * 60 * 1000 },
  { name: 'hour',  ms: 60 * 60 * 1000,            threshold: 60 * 60 * 1000 },
  { name: 'minute',ms: 60 * 1000,                 threshold: 60 * 1000 },
  { name: 'second',ms: 1000,                      threshold: 0 },
];

/**
 * @typedef {Object} LocaleData
 * @property {Object<string, {one: string, other: string}>} units
 * @property {{past: string, now: string, future: string}} templates
 */

/**
 * Formats a time delta into a human-readable relative string.
 *
 * The formatter is pure: it never reads the wall clock. A `now` value must be
 * supplied to `format`, which keeps the class deterministic and trivially
 * testable. This is a deliberate trade-off — callers who want "live" behaviour
 * pass `Date.now()` themselves.
 */
export class RelativeTimeFormatter {
  /**
   * @param {LocaleData} [locale] - Locale strings. Defaults to English.
   */
  constructor(locale) {
    this.locale = locale || DEFAULT_LOCALE;
  }

  /**
   * Format the relative time between `now` and `then`.
   *
   * @param {number} now  - Reference timestamp in ms since epoch.
   * @param {number} then - Target timestamp in ms since epoch.
   * @returns {string}
   */
  format(now, then) {
    const delta = then - now;

    if (Math.abs(delta) < 1000) {
      return this.locale.templates.now;
    }

    const phrase = this._phraseForDelta(delta);
    const isFuture = delta > 0;
    const template = isFuture ? this.locale.templates.future : this.locale.templates.past;
    return template.replace('{p}', phrase);
  }

  /**
   * Pick the unit and build the localized phrase (e.g. "3 hours") for a delta.
   * @param {number} delta - Signed milliseconds.
   * @returns {string}
   * @private
   */
  _phraseForDelta(delta) {
    const abs = Math.abs(delta);

    for (const unit of UNITS) {
      if (abs >= unit.threshold) {
        const count = Math.floor(abs / unit.ms);
        // Guard against a zero count when abs sits between threshold and one
        // full unit — should not happen with current thresholds, but keeps the
        // function total.
        const n = count < 1 ? 1 : count;
        const forms = this.locale.units[unit.name];
        const form = n === 1 ? forms.one : forms.other;
        return form.replace('{n}', String(n));
      }
    }

    // Fallback: less than a second but above the "now" window handled by caller.
    const forms = this.locale.units.second;
    return forms.one.replace('{n}', '1');
  }
}
