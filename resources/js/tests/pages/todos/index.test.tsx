import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TodosIndex from '@/pages/todos/index';

const { routerMock, useFormMock, usePageMock } = vi.hoisted(() => ({
    routerMock: {
        delete: vi.fn(),
        get: vi.fn(),
        patch: vi.fn(),
    },
    useFormMock: vi.fn(),
    usePageMock: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: routerMock,
    useForm: useFormMock,
    usePage: usePageMock,
}));

vi.mock('@/actions/App/Http/Controllers/TodoController', () => ({
    default: {
        destroy: (id: number) => ({ url: `/todos/${id}` }),
        store: () => ({ url: '/todos' }),
        update: (id: number) => ({ url: `/todos/${id}` }),
    },
}));

vi.mock('@/routes/todos', () => ({
    index: () => '/todos',
}));

type FormState = {
    clearErrors: ReturnType<typeof vi.fn>;
    data: {
        title: string;
    };
    errors: Record<string, string>;
    patch: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    processing: boolean;
    reset: ReturnType<typeof vi.fn>;
    setData: ReturnType<typeof vi.fn>;
};

function makeFormState(overrides: Partial<FormState> = {}): FormState {
    return {
        clearErrors: vi.fn(),
        data: {
            title: '',
        },
        errors: {},
        patch: vi.fn(),
        post: vi.fn(),
        processing: false,
        reset: vi.fn(),
        setData: vi.fn(),
        ...overrides,
    };
}

type RenderOptions = {
    createForm?: FormState;
    editForm?: FormState;
    flashError?: string | null;
    todos?: Array<{
        id: number;
        is_completed: boolean;
        title: string;
    }>;
};

function renderPage({
    createForm = makeFormState(),
    editForm = makeFormState(),
    flashError = null,
    todos = [],
}: RenderOptions = {}) {
    let formCallCount = 0;

    useFormMock.mockImplementation(() => {
        formCallCount += 1;

        return formCallCount === 1 ? createForm : editForm;
    });

    usePageMock.mockReturnValue({
        props: {
            flash: {
                error: flashError,
                success: null,
            },
        },
    });

    return render(
        <TodosIndex
            filters={{
                search: '',
                sort: 'latest',
                status: 'all',
            }}
            todos={todos}
        />,
    );
}

describe('TodosIndex', () => {
    beforeEach(() => {
        routerMock.get.mockReset();
        routerMock.patch.mockReset();
        routerMock.delete.mockReset();
        useFormMock.mockReset();
        usePageMock.mockReset();
    });

    it('renders the empty state when there are no todos', () => {
        renderPage();

        expect(screen.getByText('No todos yet.')).toBeInTheDocument();
        expect(
            screen.getByText('Add one above to get started.'),
        ).toBeInTheDocument();
    });

    it('shows a loading indicator while creating a todo', () => {
        renderPage({
            createForm: makeFormState({
                processing: true,
            }),
        });

        expect(screen.getByText('Saving your todo...')).toBeInTheDocument();
    });

    it('renders a request error banner from shared flash data', () => {
        renderPage({
            flashError: 'The todo service is temporarily unavailable.',
        });

        expect(
            screen.getByText("We couldn't finish that todo request."),
        ).toBeInTheDocument();
        expect(
            screen.getByText('The todo service is temporarily unavailable.'),
        ).toBeInTheDocument();
    });

    it('renders create-form validation errors', () => {
        renderPage({
            createForm: makeFormState({
                errors: {
                    title: 'Please enter a todo title.',
                },
            }),
        });

        expect(
            screen.getByText('Please enter a todo title.'),
        ).toBeInTheDocument();
    });
});
