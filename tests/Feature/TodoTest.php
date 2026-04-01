<?php

use App\Models\Todo;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('todos.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can view todos', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('todos.index'));

    $response->assertOk();
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
        'title' => '',
    ]);

    $response->assertSessionHasErrors('title');
});

test('users can toggle a todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create(['is_completed' => false]);

    $response = $this->actingAs($user)->patch(route('todos.update', $todo));

    $response->assertRedirect();
    expect($todo->fresh()->is_completed)->toBeTrue();
});

test('users can delete a todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(route('todos.destroy', $todo));

    $response->assertRedirect();
    $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
});

test('users cannot update another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->for($otherUser)->create();

    $response = $this->actingAs($user)->patch(route('todos.update', $todo));

    $response->assertForbidden();
});

test('users cannot delete another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->for($otherUser)->create();

    $response = $this->actingAs($user)->delete(route('todos.destroy', $todo));

    $response->assertForbidden();
});
