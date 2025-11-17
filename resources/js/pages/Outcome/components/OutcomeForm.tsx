import ButtonBack from "@/components/ButtonBack";
import { OutcomeI } from "@/interfaces/OutcomeInterface";
import { OptionType } from "@/types/option.type";
import { BanknoteArrowDown, List, Package, PlusCircle, Save, Tag } from "lucide-react";

interface OutcomeFormProps {
    isEdit: boolean;
    data: OutcomeI;
    setData: (key: keyof OutcomeI, value: any) => void;
    errors: Partial<Record<keyof OutcomeI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    types: OptionType[];
}

interface FieldProps {
    id?: keyof OutcomeI;
    idHtmlFor?: string;
    label: string;
    icon: React.ElementType;
    errors: string | null | undefined;
    children: React.ReactNode;
    halfWidth?: boolean;
    isRequired?: boolean;
}

const FormField: React.FC<FieldProps> = ({ id, idHtmlFor, label, icon: Icon, errors, children, halfWidth = false, isRequired = false }) => (
    <div className={halfWidth ? 'w-full md:w-1/2' : 'w-full'}>
        <label
            htmlFor={idHtmlFor ? String(idHtmlFor) : String(id)}
            className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            <Icon className="w-4 h-4 mr-2 text-blue-500" />
            {label} {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {errors && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">{errors}</p>
        )}
    </div>
);


export default function OutcomeForm({
    isEdit,
    data,
    setData,
    errors,
    handleSubmit,
    processing,
    types,
}: OutcomeFormProps) {
    // Helper function for standard input styling
    const inputClasses = (key: keyof OutcomeI) => `
        w-full p-3 text-sm rounded-lg transition-all duration-200
        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
        border ${errors[key] ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}
        focus:ring-1 focus:outline-none
    `;
    return (
        // Card Container
        <div className="w-full max-w-full p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 mx-auto">
            <ButtonBack backTo="outcomes.index" />
            {/* Form Title */}
            <h1 className="flex items-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                {isEdit ? "Edit Customer" : "Tambah Customer"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <List className="w-5 h-5 mr-2 text-gray-400" /> Detail Dasar
                    </h2>

                    {/* Title */}
                    <FormField isRequired={true} id="title" label="Nama Pengeluaran" icon={Tag} errors={errors.name}>
                        <input
                            id="name"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="Contoh: Pengeluaran Pembelian Stiker"
                            required
                            className={inputClasses('title')}
                        />
                    </FormField>

                    {/* Description */}
                    <FormField isRequired={true} id="description" label="Deskripsi" icon={Tag} errors={errors.description}>
                        <textarea
                            id="address"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Deskripsi..."
                            rows={3}
                            className={inputClasses('description') + ' resize-y'}
                        />
                    </FormField>

                    {/* TYPE */}
                    <FormField isRequired={true} id="type" label="Tipe" icon={Tag} errors={errors.description}>
                        <select
                            id="type"
                            value={data.type ?? ''}
                            onChange={(e) => setData("type", e.target.value)}
                            required
                            className={inputClasses('type') + ' appearance-none'}
                        >
                            <option value="">Pilih Tipe</option>
                            {types.map((cat) => (
                                <option defaultValue='+62' key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </FormField>

                    {/* Total */}
                    <FormField isRequired={true} id="total" label="Total Pengeluaran" icon={BanknoteArrowDown} errors={errors.name}>
                        <input
                            id="name"
                            type="text"
                            value={data.total}
                            onChange={(e) => setData("total", e.target.value)}
                            placeholder="Total Pengeluaran"
                            required
                            className={inputClasses('total')}
                        />
                    </FormField>
                </div>


                {/* --- SUBMIT BUTTON --- */}
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center px-6 py-2.5 text-base font-semibold rounded-lg text-white transition-all duration-300
                            bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300
                            dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-900
                            disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {processing && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {!processing && (isEdit ? <Save className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />)}
                        {processing
                            ? "Menyimpan..."
                            : isEdit
                                ? "Simpan Perubahan Outcome"
                                : "Tambah Outcome"}
                    </button>
                </div>
            </form>
        </div>
    );
};