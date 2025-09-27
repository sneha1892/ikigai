import { useState, useMemo } from 'react'
import type { QuizResults, Task, Goal } from '../../types'
import { PILLAR_CONFIGS } from '../../types'
import { PILLAR_HABIT_SUGGESTIONS } from '../../data/quizQuestions'
import QuickAddModal from '../QuickAddModal'

interface HabitCreationProps {
  results: QuizResults
  onCreateHabit: (habit: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onSkip: () => void
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  availableGoals?: Goal[]
}

function HabitCreation({ results, onCreateHabit, onSkip, onAddGoal, availableGoals = [] }: HabitCreationProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedHabitIndex, setSelectedHabitIndex] = useState<number>(0)

  const pillarConfig = PILLAR_CONFIGS[results.leastFocusedPillar]
  
  // Filter suggested habits based on user preferences
  const suggestedHabits = useMemo(() => {
    const habits = PILLAR_HABIT_SUGGESTIONS[results.leastFocusedPillar]
    
    return habits.filter(habit => {
      // Filter by time commitment
      const matchesTime = habit.timeCommitment.includes(results.recommendedTimeCommitment)
      // Filter by timing preference
      const matchesTiming = habit.timing.includes(results.preferredTiming) || 
                           habit.timing.includes('flexible') ||
                           results.preferredTiming === 'flexible'
      
      return matchesTime || matchesTiming
    }).slice(0, 3) // Show top 3 matches
  }, [results])

  const selectedHabit = suggestedHabits[selectedHabitIndex]

  const handleCreateCustomHabit = () => {
    setShowQuickAdd(true)
  }

  const handleQuickAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    onCreateHabit(taskData)
    setShowQuickAdd(false)
  }

  const handleCloseQuickAdd = () => {
    setShowQuickAdd(false)
  }

  const handleUseSuggestedHabit = () => {
    if (!selectedHabit) return

    const habit: Omit<Task, 'id' | 'completed' | 'createdAt'> = {
      name: selectedHabit.name,
      pillar: results.leastFocusedPillar,
      icon: selectedHabit.icon,
      repeatFrequency: 'daily',
      hasReminder: false
    }

    onCreateHabit(habit)
  }

  if (suggestedHabits.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          color: '#fff'
        }}>
          <h2>Let's create your first habit!</h2>
          <p>Use our habit creator to get started.</p>
          <button onClick={handleCreateCustomHabit}>Create Habit</button>
        </div>
        
        <QuickAddModal
          isOpen={showQuickAdd}
          onClose={handleCloseQuickAdd}
          onAddTask={handleQuickAddTask}
          prefilledPillar={results.leastFocusedPillar}
          availableGoals={availableGoals}
          onAddGoal={onAddGoal}
        />
      </div>
    )
  }

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          color: '#fff'
        }}>
          {/* Header */}
          <div style={{
            marginBottom: '2.5rem'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {results.leastFocusedPillar === 'mental' ? '🧠' :
               results.leastFocusedPillar === 'physical' ? '💪' :
               results.leastFocusedPillar === 'social' ? '💜' : '🎯'}
            </div>
            
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              background: 'linear-gradient(45deg, #fff, #e5e7eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Your First Habit
            </h1>
            
            <p style={{
              fontSize: '1.1rem',
              color: '#9CA3AF',
              lineHeight: '1.6'
            }}>
              Based on your {pillarConfig.name.toLowerCase()} focus, here are some personalized suggestions:
            </p>
          </div>

          {/* Habit Suggestions */}
          <div style={{
            marginBottom: '2.5rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: suggestedHabits.length === 1 ? '1fr' : 
                                 suggestedHabits.length === 2 ? 'repeat(2, 1fr)' : 
                                 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {suggestedHabits.map((habit, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedHabitIndex(index)}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: selectedHabitIndex === index ? `${pillarConfig.color}20` : '#2d2d2d',
                    border: selectedHabitIndex === index ? `2px solid ${pillarConfig.color}` : '1px solid #444',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedHabitIndex !== index) {
                      e.currentTarget.style.backgroundColor = `${pillarConfig.color}10`
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedHabitIndex !== index) {
                      e.currentTarget.style.backgroundColor = '#2d2d2d'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {selectedHabitIndex === index && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '4px',
                      backgroundColor: pillarConfig.color,
                      borderRadius: '16px 16px 0 0'
                    }} />
                  )}
                  
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '1rem'
                  }}>
                    {habit.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#fff',
                    marginBottom: '0.5rem'
                  }}>
                    {habit.name}
                  </h3>
                  
                  <p style={{
                    color: '#9CA3AF',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {habit.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Selected Habit Info */}
            {selectedHabit && (
              <div style={{
                backgroundColor: `${pillarConfig.color}10`,
                border: `1px solid ${pillarConfig.color}40`,
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: pillarConfig.color,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  {selectedHabit.icon} {selectedHabit.name}
                </h3>
                
                <p style={{
                  color: '#D1D5DB',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  {selectedHabit.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <button
              onClick={handleUseSuggestedHabit}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#fff',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              Use This Suggestion
            </button>

            <button
              onClick={handleCreateCustomHabit}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#9CA3AF',
                background: 'transparent',
                border: '1px solid #4B5563',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.color = '#D1D5DB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#9CA3AF'
              }}
            >
              Create Custom Habit
            </button>

            <button
              onClick={onSkip}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#9CA3AF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280'
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>

      {/* QuickAddModal for custom habit creation */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={handleCloseQuickAdd}
        onAddTask={handleQuickAddTask}
        prefilledPillar={results.leastFocusedPillar}
        availableGoals={availableGoals}
        onAddGoal={onAddGoal}
      />
    </>
  )
}

export default HabitCreation
