import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useBackButtonHandler } from '../hooks/useBackButtonHandler'
import type { Goal, PillarType } from '../types'
import { PILLAR_CONFIGS } from '../types'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  pillar: PillarType
  editingGoal?: Goal
}

// Goal suggestions for each pillar
const GOAL_SUGGESTIONS = {
  mental: {
    title: 'Live Mindfully',
    initialStatus: 'Daily Screentime: 6 hours',
    targetStatus: 'Daily Screentime: 2 hours'
  },
  physical: {
    title: 'Achieve and Maintain a Healthy Weight',
    initialStatus: 'Current Weight: 85 kg',
    targetStatus: 'Target Weight: 70 kg'
  },
  social: {
    title: 'Strengthen Relationships',
    initialStatus: 'Meaningful Interactions: 1 per week',
    targetStatus: 'Meaningful Interactions: 4 per week'
  },
  intellectual: {
    title: 'Become Proficient in [Chosen Skill/Language]',
    initialStatus: 'Proficiency: Beginner',
    targetStatus: 'Proficiency: Intermediate'
  }
}


function AddGoalModal({ isOpen, onClose, onAddGoal, pillar, editingGoal }: AddGoalModalProps) {
  const { colors } = useTheme()
  const [title, setTitle] = useState('')
  const [targetStatus, setTargetStatus] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')

  const pillarConfig = PILLAR_CONFIGS[pillar]
  const suggestion = GOAL_SUGGESTIONS[pillar]

  // Back button navigation - close modal when back button is pressed
  // Use higher priority (10) since this modal can be nested inside QuickAddModal
  useBackButtonHandler('add-goal-modal', isOpen, onClose, 10)

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setTitle(editingGoal.title)
        setTargetStatus(editingGoal.targetStatus)
        setCurrentStatus(editingGoal.currentStatus)
      } else {
        // Clear all fields for new goal (suggestions will be shown as placeholders)
        setTitle('')
        setTargetStatus('')
        setCurrentStatus('')
      }
    }
  }, [isOpen, editingGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: title.trim(),
      pillar,
      initialStatus: currentStatus.trim() || 'Starting point',
      targetStatus: targetStatus.trim() || title.trim(),
      currentStatus: currentStatus.trim() || 'Starting point',
      currentStatusUpdatedAt: new Date(),
      isActive: true
    }

    onAddGoal(goalData)
    // Don't call handleClose() here - let the parent handle closing
  }

  const handleClose = () => {
    setTitle('')
    setTargetStatus('')
    setCurrentStatus('')
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
        onClick={handleClose}
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
        <div style={{ padding: '20px 20px 32px 20px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '22px',
            fontWeight: '600',
            margin: 0,
            textAlign: 'center',
            letterSpacing: '-0.2px'
          }}>
            Add Goal
          </h2>
        </div>

        {/* Motivational Message */}
        <p style={{
          color: colors.text.tertiary,
          fontSize: '15px',
          lineHeight: '20px',
          marginBottom: '24px',
          textAlign: 'center',
          fontWeight: '400'
        }}>
          What would you want to achieve?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Goal Title - Main Input with prominent styling */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Live Mindfully"
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '16px',
                border: `2px solid ${colors.border || '#444'}`,
                backgroundColor: colors.surfaceElevated,
                color: colors.text.primary,
                fontSize: '20px',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = pillarConfig.color
                e.target.style.boxShadow = `0 0 0 3px ${pillarConfig.color}20, 0 2px 8px rgba(0, 0, 0, 0.1)`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border || '#444'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>

          {/* Current Situation & Target - Side by Side */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Current Situation */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={colors.text.tertiary} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginRight: '6px' }}
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h3 style={{
                  color: colors.text.tertiary,
                  fontSize: '12px',
                  fontWeight: '400',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  CURRENT
                </h3>
              </div>
              <input
                type="text"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                placeholder={suggestion.initialStatus}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border || '#444'}`,
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '15px',
                  fontWeight: '400',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.text.secondary
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border || '#444'
                }}
              />
            </div>

            {/* Your Target */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={pillarConfig.color} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginRight: '6px' }}
                >
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <h3 style={{
                  color: colors.text.tertiary,
                  fontSize: '12px',
                  fontWeight: '400',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  TARGET
                </h3>
              </div>
              <input
                type="text"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                placeholder={suggestion.targetStatus}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border || '#444'}`,
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontSize: '15px',
                  fontWeight: '400',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = pillarConfig.color
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border || '#444'
                }}
              />
            </div>
          </div>

          {/* Action Buttons - iOS Style */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'stretch',
            marginTop: '16px'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '17px',
                fontWeight: '400',
                color: colors.text.primary,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border || '#444'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#FFFFFF',
                background: title.trim() 
                  ? pillarConfig.color
                  : colors.text.quaternary,
                border: 'none',
                borderRadius: '12px',
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: title.trim() ? 1 : 0.6
              }}
            >
              {editingGoal ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  )
}

export default AddGoalModal
