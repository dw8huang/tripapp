import { Trip } from '../types';

function formatTimeRange(start?: string, end?: string): string {
  if (!start) return '';
  if (!end) return start;
  return `${start} - ${end}`;
}

function calculateDuration(start?: string, end?: string): string {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMinutes <= 0) return '';
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateTripCSV(trip: Trip): string {
  const rows: string[] = [];
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  rows.push('Time,Duration,Location,Topic,Type,Notes');

  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const dateStr = dayDate.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

    rows.push('');
    rows.push(`"--- Day ${dayIndex + 1} (${dateStr}) ---",,,,, `);

    const dayEvents = trip.events
      .filter(e => e.dayIndex === dayIndex)
      .sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

    if (dayEvents.length === 0) {
      rows.push('"No events planned",,,,, ');
      continue;
    }

    for (const event of dayEvents) {
      rows.push([
        csvEscape(formatTimeRange(event.startTime, event.endTime)),
        csvEscape(calculateDuration(event.startTime, event.endTime)),
        csvEscape(event.location?.name || ''),
        csvEscape(event.topic || ''),
        csvEscape(event.type || ''),
        csvEscape(event.note || ''),
      ].join(','));
    }
  }

  return rows.join('\n');
}

export function downloadTripCSV(trip: Trip): void {
  const csv = generateTripCSV(trip);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = trip.name.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  link.download = `${safeName}_itinerary.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
