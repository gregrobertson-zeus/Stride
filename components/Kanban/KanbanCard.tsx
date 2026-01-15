'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import { Linkify } from '@/components/Linkify'
import styles from './Kanban.module.css'

interface Props {
  task: Task
  onDelete: (id: string) => void
  isCelebrating?: boolean
  isClearing?: boolean
  clearDelay?: number
}

export function KanbanCard({ task, onDelete, isCelebrating, isClearing, clearDelay = 0 }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isClearing && { animationDelay: `${clearDelay}ms` }),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isCelebrating ? styles.celebrating : ''} ${isClearing ? styles.clearing : ''}`}
      data-task-id={task.id}
      {...attributes}
      {...listeners}
    >
      <Linkify text={task.title} className={styles.cardTitle} />
      <button
        className={styles.cardDelete}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  )
}
