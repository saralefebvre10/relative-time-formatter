import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RelativeTimeFormatter } from '../src/index.js';

const NOW = 1_700_000_000_000; // arbitrary fixed reference

test('zero delta returns just now', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW), 'just now');
});

test('sub-second delta returns just now', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW + 500), 'just now');
  assert.equal(f.format(NOW, NOW - 999), 'just now');
});

test('one second in the past', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 1000), '1 second ago');
});

test('59 seconds stays in seconds', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 59_000), '59 seconds ago');
});

test('one minute in the past', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 60_000), '1 minute ago');
});

test('one hour in the future', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW + 60 * 60 * 1000), 'in 1 hour');
});

test('3 hours ago', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 3 * 60 * 60 * 1000), '3 hours ago');
});

test('one day in the past', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 24 * 60 * 60 * 1000), '1 day ago');
});

test('2 days in the future', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW + 2 * 24 * 60 * 60 * 1000), 'in 2 days');
});

test('one week ago', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 7 * 24 * 60 * 60 * 1000), '1 week ago');
});

test('one month ago uses 30-day unit', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 30 * 24 * 60 * 60 * 1000), '1 month ago');
});

test('one year ago uses 365-day unit', () => {
  const f = new RelativeTimeFormatter();
  assert.equal(f.format(NOW, NOW - 365 * 24 * 60 * 60 * 1000), '1 year ago');
});

const PIG_LATIN = {
  units: {
    second: { one: '1 econdday', other: '{n} econdsday' },
    minute: { one: '1 inutemay', other: '{n} inutesmay' },
    hour:   { one: '1 ourhay',   other: '{n} ourshay' },
    day:    { one: '1 ayday',    other: '{n} aysday' },
    week:   { one: '1 eekway',   other: '{n} eeksway' },
    month:  { one: '1 onthmay',  other: '{n} onthsmay' },
    year:   { one: '1 earyay',   other: '{n} yearsyay' },
  },
  templates: {
    past: '{p} agoay',
    now:  'ustjay ownay',
    future: 'inyay {p}',
  },
};

test('custom locale is honoured', () => {
  const f = new RelativeTimeFormatter(PIG_LATIN);
  assert.equal(f.format(NOW, NOW), 'ustjay ownay');
  assert.equal(f.format(NOW, NOW - 5_000), '5 econdsday agoay');
  assert.equal(f.format(NOW, NOW + 2 * 60 * 60 * 1000), 'inyay 2 ourshay');
});
