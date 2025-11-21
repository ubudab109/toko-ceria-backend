import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import { ReactNode } from "react";
import ProductForm from "./components/ProductForm";
import { CategoryI } from "@/interfaces/CategoryInterface";
import { route } from "ziggy-js";
import { ProductI } from "@/interfaces/ProductInterface";
import toast from "react-hot-toast";

export default function Create(): ReactNode {
    const { categories } = usePage<{ categories: CategoryI[] }>().props;
    const { data, setData, post, processing, errors, reset } = useForm<ProductI>({
        id: 0,
        name: "",
        description: "",
        price: 0,
        category_id: 0,
        limited_stock: false,
        origin: "",
        abv: "",
        volume: 0,
        measurement: "ml",
        productImages: [{
            image_url: '',
            product_id: 0,
            is_thumbnail: false,
            id: 0,
        }],
        category: {
            id: 0,
            description: '',
            name: ''
        },
        is_public: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
            onError: () => toast.error('Pastikan semua input sudah terisi'),
        });
    };

    return (
        <DashboardLayout>
            <ProductForm
                isEdit={false}
                data={data}
                setData={setData}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                categories={categories as CategoryI[]}
            />
        </DashboardLayout>
    );
}