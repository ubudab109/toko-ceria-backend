import { Link } from '@inertiajs/react';
import { BaggageClaim, BanknoteArrowDown, BottleWine, DownloadCloudIcon, ReceiptCentIcon, ShoppingCart, UserCog2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { route } from 'ziggy-js';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    name: string;
    href: string;
    icon: ReactNode;
    routeName: string;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigation: NavItem[] = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            routeName: 'dashboard',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
        },
        {
            name: 'Kategori',
            href: route('categories.index'),
            routeName: 'categories.index',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            ),
        },
        {
            name: 'Produk',
            href: route('products.index'),
            routeName: 'products.index',
            icon: (
                <BottleWine />
            ),
        },
        {
            name: 'Customer',
            href: route('customers.index'),
            routeName: 'customers.index',
            icon: (
                <UserCog2Icon />
            ),
        },
        {
            name: 'Inventori',
            href: route('inventories.index'),
            routeName: 'inventories.index',
            icon: (
                <BaggageClaim />
            ),
        },
        {
            name: 'HPP',
            href: route('hpp-compositions.index'),
            routeName: 'hpp-compositions.index',
            icon: (
                <ReceiptCentIcon />
            ),
        },
        {
            name: 'Pesanan',
            href: route('orders.index'),
            routeName: 'orders.index',
            icon: (
                <ShoppingCart />
            ),
        },
        {
            name: 'Pengeluaran',
            href: route('outcomes.index'),
            routeName: 'outcomes.index',
            icon: (
                <BanknoteArrowDown />
            ),
        },
        {
            name: 'Ekspor',
            href: route('data-exports.index'),
            routeName: 'data-exports.index',
            icon: (
                <DownloadCloudIcon />
            ),
        },
    ];


    const checkIsActive = (name: string) => {
        const current = route().current();
        if (!current || !name) return false;

        if (current === name) return true;

        const prefix = name.split('.')[0];
        return current.startsWith(`${prefix}.`);
    };

    return (
        <>
            {/* Mobile sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/assets/logo.png"
                                alt="Logo"
                                className="w-24 h-24 w-auto object-contain"
                            />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Toko Ceria
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = checkIsActive(item.routeName);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={onClose}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-64 lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
                <div className="flex flex-col h-full">
                    <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/assets/logo.png"
                                alt="Logo"
                                className="h-8 w-auto object-contain"
                            />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Toko Ceria
                            </h2>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = checkIsActive(item.routeName);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );

}
