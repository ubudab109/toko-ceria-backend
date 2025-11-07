import { Column, DataTable } from "@/components/DataTable";
import JobStatus from "@/components/JobStatus";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { DataExportI } from "@/interfaces/DataExportInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { formatDate } from "@/utils/helpert";
import { usePage } from "@inertiajs/react";
import { File } from "lucide-react";
import React from "react";

interface FiltersI {
    search: string;
    statuses: string | null;
}

interface DataExportProps extends PageProps {
    dataExports: PaginationI<DataExportI>;
    filters: FiltersI;
}

export default function Index(): React.ReactNode {
    const { props } = usePage<DataExportProps>();
    const { dataExports, filters, statuses } = props;
    const { localFilters, handleSearch, handleFilterChange } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "data-exports.index",
    });

    const columns: Column<DataExportI>[] = [
        { key: 'export_type', label: 'Tipe Eksport' },
        {
            key: 'status',
            label: 'Status',
            render: (row: DataExportI) => {
                return (
                    <JobStatus status={row.status} />
                );
            }
        },
        {
            key: 'file_path', label: 'File', render: (row: DataExportI) => {
                if (row.status === 'success') {
                    return <a
                        href={row.file_path}
                        target="_blank"
                        className="
                      inline-flex items-center gap-2
                      text-white bg-blue-700 hover:bg-blue-800
                      focus:ring-4 focus:ring-blue-300
                      font-medium rounded-lg text-sm
                      px-5 py-2.5
                      me-2 mb-2
                      dark:bg-blue-600 dark:hover:bg-blue-700
                      focus:outline-none dark:focus:ring-blue-800
                      transition-colors
                    "
                    >
                        <File className="w-4 h-4" />
                        File
                    </a>
                } else {
                    return '-';
                }
            }
        },
        {
            key: 'created_at', label: 'Tanggal Export', render: (row: DataExportI) => {
                if (row.created_at) {
                    return formatDate(row.created_at?.toString());
                }
                return '-';
            }
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <DataTable<DataExportI>
                    columns={columns}
                    data={dataExports}
                    key="data-export-table"
                    onSearch={handleSearch}
                    title="List Export"
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    filters={[
                        {
                            name: "statuses",
                            label: "Status",
                            isMultiple: true,
                            options: [
                                { value: 'failed', label: 'Gagal' },
                                { value: 'pending', label: 'Dalam Antrian' },
                                { value: 'processing', label: 'Proses' },
                                { value: 'success', label: 'Sukses' },
                            ],
                            value: localFilters.statuses,
                            onChange: (v) => handleFilterChange('statuses', v),
                        },
                    ]}
                />
            </div>
        </DashboardLayout>
    )
}