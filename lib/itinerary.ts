export type ItineraryStop = {
  time: string;
  title: string;
  description?: string;
};

const TIME_TITLE_RE = /^\s*([0-9]{1,2}:[0-9]{2})\s*-\s*([^:]+):?\s*(.*)$/;
const ADMIN_LINE_RE = /^\s*\d+\.\s*([^·-]+?)\s*[·]\s*([^:-]+?)(?:\s*-\s*(.*))?$/;

export function parseItinerary(text: string): ItineraryStop[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(TIME_TITLE_RE);
      if (!match) {
        return null;
      }
      const [, time, title, description] = match;
      return {
        time: time.trim(),
        title: title.trim(),
        description: description?.trim() || undefined
      };
    })
    .filter((stop): stop is ItineraryStop => Boolean(stop));
}

export function parseAdminItinerary(text: string): ItineraryStop[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(ADMIN_LINE_RE);
      if (!match) return null;
      const [, duration, place, note] = match;
      return {
        time: duration.trim(),
        title: place.trim(),
        description: note?.trim() || undefined
      };
    })
    .filter((stop): stop is ItineraryStop => Boolean(stop));
}
