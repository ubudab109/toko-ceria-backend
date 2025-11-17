import ActionGroup from "@/components/ActionGroup";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Column, DataTable } from "@/components/DataTable";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { InventoryI, StockAdjusmentForm } from "@/interfaces/InventoryInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { formatRupiah } from "@/utils/helpert";
import { router, useForm, usePage } from "@inertiajs/react";
import { AlertTriangle, Diff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import ModalStock from "./components/ModalStock";

interface FiltersI {
    search: string;
    stock: string | null;
    is_from_product: string | null;
}

interface InventoryPageProps extends PageProps {
    inventories: PaginationI<InventoryI>;
    filters: FiltersI
}

export default function Index(): React.ReactNode {
    const { props } = usePage<InventoryPageProps>();
    const { inventories, filters } = props;
    const { localFilters, handleSearch, handleFilterChange } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "inventories.index",
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
    const [popupStock, setPopupStock] = useState<boolean>(false);
    const [selectedInventory, setSelectedInventory] = useState<InventoryI | null>(null);
    const { data, put, errors, processing, setData, reset } = useForm<StockAdjusmentForm>({
        description: '',
        stock: 0,
        type: 'reduce',
        final_stock: 0,
        is_outcome: false,
    })

    const columns: Column<InventoryI>[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'price', label: 'Price', render: (row: InventoryI) => formatRupiah(row.price || 0) },
        {
            key: 'stock', label: 'Stock', render: (row: InventoryI) => {
                return (
                    <span
                        className={`inline-flex items-center justify-center p-1 text-xs font-bold transition-colors duration-200 ${row.stock <= 10
                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'     // less
                            : row.stock < 30
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' // thinning
                                : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'     // normal
                            }`}
                    >
                        {row.stock <= 10 && <AlertTriangle size={14} className="mr-1" />}
                        {row.stock}
                    </span>
                )
            }
        },
        {
            key: 'is_from_product', label: 'Dari Produk', render: (row: InventoryI) => {
                if (row.product_id) {
                    return (
                        <span className="inline-flex items-center justify-center p-1 text-xs font-bold transition-colors duration-200 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">Iya</span>
                    )
                } else {
                    return (
                        <span className="inline-flex items-center justify-center p-1 text-xs font-bold transition-colors duration-200 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">Tidak</span>
                    )
                }
            }
        },
        {
            key: "action", label: "Action", render: row => (
                <ActionGroup
                    onDelete={() => {
                        setSelectedInventory(row);
                        setDeleteConfirmation(true);
                    }}
                    onEdit={() => router.visit(route('inventories.show', row.id))}
                    otherButton={
                        <button
                            title="Sesuaikan Stok"
                            type="button"
                            onClick={() => {
                                setSelectedInventory(row);
                                setPopupStock(true);
                            }}
                            className="
                            p-2 text-sm font-medium transition-all duration-200
                            text-gray-700 dark:text-gray-300
                            bg-white dark:bg-gray-800
                            border-y border-r border-gray-200 dark:border-gray-700
                            rounded-r-lg
                            hover:bg-yellow-50 dark:hover:bg-yellow-900 
                            hover:text-yellow-600 dark:hover:text-yellow-400
                            focus:z-10 focus:ring-1 focus:ring-yellow-500 focus:text-yellow-600 dark:focus:text-yellow-400
                        "
                        >
                            <Diff className="w-4 h-4" />
                        </button>
                    }
                />
            )
        }
    ];

    const onSubmitAdjusmentStock = () => {
        put(route('inventory.adjust-stock', selectedInventory?.id), {
            onError: () => toast.error('Harap periksa input Anda'),
            onSuccess: () => {
                reset();
                setSelectedInventory(null);
                setPopupStock(false);
                setTimeout(() => router.visit(route('inventories.index')), 800);
              }
        });
    }

    return (
        <DashboardLayout>
            <ModalStock
                isOpen={popupStock}
                onClose={() => {
                    setSelectedInventory(null);
                    setPopupStock(false);
                }}
                data={data}
                errors={errors}
                processing={processing}
                handleSubmit={onSubmitAdjusmentStock}
                inventory={selectedInventory}
                setData={setData}
                key="modal-adjust-stock"
            />
            <ConfirmationModal
                isOpen={deleteConfirmation}
                title="Hapus Inventory?"
                message="Yakin ingin menghapus inventory ini?"
                type="danger"
                onClose={() => {
                    setSelectedInventory(null);
                    setDeleteConfirmation(false);
                }}
                onConfirm={() => {
                    router.delete(route('inventories.destroy', selectedInventory?.id), {
                        onSuccess: () => {
                            setSelectedInventory(null);
                            setDeleteConfirmation(false);
                        }
                    });
                }}
                isStatic={true}
            />
            <div className="p-8">
                <DataTable<InventoryI>
                    title="Inventory List"
                    columns={columns}
                    data={inventories}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={handleSearch}
                    addButton={{ label: "Tambah Inventory", href: route("inventories.create") }}
                    filters={[
                        {
                            name: "stock",
                            label: "Stok",
                            isMultiple: false,
                            options: [
                                { label: 'Normal', value: 'normal' },
                                { label: 'Menipis', value: 'thinning' },
                                { label: 'Hampir Habis', value: 'less' },
                            ],
                            value: localFilters.stock,
                            onChange: (v) => {
                                handleFilterChange('stock', v)
                            },
                        },
                        {
                            name: "is_from_product",
                            label: "Dari Produk",
                            isMultiple: false,
                            options: [
                                { label: 'Dari Produk', value: '1' },
                                { label: 'Tidak Dari Produk', value: '0' },
                            ],
                            value: localFilters.is_from_product,
                            onChange: (v) => {
                                handleFilterChange('is_from_product', v)
                            },
                        },
                    ]}
                />
            </div>
        </DashboardLayout>
    )
}