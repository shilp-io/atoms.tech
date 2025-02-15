'use client';

import React, { useEffect, useState } from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/custom/toggles/ThemeToggle';
import { ViewModeToggle } from '@/components/custom/toggles/ViewModeToggle';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VerticalToolbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { state } = useSidebar();
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Convert pathname to breadcrumb segments
    const segments = pathname
        .split('/')
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

    useEffect(() => {
        const handleResize = () => {
            // Use a more precise breakpoint system
            const width = window.innerWidth;
            setIsMobile(width < 640);
            setIsTablet(width >= 640 && width < 1024);
        };

        // Initial check
        handleResize();

        // Debounce the resize handler for better performance
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, []);

    if (isMobile) {
        // Mobile layout - horizontal toolbar at the top
        return (
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="h-5 w-5" />
                    <div className="flex items-center h-6 gap-1 px-1 bg-muted/50 rounded font-mono text-[10px] text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-transparent"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        {segments.length > 0 && (
                            <span className="truncate max-w-[150px]">
                                {segments[segments.length - 1]}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <ViewModeToggle />
                </div>
            </div>
        );
    }

    // Desktop and tablet layout - vertical toolbar with horizontal breadcrumb
    return (
        <>
            {/* Vertical toolbar */}
            <div
                className={cn(
                    'fixed top-0 bottom-0 z-50 w-10 flex flex-col gap-2 pt-4 bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out',
                    state === 'expanded' 
                        ? 'left-[14.25rem]' 
                        : 'left-0',
                )}
            >
                <div className="h-10 w-10 flex items-center justify-center">
                    <SidebarTrigger className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 flex items-center justify-center">
                    <ThemeToggle />
                </div>
                <div className="h-10 w-10 flex items-center justify-center">
                    <ViewModeToggle />
                </div>
            </div>

            {/* Horizontal breadcrumb bar */}
            <div
                className={cn(
                    'fixed top-0 right-0 z-40 h-10 flex items-center bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out',
                    state === 'expanded'
                        ? 'left-[calc(14.25rem+2.5rem)]'
                        : 'left-10'
                )}
            >
                <div className="flex items-center h-6 gap-1 px-2 bg-muted/50 rounded font-mono text-[10px] text-muted-foreground ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                    {segments.map((segment, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="opacity-40">/</span>}
                            <span className="hover:text-foreground cursor-default transition-colors">
                                {segment}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </>
    );
};

export default VerticalToolbar;
