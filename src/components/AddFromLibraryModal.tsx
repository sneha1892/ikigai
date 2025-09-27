import { useState, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { Task, Routine, RepeatFrequency } from '../types'
import { PILLAR_CONFIGS } from '../types'

interface AddFromLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: { id: string, type: 'task' | 'routine' }) => void
  availableTasks: Task[]
  availableRoutines: Routine[]
}

function AddFromLibraryModal({
  isOpen,
  onClose,
  onAddItem,
  availableTasks,
  availableRoutines
}: AddFromLibraryModalProps) {
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'routines' | 'habits'>('routines')

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
    
    return (
      <div
        key={item.id}
        onClick={() => onAddItem({ id: item.id, type })}
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.borderSubtle}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.surfaceVariant}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0}} />
        <div style={{flex: 1}}>
          <div style={{fontSize: '14px', fontWeight: '500', color: colors.text.primary}}>{item.name}</div>
          <div style={{fontSize: '12px', color: colors.text.tertiary}}>{type === 'routine' ? `${(item as Routine).habitIds.length} habits` : pillar?.name}</div>
        </div>
      </div>
    )
  }

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
      }} onClick={onClose}>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
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

          <div style={{padding: '12px 24px'}}>
            <div style={{position: 'relative'}}>
              <Search size={18} color={colors.text.tertiary} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}}/>
              <input
                type="text"
                placeholder="Search routines & habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px',
                  border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
                  color: colors.text.primary, fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{borderBottom: `1px solid ${colors.borderSubtle}`, padding: '0 24px'}}>
            <div style={{display: 'flex'}}>
              <button onClick={() => setActiveTab('routines')} style={{
                padding: '12px 16px', border: 'none', background: 'transparent',
                color: activeTab === 'routines' ? colors.text.accent : colors.text.tertiary,
                borderBottom: `2px solid ${activeTab === 'routines' ? colors.text.accent : 'transparent'}`,
                fontWeight: '500'
              }}>
                Routines ({filteredRoutines.length})
              </button>
              <button onClick={() => setActiveTab('habits')} style={{
                padding: '12px 16px', border: 'none', background: 'transparent',
                color: activeTab === 'habits' ? colors.text.accent : colors.text.tertiary,
                borderBottom: `2px solid ${activeTab === 'habits' ? colors.text.accent : 'transparent'}`,
                fontWeight: '500'
              }}>
                Habits ({filteredHabits.length})
              </button>
            </div>
          </div>

          <div style={{flex: 1, overflow: 'auto'}}>
            {activeTab === 'routines' && (
              <div>
                {filteredRoutines.length > 0 ? filteredRoutines.map(r => renderItem(r, 'routine')) : (
                  <p style={{textAlign: 'center', padding: '20px', color: colors.text.tertiary}}>No routines found.</p>
                )}
              </div>
            )}
            {activeTab === 'habits' && (
              <div>
                {filteredHabits.length > 0 ? filteredHabits.map(h => renderItem(h, 'task')) : (
                  <p style={{textAlign: 'center', padding: '20px', color: colors.text.tertiary}}>No habits found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AddFromLibraryModal
