import React from 'react'
import { Check, Coins, Clock, Edit3 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { Task } from '../types'
import { PILLAR_CONFIGS } from '../types'
import { 
  getHabitChecklistDates, 
  isHabitActiveOnDay, 
  isHabitCompletedOnDate,
  calculateHabitStreak,
  calculateHabitCoins 
} from '../utils/dateUtils'

interface HabitDayChecklistViewProps {
  habits: Task[]
  onToggleHabit: (habitId: string, date: string) => void
  onEditHabit: (habit: Task) => void
  onDeleteHabit: (habitId: string) => void
}

function HabitDayChecklistView({ habits, onToggleHabit, onEditHabit }: HabitDayChecklistViewProps) {
  const { colors } = useTheme()
  const checklistDates = getHabitChecklistDates()

  // Group habits by pillar and sort by start time
  const habitsByPillar = React.useMemo(() => {
    return Object.values(PILLAR_CONFIGS).map(pillar => ({
      ...pillar,
      habits: habits
        .filter(habit => habit.pillar === pillar.id)
        .sort((a, b) => {
          // Sort by start time, habits without start time go to the end
          if (!a.startTime && !b.startTime) return 0
          if (!a.startTime) return 1
          if (!b.startTime) return -1
          
          // Convert time strings to comparable format (HH:MM)
          const timeA = a.startTime.padStart(5, '0')
          const timeB = b.startTime.padStart(5, '0')
          return timeA.localeCompare(timeB)
        })
    })).filter(pillar => pillar.habits.length > 0)
  }, [habits])

  const handleCheckboxToggle = (habitId: string, date: string) => {
    onToggleHabit(habitId, date)
  }

  const renderHabitRow = (habit: Task) => {
    const streak = calculateHabitStreak(habit.completionDates || [], habit.challengeDuration)
    const coins = calculateHabitCoins(habit.completionDates || [])

    return (
      <div
        key={habit.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          backgroundColor: colors.surface,
          borderRadius: '8px',
          border: `1px solid ${colors.borderSubtle}`,
          marginBottom: '4px'
        }}
      >
        {/* Habit Info - Clickable to edit */}
        <div 
          style={{ 
            flex: 1, 
            minWidth: 0,
            cursor: 'pointer',
            padding: '4px',
            margin: '-4px',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
            position: 'relative'
          }}
          onClick={() => onEditHabit(habit)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surfaceVariant
            const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement
            if (editIcon) editIcon.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement
            if (editIcon) editIcon.style.opacity = '0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {habit.name}
              <Edit3 
                size={10} 
                className="edit-icon"
                style={{
                  color: colors.text.tertiary,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  flexShrink: 0
                }}
              />
            </h3>
             {habit.startTime && (
               <div style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '3px',
                 fontSize: '10px',
                 color: colors.text.tertiary,
                 backgroundColor: colors.surfaceVariant,
                 padding: '2px 5px',
                 borderRadius: '4px'
               }}>
                 <Clock size={9} />
                 <span>{habit.startTime}</span>
               </div>
             )}
          </div>
          
          {/* Points and Streak indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Points - always shown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Coins size={10} color={coins > 0 ? '#F59E0B' : colors.text.quaternary} />
              <span style={{ 
                fontSize: '10px', 
                color: coins > 0 ? colors.text.secondary : colors.text.quaternary,
                fontWeight: coins > 0 ? '500' : '400'
              }}>
                {coins}
              </span>
            </div>
            
            {/* Streak - shown if habit has challenge duration */}
            {streak.total > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Visual streak indicator */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {Array.from({ length: Math.min(7, streak.total) }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: index < streak.current 
                          ? 'linear-gradient(135deg, #10B981, #34D399)'
                          : colors.surfaceVariant,
                        border: index < streak.current 
                          ? '1px solid #059669' 
                          : `1px solid ${colors.borderSubtle}`,
                        boxShadow: index < streak.current 
                          ? '0 0 4px #10B98180, 0 1px 2px rgba(16, 185, 129, 0.3)' 
                          : 'none'
                      }}
                    />
                  ))}
                  {streak.total > 7 && (
                    <span style={{ 
                      fontSize: '8px', 
                      color: colors.text.secondary,
                      marginLeft: '3px',
                      fontWeight: '500'
                    }}>
                      +{streak.total - 7}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '9px', color: colors.text.tertiary }}>
                  {streak.current}/{streak.total}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Day Checkboxes - no individual labels */}
        <div style={{ display: 'flex', gap: '8px' }}>
           {checklistDates.map(({ date, isToday, isFuture }) => {
             const isActive = isHabitActiveOnDay(habit, date)
             const isCompleted = isHabitCompletedOnDate(habit, date)
             // Allow unmarking if already completed, but prevent new future markings
             const isDisabled = !isActive || (isFuture && !isCompleted) 

            return (
              <button
                key={date}
                onClick={() => !isDisabled && handleCheckboxToggle(habit.id, date)}
                disabled={isDisabled}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                   border: isCompleted 
                     ? '2px solid #10B981' 
                     : `2px solid ${isDisabled ? colors.borderSubtle : colors.border}`,
                   backgroundColor: isCompleted 
                     ? '#10B981' 
                     : isDisabled 
                       ? colors.surfaceVariant 
                       : colors.surface,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isDisabled ? 0.5 : 1,
                  ...(isToday && !isCompleted && !isDisabled && {
                    boxShadow: `0 0 0 2px ${colors.primary}40`
                  })
                }}
              >
                {isCompleted && (
                  <Check size={12} color={colors.surface} strokeWidth={3} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div 
        className="md-card" 
        style={{ 
          padding: '32px',
          textAlign: 'center',
          backgroundColor: colors.surface
        }}
      >
        <p className="body-large" style={{ color: colors.text.tertiary }}>
          No habits yet
        </p>
        <p className="body-medium" style={{ color: colors.text.quaternary, marginTop: '8px' }}>
          Start building meaningful habits for your Ikigai journey
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Sticky header with day labels */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: colors.background,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '8px 4px 12px 4px',
        borderBottom: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{ flex: 1 }} />
        
        {/* Day Headers - positioned to align with checkboxes */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {checklistDates.map(({ date, label, isToday }) => (
            <div key={date} style={{
              width: '24px',
              textAlign: 'center'
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: isToday ? '600' : '400',
                color: isToday ? colors.primary : colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>
                {isToday ? 'TOD' : label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Habits grouped by pillar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
         {habitsByPillar.map((pillar) => (
          <div key={pillar.id}>
            {/* Subtle pillar name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '6px',
              gap: '6px',
              opacity: 0.7
            }}>
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: pillar.color,
                borderRadius: '1px'
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: '400',
                color: colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {pillar.name}
              </span>
            </div>
            
            {/* Habits in this pillar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {pillar.habits.map(renderHabitRow)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HabitDayChecklistView
