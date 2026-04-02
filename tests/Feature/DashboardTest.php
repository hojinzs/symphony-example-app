<?php

use App\Models\Todo;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('recentTodos')
        );
});

test('dashboard shows the authenticated users five most recent todos', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Todo::factory()->for($otherUser)->create([
        'title' => 'Other user todo',
        'created_at' => now()->addMinute(),
    ]);

    Todo::factory()->for($user)->create([
        'title' => 'Oldest todo',
        'created_at' => now()->subMinutes(6),
    ]);

    $expectedTitles = ['Newest todo', 'Second todo', 'Third todo', 'Fourth todo', 'Fifth todo'];

    Todo::factory()->for($user)->create([
        'title' => 'Fifth todo',
        'created_at' => now()->subMinutes(5),
    ]);

    Todo::factory()->for($user)->completed()->create([
        'title' => 'Fourth todo',
        'created_at' => now()->subMinutes(4),
    ]);

    Todo::factory()->for($user)->create([
        'title' => 'Third todo',
        'created_at' => now()->subMinutes(3),
    ]);

    Todo::factory()->for($user)->create([
        'title' => 'Second todo',
        'created_at' => now()->subMinutes(2),
    ]);

    Todo::factory()->for($user)->create([
        'title' => 'Newest todo',
        'created_at' => now()->subMinute(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('recentTodos', function ($recentTodos) use ($expectedTitles) {
                $recentTodoCollection = collect($recentTodos);

                expect($recentTodoCollection)->toHaveCount(5);
                expect($recentTodoCollection->pluck('title')->all())->toBe($expectedTitles);
                expect($recentTodoCollection->pluck('title')->all())->not->toContain('Oldest todo', 'Other user todo');
                expect($recentTodoCollection->get(3)['is_completed'])->toBeTrue();
                expect($recentTodoCollection->get(0)['created_at'])->not->toBeNull();

                return true;
            })
        );
});
