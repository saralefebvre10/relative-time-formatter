# Relative Time Formatter

Formats a signed time delta into a human-readable relative string such as `3 hours ago` or `in 2 days`.

```js
import { RelativeTimeFormatter } from './src/index.js';

const f = new RelativeTimeFormatter();
const now = Date.now();

f.format(now, now - 3 * 60 * 60 * 1000); // "3 hours ago"
f.format(now, now + 2 * 24 * 60 * 60 * 1000); // "in 2 days"
```

## Why

Most relative-time libraries bundle `Intl.RelativeTimeFormat` and call it a day. That works when you ship to a modern runtime with full ICU data, but it falls apart in stripped-down environments or when you need deterministic, testable output without locale-data downloads. This library is zero-dependency, pure JavaScript, and fully driven by a plain locale object you can replace.

The trade-off: units are fixed-length approximations (a month is always 30 days, a year 365 days). This keeps formatting deterministic and side-effect-free, but means the output will drift from calendar truth near month and year boundaries. If you need calendar-accurate rounding, use `Intl.RelativeTimeFormat`.

## Edge cases

- Deltas under one second in either direction return `just now`.
- The formatter never reads the clock; you pass `now` explicitly. This makes every call deterministic.
- Thresholds are tuned so that, e.g., 59 seconds reads `59 seconds`, not `1 minute`.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

