import ActionGroup from "@/components/ActionGroup";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Column, DataTable } from "@/components/DataTable";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { OutcomeI } from "@/interfaces/OutcomeInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { OptionType } from "@/types/option.type";
import { formatDate, formatRupiah } from "@/utils/helpert";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";

interface FiltersI {
    search: string;
    types: string | null
}

interface OutcomePageProps extends PageProps {
    outcomes: PaginationI<OutcomeI>;
    types: OptionType[];
    filters: FiltersI;
}

export default function Index(): React.ReactNode {
    const { props } = usePage<OutcomePageProps>();
    const {
        outcomes,
        types,
        filters,
    } = props;

    const { localFilters, handleSearch, handleFilterChange } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "outcomes.index",
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
    const [selectedOutcome, setSelectedOutcome] = useState<OutcomeI | null>(null);

    const columns: Column<OutcomeI>[] = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        {
            key: 'total',
            label: 'Total',
            render: (row) => {
                return formatRupiah(row.total);
            }
        },
        {
            key: 'created_at',
            label: 'Tanggal',
            render: (row) => {
                return formatDate(row.created_at.toString());
            }
        },
        {
            key: 'action',
            label: 'Aksi',
            render: (row) => {
                return (
                    <ActionGroup
                        onDelete={() => {
                            setDeleteConfirmation(true);
                            setSelectedOutcome(row);
                        }}
                        onEdit={() => router.visit(route('outcomes.show', row.id))}
                    />
                )
            }
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <ConfirmationModal
                    isOpen={deleteConfirmation}
                    title="Hapus Pengeluaran?"
                    message="Yakin ingin menghapus data pengeluaran ini ini?"
                    type="danger"
                    onClose={() => {
                        setSelectedOutcome(null);
                        setDeleteConfirmation(false);
                    }}
                    onConfirm={() => {
                        router.delete(route('outcomes.destroy', selectedOutcome?.id), {
                            onSuccess: () => {
                                setSelectedOutcome(null);
                                setDeleteConfirmation(false);
                            }
                        });
                    }}
                    isStatic={true}
                />
                <DataTable<OutcomeI>
                    title="Data Pengeluaran"
                    columns={columns}
                    data={outcomes}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={handleSearch}
                    addButton={{ label: "Tambah Pengeluaran", href: route("outcomes.create") }}
                    filters={[
                        {
                            name: "types",
                            label: "Tipe",
                            isMultiple: true,
                            options: types,
                            value: localFilters.types,
                            onChange: (v) => handleFilterChange('types', v),
                        },
                    ]}
                />
            </div>
        </DashboardLayout>
    )

}