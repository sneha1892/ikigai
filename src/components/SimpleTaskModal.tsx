import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useBackButtonHandler } from '../hooks/useBackButtonHandler'
import type { Task, PillarType } from '../types'
import { PILLAR_CONFIGS } from '../types'

interface SimpleTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
}

function SimpleTaskModal({ isOpen, onClose, onAddTask }: SimpleTaskModalProps) {
  const { colors } = useTheme()
  const [taskName, setTaskName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [selectedPillar, setSelectedPillar] = useState<PillarType | ''>('')
  const [duration, setDuration] = useState<number>(30) // New duration state

  // Back button navigation - close modal when back button is pressed
  // Priority 50: Standalone modal
  useBackButtonHandler('simple-task-modal', isOpen, onClose, 50)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTaskName('')
      setDueDate('')
      setDueTime('')
      setSelectedPillar('')
      setDuration(30) // Reset duration
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) return

    // Build task data without undefined values (Firebase doesn't support them)
    const taskData: any = {
      name: taskName.trim(),
      pillar: selectedPillar || 'mental', // Default pillar if none selected
      icon: 'briefcase', // Default icon for tasks
      repeatFrequency: 'once',
      hasReminder: !!(dueDate && dueTime)
    }

    // Only add reminder fields if they have values
    if (dueDate && dueTime) {
      taskData.reminderTime = dueTime
      taskData.reminderDate = dueDate
      taskData.duration = duration // Add duration when reminder is set
    }

    onAddTask(taskData)
    onClose()
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
          maxHeight: '70vh',
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
            Add New Task
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Task Name */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                Task Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Buy groceries"
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
                autoFocus
              />
            </div>

            {/* Due Date & Time */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'block'
              }}>
                Due Date & Time (Optional)
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
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
                  disabled={!dueDate}
                />
              </div>
            </div>

            {/* Duration Input - only show when date and time are set */}
            {dueDate && dueTime && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  color: colors.text.primary,
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  step="5"
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
                <p style={{
                  color: colors.text.tertiary,
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  How long will this task take? (5-240 minutes)
                </p>
              </div>
            )}

            {/* Optional Pillar Assignment */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                color: colors.text.primary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'block'
              }}>
                Category (Optional)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedPillar('')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: selectedPillar === '' ? '2px solid #10B981' : '1px solid #444',
                    backgroundColor: selectedPillar === '' ? '#10B98120' : colors.surface,
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  None
                </button>
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
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      color: pillar.color,
                      fontSize: '10px',
                      marginBottom: '2px'
                    }}>
                      {pillar.name}
                    </div>
                  </button>
                ))}
              </div>
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
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default SimpleTaskModal
