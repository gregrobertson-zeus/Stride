'use client'

import { useTasks, useTodos, useNotes } from '@/hooks/useSupabase'
import { TodoList } from '@/components/TodoList/TodoList'
import { KanbanBoard } from '@/components/Kanban/KanbanBoard'
import { NotesPanel } from '@/components/Notes/NotesPanel'
import styles from './page.module.css'

export default function Home() {
  const { todos, setTodos, loading: todosLoading } = useTodos()
  const { tasks, setTasks, loading: tasksLoading } = useTasks()
  const { notes, setNotes, loading: notesLoading } = useNotes()

  const isLoading = todosLoading || tasksLoading || notesLoading

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Stride</h1>
        <span className={styles.tagline}>Momentum you can see</span>
      </header>
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            <div className={styles.sidebar}>
              <TodoList todos={todos} setTodos={setTodos} />
            </div>
            <div className={styles.center}>
              <KanbanBoard tasks={tasks} setTasks={setTasks} />
            </div>
            <div className={styles.sidebar}>
              <NotesPanel notes={notes} setNotes={setNotes} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
