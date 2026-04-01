<?php

namespace App\Actions;

use App\Models\Todo;
use App\Models\User;

class TodoAction
{
    /**
     * @param  array{title: string}  $attributes
     */
    public function store(User $user, array $attributes): Todo
    {
        return $user->todos()->create($attributes);
    }

    public function toggle(Todo $todo): void
    {
        $todo->update([
            'is_completed' => ! $todo->is_completed,
        ]);
    }

    public function delete(Todo $todo): void
    {
        $todo->delete();
    }
}
