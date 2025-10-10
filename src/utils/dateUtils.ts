/**
 * Date utility functions for habit tracking
 */

/**
 * Get a date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const minutesTo24Hour = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Time helpers
export const timeToMinutes = (timeStr: string): number => {
  // Supports "HH:MM" and "H:MM AM/PM"
  if (!timeStr) return 0
  if (timeStr.includes(' ')) {
    const [time, period] = timeStr.split(' ')
    const [h, m] = time.split(':').map(Number)
    let hh = h
    if (period === 'PM' && h !== 12) hh += 12
    if (period === 'AM' && h === 12) hh = 0
    return hh * 60 + m
  }
  const [hours, minutes] = timeStr.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
}

export const convertTo24Hour = (displayTime: string): string => {
  const [time, period] = displayTime.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let hour24 = hours
  if (period === 'PM' && hours !== 12) hour24 += 12
  if (period === 'AM' && hours === 12) hour24 = 0
  const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  return result
}

export const formatDisplayTime = (time24: string): string => {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${mStr} ${period}`
}

/*export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0
  if (timeStr.includes(' ')) {
    const [time, period] = timeStr.split(' ')
    const [h, m] = time.split(':').map(Number)
    let hh = h
    if (period === 'PM' && h !== 12) hh += 12
    if (period === 'AM' && h === 12) hh = 0
    return hh * 60 + m
  }
  const [hours, minutes] = timeStr.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}*/

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
  
  // Find the most recent completion date
  const mostRecentCompletion = sortedDates[sortedDates.length - 1]
  if (!mostRecentCompletion) {
    return { current: 0, total: challengeDuration || 0 }
  }
  
  // Count consecutive days from the most recent completion backwards
  let streak = 0
  let checkDate = new Date(mostRecentCompletion + 'T00:00:00')
  
  // Go backwards from the most recent completion
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

/**
 * Extract original task ID from various prefixed formats used in DayPlan
 * Handles: unsched-{originalId}-{date}, mod-{modId}-{originalId}, instanceId lookups
 */
export const extractOriginalTaskId = (
  taskId: string, 
  dailyModifications?: Array<{ instanceId?: string; itemId: string }>
): string => {
  // Handle unscheduled habits: unsched-{originalId}-{date}
  if (taskId.startsWith('unsched-')) {
    return taskId.split('-')[1]
  }
  
  // Handle modification prefixed IDs: mod-{modId}-{originalId}
  if (taskId.startsWith('mod-')) {
    const parts = taskId.split('-')
    return parts[parts.length - 1] // Last segment is original ID
  }
  
  // Handle raw instance IDs (nanoid) - need to look up in dailyModifications
  if (dailyModifications) {
    const modification = dailyModifications.find(m => m.instanceId === taskId)
    if (modification) {
      return modification.itemId
    }
  }
  
  // If no prefix, assume it's already the original ID
  return taskId
}
