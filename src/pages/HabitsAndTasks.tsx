import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import TaskItem from '../components/TaskItem'
import HabitDayChecklistView from '../components/HabitDayChecklistView'
import QuickAddModal from '../components/QuickAddModal'
import SimpleTaskModal from '../components/SimpleTaskModal'
import type { Task, UserStats, Goal } from '../types'

interface HabitsAndTasksProps {
  tasks: Task[]
  userStats: UserStats
  goals?: Goal[]
  onToggleTask: (taskId: string, date?: string) => void
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onEditTask: (taskId: string, task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onDeleteTask: (taskId: string) => void
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
}

type ViewType = 'habits' | 'tasks'

function HabitsAndTasks({ tasks, goals = [], onToggleTask, onAddTask, onEditTask, onDeleteTask, onAddGoal }: HabitsAndTasksProps) {
  const { colors } = useTheme()
  const [activeView, setActiveView] = useState<ViewType>('habits')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showTaskAdd, setShowTaskAdd] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Load saved tab preference
  React.useEffect(() => {
    const savedTab = localStorage.getItem('ikigai-habits-tasks-tab') as ViewType
    if (savedTab && ['habits', 'tasks'].includes(savedTab)) {
      setActiveView(savedTab)
    }
  }, [])

  // Save tab preference
  React.useEffect(() => {
    localStorage.setItem('ikigai-habits-tasks-tab', activeView)
  }, [activeView])

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowQuickAdd(true)
  }

  const handleCloseModals = () => {
    setShowQuickAdd(false)
    setShowTaskAdd(false)
    setEditingTask(null)
  }

  const handleFabClick = () => {
    if (activeView === 'habits') {
      setShowQuickAdd(true)
    } else {
      setShowTaskAdd(true)
    }
  }

  // Filter tasks by type (habits vs simple tasks)
  const habits = tasks.filter(task => task.challengeDuration || task.repeatFrequency !== 'once')
  const simpleTasks = tasks.filter(task => !task.challengeDuration && task.repeatFrequency === 'once')

  const renderHabits = () => (
    <div>
      <HabitDayChecklistView
        habits={habits}
        onToggleHabit={onToggleTask}
        onEditHabit={handleEditTask}
        onDeleteHabit={onDeleteTask}
      />
    </div>
  )

  const renderTasks = () => (
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
          e.currentTarget.style.borderColor = colors.borderSubtle
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
            onToggleComplete={onToggleTask}
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

  return (
    <div style={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.background,
      color: colors.text.primary
    }}>
      {/* Tab Navigation */}
      <div style={{ 
        padding: '20px',
        paddingTop: '84px', // Space for top header
        paddingBottom: '16px',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '4px',
          position: 'relative'
        }}>
          {/* Tab Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              bottom: '4px',
              width: 'calc(50% - 4px)',
              backgroundColor: colors.text.accent,
              borderRadius: '8px',
              transition: 'transform 0.3s ease',
              transform: `translateX(${activeView === 'habits' ? '2px' : 'calc(100% + 2px)'})`
            }}
          />
          
          {[
            { id: 'habits' as ViewType, label: 'Habits' },
            { id: 'tasks' as ViewType, label: 'Tasks' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeView === tab.id ? colors.text.primary : colors.text.tertiary,
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
      </div>

      {/* Tab Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px'
      }}>
        {activeView === 'habits' ? renderHabits() : renderTasks()}
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

      {/* Modals */}
      {showQuickAdd && (
        <QuickAddModal
          isOpen={showQuickAdd}
          onClose={handleCloseModals}
          onAddTask={onAddTask}
          editingTask={editingTask}
          onEditTask={onEditTask}
          availableGoals={goals}
          onAddGoal={onAddGoal}
        />
      )}
      
      {showTaskAdd && (
        <SimpleTaskModal
          isOpen={showTaskAdd}
          onClose={handleCloseModals}
          onAddTask={onAddTask}
        />
      )}
    </div>
  )
}

export default HabitsAndTasks
