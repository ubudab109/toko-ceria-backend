import ActionGroup from "@/components/ActionGroup";
import { Column, DataTable } from "@/components/DataTable";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { CustomerI } from "@/interfaces/CustomerInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { router, usePage } from "@inertiajs/react";
import React from "react";
import { route } from "ziggy-js";

interface FiltersI {
    search: string;
}

interface CustomerPageProps extends PageProps {
    customers: PaginationI<CustomerI>;
    filters: FiltersI;
}

export default function Index(): React.ReactNode {
    const { props } = usePage<CustomerPageProps>();
    const { customers, filters } = props;
    const { localFilters, handleSearch } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "customers.index",
    });

    const columns: Column<CustomerI>[] = [
        { key: 'fullname', label: 'Nama Lengkap' },
        { key: 'email', label: 'Email' },
        {
            key: 'phone_nmber', label: 'Nomor HP/Telepon', render: (row: CustomerI) => {
                if (row.phone_code && row.phone_number) {
                    return `${row.phone_code} ${row.phone_number}`;
                } else {
                    return '-';
                }
            }
        },
        { key: 'age', label: 'Umur' },
        {
            key: "action", label: "Action", render: row => (
                <ActionGroup
                    onDelete={() => null}
                    isDeleteShown={false}
                    onEdit={() => router.visit(route('customers.show', row.id))}
                />
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <DataTable<CustomerI>
                    columns={columns}
                    data={customers}
                    addButton={{ label: 'Tambah Customer', href: route('customers.create') }}
                    key="customer-table"
                    onSearch={handleSearch}
                    title="List Customer"
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                />
            </div>
        </DashboardLayout>
    )
}