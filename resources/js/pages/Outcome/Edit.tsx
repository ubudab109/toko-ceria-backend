import DashboardLayout from "@/layouts/DashboardLayout";
import { useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import toast from "react-hot-toast";
import OutcomeForm from "./components/OutcomeForm";
import { OutcomeI } from "@/interfaces/OutcomeInterface";
import { OptionType } from "@/types/option.type";

export default function Edit(): React.ReactNode {
    const { types, outcome } = usePage<{ types: OptionType[], outcome: OutcomeI }>().props;
    const { data, setData, put, processing, errors } = useForm<OutcomeI>({
        id: outcome.id,
        title: outcome.title,
        created_at: outcome.created_at,
        description: outcome.description,
        total: outcome.total,
        type: outcome.type,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('outcomes.update', outcome.id), {
            onError: () => toast.error('Pastikan semua input sudah terisi'),
        });
    };

    return (
        <DashboardLayout>
            <OutcomeForm
                isEdit={true}
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