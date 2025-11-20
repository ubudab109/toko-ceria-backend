import { CategoryI } from "@/interfaces/CategoryInterface";
import { ProductI, ProductImageI } from "@/interfaces/ProductInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import ProductForm from "./components/ProductForm";
import { useEffect } from "react";

export default function Edit(): React.ReactNode {
    const { categories, product } = usePage<{ categories: CategoryI[], product: ProductI }>().props;
    const { data, setData, post, processing, errors } = useForm<ProductI>({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        limited_stock: product.limited_stock,
        origin: product.origin,
        abv: product.abv,
        volume: product.volume,
        measurement: product.measurement,
        productImages: product.product_images?.map((img: ProductImageI) => {
            return {
                id: img.id,
                image_url: img.image_url,
                product_id: img.product_id,
                is_thumbnail: img.is_thumbnail,
            }
        }),
        category: {
            id: product.category?.id || 0,
            description: product.category?.description || '',
            name: product.category?.name || ''
        },
    });

    useEffect(() => {
        setData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: product.category_id,
            limited_stock: product.limited_stock,
            origin: product.origin,
            abv: product.abv,
            volume: product.volume,
            measurement: product.measurement,
            productImages: product.product_images?.map(img => ({
                id: img.id,
                image_url: img.image_url,
                product_id: img.product_id,
                is_thumbnail: img.is_thumbnail
            })),
            category: {
                id: product.category?.id || 0,
                name: product.category?.name || '',
                description: product.category?.description || ''
            }
        });
    }, [product]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.update', data.id), {
            forceFormData: true,
            onError: () => toast.error('Pastikan semua input sudah terisi'),
        });
    };

    return (
        <DashboardLayout>
            <ProductForm
                isEdit={true}
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