import ActionGroup from "@/components/ActionGroup";
import { Column, DataTable } from "@/components/DataTable";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { OrderI, OrderStatusI, ProductOrderI } from "@/interfaces/OrderInterface";
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
                    <ul>
                        {
                            row.product_orders.map((prod: ProductOrderI) => (
                                <li key={prod.id}>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{prod.product.name}</p>
                                    {prod.product.category && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {prod.product.category.name}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatRupiah(prod.product.price)}
                                    </p>
                                </li>
                            ))
                        }
                    </ul>
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