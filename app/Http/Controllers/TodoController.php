<?php

namespace App\Http\Controllers;

use App\Actions\GetTodosAction;
use App\Actions\TodoAction;
use App\Http\Requests\IndexTodoRequest;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function __construct(
        private GetTodosAction $getTodosAction,
        private TodoAction $todoAction,
    ) {}

    public function index(IndexTodoRequest $request): Response
    {
        $filters = $request->filters();

        return Inertia::render('todos/index', [
            'filters' => $filters,
            'todos' => $this->getTodosAction
                ->handle($request->user(), $filters)
                ->map(fn (Todo $todo): array => [
                    'id' => $todo->id,
                    'title' => $todo->title,
                    'is_completed' => $todo->is_completed,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreTodoRequest $request): RedirectResponse
    {
        $this->todoAction->store($request->user(), $request->validated());

        return back();
    }

    public function update(UpdateTodoRequest $request, Todo $todo): RedirectResponse
    {
        $this->todoAction->update($todo, $request->validated());

        return back();
    }

    public function destroy(Todo $todo): RedirectResponse
    {
        Gate::authorize('delete', $todo);

        $this->todoAction->delete($todo);

        return back();
    }
}
