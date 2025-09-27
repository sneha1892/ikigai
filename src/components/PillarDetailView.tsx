import { useState } from 'react'
import { ArrowLeft, Plus, Target, Zap } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { Goal, Task, PillarType } from '../types'
import { PILLAR_CONFIGS } from '../types'
import AddGoalModal from './AddGoalModal'
import QuickAddModal from './QuickAddModal'

interface PillarDetailViewProps {
  pillar: PillarType
  goals: Goal[]
  habits: Task[]
  onBack: () => void
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  onEditGoal: (goalId: string, goal: Omit<Goal, 'id' | 'createdAt'>) => void
  onAddHabit: (habit: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
}

function PillarDetailView({ 
  pillar, 
  goals, 
  habits, 
  onBack, 
  onAddGoal, 
  onEditGoal, 
  onAddHabit 
}: PillarDetailViewProps) {
  const { colors } = useTheme()
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined)
  const [showAddHabitModal, setShowAddHabitModal] = useState(false)
  const [selectedGoalForHabit, setSelectedGoalForHabit] = useState<Goal | null>(null)
  
  const pillarConfig = PILLAR_CONFIGS[pillar]
  
  
  const handleGoalSubmit = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      onEditGoal(editingGoal.id, goalData)
    } else {
      onAddGoal(goalData)
    }
    setShowAddGoalModal(false)
    setEditingGoal(undefined)
  }
  
  const handleCloseModal = () => {
    setShowAddGoalModal(false)
    setEditingGoal(undefined)
  }


  const handleHabitCreated = (habitData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    onAddHabit(habitData)
    setShowAddHabitModal(false)
    setSelectedGoalForHabit(null)
  }

  const handleCloseHabitModal = () => {
    setShowAddHabitModal(false)
    setSelectedGoalForHabit(null)
  }
  

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text.primary
    }}>
      {/* Top App Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.borderSubtle}`
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text.primary,
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            marginRight: '12px'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            color: pillarConfig.color
          }}>
            {pillarConfig.name}
          </h1>
        </div>
        
        <button
          onClick={() => setShowAddGoalModal(true)}
          style={{
            background: `linear-gradient(135deg, ${pillarConfig.color}, ${pillarConfig.color}CC)`,
            border: 'none',
            color: colors.text.primary,
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {goals.length === 0 ? (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.text.tertiary
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${pillarConfig.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: `2px solid ${pillarConfig.color}30`
            }}>
              <Target size={32} color={pillarConfig.color} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '12px',
              color: colors.text.primary
            }}>
              No Goals Yet
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '32px',
              maxWidth: '300px',
              margin: '0 auto 32px'
            }}>
              Set your first goal for {pillarConfig.name.toLowerCase()} to start your journey.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAddGoalModal(true)}
                style={{
                  background: `linear-gradient(135deg, ${pillarConfig.color}, ${pillarConfig.color}CC)`,
                  border: 'none',
                  color: colors.text.primary,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Target size={20} />
                Add Your First Goal
              </button>
              
              <button
                onClick={() => {
                  setSelectedGoalForHabit(null)
                  setShowAddHabitModal(true)
                }}
                style={{
                  background: 'none',
                  border: `2px solid ${pillarConfig.color}40`,
                  color: pillarConfig.color,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={20} />
                Add Habit Only
              </button>
            </div>
          </div>
        ) : (
          // Goals List - simplified for now, can be enhanced later
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: colors.surface,
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                border: `1px solid ${pillarConfig.color}30`
              }}>
                <Target size={24} color={pillarConfig.color} style={{ marginBottom: '8px' }} />
                <h3 style={{ color: colors.text.primary, margin: '0 0 4px 0', fontSize: '20px' }}>
                  {goals.length}
                </h3>
                <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
                  Goals Set
                </p>
              </div>
              
              <div style={{
                backgroundColor: colors.surface,
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                border: `1px solid ${pillarConfig.color}30`
              }}>
                <Zap size={24} color={pillarConfig.color} style={{ marginBottom: '8px' }} />
                <h3 style={{ color: colors.text.primary, margin: '0 0 4px 0', fontSize: '20px' }}>
                  {habits.length}
                </h3>
                <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
                  Active Habits
                </p>
              </div>
            </div>

            {/* Goals would be displayed here - simplified for now */}
            <div style={{
              backgroundColor: colors.surface,
              padding: '20px',
              borderRadius: '16px',
              border: `1px solid ${colors.borderSubtle}`
            }}>
              <h3 style={{ color: colors.text.primary, marginBottom: '16px' }}>Your Goals</h3>
              <p style={{ color: colors.text.secondary }}>
                Full goal management interface coming soon...
              </p>
            </div>

            {habits.length > 0 && (
              <div style={{
                backgroundColor: colors.surface,
                padding: '20px',
                borderRadius: '16px',
                border: `1px solid ${colors.borderSubtle}`
              }}>
                <h3 style={{ color: colors.text.primary, marginBottom: '12px', fontSize: '15px' }}>Your Habits</h3>
                {habits.map(habit => (
                  <div key={habit.id} style={{ 
                    padding: '12px', 
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: '10px',
                    marginBottom: '8px',
                    color: colors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: `1px solid ${colors.borderSubtle}`
                  }}>
                    <span style={{ fontSize: '20px' }}>{habit.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '500' }}>
                        {habit.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '11px', color: colors.text.tertiary }}>
                        {habit.repeatFrequency === 'daily' ? 'Daily habit' : `${habit.repeatFrequency} habit`}
                      </p>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: habit.completed ? '#10B98120' : `${pillarConfig.color}15`,
                      color: habit.completed ? '#059669' : pillarConfig.color,
                      border: `1px solid ${habit.completed ? '#10B98130' : `${pillarConfig.color}30`}`
                    }}>
                      {habit.completed ? '✅' : '⏳'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={handleCloseModal}
        onAddGoal={handleGoalSubmit}
        pillar={pillar}
        editingGoal={editingGoal}
      />

      {/* Add Habit Modal */}
      <QuickAddModal
        isOpen={showAddHabitModal}
        onClose={handleCloseHabitModal}
        onAddTask={handleHabitCreated}
        prefilledPillar={pillar}
        prefilledGoal={selectedGoalForHabit || undefined}
        availableGoals={goals}
        onAddGoal={onAddGoal}
      />
    </div>
  )
}

export default PillarDetailView