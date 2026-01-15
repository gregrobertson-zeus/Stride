'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import { Linkify } from '@/components/Linkify'
import { useTaskComments } from '@/hooks/useSupabase'
import styles from './Kanban.module.css'

interface Props {
  task: Task
  onDelete: (id: string) => void
  isCelebrating?: boolean
  isClearing?: boolean
  clearDelay?: number
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function KanbanCard({ task, onDelete, isCelebrating, isClearing, clearDelay = 0 }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const { fetchComments, addComment, getComments, getCommentCount } = useTaskComments()

  const comments = getComments(task.id)
  const commentCount = getCommentCount(task.id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isExpanded })

  useEffect(() => {
    if (isExpanded) {
      fetchComments(task.id)
    }
  }, [isExpanded, task.id, fetchComments])

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.cardDelete}`)) return
    if ((e.target as HTMLElement).closest(`.${styles.commentsSection}`)) return
    setIsExpanded(!isExpanded)
  }

  const handleSubmitComment = (e: FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    addComment(task.id, newComment)
    setNewComment('')
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isClearing && { animationDelay: `${clearDelay}ms` }),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isCelebrating ? styles.celebrating : ''} ${isClearing ? styles.clearing : ''} ${isExpanded ? styles.cardExpanded : ''}`}
      data-task-id={task.id}
      onClick={handleCardClick}
      {...attributes}
      {...(isExpanded ? {} : listeners)}
    >
      <div className={styles.cardHeader}>
        <Linkify text={task.title} className={styles.cardTitle} />
        <div className={styles.cardActions}>
          {!isExpanded && commentCount > 0 && (
            <span className={styles.commentBadge}>{commentCount}</span>
          )}
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
      </div>

      {isExpanded && (
        <div
          className={styles.commentsSection}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <div className={styles.noComments}>No comments yet</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <Linkify text={comment.content} className={styles.commentContent} />
                  <span className={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</span>
                </div>
              ))
            )}
          </div>
          <form className={styles.commentForm} onSubmit={handleSubmitComment}>
            <input
              type="text"
              className={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className={styles.commentSubmit}>+</button>
          </form>
        </div>
      )}
    </div>
  )
}
