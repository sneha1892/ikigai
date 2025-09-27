import type { DailyModification } from './types';

const modification: Omit<DailyModification, 'id'> = {
  date: '2025-09-27',
  itemId: 'test-item',
  itemType: 'task',
  modification: {
    status: 'skipped',
  },
};
