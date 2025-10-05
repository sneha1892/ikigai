import { useState, useMemo, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { Task, Routine } from '../types'
import { PILLAR_CONFIGS } from '../types'

interface AddFromLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: { id: string, type: 'task' | 'routine' }, startTime?: string) => void
  availableTasks: Task[]  
  availableRoutines: Routine[]
  prefilledStartTime?: string
  onTimeChange?: (time: string | null) => void
}

function AddFromLibraryModal({
  isOpen,
  onClose,
  onAddItem,
  availableTasks,
  availableRoutines,
  prefilledStartTime='',
}: AddFromLibraryModalProps) {
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'routines' | 'habits'>('routines')
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'task' | 'routine' } | null>(null)
  const [customStartTime, setCustomStartTime] = useState<string>(prefilledStartTime || '')
  const [timeError, setTimeError] = useState<string | null>(null)
  

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedItem(null)
      setCustomStartTime(prefilledStartTime)
      setTimeError(null)
    }
  }, [isOpen, prefilledStartTime])
  

  const handleAdd = () => {
    if (!selectedItem) return

    // Basic format validation (optional)
    if (customStartTime && !/^\d{2}:\d{2}$/.test(customStartTime)) {
      setTimeError('Invalid time format')
      return
    }

    onAddItem(selectedItem, customStartTime || undefined)
    onClose()
  }

  const filteredRoutines = useMemo(() => {
    if (!searchQuery.trim()) return availableRoutines
    const query = searchQuery.toLowerCase()
    return availableRoutines.filter(r => r.name.toLowerCase().includes(query))
  }, [availableRoutines, searchQuery])

  const filteredHabits = useMemo(() => {
    const habits = availableTasks.filter(task => task.repeatFrequency !== 'once')
    if (!searchQuery.trim()) return habits
    const query = searchQuery.toLowerCase()
    return habits.filter(h => h.name.toLowerCase().includes(query))
  }, [availableTasks, searchQuery])

  if (!isOpen) return null

  const renderItem = (item: Task | Routine, type: 'task' | 'routine') => {
    const pillar = (item as Task).pillar ? PILLAR_CONFIGS[(item as Task).pillar] : null
    const color = (item as Routine).color || pillar?.color || '#888'
    const isSelected = selectedItem?.id === item.id && selectedItem?.type === type
    
    return (
      <div
        key={item.id}
        onClick={() => setSelectedItem({ id: item.id, type })}
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
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = colors.surfaceVariant
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
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
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isSelected && (
            <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
          )}
        </div>
        <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0}} />
        <div style={{flex: 1}}>
          <div style={{fontSize: '14px', fontWeight: '500', color: colors.text.primary}}>{item.name}</div>
          <div style={{fontSize: '12px', color: colors.text.tertiary}}>{type === 'routine' ? `${(item as Routine).habitIds.length} habits` : pillar?.name}</div>
        </div>
      </div>
    )
  }

  return (
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
      }} onClick={onClose}>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.borderSubtle}`
          }}>
            {/* Header */}
            <h2 style={{margin: 0, fontSize: '20px', fontWeight: '600', color: colors.text.primary}}>
              Add from Library
            </h2>
            <button onClick={onClose} style={{
              width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'transparent',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: colors.text.tertiary
            }}>
              <X size={20} />
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Time Input */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.borderSubtle}` }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text.primary, marginBottom: '8px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => {
                  setCustomStartTime(e.target.value)
                  setTimeError(null)
                }}
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
              {timeError && (
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{timeError}</p>
              )}
            </div>

            {/* Search */}
            <div style={{ padding: '20px 24px 12px 24px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color={colors.text.tertiary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search routines & habits..."
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
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: `1px solid ${colors.borderSubtle}`, padding: '0 24px' }}>
              <div style={{ display: 'flex' }}>
                <button onClick={() => setActiveTab('routines')} style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'routines' ? colors.text.accent : colors.text.tertiary,
                  borderBottom: `2px solid ${activeTab === 'routines' ? colors.text.accent : 'transparent'}`,
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Routines ({filteredRoutines.length})
                </button>
                <button onClick={() => setActiveTab('habits')} style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'habits' ? colors.text.accent : colors.text.tertiary,
                  borderBottom: `2px solid ${activeTab === 'habits' ? colors.text.accent : 'transparent'}`,
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Habits ({filteredHabits.length})
                </button>
              </div>
            </div>

            {/* Items List - Contained Scrollable Area */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              border: `1px solid ${colors.borderSubtle}`,
              borderRadius: '8px',
              backgroundColor: colors.surface,
              margin: '16px 24px'
            }}>
              {activeTab === 'routines' && (
                <div>
                  {filteredRoutines.length > 0 ? filteredRoutines.map(r => renderItem(r, 'routine')) : (
                    <p style={{ textAlign: 'center', padding: '20px', color: colors.text.tertiary }}>No routines found.</p>
                  )}
                </div>
              )}
              {activeTab === 'habits' && (
                <div>
                  {filteredHabits.length > 0 ? filteredHabits.map(h => renderItem(h, 'task')) : (
                    <p style={{ textAlign: 'center', padding: '20px', color: colors.text.tertiary }}>No habits found.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed at Bottom */}
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${colors.borderSubtle}`
          }}>
            <button
              onClick={handleAdd}
              disabled={!selectedItem}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: selectedItem ? colors.text.accent : colors.borderSubtle,
                color: selectedItem ? '#fff' : colors.text.tertiary,
                fontSize: '16px',
                fontWeight: '500',
                cursor: selectedItem ? 'pointer' : 'not-allowed',
                opacity: selectedItem ? 1 : 0.6
              }}
            >
              Add to Day
            </button>
          </div>
        </div>
        
      </div>
    
  )
}

export default AddFromLibraryModal
