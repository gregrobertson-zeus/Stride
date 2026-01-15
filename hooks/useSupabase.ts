'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Task, TodoItem, ArchivedTask, ArchivedBatch } from '@/types'

export function useTasks() {
  const [tasks, setTasksState] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
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

    fetchTasks()
  }, [])

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

    if (!supabase) return

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
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    const fetchTodos = async () => {
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

    fetchTodos()
  }, [])

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

    if (!supabase) return

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
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    const fetchNotes = async () => {
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

    fetchNotes()
  }, [])

  const setNotes = useCallback(async (newNotes: string) => {
    setNotesState(newNotes)

    const supabase = getSupabase()
    if (!supabase) return

    await supabase
      .from('notes')
      .update({ content: newNotes, updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001')
  }, [])

  return { notes, setNotes, loading }
}

export function useArchivedTasks() {
  const [archivedTasks, setArchivedTasksState] = useState<ArchivedTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    const fetchArchivedTasks = async () => {
      const { data, error } = await supabase
        .from('archived_tasks')
        .select('*')
        .order('archived_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching archived tasks:', error)
      } else {
        setArchivedTasksState(data.map(t => ({
          id: t.id,
          title: t.title,
          originalCreatedAt: new Date(t.original_created_at).getTime(),
          archivedAt: new Date(t.archived_at).getTime(),
          batchId: t.batch_id
        })))
      }
      setLoading(false)
    }

    fetchArchivedTasks()
  }, [])

  const archiveTasks = useCallback(async (tasks: Task[]) => {
    const supabase = getSupabase()
    if (!supabase || tasks.length === 0) return

    const batchId = crypto.randomUUID()
    const archivedAt = new Date().toISOString()

    const archiveData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      original_created_at: new Date(task.createdAt).toISOString(),
      archived_at: archivedAt,
      batch_id: batchId
    }))

    const { error } = await supabase.from('archived_tasks').insert(archiveData)

    if (error) {
      console.error('Error archiving tasks:', error)
    } else {
      const newArchivedTasks: ArchivedTask[] = tasks.map(task => ({
        id: task.id,
        title: task.title,
        originalCreatedAt: task.createdAt,
        archivedAt: new Date(archivedAt).getTime(),
        batchId
      }))
      setArchivedTasksState(prev => [...newArchivedTasks, ...prev])
    }
  }, [])

  const archivedBatches = useMemo(() => {
    const batches = new Map<string, ArchivedBatch>()

    archivedTasks.forEach(task => {
      if (!batches.has(task.batchId)) {
        batches.set(task.batchId, {
          batchId: task.batchId,
          archivedAt: task.archivedAt,
          tasks: []
        })
      }
      batches.get(task.batchId)!.tasks.push(task)
    })

    return Array.from(batches.values()).sort((a, b) => b.archivedAt - a.archivedAt)
  }, [archivedTasks])

  return { archivedTasks, archivedBatches, archiveTasks, loading }
}
