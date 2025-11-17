import { HPPCompositionI, HPPCompositionItemI, HPPHistoryI } from "@/interfaces/HPPCompositionInterface";
import { InventoryI } from "@/interfaces/InventoryInterface"
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import HPPForm from "./components/HPPForm";
import { PaginationI } from "@/interfaces/PaginationInterface";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { Column, DataTable } from "@/components/DataTable";
import { formatDate } from "@/utils/helpert";

interface FiltersI {
    search: string;
}

interface HPPEditProps extends PageProps {
    inventoryProducts: InventoryI[];
    inventories: InventoryI[];
    hppComposition: HPPCompositionI;
    hppHistories: PaginationI<HPPHistoryI>;
    filters: FiltersI;
}

export default function Create(): React.ReactNode {
    const {
        inventories,
        inventoryProducts,
        hppComposition,
        hppHistories,
        filters,
    } = usePage<HPPEditProps>().props;

    const { data, setData, put, processing, errors } = useForm<HPPCompositionI>({
        id: hppComposition.id,
        inventory_id: hppComposition.inventory_id,
        labor_cost: hppComposition.labor_cost,
        production_batch: hppComposition.production_batch,
        inventory: {
            id: hppComposition.inventory.id,
            measurement: hppComposition.inventory.measurement,
            name: hppComposition.inventory.name,
            stock: hppComposition.inventory.stock,
        },
        hpp_items: hppComposition.hpp_items.map((item: HPPCompositionItemI) => {
            return {
                id: item.id,
                hpp_category_id: item.hpp_category_id,
                hpp_composition_id: item.hpp_composition_id,
                category_name: item.category_name,
                hpp_category: {
                    id: item.hpp_category.id,
                    category_name: item.hpp_category.category_name,
                    hpp_composition_id: item.hpp_category.hpp_composition_id,
                },
                inventory_id: item.inventory_id,
                inventory: {
                    id: item.inventory.id,
                    measurement: item.inventory.measurement,
                    name: item.inventory.name,
                    stock: item.inventory.stock,
                },
                stock_used: item.stock_used,
                total_price_inventory: item.total_price_inventory,
            }
        }),
        total: hppComposition.total,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('hpp-compositions.update', hppComposition.id), {
            onError: () => toast.error('Pastikan semua input telah terisi')
        });
    };


    const { localFilters, handleSearch } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "hpp-compositions.show",
    });

    const columns: Column<HPPHistoryI>[] = [
        { key: 'id', label: 'id' },
        {
            key: 'user',
            label: 'Dilakukan oleh',
            render: (row) => {
                return (
                    <div>

                        <p className="font-medium text-gray-900 dark:text-gray-100">{row.user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {row.user.email || '-'}
                        </p>
                    </div>
                )
            }
        },
        {
            key: 'total_batch',
            label: 'Jumlah Batch',
            render: (row) => {
                return (
                    <div>

                        <p className="font-medium text-gray-900 dark:text-gray-100">Jumlah Permintaan Batch {' '} {row.total_batch}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total produk yang ditambah: {row.total_batch} * {hppComposition.production_batch} = {row.total_batch * hppComposition.production_batch}
                        </p>
                    </div>
                )
            }
        },
        {
            key: 'created_at',
            label: 'Dilakukan Pada Tanggal',
            render: (row) => {
                return formatDate(row.created_at.toString());
            }
        }
    ];


    return (
        <DashboardLayout>
            <HPPForm
                inventories={inventories}
                inventoryProducts={inventoryProducts}
                data={data}
                isEdit={true}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                key='hpp-form-edit'
            />

            <div className="mt-2">
                <DataTable<HPPHistoryI>
                    columns={columns}
                    title={`Data History Batch Produk ${hppComposition.inventory.name}`}
                    data={hppHistories}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={(v) => handleSearch(v, hppComposition.id)}
                    scrollToTopOnPaginate={false}
                />
            </div>
        </DashboardLayout>
    );
}