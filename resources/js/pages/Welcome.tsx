import SalesCharts from '@/components/SalesChart';
import DashboardLayout from '../layouts/DashboardLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatRupiah } from '@/utils/helpert';

interface WelcomeProps {
    title: string;
}

export default function Welcome({ title }: WelcomeProps) {
    const props = usePage().props as unknown as {
        dailySales: any[];
        monthlySales: any[];
        filteredSales: any[];
        filters: any;
        stats: {
            pettyCash: string;
            profitToday: number;
            totalOrdersToday: number;
            newCustomersToday: number;
        };
        outcomes: {
            today: number;
            thisMonth: number;
            daily: any[];
            monthly: any[];
            filtered: any[];
        };
        profits: {
            today: number;
            thisMonth: number;
            daily: any[];
            monthly: any[];
            filtered: any[];
        };
    };
    const [dateRange, setDateRange] = useState({ start: props.filters.start, end: props.filters.end });

    // Helper for stats cards
    const StatCard = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: React.ReactNode, colorClass: string }) => (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${colorClass}`}>
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Welcome to Toko Ceria Dashboard
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Petty Cash Saat Ini"
                        value={formatRupiah(parseFloat(props.stats.pettyCash || '0'), true)}
                        colorClass="bg-indigo-500"
                        icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Total Profit Hari Ini"
                        value={formatRupiah(props.stats.profitToday, true)}
                        colorClass="bg-green-500"
                        icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    />
                    <StatCard
                        title="Total Pesanan Hari Ini"
                        value={props.stats.totalOrdersToday}
                        colorClass="bg-blue-500"
                        icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                    />
                    <StatCard
                        title="Pelanggan Baru Hari Ini"
                        value={props.stats.newCustomersToday}
                        colorClass="bg-purple-500"
                        icon={<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                    />
                </div>

                {/* Welcome Content */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Welcome to Your Dashboard
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                This is your starting point. Explore the sidebar to navigate to different sections.
                            </p>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                <Link
                                    href="/products"
                                    className="block p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200">
                                        Products
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        Manage your products
                                    </p>
                                </Link>

                                <Link
                                    href="/orders"
                                    className="block p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-green-900 dark:text-green-200">
                                        Orders
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        View all orders
                                    </p>
                                </Link>

                                <Link
                                    href="/customers"
                                    className="block p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-200">
                                        Customers
                                    </h3>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                        Manage customers
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ORDERS GRAPHIC SECTION */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Grafik Penjualan
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Ini adalah grafik penjualan Toko Ceria
                            </p>
                        </div>
                        <div className="flex items-start justify-start py-12">
                            <SalesCharts
                                dailySales={props.dailySales}
                                monthlySales={props.monthlySales}
                                filteredSales={props.filteredSales}
                                currentRange={dateRange}
                                onDateRangeChange={(range) => {
                                    setDateRange(range);
                                    router.get('/', { date_range: range }, { preserveScroll: true, preserveState: true });
                                }}
                                titles={{
                                    daily: "Penjualan Hari Ini",
                                    monthly: "Penjualan Bulan Ini",
                                    filtered: "Filter Penjualan"
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* OUTCOME GRAPHIC SECTION */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Grafik Pengeluaran
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Ini adalah grafik pengeluaran Toko Ceria
                            </p>
                        </div>
                        <div className="flex items-start justify-start py-12">
                            <SalesCharts
                                dailySales={props.outcomes.daily}
                                monthlySales={props.outcomes.monthly}
                                filteredSales={props.outcomes.filtered}
                                currentRange={dateRange}
                                onDateRangeChange={(range) => {
                                    setDateRange(range);
                                    router.get('/', { date_range: range }, { preserveScroll: true, preserveState: true });
                                }}
                                titles={{
                                    daily: "Pengeluaran Hari Ini",
                                    monthly: "Pengeluaran Bulan Ini",
                                    filtered: "Filter Pengeluaran"
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* PROFIT GRAPHIC SECTION */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Grafik Profit Margin
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Ini adalah grafik profit margin Toko Ceria
                            </p>
                        </div>
                        <div className="flex items-start justify-start py-12">
                            <SalesCharts
                                dailySales={props.profits.daily}
                                monthlySales={props.profits.monthly}
                                filteredSales={props.profits.filtered}
                                currentRange={dateRange}
                                onDateRangeChange={(range) => {
                                    setDateRange(range);
                                    router.get('/', { date_range: range }, { preserveScroll: true, preserveState: true });
                                }}
                                titles={{
                                    daily: "Profit Margin Hari Ini",
                                    monthly: "Profit Margin Bulan Ini",
                                    filtered: "Filter Profit Margin"
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}