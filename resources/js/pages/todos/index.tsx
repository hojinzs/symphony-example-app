import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import TodoController from '@/actions/App/Http/Controllers/TodoController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { index } from '@/routes/todos';

type Todo = {
    id: number;
    title: string;
    is_completed: boolean;
};

export default function TodosIndex({ todos }: { todos: Todo[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(TodoController.store().url, {
            preserveScroll: true,
            onSuccess: () => reset('title'),
        });
    }

    function toggleTodo(todo: Todo) {
        router.patch(TodoController.update(todo.id).url, {}, {
            preserveScroll: true,
        });
    }

    function deleteTodo(todo: Todo) {
        router.delete(TodoController.destroy(todo.id).url, {
            preserveScroll: true,
        });
    }

    const completedCount = todos.filter((t) => t.is_completed).length;

    return (
        <>
            <Head title="Todos" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Todos</h1>
                    <p className="text-muted-foreground text-sm">
                        {completedCount}/{todos.length} completed
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
                    <Input
                        type="text"
                        placeholder="Add a new todo..."
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={processing}>
                        Add
                    </Button>
                </form>
                {errors.title && <InputError message={errors.title} className="-mt-4 mb-4" />}

                <div className="space-y-2">
                    {todos.length === 0 && (
                        <p className="text-muted-foreground py-8 text-center text-sm">
                            No todos yet. Add one above!
                        </p>
                    )}
                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                        >
                            <Checkbox
                                checked={todo.is_completed}
                                onCheckedChange={() => toggleTodo(todo)}
                            />
                            <span
                                className={`flex-1 ${todo.is_completed ? 'text-muted-foreground line-through' : ''}`}
                            >
                                {todo.title}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTodo(todo)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
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
