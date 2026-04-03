import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Circle, Clock3, ListTodo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { DashboardProps, TodoWithCreatedAt } from '@/types';
import { dashboard } from '@/routes';
import { index as todosIndex } from '@/routes/todos';

const appLocale =
    (typeof document !== 'undefined' && document.documentElement.lang) ||
    (typeof navigator !== 'undefined' && navigator.language) ||
    'en';

const createdAtFormatter = new Intl.DateTimeFormat(appLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function formatCreatedAt(createdAt: TodoWithCreatedAt['created_at']) {
    if (!createdAt) {
        return 'Created time unavailable';
    }

    return createdAtFormatter.format(new Date(createdAt));
}

export default function Dashboard({ recentTodos }: DashboardProps) {
    const todosIndexUrl = todosIndex.url();

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ListTodo className="size-5" />
                                Recent Todos
                            </CardTitle>
                            <CardDescription>
                                Your 5 most recently created todos with quick
                                access back to the list.
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="w-fit">
                            {recentTodos.length} / 5 shown
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {recentTodos.length === 0 ? (
                                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                    No todos yet. Create one to see it here.
                                </div>
                            ) : (
                                recentTodos.map((todo) => (
                                    <Link
                                        key={todo.id}
                                        href={`${todosIndexUrl}#todo-${todo.id}`}
                                        className="block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        prefetch
                                    >
                                        <Card className="gap-4 border-border/70 py-4 transition-colors hover:border-primary/40 hover:bg-accent/30">
                                            <CardContent className="flex items-start justify-between gap-4 px-4">
                                                <div className="min-w-0 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        {todo.is_completed ? (
                                                            <CheckCircle2 className="size-4 text-emerald-600" />
                                                        ) : (
                                                            <Circle className="size-4 text-muted-foreground" />
                                                        )}
                                                        <p className="truncate text-sm font-medium sm:text-base">
                                                            {todo.title}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                                                        <Clock3 className="size-3.5" />
                                                        <span>
                                                            {formatCreatedAt(
                                                                todo.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        todo.is_completed
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="shrink-0"
                                                >
                                                    {todo.is_completed
                                                        ? 'Completed'
                                                        : 'Open'}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
