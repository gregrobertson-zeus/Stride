'use client'

import { useState, FormEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types'
import { KanbanCard } from './KanbanCard'
import styles from './Kanban.module.css'

interface Props {
  title: string
  status: TaskStatus
  tasks: Task[]
  onAddTask: (title: string, status: TaskStatus) => void
  onDeleteTask: (id: string) => void
  celebrateTaskId?: string | null
  isClearing?: boolean
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'complete': 'Complete',
}

export function KanbanColumn({ title, status, tasks, onAddTask, onDeleteTask, celebrateTaskId, isClearing }: Props) {
  const [newTask, setNewTask] = useState('')
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    onAddTask(newTask.trim(), status)
    setNewTask('')
  }

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{COLUMN_LABELS[status]}</span>
        <span className={styles.columnCount}>{tasks.length}</span>
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
