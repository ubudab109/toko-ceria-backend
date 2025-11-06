import { CustomerI } from "@/interfaces/CustomerInterface";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm } from "@inertiajs/react";
import CustomerForm from "./components/CustomerForm";
import { route } from "ziggy-js";
import toast from "react-hot-toast";

export default function Create(): React.ReactNode {
    const { data, setData, post, processing, errors, reset } = useForm<CustomerI>({
        id: 0,
        email: '',
        fullname: '',
        address: '',
        age: 21,
        know_from: 'instagram',
        phone_code: '+62',
        phone_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customers.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
            onError: () => toast.error('Pastikan semua input sudah terisi'),
        });
    };

    return (
        <DashboardLayout>
            <CustomerForm
                isEdit={false}
                data={data}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                key="customers-create-form"
            />
        </DashboardLayout>
    )
}