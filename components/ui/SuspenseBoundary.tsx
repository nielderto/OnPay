'use client'

import { Suspense, ReactNode } from 'react';

interface SuspenseBoundaryProps {
    children: ReactNode;
    fallback: ReactNode;
}

export function SuspenseBoundary({ children, fallback }: SuspenseBoundaryProps) {
    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    );
} 