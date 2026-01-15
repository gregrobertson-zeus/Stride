'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useState, useRef, useEffect } from 'react'
import { Task, TaskStatus } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { useCelebration } from '@/hooks/useCelebration'
import { useArchivedTasks } from '@/hooks/useSupabase'
import styles from './Kanban.module.css'

interface Props {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'complete']
const CLEAR_THRESHOLD = 5

export function KanbanBoard({ tasks, setTasks }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [celebrateTaskId, setCelebrateTaskId] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const dragStartStatusRef = useRef<TaskStatus | null>(null)
  const { celebrate, megaCelebrate } = useCelebration()
  const { archivedBatches, archiveTasks } = useArchivedTasks()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Check for 5 completed tasks
  useEffect(() => {
    const completedTasks = tasks.filter(t => t.status === 'complete')

    if (completedTasks.length >= CLEAR_THRESHOLD && !isClearing) {
      setIsClearing(true)

      // Trigger mega celebration
      setTimeout(() => {
        megaCelebrate()

        // Archive tasks before removing them
        archiveTasks(completedTasks)

        // Animate cards out then remove them
        setTimeout(() => {
          // Remove completed tasks
          setTasks(tasks.filter(t => t.status !== 'complete'))
          setIsClearing(false)
        }, 1500)
      }, 300)
    }
  }, [tasks, isClearing, megaCelebrate, setTasks, archiveTasks])

  const addTask = (title: string, status: TaskStatus) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status,
      createdAt: Date.now(),
    }
    setTasks([...tasks, task])
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
      dragStartStatusRef.current = task.status
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    if (STATUSES.includes(overId as TaskStatus)) {
      if (activeTask.status !== overId) {
        setTasks(tasks.map(t =>
          t.id === activeId ? { ...t, status: overId as TaskStatus } : t
        ))
      }
      return
    }

    const overTask = tasks.find(t => t.id === overId)
    if (overTask && activeTask.status !== overTask.status) {
      setTasks(tasks.map(t =>
        t.id === activeId ? { ...t, status: overTask.status } : t
      ))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const activeId = active.id as string

    const task = tasks.find(t => t.id === activeId)
    const startStatus = dragStartStatusRef.current

    // Single task celebration (only if not about to trigger mega celebration)
    const completedCount = tasks.filter(t => t.status === 'complete').length
    if (task && task.status === 'complete' && startStatus !== 'complete' && completedCount < CLEAR_THRESHOLD) {
      setCelebrateTaskId(activeId)
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-task-id="${activeId}"]`)
        celebrate(cardElement as HTMLElement)
        setTimeout(() => setCelebrateTaskId(null), 600)
      }, 100)
    }

    setActiveTask(null)
    dragStartStatusRef.current = null

    if (!over) return

    const overId = over.id as string

    if (activeId === overId) return

    const activeTaskCurrent = tasks.find(t => t.id === activeId)
    const overTask = tasks.find(t => t.id === overId)

    if (activeTaskCurrent && overTask && activeTaskCurrent.status === overTask.status) {
      const oldIndex = tasks.findIndex(t => t.id === activeId)
      const newIndex = tasks.findIndex(t => t.id === overId)

      const newTasks = [...tasks]
      newTasks.splice(oldIndex, 1)
      newTasks.splice(newIndex, 0, activeTaskCurrent)
      setTasks(newTasks)
    }
  }

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            title={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            celebrateTaskId={celebrateTaskId}
            isClearing={status === 'complete' && isClearing}
            archivedBatches={status === 'complete' ? archivedBatches : undefined}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className={styles.dragOverlay}>
            {activeTask.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
