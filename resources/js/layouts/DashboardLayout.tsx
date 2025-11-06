import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { useDarkMode } from '@/hooks/useDarkMode';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark, toggleDarkMode } = useDarkMode();
    const { flash } = usePage().props; // Access flash messages

    useEffect(() => {
        const _flash = flash as { success?: string; error?: string };
        if (_flash.success) {
            toast.success(_flash.success);
        }
        if (_flash.error) {
            toast.error(_flash.error);
        }
        // Add more conditions for other toast types (info, warning, etc.)
    }, [flash]);
    return (
        <div className="min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Navbar
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    onToggleDarkMode={toggleDarkMode}
                    isDark={isDark}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}

