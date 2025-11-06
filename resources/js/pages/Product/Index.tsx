import ActionGroup from "@/components/ActionGroup";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Column, DataTable } from "@/components/DataTable";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { CategoryI } from "@/interfaces/CategoryInterface";
import { PaginationI } from "@/interfaces/PaginationInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";

interface FiltersI {
    search: string;
    category_ids: string | null;
    limited_stock: string | number;
}

interface ProductPageProps extends PageProps {
    products: PaginationI<ProductI>;
    categories: CategoryI[];
    filters: FiltersI;
}

export default function Index(): React.ReactNode {
    const { props } = usePage<ProductPageProps>();
    const { products, filters, categories } = props;
    
    const { localFilters, handleSearch, handleFilterChange } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "products.index",
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductI | null>(null);

    const columns: Column<ProductI>[] = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "price", label: "Price" },
        { key: "category", label: "Category", render: row => {
            return row.category?.name || "-";
        } },
        { key: "origin", label: "Origin" },
        {
            key: "action", label: "Action", render: row => (
                <ActionGroup
                    onDelete={() => {
                        setSelectedProduct(row);
                        setDeleteConfirmation(true);
                    }}
                    onEdit={() => router.visit(route('products.show',  row.id))}
                />
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <ConfirmationModal 
                    isOpen={deleteConfirmation}
                    title="Hapus Produk?"
                    message="Yakin ingin menghapus produk ini?"
                    type="danger"
                    onClose={() => {
                        setSelectedProduct(null);
                        setDeleteConfirmation(false);
                    }}
                    onConfirm={() => {
                        router.delete(route('products.destroy', selectedProduct?.id), {
                            onSuccess: () => {
                                setSelectedProduct(null);
                                setDeleteConfirmation(false);
                            }
                        });
                    }}
                    isStatic={true}
                />
                <DataTable<ProductI>
                    title="Product List"
                    columns={columns}
                    data={products}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={handleSearch}
                    addButton={{ label: "Tambah Produk", href: route("products.create") }}
                    filters={[
                        {
                            name: "category_ids",
                            label: "Kategori",
                            isMultiple: true,
                            options: categories.map(c => ({ label: c.name, value: c.id })),
                            value: localFilters.category_ids,
                            onChange: (v) => handleFilterChange('category_ids', v),
                        },
                        {
                            name: "limited_stock",
                            label: "Stok",
                            isMultiple: false,
                            options: [
                                { label: 'Terbatas', value: '1' },
                                { label: 'Normal', value: '0' },
                            ],
                            value: localFilters.limited_stock,
                            onChange: (v) => handleFilterChange('limited_stock', v),
                        }
                    ]}
                />
            </div>
        </DashboardLayout>
    );
}
