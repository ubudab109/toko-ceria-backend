import { CustomerI } from "@/interfaces/CustomerInterface";
import { OrderI, OrderStatusDescriptionI } from "@/interfaces/OrderInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { OptionType } from "@/types/option.type";
import { useForm, usePage } from "@inertiajs/react";
import OrderForm from "./components/OrderForm";
import { route } from "ziggy-js";
import toast from "react-hot-toast";

interface OrderCreateProps extends PageProps {
    products: ProductI[];
    customers: CustomerI[];
    statuses: OptionType[];
    statusDescriptions: OrderStatusDescriptionI[];
}
export default function Create(): React.ReactNode {
    const {
        customers,
        products,
        statuses,
        statusDescriptions,
    } = usePage<OrderCreateProps>().props;


    const { data, post, processing, errors, setData, reset } = useForm<OrderI>({
        id: 0,
        checkout_type: '',
        customer_id: 0,
        order_number: '',
        status: 'pending',
        total: 0,
        notes: '',
        customer: {
            id: 0,
            email: '',
            fullname: '',
        },
        product_orders: [
            {
                id: 0,
                order_id: 0,
                product_id: 0,
                quantity: 0,
                is_deleted: false,
                product: {
                    id: 0,
                    category: {
                        id: 0,
                        description: '',
                        name: '',
                    },
                    category_id: 0,
                    limited_stock: false,
                    name: '',
                    price: 0,
                }
            }
        ]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('orders.store'), {
            onSuccess: () => reset(),
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
                isEdit={false}
                processing={processing}
                setData={setData}
                statuses={statuses}
            />
        </DashboardLayout>
    )
}

