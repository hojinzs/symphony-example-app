import type { Todo, TodoFilters, TodoWithCreatedAt } from '@/types/todo';

export interface DashboardProps {
    recentTodos: TodoWithCreatedAt[];
}

export interface TodosIndexProps {
    filters: TodoFilters;
    todos: Todo[];
}
