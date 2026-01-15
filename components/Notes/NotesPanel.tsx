'use client'

import { useState, useEffect, useRef } from 'react'
import { Linkify } from '@/components/Linkify'
import styles from './Notes.module.css'

interface Props {
  notes: string
  setNotes: (notes: string) => void
}

export function NotesPanel({ notes, setNotes }: Props) {
  const [showSaved, setShowSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (value: string) => {
    setNotes(value)

    // Show "Saved" indicator briefly
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowSaved(true)
    timeoutRef.current = setTimeout(() => {
      setShowSaved(false)
    }, 1500)
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Notes</span>
        <span className={`${styles.status} ${showSaved ? styles.visible : ''}`}>
          Saved
        </span>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
        />
      ) : (
        <div
          className={styles.notesDisplay}
          onClick={handleEditClick}
        >
          {notes ? (
            <Linkify text={notes} className={styles.notesText} />
          ) : (
            <span className={styles.placeholder}>Write your notes here...</span>
          )}
        </div>
      )}
    </div>
  )
}
