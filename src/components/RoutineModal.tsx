import { useState, useEffect, useMemo } from 'react'
import { X, Search, Plus, Clock, Target } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useBackButtonHandler } from '../hooks/useBackButtonHandler'
import QuickAddModal from './QuickAddModal'
import type { Task, Routine, RepeatFrequency } from '../types'
import { PILLAR_CONFIGS } from '../types'

interface RoutineModalProps {
  isOpen: boolean
  onClose: () => void
  onAddRoutine?: (routine: Omit<Routine, 'id'>) => void
  editingRoutine?: Routine | null
  onEditRoutine?: (routineId: string, routine: Omit<Routine, 'id'>) => void
  availableTasks: Task[]
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  prefilledStartTime?: string
}

const ROUTINE_COLORS = ['#F97316', // Orange
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#84CC16', // Lime
]

const DAYS_OF_WEEK = [
  { id: 'monday', name: 'Mon' },
  { id: 'tuesday', name: 'Tue' },
  { id: 'wednesday', name: 'Wed' },
  { id: 'thursday', name: 'Thu' },
  { id: 'friday', name: 'Fri' },
  { id: 'saturday', name: 'Sat' },
  { id: 'sunday', name: 'Sun' }
]

function RoutineModal({
  isOpen,
  onClose,
  onAddRoutine,
  editingRoutine,
  onEditRoutine,
  availableTasks,
  onAddTask,
  prefilledStartTime
}: RoutineModalProps) {
  const { colors } = useTheme()
  const [routineName, setRoutineName] = useState('')
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([])
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState(ROUTINE_COLORS[0])
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>('daily')
  const [customDays, setCustomDays] = useState<string[]>(['monday', 'wednesday', 'friday'])

  // Back button navigation - close modal when back button is pressed  
  // Priority 20: Lower than QuickAddModal (30) so QuickAdd closes first when nested
  useBackButtonHandler('routine-modal', isOpen, onClose, 20)

  useEffect(() => {
    if (isOpen) {
      if (editingRoutine) {
        setRoutineName(editingRoutine.name)
        setSelectedHabitIds([...editingRoutine.habitIds])
        setSelectedTaskIds([...(editingRoutine.taskIds || [])])
        setSelectedColor(editingRoutine.color)
        setStartTime(editingRoutine.startTime)
        setEndTime(editingRoutine.endTime || '')
        setRepeatFrequency(editingRoutine.repeatFrequency || 'daily')
        setCustomDays(editingRoutine.customDays || ['monday', 'wednesday', 'friday'])
      } else {
        setRoutineName('')
        setSelectedHabitIds([])
        setSelectedTaskIds([])
        setSelectedColor(ROUTINE_COLORS[0])
        setStartTime(prefilledStartTime || '07:00')
        setEndTime('')
        setRepeatFrequency('daily')
        setCustomDays(['monday', 'wednesday', 'friday'])
      }
      setSearchQuery('')
      setErrors({})
    }
  }, [isOpen, editingRoutine, prefilledStartTime])

  const availableHabits = useMemo(() => {
    return availableTasks.filter(task => 
      task.repeatFrequency !== 'once' &&
      (task.challengeDuration || task.repeatFrequency === 'daily')
    )
  }, [availableTasks])

  const availableRegularTasks = useMemo(() => {
    return availableTasks.filter(task => task.repeatFrequency === 'once')
  }, [availableTasks])

  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return availableHabits
    const query = searchQuery.toLowerCase()
    return availableHabits.filter(habit =>
      habit.name.toLowerCase().includes(query) ||
      (habit.pillar && PILLAR_CONFIGS[habit.pillar]?.name.toLowerCase().includes(query))
    )
  }, [availableHabits, searchQuery])

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return availableRegularTasks
    const query = searchQuery.toLowerCase()
    return availableRegularTasks.filter(task =>
      task.name.toLowerCase().includes(query) ||
      (task.pillar && PILLAR_CONFIGS[task.pillar]?.name.toLowerCase().includes(query))
    )
  }, [availableRegularTasks, searchQuery])

  const selectedHabits = useMemo(() => {
    return availableHabits.filter(habit => selectedHabitIds.includes(habit.id)).sort((a, b) => {
      // Sort by start time, habits without start time go to the end
      if (!a.startTime && !b.startTime) return 0
      if (!a.startTime) return 1
      if (!b.startTime) return -1
      
      // Convert time strings to comparable format (HH:MM)
      const timeA = a.startTime.padStart(5, '0')
      const timeB = b.startTime.padStart(5, '0')
      return timeA.localeCompare(timeB)
    })
  }, [availableHabits, selectedHabitIds])

  const selectedTasks = useMemo(() => {
    return availableRegularTasks.filter(task => selectedTaskIds.includes(task.id)).sort((a, b) => {
      // Sort by start time, tasks without start time go to the end
      if (!a.startTime && !b.startTime) return 0
      if (!a.startTime) return 1
      if (!b.startTime) return -1
      
      // Convert time strings to comparable format (HH:MM)
      const timeA = a.startTime.padStart(5, '0')
      const timeB = b.startTime.padStart(5, '0')
      return timeA.localeCompare(timeB)
    })
  }, [availableRegularTasks, selectedTaskIds])

  const totalDuration = useMemo(() => {
    const habitsDuration = selectedHabits.reduce((sum, habit) => sum + (habit.duration || 30), 0)
    const tasksDuration = selectedTasks.reduce((sum, task) => sum + (task.duration || 30), 0)
    return habitsDuration + tasksDuration
  }, [selectedHabits, selectedTasks])

  const actualDuration = useMemo(() => {
    if (endTime && startTime) {
      // Calculate duration from start and end times
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
      const duration = endMinutes - startMinutes
      return duration > 0 ? duration : totalDuration
    }
    return totalDuration
  }, [startTime, endTime, totalDuration])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    if (!routineName.trim()) {
      newErrors.name = 'Routine name is required'
    }
    if (selectedHabitIds.length === 0 && selectedTaskIds.length === 0) {
      newErrors.habits = 'Select at least one habit or task'
    }
    if (!startTime) {
      newErrors.time = 'Start time is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    
    // Build routine data without undefined values (Firebase doesn't support them)
    const routineData: any = {
      name: routineName.trim(),
      habitIds: selectedHabitIds,
      startTime,
      color: selectedColor,
      isActive: true
    }
    
    // Add scheduling info
    routineData.repeatFrequency = repeatFrequency
    if (repeatFrequency === 'custom') {
      routineData.customDays = customDays
    }

    // Handle taskIds - always include it to handle removal case
    routineData.taskIds = selectedTaskIds.length > 0 ? selectedTaskIds : []
    
    if (endTime && endTime.trim()) {
      routineData.endTime = endTime.trim()
    }
    
    
    if (editingRoutine && onEditRoutine) {
      onEditRoutine(editingRoutine.id, routineData)
    } else if (onAddRoutine) {
      onAddRoutine(routineData)
    }
    onClose()
  }

  const handleHabitToggle = (habitId: string) => {
    setSelectedHabitIds(prev =>
      prev.includes(habitId)
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    )
    if (errors.habits) {
      setErrors(prev => ({ ...prev, habits: '' }))
    }
  }

  const handleTaskToggle = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
    if (errors.habits) {
      setErrors(prev => ({ ...prev, habits: '' }))
    }
  }

  const handleCustomDayToggle = (dayId: string) => {
    setCustomDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    )
  }

  const handleQuickAddComplete = () => {
    setShowQuickAdd(false)
  }


  const getPillarInfo = (pillarId: string) => {
    return (PILLAR_CONFIGS as any)[pillarId] || { name: 'Other', color: '#6B7280', icon: '📝' }
  }

  if (!isOpen) return null

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.borderSubtle}`
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: colors.text.primary
            }}>
              {editingRoutine ? 'Edit Routine' : 'Add Routine'}
            </h2>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.text.tertiary
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '8px'
              }}>
                Routine Name
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => {
                  setRoutineName(e.target.value)
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                placeholder="e.g. Morning Routine"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.name ? '#EF4444' : colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {errors.name && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#EF4444'
                }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '8px'
              }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  if (errors.time) setErrors(prev => ({ ...prev, time: '' }))
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.time ? '#EF4444' : colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {errors.time && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#EF4444'
                }}>
                  {errors.time}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '12px'
              }}>
                Repeat
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[
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
                      border: repeatFrequency === option.value ? `1px solid ${colors.text.accent}` : `1px solid ${colors.border}`,
                      background: repeatFrequency === option.value 
                        ? `linear-gradient(145deg, rgba(46,125,106,0.08), rgba(46,125,106,0.02))` 
                        : `linear-gradient(145deg, ${colors.surface} 0%, ${colors.surfaceVariant} 100%)`,
                      color: repeatFrequency === option.value ? colors.text.accent : colors.text.secondary,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: repeatFrequency === option.value 
                        ? '0 2px 8px rgba(46,125,106,0.18)' 
                        : 'inset 4px 4px 8px rgba(0,0,0,0.04), inset -4px -4px 8px rgba(255,255,255,0.6)'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '8px'
              }}>
                End Time <span style={{ color: colors.text.tertiary, fontWeight: '400' }}>(optional)</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="Leave empty to calculate from habits"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '11px',
                color: colors.text.tertiary
              }}>
                If not specified, duration will be calculated from selected habits
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                marginBottom: '12px'
              }}>
                Routine Color
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {ROUTINE_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: selectedColor === color ? `3px solid ${color}` : '2px solid transparent',
                      cursor: 'pointer',
                      outline: selectedColor === color ? `2px solid ${colors.background}` : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {(selectedHabits.length > 0 || selectedTasks.length > 0) && (
              <div style={{
                padding: '16px',
                backgroundColor: colors.surfaceVariant,
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <Clock size={16} color={colors.text.tertiary} />
                  <span style={{
                    fontSize: '14px',
                    color: colors.text.tertiary
                  }}>
                    {selectedHabits.length} habits, {selectedTasks.length} tasks • {actualDuration} minutes {endTime ? '(manual)' : '(calculated)'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {selectedHabits.map(habit => {
                    const pillar = getPillarInfo((habit as any).pillar || '')
                    return (
                      <div key={habit.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        backgroundColor: colors.surface,
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: pillar.color
                        }} />
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '14px',
                            color: colors.text.primary,
                            fontWeight: '500'
                          }}>
                            {habit.name}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: colors.text.quaternary,
                            marginLeft: '8px'
                          }}>
                            {(habit as any).duration || 30}m (habit)
                          </span>
                        </div>
                        <button
                          onClick={() => handleHabitToggle(habit.id)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: colors.text.tertiary
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  })}
                  {selectedTasks.map(task => {
                    const pillar = getPillarInfo((task as any).pillar || '')
                    return (
                      <div key={task.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        backgroundColor: colors.surface,
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: pillar.color
                        }} />
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '14px',
                            color: colors.text.primary,
                            fontWeight: '500'
                          }}>
                            {task.name}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: colors.text.quaternary,
                            marginLeft: '8px'
                          }}>
                            {(task as any).duration || 30}m (task)
                          </span>
                        </div>
                        <button
                          onClick={() => handleTaskToggle(task.id)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: colors.text.tertiary
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: colors.text.primary
                }}>
                  Select Habits & Tasks
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setShowQuickAdd(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: colors.text.accent,
                      border: 'none',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                    Add New Item
                  </button>
                </div>
              </div>

              <div style={{
                position: 'relative',
                marginBottom: '12px'
              }}>
                <Search
                  size={18}
                  color={colors.text.tertiary}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search habits & tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text.primary,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                maxHeight: '200px',
                overflow: 'auto',
                border: `1px solid ${errors.habits ? '#EF4444' : colors.borderSubtle}`,
                borderRadius: '8px',
                backgroundColor: colors.surface
              }}>
                {filteredHabits.length === 0 && filteredTasks.length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: colors.text.tertiary,
                    fontSize: '14px'
                  }}>
                    {availableHabits.length === 0 && availableRegularTasks.length === 0
                      ? 'No habits or tasks available. Create some first.'
                      : 'No habits or tasks match your search.'
                    }
                  </div>
                ) : (
                  <>
                    {filteredHabits.length > 0 && (
                      <div>
                        <div style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: colors.text.tertiary,
                          backgroundColor: colors.surfaceVariant,
                          borderBottom: `1px solid ${colors.borderSubtle}`
                        }}>
                          HABITS
                        </div>
                        {filteredHabits.map(habit => {
                          const isSelected = selectedHabitIds.includes(habit.id)
                          const pillar = getPillarInfo((habit as any).pillar || '')
                          return (
                            <div
                              key={habit.id}
                              onClick={() => handleHabitToggle(habit.id)}
                              style={{
                                padding: '12px 16px',
                                borderBottom: `1px solid ${colors.borderSubtle}`,
                                cursor: 'pointer',
                                backgroundColor: isSelected ? `${colors.text.accent}10` : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                border: `2px solid ${isSelected ? colors.text.accent : colors.border}`,
                                backgroundColor: isSelected ? colors.text.accent : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {isSelected && (
                                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                                )}
                              </div>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: `${pillar.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Target size={16} color={pillar.color} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: colors.text.primary,
                                  marginBottom: '2px'
                                }}>
                                  {habit.name}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: colors.text.quaternary
                                }}>
                                  {pillar.name} • {(habit as any).duration || 30}min
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {filteredTasks.length > 0 && (
                      <div>
                        <div style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: colors.text.tertiary,
                          backgroundColor: colors.surfaceVariant,
                          borderBottom: `1px solid ${colors.borderSubtle}`
                        }}>
                          TASKS
                        </div>
                        {filteredTasks.map(task => {
                          const isSelected = selectedTaskIds.includes(task.id)
                          const pillar = getPillarInfo((task as any).pillar || '')
                          return (
                            <div
                              key={task.id}
                              onClick={() => handleTaskToggle(task.id)}
                              style={{
                                padding: '12px 16px',
                                borderBottom: `1px solid ${colors.borderSubtle}`,
                                cursor: 'pointer',
                                backgroundColor: isSelected ? `${colors.text.accent}10` : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                border: `2px solid ${isSelected ? colors.text.accent : colors.border}`,
                                backgroundColor: isSelected ? colors.text.accent : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {isSelected && (
                                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                                )}
                              </div>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: `${pillar.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Target size={16} color={pillar.color} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: colors.text.primary,
                                  marginBottom: '2px'
                                }}>
                                  {task.name}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: colors.text.quaternary
                                }}>
                                  {pillar.name} • {(task as any).duration || 30}min
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
              {errors.habits && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#EF4444'
                }}>
                  {errors.habits}
                </p>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '20px 24px',
            borderTop: `1px solid ${colors.borderSubtle}`
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.text.tertiary,
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!routineName.trim() || (selectedHabitIds.length === 0 && selectedTaskIds.length === 0)}
              style={{
                flex: 2,
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: colors.text.accent,
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: (selectedHabitIds.length === 0 && selectedTaskIds.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (selectedHabitIds.length === 0 && selectedTaskIds.length === 0) ? 0.5 : 1
              }}
            >
              {editingRoutine ? 'Update Routine' : 'Create Routine'}
            </button>
          </div>
        </div>
      </div>

      {showQuickAdd && (
        <QuickAddModal
          isOpen={showQuickAdd}
          onClose={handleQuickAddComplete}
          onAddTask={onAddTask}
          editingTask={null}
          onEditTask={undefined}
        />
      )}
    </>
  )
}

export default RoutineModal