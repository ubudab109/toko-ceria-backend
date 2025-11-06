import { CustomerI } from "@/interfaces/CustomerInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import CustomerForm from "./components/CustomerForm";
import { route } from "ziggy-js";
import toast from "react-hot-toast";

export default function Edit(): React.ReactNode {
    const { customer } = usePage<{ customer: CustomerI }>().props;
    const { data, setData, put, processing, errors } = useForm<CustomerI>({
        id: customer.id,
        email: customer.email,
        fullname: customer.fullname,
        address: customer.address,
        age: customer.age,
        know_from: customer.know_from,
        phone_code: customer.phone_code,
        phone_number: customer.phone_number,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('customers.update', customer.id), {
            onError: () => toast.error('Pastikan semua input sudah terisi'),
        });
    };

    return (
        <DashboardLayout>
            <CustomerForm
                isEdit={true}
                data={data}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                key="customers-update-form"
            />
        </DashboardLayout>
    )
}