export type TodoSort = 'latest' | 'oldest' | 'alphabetical';

export type TodoStatus = 'all' | 'active' | 'completed';

export interface Todo {
    id: number;
    title: string;
    is_completed: boolean;
}

export interface TodoWithCreatedAt extends Todo {
    created_at: string | null;
}

export interface TodoFilters {
    search: string | null;
    sort: TodoSort;
    status: TodoStatus;
}

export interface StoreTodoRequestData {
    title: string;
}

export interface UpdateTodoRequestData {
    title?: string;
    is_completed?: boolean;
}
