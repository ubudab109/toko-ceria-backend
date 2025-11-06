import { CustomerI } from "@/interfaces/CustomerInterface";
import { OrderI, OrderStatusDescriptionI, ProductOrderI } from "@/interfaces/OrderInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { OptionType } from "@/types/option.type";
import { useForm, usePage } from "@inertiajs/react";
import OrderForm from "./components/OrderForm";
import { route } from "ziggy-js";
import toast from "react-hot-toast";

interface OrderEditProps extends PageProps {
    order: OrderI;
    products: ProductI[];
    customers: CustomerI[];
    statuses: OptionType[];
    statusDescriptions: OrderStatusDescriptionI[];
}
export default function Create(): React.ReactNode {
    const {
        order,
        customers,
        products,
        statuses,
        statusDescriptions,
    } = usePage<OrderEditProps>().props;

    const { data, put, processing, errors, setData } = useForm<OrderI>({
        id: order.id,
        checkout_type: order.checkout_type,
        customer_id: order.customer_id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        notes: order.notes,
        customer: {
            id: order.customer.id,
            email: order.customer.email,
            fullname: order.customer.fullname,
        },
        product_orders: order.product_orders.map((prod: ProductOrderI) => {
            return {
                id: prod.id,
                order_id: prod.order_id,
                product_id: prod.product_id,
                quantity: prod.quantity,
                is_deleted: false,
                product: {
                    id: prod.product.id,
                    category: prod.product.category ? {
                        id: prod.product.category.id,
                        description: prod.product.category.description,
                        name: prod.product.category.name,
                    } : {
                        id: 0,
                        description: '',
                        name: 'Tidak memiliki kategori'
                    },
                    category_id: prod.product.category_id,
                    limited_stock: prod.product.limited_stock,
                    name: prod.product.name,
                    price: prod.product.price,
                }
            }
        })
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('orders.update', order.id), {
            onError: () => toast.error('Harap periksa input Anda'),
        });
    }
    return (
        <DashboardLayout>
            <OrderForm
                customers={customers}
                data={data}
                statusDescriptions={statusDescriptions}
                products={products}
                errors={errors}
                handleSubmit={handleSubmit}
                isEdit={true}
                processing={processing}
                setData={setData}
                statuses={statuses}
            />
        </DashboardLayout>
    )
}

