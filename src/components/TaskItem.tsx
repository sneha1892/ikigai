import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, Trash2, MoreVertical } from 'lucide-react'
import type { Task } from '../types'
import { PILLAR_CONFIGS } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { useBackButtonHandler } from '../hooks/useBackButtonHandler'

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onSkip?: (taskId: string) => void
  showTime?: boolean
  hideTypePill?: boolean
  variant?: 'default' | 'flat'
  isFutureDate?: boolean
}

function TaskItem({ task, onToggleComplete, onEdit, onDelete, onSkip, hideTypePill, variant = 'default', isFutureDate }: TaskItemProps) {
  const { colors } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pillarConfig = PILLAR_CONFIGS[task.pillar]
  const isHabit = Boolean(task.challengeDuration || task.repeatFrequency !== 'once')

  // Back button navigation - close delete confirmation dialog when back button is pressed
  // Use highest priority (100) since confirmation dialogs should be closed first
  useBackButtonHandler(
    `delete-confirm-${task.id}`, 
    showDeleteConfirm, 
    () => setShowDeleteConfirm(false), 
    100
  )

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      // Use a small delay to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }
  }, [menuOpen])

  const getChallengeProgressLabel = (): string | null => {
    if (!task.challengeDuration) return null
    const list = Array.isArray((task as any).completionDates) ? ((task as any).completionDates as string[]) : []
    const currentDay = Math.min(task.challengeDuration, list.length)
    return `Completed ${currentDay}/${task.challengeDuration} days`
  }

  const handleToggle = () => {
    if (isFutureDate) return; // 🔒 BLOCK FUTURE
    if (!task.completed) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1200) // Longer duration for better visibility
    }
    onToggleComplete(task.id)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(task.id)
    }
    setShowDeleteConfirm(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  // Map task icons to Lucide components
  // Icon map retained if needed in future; currently not used in compact list UI.

  return (
    <div 
      className="task-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: variant === 'flat' ? '6px 8px' : '8px 10px',
        backgroundColor: variant === 'flat' ? 'transparent' : (isHabit ? 'transparent' : colors.surfaceVariant),
        borderRadius: '10px',
        marginBottom: '2px',
        border: 'none',
        position: 'relative',
        overflow: 'visible',
        minHeight: variant === 'flat' && isHabit ? '36px' : '44px'
      }}
    >
      {/* Completion Checkbox - left like routine habit row */}
      <button
        onClick={handleToggle}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: task.completed ? colors.text.accent : colors.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginRight: '10px',
          flexShrink: 0
        }}
      >
        {task.completed && (
          <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>
        )}
      </button>

      {/* Task Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="body-large" style={{ 
            color: task.completed ? colors.text.tertiary : colors.text.primary,
            textDecoration: task.completed ? 'line-through' : 'none',
            fontSize: '14px',
            fontWeight: 500
          }}>
            {task.name}
          </div>
          {/* Type pill (optional) */}
          {!hideTypePill && (
            <span style={{
              marginLeft: 4,
              fontSize: '11px',
              color: colors.text.tertiary,
              backgroundColor: colors.background,
              border: `1px solid ${colors.borderSubtle}`,
              padding: '2px 6px',
              borderRadius: 999
            }}>
              {(task.challengeDuration || task.repeatFrequency !== 'once') ? 'Habit' : 'Task'}
            </span>
          )}
        </div>
        {/* Second line: goal/challenge info when available */}
        {(task.goalId || task.challengeDuration) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            {task.goalId && (
              <span style={{ fontSize: '11px', color: colors.text.quaternary }}>Linked to goal</span>
            )}
            {task.challengeDuration && (
              <span style={{
                color: colors.text.tertiary,
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: colors.background,
                padding: '2px 6px',
                borderRadius: '999px',
                border: `1px solid ${colors.borderSubtle}`
              }}>
                {getChallengeProgressLabel()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: duration pill + overflow menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, position: 'relative' }}>
        {!isHabit && (
          <span style={{ fontSize: '11px', color: colors.text.tertiary, backgroundColor: colors.background, border: `1px solid ${colors.borderSubtle}`, padding: '2px 6px', borderRadius: 999 }}>
            {task.duration !== undefined ? task.duration : 30}m
          </span>
        )}
        {(onEdit || onDelete) && (
          <button
            ref={buttonRef}
             onClick={() => {
              if (!menuOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                setMenuPosition({
                  top: rect.top + 8,
                  right: window.innerWidth - rect.right + 40
                })
              }
              setMenuOpen(v => !v)
            }}
            title="More"
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: colors.text.tertiary, cursor: 'pointer' }}
          >
            <MoreVertical size={16} />
          </button>
        )}
        {menuOpen && createPortal(
          <div 
            ref={menuRef} 
            style={{ 
              position: 'fixed', 
              top: menuPosition.top, 
              right: menuPosition.right, 
              background: colors.surface, 
              border: `1px solid ${colors.borderSubtle}`, 
              borderRadius: 8, 
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)', 
              zIndex: 10000, 
              overflow: 'hidden', 
              minWidth: '100px' 
            }}
          >
            {onEdit && (
              <button onClick={() => { setMenuOpen(false); onEdit(task) }} style={{ display: 'block', padding: '8px 12px', border: 'none', width: '100%', textAlign: 'left', background: 'transparent', color: colors.text.primary, cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Edit3 size={14} /> Edit
                </span>
              </button>
            )}
            {onSkip && isHabit && (
              <button onClick={() => { 
                setMenuOpen(false); 
                onSkip(task.id) 
              }} style={{ display: 'block', padding: '8px 12px', border: 'none', width: '100%', textAlign: 'left', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Skip today
                </span>
              </button>
            )}
            {onDelete && (
              <button onClick={() => { setMenuOpen(false); handleDeleteClick() }} style={{ display: 'block', padding: '8px 12px', border: 'none', width: '100%', textAlign: 'left', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={14} /> Delete
                </span>
              </button>
            )}
          </div>,
          document.body
        )}
      </div>

      {/* Completion Shimmer Animation */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.8, times: [0, 0.3, 1] }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${pillarConfig.color}15, transparent)`,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      {/* Points Animation with Particles */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {/* Main points text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.8, 1.1, 1, 0.9],
                y: [0, -8, -12, -20]
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
                times: [0, 0.2, 0.7, 1]
              }}
              style={{
                position: 'absolute',
                top: '50%',
                right: '50px',
                transform: 'translateY(-50%)',
                color: '#10B981',
                fontSize: '12px',
                fontWeight: '600',
                pointerEvents: 'none',
                zIndex: 10,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              +10 POINTS
            </motion.div>

            {/* Subtle particle effects */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0, 0.8, 0],
                  x: [0, (i - 0.5) * 20],
                  y: [0, -15]
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.1,
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '70px',
                  width: '3px',
                  height: '3px',
                  backgroundColor: '#10B981',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 10,
                  boxShadow: '0 0 3px rgba(16, 185, 129, 0.6)'
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog - Using Portal */}
      {showDeleteConfirm && createPortal(
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
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleDeleteCancel}
          />
          
          {/* Confirmation Dialog */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: colors.surfaceElevated,
              borderRadius: '16px',
              padding: '24px',
              zIndex: 2001,
              minWidth: '300px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              border: '1px solid #444'
            }}
          >
            <h3 style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Delete item
            </h3>
            <p style={{
              color: '#888',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete "{task.name}"? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #444',
                  backgroundColor: colors.surfaceVariant,
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  )
}

export default TaskItem
