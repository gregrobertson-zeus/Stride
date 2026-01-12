'use client'

import { useState, FormEvent } from 'react'
import { TodoItem as TodoItemType } from '@/types'
import { TodoItem } from './TodoItem'
import styles from './TodoList.module.css'

interface Props {
  todos: TodoItemType[]
  setTodos: (todos: TodoItemType[]) => void
}

export function TodoList({ todos, setTodos }: Props) {
  const [newTodo, setNewTodo] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const todo: TodoItemType = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
    }
    setTodos([...todos, todo])
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const activeCount = todos.filter(t => !t.completed).length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Quick Tasks</span>
        <span className={styles.count}>{activeCount}</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Add a task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" className={styles.addButton}>Add</button>
      </form>

      <div className={styles.list}>
        {todos.length === 0 ? (
          <div className={styles.empty}>No tasks yet</div>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              item={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>
    </div>
  )
}
