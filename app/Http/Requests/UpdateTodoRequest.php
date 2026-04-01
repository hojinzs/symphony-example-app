<?php

namespace App\Http\Requests;

use App\Models\Todo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Todo $todo */
        $todo = $this->route('todo');

        return $this->user()?->can('update', $todo) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('title')) {
            $this->merge([
                'title' => trim((string) $this->input('title')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_completed' => ['sometimes', 'boolean'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
