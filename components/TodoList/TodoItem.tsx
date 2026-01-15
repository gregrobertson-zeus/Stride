'use client'

import { TodoItem as TodoItemType } from '@/types'
import { Linkify } from '@/components/Linkify'
import styles from './TodoList.module.css'

interface Props {
  item: TodoItemType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ item, onToggle, onDelete }: Props) {
  return (
    <div className={styles.item} onClick={() => onToggle(item.id)}>
      <div className={`${styles.checkbox} ${item.completed ? styles.checked : ''}`}>
        {item.completed && <span className={styles.checkmark}>✓</span>}
      </div>
      <Linkify text={item.text} className={`${styles.text} ${item.completed ? styles.completed : ''}`} />
      <button
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(item.id)
        }}
      >
        ×
      </button>
    </div>
  )
}
