import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import toast from "react-hot-toast";
import OutcomeForm from "./components/OutcomeForm";
import { OutcomeI } from "@/interfaces/OutcomeInterface";
import { OptionType } from "@/types/option.type";

export default function Create(): React.ReactNode {
    const { types } = usePage<{ types: OptionType[] }>().props;
    const { data, setData, post, processing, errors, reset } = useForm<OutcomeI>({
        id: 0,
        title: '',
        created_at: new Date(),
        description: '',
        total: 0,
        type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('outcomes.store'), {
            onSuccess: () => reset(),
            onError: () => toast.error('Pastikan semua input sudah terisi'),
        });
    };

    return (
        <DashboardLayout>
            <OutcomeForm
                isEdit={false}
                data={data}
                errors={errors}
                handleSubmit={handleSubmit}
                processing={processing}
                setData={setData}
                types={types}
                key="outcome-create-form"
            />
        </DashboardLayout>
    )
}