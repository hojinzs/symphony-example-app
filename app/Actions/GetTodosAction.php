<?php

namespace App\Actions;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class GetTodosAction
{
    /**
     * @param  array{search: ?string, sort: string, status: string}  $filters
     * @return Collection<int, Todo>
     */
    public function handle(User $user, array $filters): Collection
    {
        $query = $user->todos()
            ->select(['id', 'title', 'is_completed', 'created_at'])
            ->when($filters['status'] === 'active', function (Builder $query): void {
                $query->where('is_completed', false);
            })
            ->when($filters['status'] === 'completed', function (Builder $query): void {
                $query->where('is_completed', true);
            })
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $query->where('title', 'like', '%'.addcslashes($filters['search'], '\\%_').'%');
            });

        match ($filters['sort']) {
            'oldest' => $query->oldest(),
            'alphabetical' => $query->orderBy('title')->orderByDesc('created_at'),
            default => $query->latest(),
        };

        return $query->get();
    }
}
