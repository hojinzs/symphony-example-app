import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            flash: {
                error: string | null;
                success: string | null;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
