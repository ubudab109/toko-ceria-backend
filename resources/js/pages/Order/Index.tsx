import ActionGroup from "@/components/ActionGroup";
import { Column, DataTable } from "@/components/DataTable";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { OrderI, OrderMarginI, OrderStatusI, ProductOrderI } from "@/interfaces/OrderInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { formatDate, formatRupiah } from "@/utils/helpert";
import { router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";

interface FiltersI {
    search: string;
    statuses: string | null;
    checkout_type: string | null;
    date_range: { startDate?: string; endDate?: string } | null;
}

interface OrderPageProps extends PageProps {
    orders: PaginationI<OrderI>;
    statuses: OrderStatusI[];
    filters: FiltersI;
}

export default function Index(): React.ReactNode {
    const { props } = usePage<OrderPageProps>();
    const { orders, filters, statuses } = props;

    const { localFilters, handleSearch, handleFilterChange } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: 'orders.index',
    });

    const columns: Column<OrderI>[] = [
        { key: 'order_number', label: 'Order Number' },
        { key: 'total', label: 'Total', render: (row: OrderI) => formatRupiah(row.total || 0) },
        { key: 'checkout_type', label: 'Tipe Checkout' },
        {
            key: 'status',
            label: 'Status',
            render: (row: OrderI) => <OrderStatusBadge status={row.status} key={`status_${row.id}`} />
        },
        {
            key: 'customer', label: 'Customer', render: (row: OrderI) => {
                return (
                    <div>

                        <p className="font-medium text-gray-900 dark:text-gray-100">{row.customer.fullname}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {row.customer.email || '-'}
                        </p>
                    </div>
                )
            }
        },
        {
            key: 'products', label: 'Produk', render: (row: OrderI) => {
                return (
                    <div className="space-y-3 min-w-[250px]">
                        {
                            row.margins?.map((prod: OrderMarginI, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{prod.product_name}</span>
                                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">x{prod.order_quantity}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                        <div className="text-gray-500 dark:text-gray-400">Harga Produk:</div>
                                        <div className="text-right font-medium text-gray-900 dark:text-gray-200">{formatRupiah(prod.product_price, true)}</div>

                                        <div className="text-gray-500 dark:text-gray-400">Harga Total:</div>
                                        <div className="text-right font-medium text-gray-900 dark:text-gray-200">{formatRupiah(prod.product_price * prod.order_quantity, true)}</div>

                                        <div className="text-gray-500 dark:text-gray-400">Harga HPP:</div>
                                        <div className="text-right font-medium text-gray-900 dark:text-gray-200">{formatRupiah(prod.hpp_price, true)}</div>

                                        <div className="text-gray-500 dark:text-gray-400">Total HPP:</div>
                                        <div className="text-right font-medium text-gray-900 dark:text-gray-200">{formatRupiah(prod.total_hpp_price, true)}</div>

                                        <div className="text-gray-500 dark:text-gray-400 font-medium">Margin:</div>
                                        <div className="text-right font-bold text-green-600 dark:text-green-400">{formatRupiah(prod.margin_profit, true)}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                );
            },
        },
        {
            key: 'created_at', label: 'Tanggal order', render: (row: OrderI) => {
                if (row.created_at) {
                    return formatDate(row.created_at?.toString());
                }
                return '-';
            }
        },
        {
            key: "action", label: "Action", render: row => (
                <ActionGroup
                    onDelete={() => null}
                    onEdit={() => router.visit(route('orders.show', row.id))}
                    isDeleteShown={false}
                />
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <DataTable<OrderI>
                    title="Order List"
                    columns={columns}
                    data={orders}
                    showExport={true}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={handleSearch}
                    onExport={() => {
                        console.log('filters', filters);
                        if (filters.date_range?.startDate && filters.date_range.endDate) {
                            router.post(route('export.orders'), {
                                date_start: filters.date_range.startDate,
                                date_end: filters.date_range.endDate,
                            }, {
                                onSuccess: () => {
                                    toast.success('Proses export data order telah dilakukan. Mohon menunggu sampai proses selesai');
                                },
                                onError: (err: any) => {
                                    console.log('error export', err);
                                    toast.error('Terjadi kesalahan mohon ulangi proses Anda');
                                }
                            });
                        } else {
                            toast.error('Mohon memilih tanggal sebelum export');
                        }
                    }}
                    addButton={{ label: "Tambah Order Manual", href: route("orders.create") }}
                    filters={[
                        {
                            name: "statuses",
                            label: "Status",
                            isMultiple: true,
                            options: statuses,
                            value: localFilters.statuses,
                            onChange: (v) => handleFilterChange('statuses', v),
                        },
                        {
                            name: "checkout_type",
                            label: "Tipe Checkout",
                            isMultiple: false,
                            options: [
                                { label: 'QRIS', value: 'qris' },
                                { label: 'CASH', value: 'cash' },
                            ],
                            value: localFilters.checkout_type,
                            onChange: (v) => handleFilterChange('checkout_type', v),
                        },
                        {
                            name: "date_range",
                            label: "Tanggal Order",
                            value: localFilters.date_range,
                            onChange: (v) => handleFilterChange('date_range', v),
                        }
                    ]}
                />
            </div>
        </DashboardLayout>
    )
}