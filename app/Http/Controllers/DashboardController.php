<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'recentTodos' => $request->user()
                ->todos()
                ->latest()
                ->take(5)
                ->get(['id', 'title', 'is_completed', 'created_at'])
                ->map(fn (Todo $todo): array => [
                    'id' => $todo->id,
                    'title' => $todo->title,
                    'is_completed' => $todo->is_completed,
                    'created_at' => $todo->created_at?->toIso8601String(),
                ])
                ->values()
                ->all(),
        ]);
    }
}
