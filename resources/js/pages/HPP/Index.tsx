import ActionGroup from "@/components/ActionGroup";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Column, DataTable } from "@/components/DataTable";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { HPPBatchFormI, HPPCompositionI } from "@/interfaces/HPPCompositionInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { formatRupiah } from "@/utils/helpert";
import { router, useForm, usePage } from "@inertiajs/react";
import { Diff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import ModalBatch from "./components/ModalBatch";

interface FiltersI {
    search: string;
}

interface HPPPageProps extends PageProps {
    hppCompositions: PaginationI<HPPCompositionI>;
    filters: FiltersI;
}

export default function Index(): React.ReactNode {
    const { props } = usePage<HPPPageProps>();
    const { hppCompositions, filters } = props;

    const { localFilters, handleSearch } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "hpp-compositions.index",
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
    const [selectedHpp, setSelectedHpp] = useState<HPPCompositionI | null>(null);
    const [popupBatch, setPopupBatch] = useState<boolean>(false);
    const { data, put, errors, processing, setData, reset } = useForm<HPPBatchFormI>({
        requested_batch: 0,
    });

    const columns: Column<HPPCompositionI>[] = [
        { label: 'ID', key: 'id' },
        {
            label: 'SKU',
            key: 'sku',
            render: (row) => {
                return row.inventory.sku;
            }
        },
        {
            label: 'Produk',
            key: 'inventory_id',
            render: (row) => {
                return row.inventory.name;
            }
        },
        {
            label: 'Total/Batch',
            key: 'total',
            render: (row) => {
                return formatRupiah(row.total);
            }
        },
        {
            key: "action", label: "Action", render: row => (
                <ActionGroup
                    onDelete={() => {
                        setSelectedHpp(row);
                        setDeleteConfirmation(true);
                    }}
                    onEdit={() => router.visit(route('hpp-compositions.show', row.id))}
                    otherButton={
                        <button
                            title="Proses Batch"
                            type="button"
                            onClick={() => {
                                setSelectedHpp(row);
                                setPopupBatch(true);
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

    const onSubmitBatch = () => {
        put(route('batch.hpp-compositions', selectedHpp?.id), {
            onError: () => toast.error('Harap periksa input Anda'),
            onSuccess: () => {
                reset();
                setSelectedHpp(null);
                setPopupBatch(false);
                setTimeout(() => router.visit(route('hpp-compositions.index')), 800);
            }
        });
    }

    return (
        <DashboardLayout>
            <ModalBatch
                data={data}
                errors={errors}
                handleSubmit={onSubmitBatch}
                hppComposition={selectedHpp}
                isOpen={popupBatch}
                onClose={() => {
                    setSelectedHpp(null);
                    setPopupBatch(false);
                }}
                processing={processing}
                setData={setData}
                key={'modal-batch'}
            />
            <ConfirmationModal
                isOpen={deleteConfirmation}
                title="Hapus HPP?"
                message="Yakin ingin menghapus HPP ini?"
                type="danger"
                onClose={() => {
                    setSelectedHpp(null);
                    setDeleteConfirmation(false);
                }}
                onConfirm={() => {
                    router.delete(route('hpp-compositions.destroy', selectedHpp?.id), {
                        onSuccess: () => {
                            setSelectedHpp(null);
                            setDeleteConfirmation(false);
                        }
                    });
                }}
                isStatic={true}
            />

            <div className="p-8">
                <DataTable
                    title="Daftar Komposisi HPP"
                    columns={columns}
                    data={hppCompositions}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={handleSearch}
                    addButton={{ label: "Tambah HPP", href: route("hpp-compositions.create") }}
                />
            </div>
        </DashboardLayout>
    )
}