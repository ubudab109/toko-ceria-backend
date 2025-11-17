import { InventoryI } from "@/interfaces/InventoryInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import React from "react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import InventoryForm from "./components/InventoryForm";

export default function Create(): React.ReactNode {
    const { products } = usePage<{products: ProductI[]}>().props;

    const {data, setData, post, processing, errors, reset} = useForm<InventoryI>({
        id: 0,
        name: '',
        measurement: 'ml',
        stock: 0,
        description: '',
        price: 0,
        product: {
            id: 0,
            name: '',
            price: 0,
            description: '',
            measurement: ''
        },
        product_id: 0,
        sku: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventories.store'), {
            onSuccess: () => reset(),
            onError: () => toast.error('Pastikan semua input telah terisi')
        });
    }

    return (
        <DashboardLayout>
            <InventoryForm 
                products={products}
                data={data}
                isEdit={false}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                key='inventory-form-create'
            />
        </DashboardLayout>
    );
}