/**
 * Date utility functions for habit tracking
 */

/**
 * Get a date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

  // Helper function to check if a date is in the future
const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return target > today;
  };
/**
 * Get a date from a date string
 */
export const getDateFromString = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00')
}

/**
 * Get an array of dates for the habit checklist (previous 2 days, today, next 2 days)
 */
export const getHabitChecklistDates = (): Array<{ date: string; label: string; isToday: boolean; isPast: boolean; isFuture: boolean }> => {
  const today = new Date()
  const dates = []
  
  // Previous 2 days
  for (let i = 2; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push({
      date: getDateString(date),
      label: getDayLabel(date),
      isToday: false,
      isPast: true,
      isFuture: false
    })
  }
  
  // Today
  dates.push({
    date: getDateString(today),
    label: 'Today',
    isToday: true,
    isPast: false,
    isFuture: false
  })
  
  // Next 2 days
  for (let i = 1; i <= 2; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push({
      date: getDateString(date),
      label: getDayLabel(date),
      isToday: false,
      isPast: false,
      isFuture: true
    })
  }
  
  return dates
}

/**
 * Get a short day label (e.g., "Mon", "Tue", "Today")
 */
export const getDayLabel = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

/**
 * Check if a habit should be active on a given day based on its repeat frequency
 */
export const isHabitActiveOnDay = (habit: { repeatFrequency: string; customDays?: string[] }, dateString: string): boolean => {
  if (habit.repeatFrequency === 'daily') {
    return true
  }
  
  if (habit.repeatFrequency === 'custom' && habit.customDays) {
    const date = getDateFromString(dateString)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return habit.customDays.includes(dayName)
  }
  
  return false
}

/**
 * Calculate habit streak (consecutive completed days from start)
 */
export const calculateHabitStreak = (completionDates: string[], challengeDuration?: number): { current: number; total: number } => {
  if (!completionDates || completionDates.length === 0) {
    return { current: 0, total: challengeDuration || 0 }
  }
  
  // Sort dates in ascending order
  const sortedDates = [...completionDates].sort()
  const today = getDateString(new Date())
  
  // Count consecutive days from the most recent completion
  let streak = 0
  const todayDate = new Date(today + 'T00:00:00')
  
  // Start from today and go backwards
  let checkDate = new Date(todayDate)
  
  while (true) {
    const checkDateString = getDateString(checkDate)
    if (sortedDates.includes(checkDateString)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return { current: streak, total: challengeDuration || 0 }
}

/**
 * Calculate coins earned from habit completions
 */
export const calculateHabitCoins = (completionDates: string[]): number => {
  return (completionDates || []).length * 10 // 10 coins per completion
}

/**
 * Check if a date is completed for a habit
 */
export const isHabitCompletedOnDate = (habit: { completionDates?: string[] }, dateString: string): boolean => {
  return (habit.completionDates || []).includes(dateString)
}
