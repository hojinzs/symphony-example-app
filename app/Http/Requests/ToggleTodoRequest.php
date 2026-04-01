<?php

namespace App\Http\Requests;

use App\Models\Todo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ToggleTodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Todo $todo */
        $todo = $this->route('todo');

        return $this->user()?->can('update', $todo) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
