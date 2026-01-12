'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Notes.module.css'

interface Props {
  notes: string
  setNotes: (notes: string) => void
}

export function NotesPanel({ notes, setNotes }: Props) {
  const [showSaved, setShowSaved] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

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

      <textarea
        className={styles.textarea}
        placeholder="Write your notes here..."
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
}
