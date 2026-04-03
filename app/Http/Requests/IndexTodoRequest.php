<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexTodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $search = trim((string) $this->input('search', ''));

        $this->merge([
            'search' => $search !== '' ? $search : null,
            'sort' => strtolower((string) $this->input('sort', 'latest')),
            'status' => strtolower((string) $this->input('status', 'all')),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['required', 'string', Rule::in(['latest', 'oldest', 'alphabetical'])],
            'status' => ['required', 'string', Rule::in(['all', 'active', 'completed'])],
        ];
    }

    /**
     * @return array{search: ?string, sort: string, status: string}
     */
    public function filters(): array
    {
        /** @var array{search?: ?string, sort: string, status: string} $validated */
        $validated = $this->validated();

        return [
            'search' => $validated['search'] ?? null,
            'sort' => $validated['sort'],
            'status' => $validated['status'],
        ];
    }
}
