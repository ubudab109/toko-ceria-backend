import { InventoryHistoryI, InventoryI } from "@/interfaces/InventoryInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import React from "react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import InventoryForm from "./components/InventoryForm";
import { PaginationI } from "@/interfaces/PaginationInterface";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { Column, DataTable } from "@/components/DataTable";
import { formatDate } from "@/utils/helpert";


interface FiltersI {
    search: string;
    type: string | null;
}

interface InventoryDetailPageProps extends PageProps {
    inventoryHistories: PaginationI<InventoryHistoryI>;
    products: ProductI[];
    inventory: InventoryI;
    filters: FiltersI;
}

export default function Edit(): React.ReactNode {
    const { products, inventory, inventoryHistories, filters } = usePage<InventoryDetailPageProps>().props;
    const { localFilters, handleSearch, handleFilterChange } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "inventories.show",
    });

    const { data, setData, put, processing, errors } = useForm<InventoryI>({
        id: inventory.id,
        name: inventory.name,
        measurement: inventory.measurement,
        stock: inventory.stock,
        description: inventory.description,
        price: inventory.price,
        product: inventory.product ? {
            id: inventory.product.id,
            name: inventory.product.name,
            price: inventory.product.price,
            description: inventory.product.description,
            measurement: inventory.product.measurement
        } : {
            id: 0,
            name: '',
            price: 0,
            description: '',
            measurement: ''
        },
        product_id: inventory.product_id,
        sku: inventory.sku,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('inventories.update', inventory.id), {
            onError: () => toast.error('Pastikan semua input telah terisi')
        });
    }

    const columns: Column<InventoryHistoryI>[] = [
        {
            key: 'user',
            label: 'Dilakukan Oleh',
            render: (row: InventoryHistoryI) => {
                if (row.user) {
                    return (
                        <div>
    
                            <p className="font-medium text-gray-900 dark:text-gray-100">{row.user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {row.user.email || '-'}
                            </p>
                        </div>
                    );
                } else {
                    return (
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">System</p>
                        </div>
                    );
                }
            }
        },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Deskripsi' },
        {
            key: 'type',
            label: 'Tipe',
            render: (row: InventoryHistoryI) => {
                const type = row.type;
                const output = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return output;
            }
        },
        { key: 'previous_value', label: 'Data Sebelumnya' },
        { key: 'current_value', label: 'Data Terakhir' },
        {
            key: 'created_at',
            label: 'Diubah Pada',
            render: (row: InventoryHistoryI) => {
                return formatDate(row.created_at.toString());
            }
        },

    ]

    return (
        <DashboardLayout>
            <InventoryForm
                products={products}
                data={data}
                isEdit={true}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                key='inventory-form-update'
            />

            <div className="mt-2">
                <DataTable<InventoryHistoryI>
                    title="History Perubahan Inventori"
                    columns={columns}
                    data={inventoryHistories}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={(v) => handleSearch(v, inventory.id)}
                    scrollToTopOnPaginate={false}
                    filters={[
                        {
                            name: "type",
                            label: "Tipe",
                            isMultiple: false,
                            options: [
                                { label: 'Perubahan Data', value: 'perubahan' },
                                { label: 'Penyesuain Stok', value: 'penyesuain_stock' },
                            ],
                            value: localFilters.type,
                            onChange: (v) => {
                                handleFilterChange('type', v, inventory.id)
                            },
                        },
                    ]}
                />
            </div>
        </DashboardLayout>
    )
}