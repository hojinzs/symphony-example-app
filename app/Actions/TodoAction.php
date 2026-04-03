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

    /**
     * @param  array{is_completed?: bool, title?: string}  $attributes
     */
    public function update(Todo $todo, array $attributes): void
    {
        $todo->update($attributes);
    }

    public function delete(Todo $todo): void
    {
        $todo->delete();
    }
}
