import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Flame, Star } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import TaskItem from './TaskItem'
import QuickAddModal from './QuickAddModal'
import SimpleTaskModal from '../components/SimpleTaskModal'
import type { Task, UserStats, Goal } from '../types'
import { PILLAR_CONFIGS } from '../types'

interface TabbedHomeProps {
  tasks: Task[]
  userStats: UserStats
  goals?: Goal[]
  onToggleTask: (taskId: string, date?: string) => void
  onPointsEarned?: () => void
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onEditTask: (taskId: string, task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onDeleteTask: (taskId: string) => void
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
}

type TabType = 'today' | 'habits' | 'tasks'

function TabbedHome({ tasks, userStats, goals = [], onToggleTask, onAddTask, onEditTask, onDeleteTask, onAddGoal }: TabbedHomeProps) {
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [currentDate, setCurrentDate] = useState('')
  const [pointsAnimating, setPointsAnimating] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showTaskAdd, setShowTaskAdd] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [previousPoints, setPreviousPoints] = useState(userStats.totalPoints)

  // Smooth points counter animation
  const pointsMotionValue = useMotionValue(userStats.totalPoints)
  const pointsSpring = useSpring(pointsMotionValue, {
    stiffness: 100,
    damping: 30,
    mass: 1
  })
  const animatedPoints = useTransform(pointsSpring, (value) => Math.round(value))

  // Load saved tab preference
  useEffect(() => {
    const savedTab = localStorage.getItem('ikigai-active-tab') as TabType
    if (savedTab && ['today', 'habits', 'tasks'].includes(savedTab)) {
      setActiveTab(savedTab)
    }
  }, [])

  // Save tab preference
  useEffect(() => {
    localStorage.setItem('ikigai-active-tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    // Set current date in format matching the design
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }
    setCurrentDate(now.toLocaleDateString('en-US', options))
  }, [])

  // Trigger points animation when points increase
  useEffect(() => {
    if (userStats.totalPoints > previousPoints) {
      triggerPointsAnimation()
    }
    pointsMotionValue.set(userStats.totalPoints)
    setPreviousPoints(userStats.totalPoints)
  }, [userStats.totalPoints, previousPoints, pointsMotionValue])

  const triggerPointsAnimation = () => {
    setPointsAnimating(true)
    setTimeout(() => setPointsAnimating(false), 800)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowQuickAdd(true)
  }

  const handleCloseModals = () => {
    setShowQuickAdd(false)
    setShowTaskAdd(false)
    setEditingTask(null)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  const handleFabClick = () => {
    switch (activeTab) {
      case 'today':
        // Show quick menu with both options (will implement later)
        setShowQuickAdd(true)
        break
      case 'habits':
        setShowQuickAdd(true)
        break
      case 'tasks':
        setShowTaskAdd(true)
        break
    }
  }

  // Filter tasks by type (habits vs simple tasks)
  const habits = tasks.filter(task => task.challengeDuration || task.repeatFrequency !== 'once')
  const simpleTasks = tasks.filter(task => !task.challengeDuration && task.repeatFrequency === 'once')

  // Group habits by pillar - memoized for performance
  const habitsByPillar = useMemo(() => 
    Object.values(PILLAR_CONFIGS).map(pillar => ({
      ...pillar,
      habits: habits.filter(habit => habit.pillar === pillar.id)
    })), [habits]
  )

  // Create timeline for Today view - memoized for performance
  const timeline = useMemo(() => {
    const timeSlots = [
      { label: 'Morning', time: '6:00 AM', tasks: [] as Task[] },
      { label: 'Afternoon', time: '12:00 PM', tasks: [] as Task[] },
      { label: 'Evening', time: '6:00 PM', tasks: [] as Task[] },
      { label: 'Anytime Today', time: '', tasks: [] as Task[] }
    ]

    tasks.forEach(task => {
      if (task.reminderTime) {
        const hour = parseInt(task.reminderTime.split(':')[0])
        if (hour < 12) {
          timeSlots[0].tasks.push(task)
        } else if (hour < 18) {
          timeSlots[1].tasks.push(task)
        } else {
          timeSlots[2].tasks.push(task)
        }
      } else {
        timeSlots[3].tasks.push(task)
      }
    })

    return timeSlots
  }, [tasks])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <div>
            {/* Today Header */}
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <h1 
                className="headline-large" 
                style={{ 
                  marginBottom: '4px',
                  fontSize: '28px',
                  fontWeight: '300',
                  letterSpacing: '-0.3px',
                  color: colors.text.primary
                }}
              >
                {currentDate}
              </h1>
            </div>

            {/* Timeline */}
            <div>
              {timeline.map((timeSlot, index) => (
                <div key={index} style={{ marginBottom: '32px' }}>
                  {timeSlot.tasks.length > 0 && (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px',
                        gap: '12px'
                      }}>
                        <h3 style={{
                          color: colors.text.primary,
                          fontSize: '16px',
                          fontWeight: '500',
                          margin: 0
                        }}>
                          {timeSlot.label}
                        </h3>
                        {timeSlot.time && (
                          <span style={{
                            color: colors.text.tertiary,
                            fontSize: '14px'
                          }}>
                            {timeSlot.time}
                          </span>
                        )}
                        <div style={{
                          flex: 1,
                          height: '1px',
                          backgroundColor: colors.borderSubtle
                        }} />
                      </div>
                      {timeSlot.tasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggleComplete={(taskId) => {
                            const today = new Date().toISOString().split('T')[0]
                            onToggleTask(taskId, today)
                            const taskBeingToggled = tasks.find(t => t.id === taskId)
                            if (taskBeingToggled && !taskBeingToggled.completed) {
                              triggerPointsAnimation()
                            }
                          }}
                          onEdit={handleEditTask}
                          onDelete={onDeleteTask}
                        />
                      ))}
                    </>
                  )}
                </div>
              ))}

              {tasks.length === 0 && (
                <div 
                  className="md-card" 
                  style={{ 
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: colors.surface
                  }}
                >
                  <p className="body-large" style={{ color: colors.text.tertiary }}>
                    No tasks for today
                  </p>
                  <p className="body-medium" style={{ color: colors.text.quaternary, marginTop: '8px' }}>
                    Add some habits to get started on your Ikigai journey
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 'habits':
        return (
          <div>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <h1 
                className="headline-large" 
                style={{ 
                  marginBottom: '4px',
                  fontSize: '28px',
                  fontWeight: '300',
                  letterSpacing: '-0.3px',
                  color: colors.text.primary
                }}
              >
                Habits
              </h1>
              <p 
                className="body-medium" 
                style={{ 
                  color: colors.text.tertiary,
                  fontSize: '15px',
                  fontWeight: '400',
                  marginTop: '2px'
                }}
              >
                Organized by life pillars
              </p>
            </div>

            {habitsByPillar.map(pillar => (
              <div key={pillar.id} style={{ marginBottom: '20px' }}>
                {pillar.habits.length > 0 && (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: pillar.color
                      }} />
                      <h3 style={{
                        color: pillar.color,
                        fontSize: '15px',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {pillar.name}
                      </h3>
                      <div style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: colors.borderSubtle
                      }} />
                    </div>
                    {pillar.habits.map(habit => (
                      <TaskItem
                        key={habit.id}
                        task={habit}
                        onToggleComplete={(taskId) => {
                          const today = new Date().toISOString().split('T')[0]
                          onToggleTask(taskId, today)
                          const taskBeingToggled = tasks.find(t => t.id === taskId)
                          if (taskBeingToggled && !taskBeingToggled.completed) {
                            triggerPointsAnimation()
                          }
                        }}
                        onEdit={handleEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </>
                )}
              </div>
            ))}

            {habits.length === 0 && (
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
            )}
          </div>
        )

      case 'tasks':
        return (
          <div>
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <h1 
                className="headline-large" 
                style={{ 
                  marginBottom: '4px',
                  fontSize: '28px',
                  fontWeight: '300',
                  letterSpacing: '-0.3px',
                  color: colors.text.primary
                }}
              >
                Tasks
              </h1>
              <p 
                className="body-medium" 
                style={{ 
                  color: colors.text.tertiary,
                  fontSize: '15px',
                  fontWeight: '400',
                  marginTop: '2px'
                }}
              >
                Quick one-time tasks
              </p>
            </div>

            {/* Quick Add Input */}
            <div 
              style={{
                backgroundColor: colors.surface,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: `1px solid ${colors.borderSubtle}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setShowTaskAdd(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10B981'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333'
              }}
            >
              <span style={{ color: colors.text.tertiary, fontSize: '16px' }}>
                Add a task...
              </span>
            </div>

            {/* Task List */}
            <div>
              {simpleTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={(taskId) => {
                    const today = new Date().toISOString().split('T')[0]
                    onToggleTask(taskId, today)
                    const taskBeingToggled = tasks.find(t => t.id === taskId)
                    if (taskBeingToggled && !taskBeingToggled.completed) {
                      triggerPointsAnimation()
                    }
                  }}
                  onEdit={handleEditTask}
                  onDelete={onDeleteTask}
                />
              ))}

              {simpleTasks.length === 0 && (
                <div 
                  className="md-card" 
                  style={{ 
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: colors.surface
                  }}
                >
                  <p className="body-large" style={{ color: colors.text.tertiary }}>
                    No tasks yet
                  </p>
                  <p className="body-medium" style={{ color: colors.text.quaternary, marginTop: '8px' }}>
                    Add quick tasks to stay organized
                  </p>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div style={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header with streak and points */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
        alignItems: 'center',
        marginBottom: '32px',
        gap: '12px',
        width: '100%',
        padding: '20px 20px 0 20px'
      }}>
        {/* Streak Badge */}
        <div style={{
          backgroundColor: colors.surface,
          padding: '8px 16px',
          borderRadius: '20px',
          border: `1px solid #FDBA74`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: colors === colors ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 3px rgba(255,255,255,0.1)'
        }}>
          <Flame size={16} color="#FDBA74" />
          <span 
            className="body-medium" 
            style={{ 
              color: '#FDBA74', 
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            {userStats.streak}-Day Streak
          </span>
        </div>
        
        {/* Points Badge */}
        <div 
          id="points-badge"
          style={{
            backgroundColor: colors.surface,
            padding: '8px 16px',
            borderRadius: '20px',
            border: `1px solid ${colors.text.accent}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Star size={16} color="#10B981" fill="#10B981" />
          <motion.span 
            className="body-medium" 
            style={{ 
              color: '#10B981', 
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            <motion.span>{animatedPoints}</motion.span> Points
          </motion.span>
          
          {/* Enhanced Sparkle Animation */}
          <AnimatePresence>
            {pointsAnimating && (
              <>
                {/* Subtle sparkle particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: 15,
                      y: 8
                    }}
                    animate={{ 
                      opacity: [0, 0.7, 0],
                      scale: [0, 0.8, 0],
                      x: [15, 15 + (i - 1.5) * 12],
                      y: [8, 8 - 12]
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    style={{
                      position: 'absolute',
                      width: '2px',
                      height: '2px',
                      backgroundColor: '#10B981',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      opacity: 0.8
                    }}
                  />
                ))}
                
                {/* Subtle glow effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '24px',
        marginLeft: '20px',
        marginRight: '20px',
        position: 'relative',
        flexShrink: 0
      }}>
        {/* Tab Indicator */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            width: 'calc(33.33% - 8px)',
            backgroundColor: colors.text.accent,
            borderRadius: '8px',
            transition: 'transform 0.3s ease',
            transform: `translateX(${activeTab === 'today' ? '4px' : activeTab === 'habits' ? 'calc(100% + 8px)' : 'calc(200% + 12px)'})`
          }}
        />
        
        {[
          { id: 'today' as TabType, label: 'Today' },
          { id: 'habits' as TabType, label: 'Habits' },
          { id: 'tasks' as TabType, label: 'Tasks' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab.id ? colors.text.primary : colors.text.tertiary,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        {renderTabContent()}
      </div>

      {/* Context-Aware FAB */}
      <button
        onClick={handleFabClick}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: colors.text.accent,
          border: 'none',
          boxShadow: `0 4px 12px rgba(16, 185, 129, 0.3)`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: colors.text.primary,
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
      >
        +
      </button>

      {/* Modals */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={handleCloseModals}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        editingTask={editingTask}
        availableGoals={goals}
        onAddGoal={onAddGoal}
      />

      <SimpleTaskModal
        isOpen={showTaskAdd}
        onClose={handleCloseModals}
        onAddTask={onAddTask}
      />

      {/* CSS Animations */}
      <style>
        {`
          @keyframes glow {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          @keyframes sparkle-0 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(15px, -10px) scale(1); opacity: 0; }
          }
          
          @keyframes sparkle-1 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(-12px, -8px) scale(1); opacity: 0; }
          }
          
          @keyframes sparkle-2 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(10px, 12px) scale(1); opacity: 0; }
          }
          
          @keyframes sparkle-3 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(-15px, 5px) scale(1); opacity: 0; }
          }
          
          @keyframes sparkle-4 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(8px, -15px) scale(1); opacity: 0; }
          }
          
          @keyframes sparkle-5 {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(-8px, 10px) scale(1); opacity: 0; }
          }
        `}
      </style>
    </div>
  )
}

export default TabbedHome
