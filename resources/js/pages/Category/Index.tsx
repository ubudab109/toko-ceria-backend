import { router, usePage } from "@inertiajs/react";
import { DataTable, Column } from "@/components/DataTable";
import { route } from "ziggy-js";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CategoryI } from "@/interfaces/CategoryInterface";
import ActionGroup from "@/components/ActionGroup";
import { PaginationI } from "@/interfaces/PaginationInterface";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";
import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface CategoryPageProps extends PageProps {
  categories: PaginationI<CategoryI>;
  filters: {
    search: string;
  };
}

export default function Index() {

  const { props } = usePage<CategoryPageProps>();
  const { categories, filters } = props;
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryI | null>(null);
  const { localFilters, handleSearch } = useInertiaFilters({
    initialFilters: filters,
    baseRoute: "categories.index",
  });

  const columns: Column<CategoryI>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "action", label: "Action", render: (row) => {
        console.log('row', row);
        return (
          <ActionGroup onDelete={() => {
            setDeleteConfirmation(true);
            setSelectedCategory(row);
          }} onEdit={() => router.visit(route('categories.show', row.id))} />
        )
      }
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <ConfirmationModal 
          isOpen={deleteConfirmation}
          title="Hapus Kategori?"
          message="Menghapus kategori akan membuat produk yang berada dalam kategori ini menjadi kosong"
          onClose={() => {
            setSelectedCategory(null);
            setDeleteConfirmation(false);
          }}
          onConfirm={() => {
            router.delete(route('categories.destroy', selectedCategory?.id), {
              onSuccess: () => {
                setDeleteConfirmation(false);
                setSelectedCategory(null);
              }
            });
          }}
          type="danger"
          isStatic={true}
        />
        <DataTable<CategoryI>
          title="Category List"
          columns={columns}
          data={categories}
          search={typeof localFilters.search === 'string' ? localFilters.search : ''}
          onSearch={handleSearch}
          addButton={{
            label: "Tambah Kategori",
            href: route("categories.create"),
          }}
        />
      </div>
    </DashboardLayout>
  );
}
