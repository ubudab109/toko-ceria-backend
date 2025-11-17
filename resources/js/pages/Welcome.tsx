import SalesCharts from '@/components/SalesChart';
import DashboardLayout from '../layouts/DashboardLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface WelcomeProps {
    title: string;
}

export default function Welcome({ title }: WelcomeProps) {
    const props = usePage().props as unknown as {
        dailySales: any[];
        monthlySales: any[];
        filteredSales: any[];
        filters: any;
    };
    const [dateRange, setDateRange] = useState({ start: props.filters.start, end: props.filters.end });
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Welcome to Toko Ceria Dashboard
                    </p>
                </div>

                {/* Welcome Content */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-center py-12">
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
                </div>

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
                            {/* CHART DISINI */}
                            <SalesCharts
                                dailySales={props.dailySales}
                                monthlySales={props.monthlySales}
                                filteredSales={props.filteredSales}
                                currentRange={dateRange}
                                onDateRangeChange={(range) => {
                                  setDateRange(range);
                                  router.get('/', { date_range: range }, { preserveScroll: true, preserveState: true });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}