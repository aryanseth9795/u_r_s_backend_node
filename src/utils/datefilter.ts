// Helper: build createdAt filter for Mongo based on range + optional custom dates

import { RangeKey } from "../types/adminTypes.js";


const buildCreatedAtFilter = (
  range: RangeKey,
  startDate?: string,
  endDate?: string
): Record<string, Date> | null => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  // Map numeric codes to named ranges
  let key: string | undefined = range;
  if (range === '0') key = 'today';
  if (range === '1') key = 'yesterday';
  if (range === '3') key = 'last_3_days';
  if (range === '7') key = 'last_week';

  let from: Date | undefined;
  let to: Date | undefined;

  switch (key) {
    case 'today': {
      from = startOfToday;
      to = endOfToday;
      break;
    }
    case 'yesterday': {
      const y = new Date(startOfToday);
      y.setDate(y.getDate() - 1);
      from = new Date(y.getFullYear(), y.getMonth(), y.getDate());
      to = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      break;
    }
    case 'last_3_days': {
      // last 3 days including today
      from = new Date(startOfToday);
      from.setDate(from.getDate() - 2);
      to = endOfToday;
      break;
    }
    case 'last_week': {
      // last 7 days including today
      from = new Date(startOfToday);
      from.setDate(from.getDate() - 6);
      to = endOfToday;
      break;
    }
    case 'custom': {
      const filter: Record<string, Date> = {};

      if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) {
          filter.$gte = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }

      if (endDate) {
        const d = new Date(endDate);
        if (!isNaN(d.getTime())) {
          filter.$lte = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            23,
            59,
            59,
            999
          );
        }
      }

      return Object.keys(filter).length ? filter : null;
    }
    default:
      return null; // no date filter
  }

  if (!from || !to) return null;
  return { $gte: from, $lte: to };
};

export default buildCreatedAtFilter;