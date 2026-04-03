<?php

use App\Models\Todo;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('todos.index'));
    $response->assertRedirect(route('login'));
});

test('guests cannot create, update, or delete todos', function () {
    $todo = Todo::factory()->create();

    $this->post(route('todos.store'), [
        'title' => 'Buy groceries',
    ])->assertRedirect(route('login'));

    $this->patch(route('todos.update', $todo))
        ->assertRedirect(route('login'));

    $this->delete(route('todos.destroy', $todo))
        ->assertRedirect(route('login'));
});

test('authenticated users can view todos', function () {
    $user = User::factory()->create();
    $oldestTodo = Todo::factory()->for($user)->create([
        'title' => 'First todo',
        'created_at' => now()->subDays(2),
    ]);
    $latestTodo = Todo::factory()->for($user)->create([
        'title' => 'Latest todo',
        'created_at' => now(),
    ]);
    Todo::factory()->create([
        'title' => 'Another user todo',
    ]);

    $this->actingAs($user)
        ->get(route('todos.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('todos/index')
            ->where('filters.search', null)
            ->where('filters.sort', 'latest')
            ->where('filters.status', 'all')
            ->where('todos.0', [
                'id' => $latestTodo->id,
                'title' => $latestTodo->title,
                'is_completed' => $latestTodo->is_completed,
            ])
            ->where('todos.1', [
                'id' => $oldestTodo->id,
                'title' => $oldestTodo->title,
                'is_completed' => $oldestTodo->is_completed,
            ])
            ->has('todos', 2)
        );
});

test('users can create a todo', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('todos.store'), [
        'title' => 'Buy groceries',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('todos', [
        'user_id' => $user->id,
        'title' => 'Buy groceries',
        'is_completed' => false,
    ]);
});

test('todo title is required', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('todos.store'), [
        'title' => '   ',
    ]);

    $response->assertSessionHasErrors('title');
});

test('todo title may not exceed 255 characters', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('todos.store'), [
        'title' => str_repeat('a', 256),
    ]);

    $response->assertSessionHasErrors('title');
});

test('users can create multiple todos with the same title', function () {
    $user = User::factory()->create();
    $title = 'Buy groceries';

    $this->actingAs($user)->post(route('todos.store'), [
        'title' => $title,
    ])->assertRedirect();

    $this->actingAs($user)->post(route('todos.store'), [
        'title' => $title,
    ])->assertRedirect();

    expect($user->todos()->where('title', $title)->count())->toBe(2);
});

test('users can toggle a todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create(['is_completed' => false]);

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), [
        'is_completed' => true,
    ]);

    $response->assertRedirect();
    expect($todo->fresh()->is_completed)->toBeTrue();
});

test('users can toggle a completed todo back to incomplete', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->completed()->create();

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), [
        'is_completed' => false,
    ]);

    $response->assertRedirect();
    expect($todo->fresh()->is_completed)->toBeFalse();
});

test('completed todos remain completed when the same completion state is submitted again', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->completed()->create();

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), [
        'is_completed' => true,
    ]);

    $response->assertRedirect();
    expect($todo->fresh()->is_completed)->toBeTrue();
});

test('duplicate completion requests keep a todo completed', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create(['is_completed' => false]);

    $this->actingAs($user)->patch(route('todos.update', $todo), [
        'is_completed' => true,
    ])->assertRedirect();

    $this->actingAs($user)->patch(route('todos.update', $todo), [
        'is_completed' => true,
    ])->assertRedirect();

    expect($todo->fresh()->is_completed)->toBeTrue();
});

test('users can update a todo title', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create([
        'title' => 'Old title',
    ]);

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), [
        'title' => 'Updated title',
    ]);

    $response->assertRedirect();
    expect($todo->fresh()->title)->toBe('Updated title');
});

test('todo title is required when updating', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create([
        'title' => 'Original title',
    ]);

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), [
        'title' => '   ',
    ]);

    $response->assertSessionHasErrors('title');
    expect($todo->fresh()->title)->toBe('Original title');
});

test('users cannot send an empty todo update', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create([
        'title' => 'Original title',
        'is_completed' => false,
    ]);

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), []);

    $response->assertSessionHasErrors('title');
    expect($todo->fresh()->title)->toBe('Original title')
        ->and($todo->fresh()->is_completed)->toBeFalse();
});

test('users can delete a todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(route('todos.destroy', $todo));

    $response->assertRedirect();
    $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
});

test('duplicate delete requests remove a todo only once', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    $this->actingAs($user)->delete(route('todos.destroy', $todo))
        ->assertRedirect();

    $this->assertDatabaseMissing('todos', ['id' => $todo->id]);

    $this->actingAs($user)->delete(route('todos.destroy', $todo))
        ->assertNotFound();
});

test('users cannot update another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->for($otherUser)->create(['is_completed' => false]);

    $response = $this->actingAs($user)->patch(route('todos.update', $todo), [
        'title' => 'Blocked',
    ]);

    $response->assertForbidden();
    expect($todo->fresh()->is_completed)->toBeFalse();
});

test('users cannot delete another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->for($otherUser)->create();

    $response = $this->actingAs($user)->delete(route('todos.destroy', $todo));

    $response->assertForbidden();
    $this->assertModelExists($todo);
});

test('users can filter todos by completion status', function () {
    $user = User::factory()->create();
    $completedTodo = Todo::factory()->for($user)->completed()->create([
        'title' => 'Completed task',
    ]);
    Todo::factory()->for($user)->create([
        'title' => 'Active task',
    ]);

    $this->actingAs($user)
        ->get(route('todos.index', ['status' => 'completed']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.status', 'completed')
            ->has('todos', 1)
            ->where('todos.0.title', $completedTodo->title),
        );
});

test('users can search todos by title', function () {
    $user = User::factory()->create();
    $matchingTodo = Todo::factory()->for($user)->create([
        'title' => 'Write release notes',
    ]);
    Todo::factory()->for($user)->create([
        'title' => 'Buy groceries',
    ]);

    $this->actingAs($user)
        ->get(route('todos.index', ['search' => 'release']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'release')
            ->has('todos', 1)
            ->where('todos.0.title', $matchingTodo->title),
        );
});

test('users can sort todos by oldest first', function () {
    $user = User::factory()->create();
    $oldestTodo = Todo::factory()->for($user)->create([
        'title' => 'First task',
        'created_at' => now()->subDays(3),
    ]);
    $latestTodo = Todo::factory()->for($user)->create([
        'title' => 'Second task',
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('todos.index', ['sort' => 'oldest']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'oldest')
            ->where('todos.0.title', $oldestTodo->title)
            ->where('todos.1.title', $latestTodo->title),
        );
});

test('users can sort todos alphabetically', function () {
    $user = User::factory()->create();
    $alphaTodo = Todo::factory()->for($user)->create([
        'title' => 'Alpha task',
    ]);
    $zebraTodo = Todo::factory()->for($user)->create([
        'title' => 'Zebra task',
    ]);

    $this->actingAs($user)
        ->get(route('todos.index', ['sort' => 'alphabetical']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'alphabetical')
            ->where('todos.0.title', $alphaTodo->title)
            ->where('todos.1.title', $zebraTodo->title),
        );
});
