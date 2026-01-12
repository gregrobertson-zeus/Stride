'use client'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import { TodoList } from '@/components/TodoList/TodoList'
import { KanbanBoard } from '@/components/Kanban/KanbanBoard'
import { NotesPanel } from '@/components/Notes/NotesPanel'
import { Task, TodoItem } from '@/types'
import styles from './page.module.css'

export default function Home() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('stride-todos', [])
  const [tasks, setTasks] = useLocalStorage<Task[]>('stride-tasks', [])
  const [notes, setNotes] = useLocalStorage<string>('stride-notes', '')

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Stride</h1>
        <span className={styles.tagline}>Momentum you can see</span>
      </header>
      <main className={styles.main}>
        <div className={styles.sidebar}>
          <TodoList todos={todos} setTodos={setTodos} />
        </div>
        <div className={styles.center}>
          <KanbanBoard tasks={tasks} setTasks={setTasks} />
        </div>
        <div className={styles.sidebar}>
          <NotesPanel notes={notes} setNotes={setNotes} />
        </div>
      </main>
    </div>
  )
}
