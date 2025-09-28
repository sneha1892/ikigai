import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useBackButtonHandler } from '../hooks/useBackButtonHandler'
import type { Task, PillarType, RepeatFrequency, Goal } from '../types'
import { PILLAR_CONFIGS } from '../types'
import AddGoalModal from './AddGoalModal'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onEditTask?: (taskId: string, task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  editingTask?: Task | null
  prefilledPillar?: PillarType
  prefilledGoal?: Omit<Goal, 'id' | 'createdAt'>
  prefilledStartTime?: string
  prefilledDate?: string
  availableGoals?: Goal[]
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
}

{/*const ICONS = [
  { name: 'droplets', emoji: '💧' },
  { name: 'book', emoji: '📚' },
  { name: 'brain', emoji: '🧠' },
  { name: 'heart', emoji: '❤️' },
  { name: 'dumbbell', emoji: '🏋️' },
  { name: 'apple', emoji: '🍎' },
  { name: 'moon', emoji: '🌙' },
  { name: 'phone', emoji: '📞' },
  { name: 'family', emoji: '👨‍👩‍👧‍👦' },
  { name: 'briefcase', emoji: '💼' },
  { name: 'paint', emoji: '🎨' },
  { name: 'nature', emoji: '🌿' },
  { name: 'meditation', emoji: '🧘' },
  { name: 'run', emoji: '🏃' },
  { name: 'write', emoji: '✍️' },
  { name: 'music', emoji: '🎵' }
] */}

const DAYS_OF_WEEK = [
  { id: 'monday', name: 'Mon' },
  { id: 'tuesday', name: 'Tue' },
  { id: 'wednesday', name: 'Wed' },
  { id: 'thursday', name: 'Thu' },
  { id: 'friday', name: 'Fri' },
  { id: 'saturday', name: 'Sat' },
  { id: 'sunday', name: 'Sun' }
]

function QuickAddModal({ 
  isOpen, 
  onClose, 
  onAddTask, 
  onEditTask, 
  editingTask, 
  prefilledPillar, 
  prefilledGoal, 
  prefilledStartTime,
  prefilledDate,
  availableGoals = [],
  onAddGoal
}: QuickAddModalProps) {
  const { colors } = useTheme()
  const [taskName, setTaskName] = useState('')
  const [selectedPillar, setSelectedPillar] = useState<PillarType>(prefilledPillar || 'mental')
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [selectedIcon, setSelectedIcon] = useState('brain')
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>('daily')
  const [customDays, setCustomDays] = useState<string[]>(['monday', 'wednesday', 'friday'])
  const [hasReminder, setHasReminder] = useState(!!prefilledStartTime)
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0])
  const [challengeDuration, setChallengeDuration] = useState<number>(7)
  const [duration, setDuration] = useState<number>(30) // Duration in minutes
  const [startTime, setStartTime] = useState<string>('') // Start time (HH:MM)
  const [endTime, setEndTime] = useState<string>('') // End time (HH:MM)
  
  // Goal creation state
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)

  // Back button navigation - close modal when back button is pressed
  // Priority 30: Lower than AddGoalModal (10) so AddGoal closes first when nested
  useBackButtonHandler('quick-add-modal', isOpen, onClose, 30)

  // Reset form when modal opens or populate when editing
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        // Populate form with existing task data
        setTaskName(editingTask.name)
        setSelectedPillar(editingTask.pillar)
        setSelectedGoal(editingTask.goalId || '')
        setSelectedIcon(editingTask.icon)
        setRepeatFrequency(editingTask.repeatFrequency)
        setCustomDays(editingTask.customDays || ['monday', 'wednesday', 'friday'])
        setHasReminder(editingTask.hasReminder)
        setReminderDate(editingTask.reminderDate || '')
        setChallengeDuration(editingTask.challengeDuration || 7)
        setDuration(editingTask.duration || 30) // Set duration
        setStartTime(editingTask.startTime || '')
        setEndTime(editingTask.endTime || '')
      } else {
        // Reset form for new task or use prefilled values
        setTaskName('')
        setSelectedPillar(prefilledPillar || 'mental')
        setSelectedGoal(prefilledGoal ? `temp-${Date.now()}` : '')
        setSelectedIcon('brain')
        setRepeatFrequency('daily')
        setCustomDays(['monday', 'wednesday', 'friday'])
        setHasReminder(!!prefilledStartTime)
        setReminderDate(prefilledDate || new Date().toISOString().split('T')[0])
        setChallengeDuration(7)
        setDuration(30) // Reset duration
        setStartTime(prefilledStartTime || '')
        setEndTime('')
      }
    }
  }, [isOpen, editingTask, prefilledPillar, prefilledGoal, prefilledStartTime, prefilledDate])

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Helper function to convert minutes since midnight to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  
  // Calculate end time when start time or duration changes
  useEffect(() => {
    if (startTime && duration > 0 && !endTime) {
      const startMinutes = timeToMinutes(startTime)
      const calculatedEndMinutes = startMinutes + duration
      const calculatedEndTime = minutesToTime(calculatedEndMinutes)
      setEndTime(calculatedEndTime)
    }
  }, [startTime, duration])

  // Calculate start time when end time or duration changes  
  useEffect(() => {
    if (endTime && duration > 0 && !startTime) {
      const endMinutes = timeToMinutes(endTime)
      const calculatedStartMinutes = endMinutes - duration
      if (calculatedStartMinutes >= 0) {
        const calculatedStartTime = minutesToTime(calculatedStartMinutes)
        setStartTime(calculatedStartTime)
      }
    }
  }, [endTime, duration])

  // Calculate duration when start and end times change
  useEffect(() => {
    if (startTime && endTime) {
      const startMinutes = timeToMinutes(startTime)
      const endMinutes = timeToMinutes(endTime)
      const calculatedDuration = endMinutes - startMinutes
      if (calculatedDuration > 0 && calculatedDuration !== duration) {
        setDuration(calculatedDuration)
      }
    }
  }, [startTime, endTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) return

    // Build task data without undefined values (Firebase doesn't support them)
    const taskData: any = {
      name: taskName.trim(),
      pillar: selectedPillar,
      icon: selectedIcon,
      repeatFrequency,
      hasReminder
    }

    // Only add fields that have values
    if (repeatFrequency === 'custom' && customDays.length > 0) {
      taskData.customDays = customDays
    }
    
    if (startTime) {
      taskData.reminderTime = startTime
    }
    
    if ( repeatFrequency === 'once' && reminderDate) {
      taskData.reminderDate = reminderDate
    }
    
    if (repeatFrequency !== 'once' && challengeDuration) {
      taskData.challengeDuration = challengeDuration
    }
    
    // Always add duration if it's set
    // Always add duration
    taskData.duration = duration
    
    // Add time fields if they have values
    if (startTime) {
      taskData.startTime = startTime
    }
    
    if (endTime) {
      taskData.endTime = endTime
    }
    
    if (selectedGoal) {
      taskData.goalId = selectedGoal
    }


    if (editingTask && onEditTask) {
      onEditTask(editingTask.id, taskData)
    } else {
      onAddTask(taskData)
    }
    onClose()
  }

  const handleCustomDayToggle = (dayId: string) => {
    setCustomDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    )
  }

  const handleGoalCreated = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (onAddGoal) {
      onAddGoal(goalData)
    }
    setShowAddGoalModal(false)
  }

  const handleCloseGoalModal = () => {
    setShowAddGoalModal(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          zIndex: 1001,
          maxHeight: '85vh',
          overflowY: 'auto',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Handle */}
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: '#444',
          borderRadius: '2px',
          margin: '12px auto 0',
        }} />

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            fontWeight: '500',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {editingTask ? 'Edit Habit/Task' : 'Add New Habit/Task'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Habit Name */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                Habit Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Drink 2L Water"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: colors.surface,
                  border: '1px solid #444',
                  borderRadius: '12px',
                  color: colors.text.primary,
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
              />
            </div>

            {/* Pillar Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'block'
              }}>
                Category
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                {Object.values(PILLAR_CONFIGS).map((pillar) => (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setSelectedPillar(pillar.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedPillar === pillar.id ? `2px solid ${pillar.color}` : '1px solid #444',
                      backgroundColor: selectedPillar === pillar.id ? `${pillar.color}20` : colors.surface,
                      color: colors.text.primary,
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      color: pillar.color,
                      fontSize: '12px',
                      marginBottom: '4px'
                    }}>
                      {pillar.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: colors.text.tertiary,
                      lineHeight: '1.3'
                    }}>
                      {pillar.description.split(',')[0]}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'block'
              }}>
                Goal (Optional)
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => {
                  if (e.target.value === 'add-new') {
                    setShowAddGoalModal(true)
                  } else {
                    setSelectedGoal(e.target.value)
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #444',
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">No goal selected</option>
                {prefilledGoal && (
                  <option value={`temp-${Date.now()}`}>
                    {prefilledGoal.title}
                  </option>
                )}
                {availableGoals
                  .filter(goal => goal.pillar === selectedPillar)
                  .map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                <option value="add-new" style={{ 
                  color: PILLAR_CONFIGS[selectedPillar].color,
                  fontWeight: '500'
                }}>
                  + Not in the list? Add now!!
                </option>
              </select>
            </div>

            {/* Icon Selection - not used
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'block'
              }}>
                Icon
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px'
              }}>
                {ICONS.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setSelectedIcon(icon.name)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: selectedIcon === icon.name ? '2px solid #10B981' : '1px solid #444',
                      backgroundColor: selectedIcon === icon.name ? '#10B98120' : colors.surface,
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Repeat Frequency */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'block'
              }}>
                Repeat
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[
                  { value: 'once', label: 'Once' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'custom', label: 'Custom' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRepeatFrequency(option.value as RepeatFrequency)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: repeatFrequency === option.value ? '1px solid #10B981' : '1px solid #444',
                      backgroundColor: repeatFrequency === option.value ? '#10B98120' : colors.surface,
                      color: repeatFrequency === option.value ? '#10B981' : '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Challenge Duration - only show for habits (not once) */}
              {repeatFrequency === 'daily' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Challenge Duration
                  </label>
                  <select
                    value={challengeDuration}
                    onChange={(e) => setChallengeDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: colors.surface,
                      border: '1px solid #444',
                      borderRadius: '12px',
                      color: colors.text.primary,
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={3}>3 days (Quick Win)</option>
                    <option value={7}>7 days (Weekly Challenge)</option>
                    <option value={21}>21 days (Habit Formation)</option>
                    <option value={66}>66 days (Deep Integration)</option>
                  </select>
                </div>
              )}

              {/* Custom Days Selection */}
              {repeatFrequency === 'custom' && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleCustomDayToggle(day.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: customDays.includes(day.id) ? '1px solid #10B981' : '1px solid #444',
                        backgroundColor: customDays.includes(day.id) ? '#10B98120' : colors.surface,
                        color: customDays.includes(day.id) ? '#10B981' : colors.text.tertiary,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Time Management Section - Always visible for habits */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⏰ Schedule Time(Optional)
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                {/* Start Time */}
                <div>
                  <label style={{
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: colors.surface,
                      border: '1px solid #444',
                      borderRadius: '12px',
                      color: colors.text.primary,
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label style={{
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: colors.surface,
                      border: '1px solid #444',
                      borderRadius: '12px',
                      color: colors.text.primary,
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label style={{
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: colors.surface,
                      border: '1px solid #444',
                      borderRadius: '12px',
                      color: colors.text.primary,
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                   {repeatFrequency === 'once' && (
                      <input
                        type="date"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} // Can't select past dates
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          backgroundColor: colors.surface,
                          border: '1px solid #444',
                          borderRadius: '12px',
                          color: colors.text.primary,
                          fontSize: '16px',
                          outline: 'none'
                        }}
                        placeholder="Select date"
                      />
                    )}
                  </div>

            </div>

            {/* Remind Me Button */}
            <div style={{ marginBottom: '32px' }}>
              <button
                type="button"
                onClick={() => setHasReminder(!hasReminder)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: hasReminder ? '2px solid #10B981' : '2px solid #444',
                  backgroundColor: hasReminder ? '#10B98120' : colors.surface,
                  color: hasReminder ? '#10B981' : colors.text.primary,
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {hasReminder ? '🔔' : '🔕'} 
                {hasReminder ? 'Remind Me Enabled' : 'Remind Me'}
              </button>
              

              {hasReminder && (
                <div style={{ marginTop: '12px' }}>
                  
                  <p style={{
                    color: colors.text.tertiary,
                    fontSize: '12px',
                    textAlign: 'center',
                    margin: '8px 0 0 0'
                  }}>
                    You'll receive notifications for this habit
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #444',
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!taskName.trim()}
                style={{
                  flex: 2,
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: taskName.trim() ? '#10B981' : '#444',
                  color: colors.text.primary,
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: taskName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                {editingTask ? 'Update Habit/Task' : 'Add Habit/Task'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Goal Modal - Reusing the existing AddGoalModal as a popup */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={handleCloseGoalModal}
        onAddGoal={handleGoalCreated}
        pillar={selectedPillar}
      />
    </>
  )
}

export default QuickAddModal