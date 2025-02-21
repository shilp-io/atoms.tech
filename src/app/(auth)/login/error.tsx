// app/auth/login/error.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ErrorCard } from '@/components/ui/error-card';

// app/auth/login/error.tsx

// app/auth/login/error.tsx

// app/auth/login/error.tsx

export default function LoginError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log error to your error reporting service
        console.error(error);
    }, [error]);

    return (
        <ErrorCard
            title="Login Error"
            message={error.message}
            retryButton={{
                onClick: () => reset(),
                text: 'Try Again',
            }}
            redirectButton={{
                onClick: () => router.push('/signup'),
                text: 'Sign Up Instead',
            }}
        />
    );
}
