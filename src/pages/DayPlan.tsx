import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical, Zap, Play, Clock4, Plus, Timer, CheckCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import TaskItem from '../components/TaskItem'
import QuickAddModal from '../components/QuickAddModal'
import RoutineModal from '../components/RoutineModal'
import AddFromLibraryModal from '../components/AddFromLibraryModal'
import type { Task, UserStats, Goal, Routine, DailyModification } from '../types'
import { nanoid } from 'nanoid'



interface DayPlanProps {
  tasks: Task[]
  userStats: UserStats
  goals?: Goal[]
  routines?: Routine[]
  dailyModifications?: DailyModification[]
  onToggleTask: (taskId: string, date?: string) => void
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onEditTask: (taskId: string, task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onDeleteTask: (taskId: string) => void
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  onAddRoutine?: (routine: Omit<Routine, 'id'>) => void
  onEditRoutine?: (routineId: string, routine: Omit<Routine, 'id'>) => void
  onDeleteRoutine?: (routineId: string) => void
  onAddModification?: (modification: Omit<DailyModification, 'id'>) => void
}

function DayPlan({ tasks, goals = [], routines = [], dailyModifications = [], onToggleTask, onAddTask, onEditTask, onDeleteTask, onAddGoal, onAddRoutine, onEditRoutine, onDeleteRoutine, onAddModification }: DayPlanProps) {
  const { colors } = useTheme()
  
  // Debug logging
  console.log('🎯 DayPlan render:', {
    tasks: tasks.length,
    routines: routines.length,
    dailyModifications: dailyModifications.length,
    onAddModification: !!onAddModification,
    modificationsData: dailyModifications
  });
  // currentDateLabel retained previously; no longer used in single-line header
  // const [currentDateLabel, setCurrentDateLabel] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [prefilledStartTime, setPrefilledStartTime] = useState<string>('')
  const [prefilledDate, setPrefilledDate] = useState<string>('')
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [freeSlotMenuFor, setFreeSlotMenuFor] = useState<string | null>(null)
  const [freeSlotMenuPosition, setFreeSlotMenuPosition] = useState({ top: 0, right: 0 })
  const [routineMenuFor, setRoutineMenuFor] = useState<string | null>(null)
  const [habitMenuFor, setHabitMenuFor] = useState<string | null>(null);
  const routineMenuRef = useRef<HTMLDivElement>(null)
  const habitMenuRef = useRef<HTMLDivElement>(null);
  const freeSlotMenuRef = useRef<HTMLDivElement>(null)
  const freeSlotButtonRef = useRef<HTMLButtonElement>(null)
  const speedDialRef = useRef<HTMLDivElement>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [dayStartTime, setDayStartTime] = useState<string>('07:30')
  const [hoveredFreeSlotId, setHoveredFreeSlotId] = useState<string | null>(null)
  const [showAddFromLibrary, setShowAddFromLibrary] = useState(false)

  const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return target > today;
  };
  const isFuture = isFutureDate(selectedDate)
  
  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (routineMenuFor && routineMenuRef.current && !routineMenuRef.current.contains(event.target as Node)) {
        setRoutineMenuFor(null)
      }
      if (freeSlotMenuFor && freeSlotMenuRef.current && !freeSlotMenuRef.current.contains(event.target as Node)) {
        setFreeSlotMenuFor(null)
      }
      if (habitMenuFor && habitMenuRef.current && !habitMenuRef.current.contains(event.target as Node)) {
        setHabitMenuFor(null);
      }
      if (speedDialOpen && speedDialRef.current && !speedDialRef.current.contains(event.target as Node)) {
        setSpeedDialOpen(false)
      }
    }

    if (routineMenuFor || freeSlotMenuFor || speedDialOpen || habitMenuFor) {
      // Use a small delay to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }
  }, [routineMenuFor, freeSlotMenuFor, speedDialOpen, habitMenuFor])

  

  // Add this state for UI feedback
  const [futureDateMessage, setFutureDateMessage] = useState<string | null>(null);

  // Auto-clear message
  useEffect(() => {
    if (futureDateMessage) {
      const id = setTimeout(() => setFutureDateMessage(null), 2000);
      return () => clearTimeout(id);
    }
  }, [futureDateMessage]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowQuickAdd(true)
  }

  const handleEditRoutine = (routine: Routine) => {
    // For added routines, we need to handle them specially
    const isAddedRoutine = routine.id.startsWith('mod-')
    if (isAddedRoutine) {
      // Get the original routine but preserve the modified start time
      const originalId = routine.id.split('-')[2]
      const originalRoutine = routines.find(r => r.id === originalId)
      if (originalRoutine) {
        setEditingRoutine({
          ...originalRoutine,
          startTime: routine.startTime,
          // Mark this as a modified routine for special handling
          id: routine.id // Keep the modified ID so we know to update the modification
        })
      }
    } else {
      setEditingRoutine(routine)
    }
    setShowRoutineModal(true)
  }

  const handleEditRoutineSubmit = (routineId: string, routineData: Omit<Routine, 'id'>) => {
    const isModifiedRoutine = routineId.startsWith('mod-')
    
    if (isModifiedRoutine) {
      // This is an added routine - update the modification
      const originalId = routineId.split('-')[2]
      
      // Find the existing modification and update it
      if (onAddModification) {
        onAddModification({
          date: selectedDate.toISOString().split('T')[0],
          itemId: originalId,
          itemType: 'routine' as const,
          modification: { 
            status: 'added' as const,
            startTime: routineData.startTime
          }
        });
      }
    } else {
      // This is a regular routine - update it normally
      if (onEditRoutine) {
        onEditRoutine(routineId, routineData)
      }
    }
  }

  const handleCloseModals = () => {
    setShowQuickAdd(false)
    setEditingTask(null)
    setPrefilledStartTime('')
    setPrefilledDate('')
    setShowRoutineModal(false)
    setEditingRoutine(null)
    setFreeSlotMenuFor(null)
    setRoutineMenuFor(null)
    setShowAddFromLibrary(false)
  }

  const handleAddItemFromLibrary = (item: { id: string, type: 'task' | 'routine' }, startTime?: string) => {
    console.log('🔵 handleAddItemFromLibrary called:', { item, startTime, onAddModification: !!onAddModification });
    if (onAddModification) {
      const modification = {
        date: selectedDate.toISOString().split('T')[0],
        itemId: item.id,
        itemType: item.type,
        instanceId: nanoid(), // ← UNIQUE INSTANCE ID
        modification: { 
          status: 'added' as const,
          ...(startTime && { startTime })
        }
      };
      console.log('🔵 Calling onAddModification with:', modification);
      onAddModification(modification);
    } else {
      console.log('🔴 onAddModification is not available');
    }
    setShowAddFromLibrary(false);
  }

  // Calendar helpers
  // Note: Previously had a generic getDayId helper; in this compact version we inline where needed.

  // Time helpers
  const timeToMinutes = (timeStr: string): number => {
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

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
  }

  const convertTo24Hour = (displayTime: string): string => {
    const [time, period] = displayTime.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    let hour24 = hours
    if (period === 'PM' && hours !== 12) hour24 += 12
    if (period === 'AM' && hours === 12) hour24 = 0
    const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    return result
  }

  const formatDisplayTime = (time24: string): string => {
    const [hStr, mStr] = time24.split(':')
    const h = parseInt(hStr, 10)
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    return `${displayHour}:${mStr} ${period}`
  }

  // Build timeline for selected day
  interface TimelineEvent { id: string; type: 'task' | 'routine' | 'freeTime' | 'dayEnd'; 
    time: string; 
    task?: Task; 
    routine?: Routine; 
    habits?: Task[]; 
    startTime?: string; 
    endTime?: string;
    unscheduledHabits?: Task[];
  }
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []
    const getTaskDuration = (task: Task): number => task.duration !== undefined ? task.duration : 30
    const iso = selectedDate.toISOString().split('T')[0]
    const selectedDayId = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][selectedDate.getDay()]

    const modificationsForDay = dailyModifications.filter(m => m.date === iso)
    // Build set of skipped IDs: for scheduled items → itemId; for added → instanceId
    const skippedIds = new Set<string>();
    modificationsForDay
      .filter(m => m.modification.status === 'skipped')
      .forEach(m => {
        if (m.instanceId) {
          skippedIds.add(m.instanceId); // skip specific instance
        } else {
          skippedIds.add(m.itemId); // skip scheduled item
        }
      });
    const addedModifications = modificationsForDay.filter(m => m.modification.status === 'added');
    
    console.log('📅 Timeline generation debug:', {
      iso,
      totalModifications: dailyModifications.length,
      modificationsForDay: modificationsForDay.length,
      skippedItemIds: Array.from(skippedIds),
      addedModifications: addedModifications.length,
      modificationsForDayData: modificationsForDay
    });

    // Routines → add as a single event composed of its habits and tasks
    const routineHabitIds = new Set((routines ?? []).flatMap(r => r.habitIds))
    const routineTaskIds = new Set((routines ?? []).flatMap(r => r.taskIds || []))

    const scheduledRoutines = (routines ?? []).filter(routine => {
      if (routine.repeatFrequency === 'daily') return true
      if (routine.repeatFrequency === 'custom' && routine.customDays?.includes(selectedDayId)) return true
      return false
    })

  // Added Routines (from modifications)
  const addedRoutines = addedModifications
    .filter(mod => mod.itemType === 'routine')
    .map(mod => {
      const routine = routines.find(r => r.id === mod.itemId);
      if (!routine) return null;
      return {
        ...routine,
        id: mod.instanceId || `mod-${mod.id}-${routine.id}`, // Use instanceId as timeline ID
        startTime: mod.modification.startTime || routine.startTime || '09:00',
        _isAddedInstance: true,
        _originalId: routine.id,
        _instanceId: mod.instanceId || mod.id
      };
    })
    .filter((r): r is Routine & { _isAddedInstance: true; _originalId: string; _instanceId: string } => r !== null);


    const allRoutinesForDay = [...scheduledRoutines, ...addedRoutines]

    allRoutinesForDay.forEach(routine => {
      // Check if this routine (or its original ID if it's an added routine) is skipped
      const checkId = routine.id.startsWith('mod-') ? routine.id.split('-').slice(-1)[0] : routine.id
      if (skippedIds.has(checkId)) return
      // Get both habits and tasks for the routine, filtering out skipped ones
      const routineHabits = tasks.filter(t => {
        if (!routine.habitIds.includes(t.id)) return false;
        // Check if this specific habit is skipped for today
        if (skippedIds.has(t.id)) return false; // ← scheduled habit skip
      return true;
      }).map(habit => {
        // Check completion based on selected date for habits in routines
        const completionDates = Array.isArray(habit.completionDates) ? habit.completionDates : []
        return {
          ...habit,
          completed: completionDates.includes(iso)
        }
      })
      
      const routineTasks = tasks.filter(t => {
        if (!routine.taskIds?.includes(t.id)) return false;
        // Check if this specific task is skipped for today
        if (skippedIds.has(t.id)) return false; // ← scheduled habit skip
        return true;
      }).map(task => {
        // For one-time tasks, check if completed on the selected date
        return {
          ...task,
          completed: task.completed || false
        }
      })
      
      const allRoutineItems = [...routineHabits, ...routineTasks].sort((a, b) => {
        // Sort by start time, items without start time go to the end
        if (!a.startTime && !b.startTime) return 0
        if (!a.startTime) return 1
        if (!b.startTime) return -1
        
        // Convert time strings to comparable format (HH:MM)
        const timeA = a.startTime.padStart(5, '0')
        const timeB = b.startTime.padStart(5, '0')
        return timeA.localeCompare(timeB)
      })
      
      if (!allRoutineItems.length) return
      const startMin = timeToMinutes(routine.startTime)
      const startDisp = new Date(`2000-01-01T${routine.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      
      // Use provided endTime if available, otherwise calculate from habits and tasks
      let endTimeStr: string
      if (routine.endTime) {
        endTimeStr = new Date(`2000-01-01T${routine.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      } else {
        const total = allRoutineItems.reduce((s, item) => s + (item.duration || 30), 0)
        endTimeStr = minutesToTime(startMin + total)
      }
      
      events.push({
        id: `routine-${routine.id}`,
        type: 'routine',
        time: startDisp,
        startTime: startDisp,
        endTime: endTimeStr,
        routine,
        habits: allRoutineItems
      })
    })

    // Added Tasks (from modifications)
  const addedTasks: (Task & { _isAddedInstance: true; _originalId: string; _instanceId: string, _modificationId: string })[] = addedModifications
    .filter(mod => mod.itemType === 'task')
    .map(mod => {
      const task = tasks.find(t => t.id === mod.itemId);
      if (!task || !task.id) return null;
      const isCompleted = mod.modification.completed === true;
      return {
        ...task,
        id: mod.instanceId || `mod-${mod.id}-${task.id}`,
        reminderTime: mod.modification.startTime || task.reminderTime || '09:00',
        reminderDate: iso,
        repeatFrequency: 'once' as const,
        completed: isCompleted, // ← use instance-level completion
        _isAddedInstance: true,
        _originalId: task.id,
        _instanceId: mod.instanceId || mod.id,
        _modificationId: mod.id // ← store mod ID for toggling
      } as Task & { _isAddedInstance: true; _originalId: string; _instanceId: string, _modificationId: string };
    })
  .filter((t): t is Task & { _isAddedInstance: true; _originalId: string; _instanceId: string, _modificationId: string } => t !== null);

    const scheduledTasks = tasks.filter(task => {
      if (skippedIds.has(task.id)) return false
      if (!task.reminderTime ) return false
      if (routineHabitIds.has(task.id)) return false
      if (routineTaskIds.has(task.id)) return false
      if (task.repeatFrequency === 'once') return task.reminderDate === iso
      if (task.repeatFrequency === 'custom' && task.customDays && task.customDays.length > 0) return task.customDays.includes(selectedDayId)
      return true
    })

    const allTasksForDay = [...scheduledTasks, ...addedTasks]

    const sortedTasks = allTasksForDay.sort((a, b) => timeToMinutes(a.reminderTime!) - timeToMinutes(b.reminderTime!))
    sortedTasks.forEach((task, idx) => {
      // For habits, check completion based on selected date
      let taskForDay: Task = task;
      // Preserve unique ID and completion for added instances
      if ((task as any)._isAddedInstance) {
        // Added instance → treat as one-time task with its own completed state
        taskForDay = {
          ...task,
          repeatFrequency: 'once',
          completed: task.completed || false, // ← will be wrong, but at least shows all instances
        };
      } else {
        // Scheduled habit → use completionDates
        const isHabit = Boolean(task.challengeDuration || task.repeatFrequency !== 'once');
        if (isHabit) {
          const completionDates = Array.isArray(task.completionDates) ? task.completionDates : [];
          taskForDay = {
            ...task,
            completed: completionDates.includes(iso),
          };
        }
      }

      const startTime = timeToMinutes(taskForDay.reminderTime!)
      const endTimeMin = startTime + getTaskDuration(taskForDay)
      const uniqueId = (task as any)._instanceId 
        ? `inst-${(task as any)._instanceId}` 
        : `${task.id}-${task.reminderTime || 'no-time'}-${idx}`;
      events.push({
        id: `task-${uniqueId}`,
        type: 'task',
        time: new Date(`2000-01-01T${taskForDay.reminderTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        task: taskForDay,
        startTime: new Date(`2000-01-01T${taskForDay.reminderTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        endTime: minutesToTime(endTimeMin)
      })
    })

    const dayStartMinutes = timeToMinutes(dayStartTime)
    const dayEndMinutes = 24 * 60

    if (events.length === 0) {
      const startDisp = formatDisplayTime(dayStartTime)
      events.push({ id: 'free-1', type: 'freeTime', time: startDisp, startTime: startDisp, endTime: minutesToTime(dayEndMinutes) })
    } else {
      // Ensure events are sorted first
      events.sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!))
      const firstTaskStart = timeToMinutes(events[0].startTime!)
      if (firstTaskStart > dayStartMinutes) {
        const startDisp = formatDisplayTime(dayStartTime)
        events.unshift({ id: 'free-before', type: 'freeTime', time: startDisp, startTime: startDisp, endTime: events[0].startTime! })
      }
      for (let i = 0; i < events.length - 1; i++) {
        const currentTaskEnd = timeToMinutes(events[i].endTime!)
        const nextTaskStart = timeToMinutes(events[i + 1].startTime!)
        if (nextTaskStart > currentTaskEnd) {
          events.splice(i + 1, 0, { id: `free-${i}`, type: 'freeTime', time: events[i].endTime!, startTime: events[i].endTime!, endTime: events[i + 1].startTime! })
          i++
        }
      }
      const lastTaskEnd = timeToMinutes(events[events.length - 1].endTime!)
      if (lastTaskEnd < dayEndMinutes) {
        events.push({ id: 'free-after', type: 'freeTime', time: events[events.length - 1].endTime!, startTime: events[events.length - 1].endTime!, endTime: minutesToTime(dayEndMinutes) })
      }
    }
    // Add day end marker for visual closure
    events.push({ id: 'day-end', type: 'dayEnd', time: minutesToTime(dayEndMinutes) })

    // --- UNSCHEDULED HABITS SECTION ---
    const unscheduledHabits = tasks.filter(task => {
      // Must be a habit (not one-time task)
      const isHabit = task.repeatFrequency !== 'once' || Boolean(task.challengeDuration);
      // Must not be part of any routine
      const isInRoutine = routineHabitIds.has(task.id) || routineTaskIds.has(task.id);
      // Must have no reminderTime (unscheduled)
      const isUnscheduled = !task.reminderTime;
      // Must not be skipped as a scheduled item
      const isSkipped = skippedIds.has(task.id);
      return isHabit && !isInRoutine && isUnscheduled && !isSkipped;
    }).map(task => ({
      ...task,
      // Treat as today's instance with no time
      id: `unsched-${task.id}-${iso}`, // unique per day
      _isUnscheduled: true,
      reminderDate: iso,
      completed: Array.isArray(task.completionDates) 
        ? task.completionDates.includes(iso) 
        : false,
        _originalId: task.id
    }));

    // Add unscheduled habits as a special event group
    if (unscheduledHabits.length > 0) {
      events.push({
        id: 'unscheduled-habits',
        type: 'freeTime', // reuse styling
        time: 'Unscheduled',
        startTime: '',
        endTime: '',
        unscheduledHabits
      });
}
    return events
  }, [tasks, routines, dailyModifications, selectedDate, dayStartTime])

  // Next Up computation
  const nextUp = useMemo(() => {
    const now = new Date()
    const isSameDay = selectedDate.toDateString() === now.toDateString()
    const minutesNow = now.getHours() * 60 + now.getMinutes()
    const eventsSorted = [...timelineEvents].sort((a,b) => timeToMinutes(a.startTime || a.time) - timeToMinutes(b.startTime || b.time))
    if (!isSameDay || eventsSorted.length === 0) return null
    for (const e of eventsSorted) {
      const start = timeToMinutes(e.startTime || e.time)
      if (start < minutesNow) continue
      // Only show for simple tasks, not habits or routines or freeTime/dayEnd
      if (e.type === 'task' && e.task) {
        const isHabit = Boolean(e.task.challengeDuration || e.task.repeatFrequency !== 'once')
        if (!isHabit) return e
      }
      // Otherwise continue searching
    }
    return null
  }, [timelineEvents, selectedDate])

  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const minutesNow = new Date().getHours() * 60 + new Date().getMinutes()
  const firstFutureIndex = useMemo(() => {
    if (!isToday) return -1
    return timelineEvents.findIndex(e => {
      const start = timeToMinutes(e.startTime || e.time)
      return start >= minutesNow
    })
  }, [timelineEvents, isToday])

  // Routine card UI (expanded)
  const RoutineCard = ({ routine, habits }: { routine: Routine; habits: Task[] }) => {
    const completed = habits.filter(h => h.completed).length
    const progress = habits.length ? (completed / habits.length) * 100 : 0
    // Calculate duration
    const startMinutes = timeToMinutes(routine.startTime);
    let durationMinutes: number;

    if (routine.endTime) {
      const endMinutes = timeToMinutes(routine.endTime);
      durationMinutes = endMinutes - startMinutes;
      if (durationMinutes <= 0) {
        durationMinutes = habits.reduce((sum, item) => sum + (item.duration || 30), 0);
      }
    } else {
      durationMinutes = habits.reduce((sum, item) => sum + (item.duration || 30), 0);
    }
    const isAdded = routine.id.startsWith('mod-');
    const originalId = isAdded ? routine.id.split('-').slice(-1)[0] : routine.id;

    return (
      <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: '16px', border: `2px solid ${routine.color}20`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: `${routine.color}20` }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: routine.color, transition: 'width .2s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${routine.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color={routine.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.text.primary }}>{routine.name}</div>
            <div style={{ margin: 0, fontSize: 13, color: colors.text.tertiary }}>{completed}/{habits.length} completed • {durationMinutes}m</div>
          </div>
          <button onClick={() => setRoutineMenuFor(prev => prev === routine.id ? null : routine.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: 'none', color: colors.text.tertiary, position: 'relative' }}>
            <MoreVertical size={16} />
          </button>
          {routineMenuFor === routine.id && (
            <div ref={routineMenuRef} style={{ position: 'absolute', right: 40, top: 8, background: colors.surface, border: `1px solid ${colors.borderSubtle}`, borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.2)', zIndex: 1000, minWidth: '100px' }}>
              <button onClick={() => { 
                handleEditRoutine(routine);
                setRoutineMenuFor(null) 
              }} style={{ display: 'block', padding: '8px 12px', border: 'none', background: 'transparent', color: colors.text.primary, width: '100%', textAlign: 'left', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => {
                console.log('🟠 Routine skip called:', { originalId, onAddModification: !!onAddModification });
                if (onAddModification) {
                  const modification = {
                    date: selectedDate.toISOString().split('T')[0],
                    itemId: originalId,
                    itemType: 'routine' as const,
                    modification: { status: 'skipped' as const }
                  };
                  console.log('🟠 Calling onAddModification for routine skip:', modification);
                  onAddModification(modification);
                } else {
                  console.log('🔴 onAddModification not available for routine skip');
                }
                setRoutineMenuFor(null);
              }} style={{ display: 'block', padding: '8px 12px', border: 'none', background: 'transparent', color: '#EF4444', width: '100%', textAlign: 'left', cursor: 'pointer' }}>Skip today</button>
              <button onClick={() => { if (confirm('Delete this routine?')) { if (onDeleteRoutine) { onDeleteRoutine(originalId) } } setRoutineMenuFor(null) }} style={{ display: 'block', padding: '8px 12px', border: 'none', background: 'transparent', color: '#EF4444', width: '100%', textAlign: 'left', cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {habits.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', backgroundColor: colors.surfaceVariant, borderRadius: 8 }}>
              <button 
                onClick={() => {
                  if (isFuture) return; // 🔒 BLOCK FUTURE
                  const dateStr = selectedDate.toISOString().split('T')[0]
                  onToggleTask(h.id, dateStr)
                }} 
                style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: h.completed ? colors.text.accent : colors.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {h.completed ? '✓' : ''}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ color: h.completed ? colors.text.tertiary : colors.text.primary, fontSize: 14, fontWeight: 500, textDecoration: h.completed ? 'line-through' : 'none' }}>{h.name}</div>
              </div>
              <button onClick={(e) => {
                  e.stopPropagation();
                  setHabitMenuFor(habitMenuFor === h.id ? null : h.id);
                }} style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none', color: colors.text.tertiary, position: 'relative' }}>
                <MoreVertical size={16} />
              </button>
              {habitMenuFor === h.id && (
                <div ref={habitMenuRef} style={{ position: 'absolute', right: 40, top: '100%', background: colors.surface, border: `1px solid ${colors.borderSubtle}`, borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.2)', zIndex: 1001, minWidth: '100px' }}>
                  <button onClick={() => {
                    console.log('🟡 Habit skip called:', { habitId: h.id, onAddModification: !!onAddModification });
                    if (onAddModification) {
                      const modification = {
                        date: selectedDate.toISOString().split('T')[0],
                        itemId: h.id,
                        itemType: 'task' as const, // Habits are stored as tasks
                        modification: { status: 'skipped' as const }
                      };
                      console.log('🟡 Calling onAddModification for habit skip:', modification);
                      onAddModification(modification);
                    }
                    setHabitMenuFor(null);
                  }} style={{ display: 'block', padding: '8px 12px', border: 'none', background: 'transparent', color: '#EF4444', width: '100%', textAlign: 'left', cursor: 'pointer' }}>Skip today</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Collapsed routine row removed

  // 5-day navigation centered around selected date
  const navDays = useMemo(() => [-2,-1,0,1,2].map(offset => { const d = new Date(selectedDate); d.setDate(selectedDate.getDate() + offset); return d }), [selectedDate])
  const goPrevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() - 1); return n })
  const goNextDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() + 1); return n })
  // Helper retained for potential future use; not needed now

  return (
    <div style={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.background,
      color: colors.text.primary
    }}>
      {/* Header: single-line month and Start time */}
      <div style={{ 
        padding: '16px',
        paddingTop: '80px',
        paddingBottom: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="headline-large" style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '-0.2px', color: colors.text.primary, margin: 0 }}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.text.tertiary, fontSize: '14px' }}>Start:</span>
            <input type="time" value={dayStartTime} onChange={(e) => setDayStartTime(e.target.value)} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '4px 8px', color: colors.text.primary, fontSize: '14px', outline: 'none' }} />
          </div>
        </div>
        {/* Day strip with arrows on the sides */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <button aria-label="Previous day" onClick={goPrevDay} style={{ background: colors.surface, border: `1px solid ${colors.borderSubtle}`, color: colors.text.primary, borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer' }}>‹</button>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px', flex: 1 }}>
            {navDays.map((d, idx) => {
              const isSelected = d.toDateString() === selectedDate.toDateString()
              const isToday = d.toDateString() === new Date().toDateString()
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  aria-current={isToday ? 'date' : undefined}
                  title={d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  style={{ minWidth: '64px', padding: '8px 6px', borderRadius: '10px', border: isSelected ? `2px solid ${colors.text.accent}` : `1px solid ${colors.borderSubtle}`, background: isSelected ? '#10B98120' : colors.surface, color: colors.text.primary, cursor: 'pointer' }}>
                  <div style={{ fontSize: '12px', color: colors.text.tertiary, marginBottom: '2px' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{d.getDate()}</div>
                  {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.text.accent, margin: '4px auto 0' }} />}
                </button>
              )
            })}
          </div>
          <button aria-label="Next day" onClick={goNextDay} style={{ background: colors.surface, border: `1px solid ${colors.borderSubtle}`, color: colors.text.primary, borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer' }}>›</button>
        </div>
      </div>

      {/* Single-day timeline content with swipe navigation */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingBottom: '88px'
      }}
        onTouchStart={(e) => setTouchStartX(e.changedTouches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return
          const dx = e.changedTouches[0].clientX - touchStartX
          if (dx > 40) goPrevDay()
          if (dx < -40) goNextDay()
          setTouchStartX(null)
        }}
      >
        {/* Next Up sticky header */}
        {nextUp && (
          <div style={{ position: 'sticky', top: 0, zIndex: 5, paddingTop: 8, paddingBottom: 8, marginBottom: 6, 
            background: 'transparent',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, 
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: `1px solid ${colors.borderSubtle}`,
              borderRadius: 12, padding: '8px 10px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}>
              <Clock4 size={16} color={colors.text.accent} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 1 }}>Next up</div>
                <div style={{ fontSize: 14, color: colors.text.primary, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nextUp.type === 'task' && nextUp.task ? nextUp.task.name : nextUp.type === 'routine' && nextUp.routine ? nextUp.routine.name : 'Free time'}
                </div>
                <div style={{ fontSize: 12, color: colors.text.tertiary }}>{nextUp.startTime} {nextUp.endTime ? `• ${nextUp.endTime}` : ''}</div>
              </div>
              <button style={{ padding: '8px 10px', borderRadius: 8, background: colors.text.accent, color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'transform .15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Play size={14} /> Start
              </button>
              <button style={{ padding: '8px 10px', borderRadius: 8, background: colors.surfaceVariant, color: colors.text.primary, border: `1px solid ${colors.borderSubtle}`, cursor: 'pointer', transition: 'background-color .15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.surface }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.surfaceVariant }}
              >Snooze 30m</button>
            </div>
          </div>
        )}
        

        {timelineEvents.length === 0 ? (
          <div className="md-card" style={{ padding: '24px', textAlign: 'center', backgroundColor: colors.surface }}>
            <p className="body-large" style={{ color: colors.text.tertiary }}>No tasks for this day</p>
            <button onClick={() => { setEditingTask(null); setPrefilledStartTime(''); setPrefilledDate(selectedDate.toISOString().split('T')[0]); setShowQuickAdd(true) }} style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: colors.text.accent, color: '#fff', cursor: 'pointer' }}>Add one</button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline vertical line */}
            <div style={{ position: 'absolute', left: '76px', top: '0', bottom: '0', width: '1px', backgroundColor: colors.borderSubtle, zIndex: 1 }} />

            {timelineEvents.map((event, idx) => {
              const startMin = timeToMinutes(event.startTime || event.time)
              const endMin = event.endTime ? timeToMinutes(event.endTime) : startMin
              const isPast = isToday && endMin < minutesNow && event.type !== 'dayEnd'
              const isCardEvent = (e: typeof event) => e.type === 'task' || e.type === 'freeTime' || e.type === 'routine'
              const prev = idx > 0 ? timelineEvents[idx - 1] : null
              const next = idx < timelineEvents.length - 1 ? timelineEvents[idx + 1] : null
              const prevIsCard = prev ? isCardEvent(prev) : false
              const nextIsCard = next ? isCardEvent(next) : false
              return (
              <div key={event.id}
                style={{ display: 'flex', alignItems: event.type === 'routine' ? 'flex-start' : 'center', minHeight: event.type === 'routine' ? undefined : `${56}px`, marginBottom: 0, position: 'relative', zIndex: 2, opacity: isPast ? 0.7 : 1 }}
              >
                {/* Time marker */}
                <div style={{ width: '76px', display: 'flex', justifyContent: 'flex-end', paddingRight: '10px', flexShrink: 0 }}>
                  <span style={{ color: colors.text.primary, fontSize: '12px', fontWeight: 600, backgroundColor: colors.surface, padding: '4px 8px', borderRadius: '999px', border: `1px solid ${colors.borderSubtle}`, boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.02)' }}>{event.time}</span>
                </div>
                {/* Dot */}
                {event.type !== 'dayEnd' && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: event.type === 'task' ? colors.text.accent : event.type === 'routine' ? '#F59E0B' : colors.text.tertiary, border: `2px solid ${colors.background}`, position: 'absolute', left: '72px', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }} />
                )}
                {/* Content */}
                <div style={{ flex: 1, paddingLeft: '18px' }}>
                  {isToday && idx === firstFutureIndex && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ height: 1, background: colors.borderSubtle, flex: 1 }} />
                      <span style={{ fontSize: 11, color: colors.text.tertiary }}>Now</span>
                      <div style={{ height: 1, background: colors.borderSubtle, flex: 1 }} />
                    </div>
                  )}
                  {/* Unified card container per event */}
                  {event.type === 'task' && event.task ? (
                    <div
                      style={{
                        background: colors.surface,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: 12,
                        borderTopLeftRadius: prevIsCard ? 6 : 12,
                        borderTopRightRadius: prevIsCard ? 6 : 12,
                        borderBottomLeftRadius: nextIsCard ? 6 : 12,
                        borderBottomRightRadius: nextIsCard ? 6 : 12,
                        padding: '6px 8px',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                        transition: 'transform .15s ease, box-shadow .15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.08)' }}
                    >
                      {!(event.task.challengeDuration || event.task.repeatFrequency !== 'once') && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: colors.text.tertiary, background: colors.background, border: `1px solid ${colors.borderSubtle}`, borderRadius: 999, padding: '2px 6px' }}>
                            <Clock4 size={12} /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                          </span>
                          {event.task.completed && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10B981', background: '#10B98115', border: '1px solid #10B98140', borderRadius: 999, padding: '2px 6px' }}>
                              <CheckCircle size={12} /> Done
                            </span>
                          )}
                        </div>
                      )}
                      <TaskItem 
                        task={event.task} 
                        isFutureDate={isFuture}
                        onToggleComplete={(taskId) => {
                          if (isFuture) return;

                          const dateStr = selectedDate.toISOString().split('T')[0];
                          // Find the modification for this instance
                          const mod = dailyModifications.find(m => 
                            m.instanceId === taskId || 
                            m.id === (event.task as any)._modificationId
                          );

                          if (mod && mod.itemType === 'task') {
                            // Toggle instance completion via dailyModifications
                            if (onAddModification) {
                              onAddModification({
                                date: dateStr,
                                itemId: mod.itemId,
                                itemType: 'task',
                                instanceId: mod.instanceId,
                                modification: {
                                  ...mod.modification,
                                  completed: !mod.modification.completed
                                }
                              });
                            }
                          } else {
                            // Toggle original habit (scheduled version)
                            const originalId = taskId.startsWith('unsched-')
                              ? taskId.split('-')[1]
                              : taskId;
                            onToggleTask(originalId, dateStr);
                          }
                        }}
                        onEdit={handleEditTask} 
                        onDelete={onDeleteTask} 
                        onSkip={(taskId) => {
                          if (!onAddModification) return;

                          let originalId = taskId;
                          let instanceId: string | undefined;

                          // Handle unscheduled (shouldn't happen here, but safe)
                          if (taskId.startsWith('unsched-')) {
                            originalId = taskId.split('-')[1];
                          }
                          // Handle mod-prefixed fallback IDs
                          else if (taskId.startsWith('mod-')) {
                            const parts = taskId.split('-');
                            originalId = parts[parts.length - 1];
                          }
                          // Handle raw nanoid instance IDs (most common for added tasks)
                          else {
                            const mod = dailyModifications.find(m => m.instanceId === taskId);
                            if (mod) {
                              originalId = mod.itemId;
                              instanceId = mod.instanceId;
                            }
                            // else: assume it's a real scheduled task ID → originalId = taskId
                          }

                          onAddModification({
                            date: selectedDate.toISOString().split('T')[0],
                            itemId: originalId,
                            itemType: 'task',
                            ...(instanceId && { instanceId }), // only include if it exists
                            modification: { status: 'skipped' }
                          });
}}
                        showTime={false} 
                        hideTypePill 
                        variant="flat"
                      />
                    </div>
                  ) : event.type === 'routine' && event.routine && event.habits ? (
                    <RoutineCard routine={event.routine} habits={event.habits} />
                  ) : event.type === 'freeTime' ? (event.unscheduledHabits ? (
                    // ── UNSCHEDULED HABITS SECTION ──
                        <div style={{ 
                          background: colors.surface, 
                          borderRadius: 12, 
                          padding: '12px', 
                          border: `1px solid ${colors.borderSubtle}` 
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: colors.text.primary }}>
                            Unscheduled Tasks
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {event.unscheduledHabits.map(habit => (
                              <TaskItem
                                key={habit.id}
                                task={habit}
                                isFutureDate={isFuture}
                                onToggleComplete={(taskId) => {
                                  if (isFuture) return;
                                  
                                  const dateStr = selectedDate.toISOString().split('T')[0];
                                  let originalId = taskId;

                                  if (taskId.startsWith('unsched-')) {
                                    originalId = taskId.split('-')[1]; // ✅ 'habit123'
                                  } else if (taskId.startsWith('mod-')) {
                                    const parts = taskId.split('-');
                                    originalId = parts[parts.length - 1]; // ✅ last segment = original task ID
                                  } else {
                                    // Handle raw nanoid instanceId (no prefix)
                                    const mod = dailyModifications.find(m => m.instanceId === taskId);
                                    if (mod) {
                                      originalId = mod.itemId;
                                    }
                                  }

                                  onToggleTask(originalId, dateStr);
                                }}
                                onEdit={handleEditTask}
                                onDelete={onDeleteTask}
                                onSkip={(taskId) => {
                                  const originalId = taskId.startsWith('unsched-')
                                    ? taskId.split('-')[1]
                                    : taskId;
                                  if (onAddModification) {
                                    onAddModification({
                                      date: selectedDate.toISOString().split('T')[0],
                                      itemId: originalId,
                                      itemType: 'task',
                                      modification: { status: 'skipped' }
                                    });
                                  }
                                }}
                                showTime={false}
                                hideTypePill
                                variant="flat"
                              />
                            ))}
                          </div>
                        </div>
                  ) :(
                    <div
                      onMouseEnter={() => setHoveredFreeSlotId(event.id)}
                      onMouseLeave={() => setHoveredFreeSlotId(prev => prev === event.id ? null : prev)}
                      onClick={() => setHoveredFreeSlotId(event.id)}
                      style={{
                        background: `linear-gradient(180deg, ${colors.surface}AA, ${colors.surface}60)`,
                        border: `1.5px dashed ${colors.border}`,
                        borderRadius: 12,
                        borderTopLeftRadius: prevIsCard ? 6 : 12,
                        borderTopRightRadius: prevIsCard ? 6 : 12,
                        borderBottomLeftRadius: nextIsCard ? 6 : 12,
                        borderBottomRightRadius: nextIsCard ? 6 : 12,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color .15s ease, border-color .1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Timer size={14} color={colors.text.tertiary} />
                        <span style={{ color: colors.text.tertiary, fontSize: '12px' }}>Free slot</span>
                        {event.startTime && event.endTime && (
                          <span style={{ color: colors.text.tertiary, fontSize: '11px', backgroundColor: colors.background, padding: '2px 6px', borderRadius: 999, border: `1px solid ${colors.borderSubtle}` }}>{event.startTime} - {event.endTime}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                        {(hoveredFreeSlotId === event.id || freeSlotMenuFor === event.id) && (
                          <button 
                            ref={freeSlotButtonRef}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditingTask(null); 
                              setPrefilledStartTime(convertTo24Hour(event.startTime!)); 
                              setPrefilledDate(selectedDate.toISOString().split('T')[0]); 
                              if (!freeSlotMenuFor && freeSlotButtonRef.current) {
                                const rect = freeSlotButtonRef.current.getBoundingClientRect()
                                setFreeSlotMenuPosition({
                                  top: rect.top + 8,
                                  right: window.innerWidth - rect.right + 40
                                })
                              }
                              setFreeSlotMenuFor(prev => prev === event.id ? null : event.id) 
                            }} 
                            title="Add in this free slot" 
                            style={{ height: 28, padding: '0 10px', borderRadius: 999, backgroundColor: colors.text.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 12, transition: 'opacity .15s ease' }}
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        {freeSlotMenuFor === event.id && createPortal(
                          <div 
                            ref={freeSlotMenuRef} 
                            style={{ 
                              position: 'fixed', 
                              top: freeSlotMenuPosition.top, 
                              right: freeSlotMenuPosition.right, 
                              display: 'flex', 
                              gap: '8px', 
                              zIndex: 10000 
                            }}
                          >
                            <button onClick={() => { setShowQuickAdd(true); setFreeSlotMenuFor(null); setHoveredFreeSlotId(null) }} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${colors.borderSubtle}`, background: colors.surface, color: colors.text.primary, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>+ Task</button>
                            <button onClick={() => { setShowRoutineModal(true); setFreeSlotMenuFor(null); setHoveredFreeSlotId(null) }} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${colors.borderSubtle}`, background: colors.surface, color: colors.text.primary, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>+ Routine</button>
                            <button onClick={() => { setShowAddFromLibrary(true); setFreeSlotMenuFor(null); setHoveredFreeSlotId(null) }} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${colors.borderSubtle}`, background: colors.surface, color: colors.text.primary, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>+ Library</button>
                          </div>,
                          document.body
                        )}
                      </div>
                    </div>
                  )) : (
                    <div style={{ height: 24 }}>
                      <span style={{ color: colors.text.quaternary, fontSize: 12 }}>End of day</span>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* FAB with speed-dial */}
      <div ref={speedDialRef} style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 1000 }}>
        {speedDialOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', marginBottom: '10px' }}>
            <button onClick={() => { setShowAddFromLibrary(true); setSpeedDialOpen(false) }} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.borderSubtle}`, background: colors.surface, color: colors.text.primary, fontSize: 12 }}>Add from Library</button>
            <button onClick={() => { setPrefilledStartTime(''); setPrefilledDate(new Date().toISOString().split('T')[0]); setShowQuickAdd(true); setSpeedDialOpen(false) }} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.borderSubtle}`, background: colors.surface, color: colors.text.primary, fontSize: 12 }}>+ Habit</button>
            <button onClick={() => { setPrefilledStartTime(''); setPrefilledDate(new Date().toISOString().split('T')[0]); setEditingRoutine(null); setShowRoutineModal(true); setSpeedDialOpen(false) }} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.borderSubtle}`, background: colors.surface, color: colors.text.primary, fontSize: 12 }}>+ Routine</button>
          </div>
        )}
        <button
          onClick={() => setSpeedDialOpen(v => !v)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: colors.text.accent,
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Modals */}
      {showQuickAdd && (
        <QuickAddModal
          isOpen={showQuickAdd}
          onClose={handleCloseModals}
          onAddTask={onAddTask}
          editingTask={editingTask}
          onEditTask={onEditTask}
          prefilledStartTime={prefilledStartTime}
          prefilledDate={prefilledDate}
          availableGoals={goals}
          onAddGoal={onAddGoal}
        />
      )}
      {showRoutineModal && (
        <RoutineModal
          isOpen={showRoutineModal}
          onClose={handleCloseModals}
          onAddRoutine={(routine) => { if (onAddRoutine) { onAddRoutine(routine) } }}
          editingRoutine={editingRoutine}
          onEditRoutine={handleEditRoutineSubmit}
          availableTasks={tasks}
          onAddTask={onAddTask}
          prefilledStartTime={prefilledStartTime}
        />
      )}
      {showAddFromLibrary && (
        <AddFromLibraryModal
          isOpen={showAddFromLibrary}
          onClose={handleCloseModals}
          onAddItem={handleAddItemFromLibrary}
          availableTasks={tasks}
          availableRoutines={routines}
          prefilledStartTime={prefilledStartTime || undefined}
        />
      )}
    </div>
  )
}

export default DayPlan