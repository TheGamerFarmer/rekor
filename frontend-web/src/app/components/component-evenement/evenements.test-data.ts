import { defaultEvenements, getHeureEvenement, type Evenement } from './evenements.data';

const daysFromToday: Record<number, number> = {
  1: -7,
  2: -5,
  3: 1,
  4: 3,
  5: 5,
  6: 7,
  7: 12,
};

/** Creates event fixtures with dates relative to the current day for stable tests. */
export function createTestEvenements(): Evenement[] {
  return defaultEvenements.map((event) => ({
    ...event,
    date: `${dateRelativeToToday(daysFromToday[event.id])}T${getHeureEvenement(event.date)}:00`,
  }));
}

/** Returns the local calendar date at the requested offset from today. */
export function dateRelativeToToday(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
