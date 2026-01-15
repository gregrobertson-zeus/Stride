'use client'

import { useState, FormEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus, ArchivedBatch } from '@/types'
import { KanbanCard } from './KanbanCard'
import { Linkify } from '@/components/Linkify'
import { useCelebration } from '@/hooks/useCelebration'
import styles from './Kanban.module.css'

interface Props {
  title: string
  status: TaskStatus
  tasks: Task[]
  onAddTask: (title: string, status: TaskStatus) => void
  onDeleteTask: (id: string) => void
  celebrateTaskId?: string | null
  isClearing?: boolean
  archivedBatches?: ArchivedBatch[]
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'complete': 'Complete',
}

export function KanbanColumn({ title, status, tasks, onAddTask, onDeleteTask, celebrateTaskId, isClearing, archivedBatches }: Props) {
  const [newTask, setNewTask] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const { playWhoosh } = useCelebration()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    onAddTask(newTask.trim(), status)
    setNewTask('')
  }

  const handleToggleHistory = () => {
    playWhoosh()
    setShowHistory(prev => !prev)
  }

  const hasHistory = archivedBatches && archivedBatches.length > 0

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{COLUMN_LABELS[status]}</span>
        <div className={styles.columnHeaderRight}>
          {status === 'complete' && hasHistory && (
            <button
              className={`${styles.historyToggle} ${showHistory ? styles.historyToggleActive : ''}`}
              onClick={handleToggleHistory}
              title={showHistory ? 'Hide history' : 'Show history'}
            >
              <span className={styles.historyIcon}>
                {showHistory ? '▼' : '▶'}
              </span>
              History
            </button>
          )}
          <span className={styles.columnCount}>{tasks.length}</span>
        </div>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`${styles.columnContent} ${isOver ? styles.dragOver : ''}`}
        >
          {tasks.length === 0 ? (
            <div className={styles.empty}>Drop tasks here</div>
          ) : (
            tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                isCelebrating={celebrateTaskId === task.id}
                isClearing={isClearing}
                clearDelay={index * 100}
              />
            ))
          )}
        </div>
      </SortableContext>

      {status === 'complete' && hasHistory && (
        <div className={`${styles.historySection} ${showHistory ? styles.historyExpanded : styles.historyCollapsed}`}>
          <div className={styles.historyContent}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>Completed History</span>
              <span className={styles.historyCount}>
                {archivedBatches!.reduce((sum, b) => sum + b.tasks.length, 0)} tasks
              </span>
            </div>
            {archivedBatches!.map(batch => (
              <div key={batch.batchId} className={styles.historyBatch}>
                <div className={styles.batchDate}>
                  {new Date(batch.archivedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {batch.tasks.map(task => (
                  <div key={task.id} className={styles.archivedCard}>
                    <Linkify text={task.title} className={styles.archivedTitle} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <form className={styles.addForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.addInput}
          placeholder="Add task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className={styles.addButton}>+</button>
      </form>
    </div>
  )
}
