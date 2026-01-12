'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Task, TodoItem } from '@/types'

export function useTasks() {
  const [tasks, setTasksState] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasksState(data.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status as Task['status'],
        createdAt: t.created_at
      })))
    }
    setLoading(false)
  }

  const setTasks = useCallback(async (newTasks: Task[]) => {
    const supabase = getSupabase()
    const currentIds = tasks.map(t => t.id)
    const newIds = newTasks.map(t => t.id)

    const deletedIds = currentIds.filter(id => !newIds.includes(id))
    const addedTasks = newTasks.filter(t => !currentIds.includes(t.id))
    const updatedTasks = newTasks.filter(t => {
      const existing = tasks.find(e => e.id === t.id)
      return existing && (existing.status !== t.status || existing.title !== t.title)
    })

    setTasksState(newTasks)

    if (deletedIds.length > 0) {
      await supabase.from('tasks').delete().in('id', deletedIds)
    }

    for (const task of addedTasks) {
      await supabase.from('tasks').insert({
        id: task.id,
        title: task.title,
        status: task.status,
        created_at: task.createdAt
      })
    }

    for (const task of updatedTasks) {
      await supabase.from('tasks').update({
        title: task.title,
        status: task.status
      }).eq('id', task.id)
    }
  }, [tasks])

  return { tasks, setTasks, loading }
}

export function useTodos() {
  const [todos, setTodosState] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodosState(data.map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed
      })))
    }
    setLoading(false)
  }

  const setTodos = useCallback(async (newTodos: TodoItem[]) => {
    const supabase = getSupabase()
    const currentIds = todos.map(t => t.id)
    const newIds = newTodos.map(t => t.id)

    const deletedIds = currentIds.filter(id => !newIds.includes(id))
    const addedTodos = newTodos.filter(t => !currentIds.includes(t.id))
    const updatedTodos = newTodos.filter(t => {
      const existing = todos.find(e => e.id === t.id)
      return existing && existing.completed !== t.completed
    })

    setTodosState(newTodos)

    if (deletedIds.length > 0) {
      await supabase.from('todos').delete().in('id', deletedIds)
    }

    for (const todo of addedTodos) {
      await supabase.from('todos').insert({
        id: todo.id,
        text: todo.text,
        completed: todo.completed
      })
    }

    for (const todo of updatedTodos) {
      await supabase.from('todos').update({
        completed: todo.completed
      }).eq('id', todo.id)
    }
  }, [todos])

  return { todos, setTodos, loading }
}

export function useNotes() {
  const [notes, setNotesState] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (error) {
      console.error('Error fetching notes:', error)
    } else if (data) {
      setNotesState(data.content || '')
    }
    setLoading(false)
  }

  const setNotes = useCallback(async (newNotes: string) => {
    const supabase = getSupabase()
    setNotesState(newNotes)

    await supabase
      .from('notes')
      .update({ content: newNotes, updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001')
  }, [])

  return { notes, setNotes, loading }
}
