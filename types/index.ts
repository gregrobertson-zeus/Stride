export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'complete';
  createdAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TaskStatus = 'todo' | 'in-progress' | 'complete';

export interface ArchivedTask {
  id: string;
  title: string;
  originalCreatedAt: number;
  archivedAt: number;
  batchId: string;
}

export interface ArchivedBatch {
  batchId: string;
  archivedAt: number;
  tasks: ArchivedTask[];
}
