<?php

namespace App\Http\Controllers;

use App\Actions\TodoAction;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\ToggleTodoRequest;
use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function __construct(private TodoAction $todoAction) {}

    public function index(Request $request): Response
    {
        return Inertia::render('todos/index', [
            'todos' => $request->user()
                ->todos()
                ->latest()
                ->get(),
        ]);
    }

    public function store(StoreTodoRequest $request): RedirectResponse
    {
        $this->todoAction->store($request->user(), $request->validated());

        return back();
    }

    public function update(ToggleTodoRequest $request, Todo $todo): RedirectResponse
    {
        $this->todoAction->toggle($todo);

        return back();
    }

    public function destroy(Todo $todo): RedirectResponse
    {
        Gate::authorize('delete', $todo);

        $this->todoAction->delete($todo);

        return back();
    }
}
