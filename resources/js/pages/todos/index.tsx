import { Head, router, useForm } from '@inertiajs/react';
import { Check, Pencil, RotateCcw, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import TodoController from '@/actions/App/Http/Controllers/TodoController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { index } from '@/routes/todos';

type Todo = {
    id: number;
    title: string;
    is_completed: boolean;
};

type TodoFilters = {
    search: string | null;
    sort: 'latest' | 'oldest' | 'alphabetical';
    status: 'all' | 'active' | 'completed';
};

const defaultFilters: TodoFilters = {
    search: '',
    sort: 'latest',
    status: 'all',
};

export default function TodosIndex({
    filters,
    todos,
}: {
    filters: TodoFilters;
    todos: Todo[];
}) {
    const createForm = useForm({
        title: '',
    });
    const editForm = useForm({
        title: '',
    });
    const [activeFilters, setActiveFilters] = useState<TodoFilters>({
        ...defaultFilters,
        ...filters,
    });
    const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        createForm.post(TodoController.store().url, {
            preserveScroll: true,
            onSuccess: () => createForm.reset('title'),
        });
    }

    function applyFilters(nextFilters: TodoFilters) {
        setActiveFilters(nextFilters);

        router.get(index(), nextFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function handleFilterSubmit(e: FormEvent) {
        e.preventDefault();
        applyFilters(activeFilters);
    }

    function updateFilter<K extends keyof TodoFilters>(key: K, value: TodoFilters[K]) {
        const nextFilters = {
            ...activeFilters,
            [key]: value,
        };

        setActiveFilters(nextFilters);

        if (key !== 'search') {
            applyFilters(nextFilters);
        }
    }

    function resetFilters() {
        setActiveFilters(defaultFilters);

        router.get(index(), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function toggleTodo(todo: Todo) {
        router.patch(
            TodoController.update(todo.id).url,
            {
                is_completed: !todo.is_completed,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function startEditing(todo: Todo) {
        setEditingTodoId(todo.id);
        editForm.clearErrors();
        editForm.setData('title', todo.title);
    }

    function cancelEditing() {
        setEditingTodoId(null);
        editForm.reset();
        editForm.clearErrors();
    }

    function saveTodo(todo: Todo) {
        editForm.patch(TodoController.update(todo.id).url, {
            preserveScroll: true,
            onSuccess: () => cancelEditing(),
        });
    }

    function deleteTodo(todo: Todo) {
        router.delete(TodoController.destroy(todo.id).url, {
            preserveScroll: true,
        });
    }

    const completedCount = todos.filter((todo) => todo.is_completed).length;
    const hasActiveFilters =
        (filters.search ?? '') !== '' ||
        filters.sort !== defaultFilters.sort ||
        filters.status !== defaultFilters.status;

    return (
        <>
            <Head title="Todos" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <div className="rounded-2xl border bg-card/60 p-6 shadow-xs">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold tracking-tight">Todos</h1>
                            <p className="text-muted-foreground text-sm">
                                Keep the list tidy with inline edits, focused filters, and quick
                                sorting.
                            </p>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Showing {todos.length} item{todos.length === 1 ? '' : 's'} and{' '}
                            {completedCount} completed
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-2xl border bg-card/60 p-5 shadow-xs"
                    >
                        <div className="space-y-1">
                            <h2 className="font-medium">Add a todo</h2>
                            <p className="text-muted-foreground text-sm">
                                New items land at the top by default.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                type="text"
                                placeholder="Add a new todo..."
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={createForm.processing}>
                                Add
                            </Button>
                        </div>
                        <InputError message={createForm.errors.title} />
                    </form>

                    <form
                        onSubmit={handleFilterSubmit}
                        className="space-y-4 rounded-2xl border bg-card/60 p-5 shadow-xs"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 className="font-medium">Find the right items</h2>
                            <p className="text-muted-foreground text-sm">
                                Narrow the list by status, title, or display order.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                            <div className="grid gap-2">
                                <Label htmlFor="todo-search">Search</Label>
                                <Input
                                    id="todo-search"
                                    type="search"
                                    value={activeFilters.search ?? ''}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    placeholder="Search by title"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="todo-sort">Sort</Label>
                                <Select
                                    value={activeFilters.sort}
                                    onValueChange={(value: TodoFilters['sort']) =>
                                        updateFilter('sort', value)
                                    }
                                >
                                    <SelectTrigger id="todo-sort" className="w-full">
                                        <SelectValue placeholder="Select sort order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Latest first</SelectItem>
                                        <SelectItem value="oldest">Oldest first</SelectItem>
                                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <ToggleGroup
                                    type="single"
                                    value={activeFilters.status}
                                    onValueChange={(value: TodoFilters['status'] | '') => {
                                        if (value !== '') {
                                            updateFilter('status', value);
                                        }
                                    }}
                                    variant="outline"
                                >
                                    <ToggleGroupItem value="all">All</ToggleGroupItem>
                                    <ToggleGroupItem value="active">Active</ToggleGroupItem>
                                    <ToggleGroupItem value="completed">Completed</ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" variant="outline">
                                    Apply search
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetFilters}>
                                    <RotateCcw className="size-4" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="space-y-2">
                    {todos.length === 0 && (
                        <div className="rounded-2xl border border-dashed p-10 text-center">
                            <p className="text-sm font-medium">
                                {hasActiveFilters
                                    ? 'No todos match the current filters.'
                                    : 'No todos yet.'}
                            </p>
                            <p className="text-muted-foreground mt-2 text-sm">
                                {hasActiveFilters
                                    ? 'Adjust the filters or search term to broaden the results.'
                                    : 'Add one above to get started.'}
                            </p>
                        </div>
                    )}

                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className="rounded-2xl border bg-card/60 p-4 shadow-xs"
                        >
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    checked={todo.is_completed}
                                    onCheckedChange={() => toggleTodo(todo)}
                                    className="mt-1"
                                />

                                <div className="flex-1 space-y-3">
                                    {editingTodoId === todo.id ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                saveTodo(todo);
                                            }}
                                            className="space-y-3"
                                        >
                                            <Input
                                                value={editForm.data.title}
                                                onChange={(e) =>
                                                    editForm.setData('title', e.target.value)
                                                }
                                                autoFocus
                                            />
                                            <InputError message={editForm.errors.title} />
                                            <div className="flex gap-2">
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={editForm.processing}
                                                >
                                                    <Check className="size-4" />
                                                    Save
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={cancelEditing}
                                                >
                                                    <X className="size-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-1">
                                                <p
                                                    className={`text-sm font-medium ${todo.is_completed ? 'text-muted-foreground line-through' : ''}`}
                                                >
                                                    {todo.title}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {todo.is_completed ? 'Completed' : 'In progress'}
                                                </p>
                                            </div>

                                            <div className="flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => startEditing(todo)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteTodo(todo)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

TodosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Todos',
            href: index(),
        },
    ],
};
