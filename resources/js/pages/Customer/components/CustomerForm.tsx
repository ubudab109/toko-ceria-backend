import ButtonBack from "@/components/ButtonBack";
import { CustomerI } from "@/interfaces/CustomerInterface";
import { countryCodes } from "@/utils/countryCode";
import { BookCheck, Flag, List, MailCheck, MapPinHouse, Package, PersonStanding, PlusCircle, Save, Smartphone, Tag } from "lucide-react";

interface CustomerFormProps {
    isEdit: boolean;
    data: CustomerI;
    setData: (key: keyof CustomerI, value: any) => void;
    errors: Partial<Record<keyof CustomerI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    processing: boolean;
}

interface FieldProps {
    id?: keyof CustomerI;
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


export default function CustomerForm({
    isEdit,
    data,
    setData,
    errors,
    handleSubmit,
    processing,
}: CustomerFormProps) {
    // Helper function for standard input styling
    const inputClasses = (key: keyof CustomerI) => `
        w-full p-3 text-sm rounded-lg transition-all duration-200
        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
        border ${errors[key] ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}
        focus:ring-1 focus:outline-none
    `;
    return (
        // Card Container
        <div className="w-full max-w-full p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 mx-auto">
            <ButtonBack />
            {/* Form Title */}
            <h1 className="flex items-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                {isEdit ? "Edit Customer" : "Tambah Customer"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">

                {/* --- SECTION 1: CORE PRODUCT INFO --- */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <List className="w-5 h-5 mr-2 text-gray-400" /> Detail Dasar
                    </h2>

                    {/* Name */}
                    <FormField isRequired={true} id="fullname" label="Nama Lengkap" icon={Tag} errors={errors.name}>
                        <input
                            id="name"
                            type="text"
                            value={data.fullname}
                            onChange={(e) => setData("fullname", e.target.value)}
                            placeholder="Contoh: Jhon Doe"
                            required
                            className={inputClasses('fullname')}
                        />
                    </FormField>
                    {/* Email */}
                    <FormField isRequired={true} id="email" label="Email" icon={MailCheck} errors={errors.email}>
                        <input
                            id="name"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="Contoh: example@example.com"
                            required
                            className={inputClasses('email')}
                        />
                    </FormField>

                    {/* Address */}
                    <FormField id="address" label="Alamat" icon={MapPinHouse} errors={errors.description}>
                        <textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            placeholder="Deskripsi lengkap produk Anda..."
                            rows={3}
                            className={inputClasses('address') + ' resize-y'}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Phone Code */}
                        <FormField id="phone_code" label="Kode Nomor" icon={Flag} errors={errors.abv}>
                            <select
                                id="phone_code"
                                value={data.phone_code ?? ''}
                                onChange={(e) => setData("phone_code", parseInt(e.target.value, 10) || null)}
                                required
                                className={inputClasses('phone_code') + ' appearance-none'}
                            >
                                <option value="">Pilih Kode Nomor</option>
                                {countryCodes.map((cat) => (
                                    <option defaultValue='+62' key={cat.name} value={cat.dial_code}>{cat.dial_code}</option>
                                ))}
                            </select>
                        </FormField>

                        {/* Phone Number */}
                        <FormField id="phone_number" label="Nomor HP" icon={Smartphone} errors={errors.volume}>
                            <input
                                id="volume"
                                type="text"
                                value={data.phone_number || ''}
                                onChange={(e) => setData("phone_number", e.target.value)}
                                placeholder="Cth: 858 1234 4546"
                                className={inputClasses('phone_number')}
                            />
                        </FormField>

                        {/* Age */}
                        <FormField id="age" label="Umur" icon={PersonStanding} errors={errors.measurement}>
                            <input
                                id="age"
                                type="number"
                                value={data.age}
                                onChange={(e) => setData("age", e.target.value)}
                                placeholder="Cth: 858 1234 4546"
                                className={inputClasses('age')}
                            />
                        </FormField>


                    </div>

                    {/* Known From */}
                    <FormField id="know_from" label="Mengeal TokCer Dari" icon={BookCheck} errors={errors.measurement}>
                        <input
                            id="know_from"
                            type="text"
                            value={data.know_from}
                            onChange={(e) => setData("know_from", e.target.value)}
                            placeholder="Cth: Instagram"
                            className={inputClasses('know_from')}
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
                                ? "Simpan Perubahan Customer"
                                : "Tambah Customer"}
                    </button>
                </div>
            </form>
        </div>
    );
};