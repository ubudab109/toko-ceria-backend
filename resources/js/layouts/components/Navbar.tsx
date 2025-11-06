import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Echo from "@/echo";
import { NotificationI } from '@/interfaces/NotificationInterface';
import axios from 'axios';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

interface NavbarProps extends PageProps {
    onMenuClick: () => void;
    onToggleDarkMode: () => void;
    isDark: boolean;
}

export default function Navbar({ onMenuClick, onToggleDarkMode, isDark }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState<boolean>(false);
    const [loadingReadAll, setLoadingReadAll] = useState<boolean>(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const { props } = usePage<NavbarProps>();
    const { auth } = props;
    const [notifications, setNotifications] = useState<NotificationI[] | []>(auth?.user?.notifications ? auth?.user?.notifications?.map((notif: NotificationI) => {
        return {
            id: notif.id,
            is_read: notif.is_read,
            title: notif.title,
            description: notif.description,
            user: notif.user,
            user_id: notif.user_id,
            link: notif.link,
            created_at: notif.created_at,
            updated_at: notif.updated_at
        }
    }) : []);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const hasSubscribed = useRef(false);

    useEffect(() => {
        if (!auth?.user || hasSubscribed.current) return;

        const authUser = auth.user;
        const channel = Echo.private(`notifications.${authUser.id}`);

        channel.listen("NotificationSent", (e: any) => {
            const newNotif: NotificationI = {
                id: e.id,
                user_id: e.user_id ?? authUser.id,
                user: e.user ?? authUser,
                title: e.title,
                description: e.description,
                link: e.link,
                is_read: e.is_read ?? false,
                created_at: new Date(),
                updated_at: new Date(),
            };

            setNotifications((prev) => {
                const exists = prev.some((n) => n.id === e.id);
                return exists ? prev : [newNotif, ...prev];
            });
        });

        hasSubscribed.current = true;

        return () => {
            Echo.leave(`notifications.${authUser.id}`);
        };
    }, [auth?.user]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
                setShowAvatarMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const readAll = async () => {
        setLoadingReadAll(true);
        await axios.put(route('read.notification-all'))
            .then(() => {
                toast.success('Notifikasi Berhasil Dibaca');
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, is_read: true }))
                );
            }).catch(() => {
                toast.error('Terjadi kesalahan. Mohon Ulangi');
            }).finally(() => {
                setLoadingReadAll(false);
            });
    }

    return (
        <nav className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo and Menu Button */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-md"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-2 group"
                        >
                            <div className="flex items-center gap-2">
                                <img
                                    src="/assets/logo.png"
                                    alt="Toko Ceria Logo"
                                    className="h-8 w-auto sm:h-10 object-contain transition-transform duration-200 group-hover:scale-105"
                                />
                                <span className="hidden sm:inline-block text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Toko Ceria
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Search Button */}
                    <button className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Right: Notifications and Avatar */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 sm:mt-2 mt-2 w-auto sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={readAll} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                    {loadingReadAll ? 'Processing...' : 'Mark all as read'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                    }`}
                                                onClick={async () => {
                                                    await axios.put(route('read.notification', notification.id))
                                                        .then(() => {
                                                            router.visit(notification.link)
                                                        })
                                                        .catch((err) => {
                                                            console.log('err', err);
                                                            router.visit(notification.link)
                                                        })
                                                }}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {!notification.is_read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {notification.description}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            {notification.created_at.toString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href="/notifications"
                                            className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View all notifications
                                        </Link>
                                    </div> */}
                                </div>
                            )}
                        </div>

                        {/* Avatar Dropdown */}
                        <div className="relative" ref={avatarRef}>
                            <button
                                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                            >
                                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">A</span>
                                </div>
                            </button>

                            {/* Avatar Dropdown Menu */}
                            {showAvatarMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                    <div className="py-1">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">admin@tokoceria.com</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                onToggleDarkMode();
                                                setShowAvatarMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                                        >
                                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                                            <svg
                                                className={`w-4 h-4 ${isDark ? 'text-yellow-500' : 'text-gray-400'}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                {isDark ? (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                                    />
                                                ) : (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                                    />
                                                )}
                                            </svg>
                                        </button>
                                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1">
                                            <Link
                                                href="/logout"
                                                method="post"
                                                className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Logout
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar (Full Width) */}
            <div className="md:hidden px-4 pb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>
        </nav>
    );
}

