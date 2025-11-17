import { HPPCompositionI } from "@/interfaces/HPPCompositionInterface";
import { InventoryI } from "@/interfaces/InventoryInterface"
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import HPPForm from "./components/HPPForm";

interface HPPCreateProps extends PageProps {
    inventoryProducts: InventoryI[];
    inventories: InventoryI[];
}

export default function Create(): React.ReactNode {
    const {
        inventories,
        inventoryProducts,
    } = usePage<HPPCreateProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm<HPPCompositionI>({
        id: 0,
        inventory_id: 0,
        labor_cost: 0,
        production_batch: 0,
        inventory: {
            id: 0,
            measurement: '',
            name: '',
            stock: 0,
        },
        hpp_items: [
            {
                id: 0,
                hpp_category_id: 0,
                hpp_composition_id: 0,
                category_name: '',
                hpp_category: {
                    id: 0,
                    category_name: '',
                    hpp_composition_id: 0,
                },
                inventory_id: 0,
                inventory: {
                    id: 0,
                    measurement: '',
                    name: '',
                    stock: 0,
                },
                stock_used: 0,
                total_price_inventory: 0,
            }
        ],
        total: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hpp-compositions.store'), {
            onSuccess: () => reset(),
            onError: () => toast.error('Pastikan semua input telah terisi')
        });
    };

    return (
        <DashboardLayout>
            <HPPForm
                inventories={inventories}
                inventoryProducts={inventoryProducts}
                data={data}
                isEdit={false}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                key='hpp-form-create'
            />
        </DashboardLayout>
    );
}