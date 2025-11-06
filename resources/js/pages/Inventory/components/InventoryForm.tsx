import ButtonBack from "@/components/ButtonBack";
import { InventoryI } from "@/interfaces/InventoryInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import { MOCK_MEASUREMENTS } from "@/utils/constant";
import { formatRupiah } from "@/utils/helpert";
import axios from "axios";
import { DecimalsArrowLeft, DollarSign, List, Package, PlusCircle, Save, Scale, Tag, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";


interface InventoryFormProps {
    isEdit: boolean;
    data: InventoryI;
    setData: (key: keyof InventoryI, value: any) => void;
    errors: Partial<Record<keyof InventoryI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    products: ProductI[];
}

interface FieldProps {
    id?: keyof InventoryI;
    idHtmlFor?: string;
    label: string;
    icon: React.ElementType;
    errors: string | null | undefined;
    children: React.ReactNode;
    halfWidth?: boolean;
    isRequired?: boolean;
}

const FormField: React.FC<FieldProps> = ({ idHtmlFor, label, icon: Icon, errors, children, halfWidth = false, isRequired = false }) => (
    <div className={halfWidth ? 'w-full md:w-1/2' : 'w-full'}>
        <label
            htmlFor={String(idHtmlFor)}
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


export default function InventoryForm({
    isEdit,
    data,
    setData,
    errors,
    handleSubmit,
    processing,
    products,
}: InventoryFormProps) {
    const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
    const [isGeneratingSku, setIsGeneratingSku] = useState<boolean>(false)
    // Helper function for standard input styling
    const inputClasses = (key: keyof InventoryI) => `
        w-full p-3 text-sm rounded-lg transition-all duration-200
        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
        border ${errors[key] ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}
        focus:ring-1 focus:outline-none
    `;
    const handleSelectProduct = (product: ProductI) => {
        setData("name", product.name);
        setData('price', product.price);
        setData('measurement', product.measurement);
        setData('product_id', product.id);
        setIsProductModalOpen(false);
    };

    return (
        // Card Container
        <div className="w-full max-w-full p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 mx-auto">
            <ButtonBack />
            {/* Form Title */}
            <h1 className="flex items-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                {isEdit ? "Edit Inventory" : "Tambah Inventory Baru"}
            </h1>

            {isProductModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 relative">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pilih Produk</h3>
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List produk */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => handleSelectProduct(product)}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200 rounded-md"
                                    >
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                                        {product.category && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.category.name}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatRupiah(product.price)}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                                    Tidak ada produk tersedia
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">

                {/* --- SECTION 1: CORE PRODUCT INFO --- */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <List className="w-5 h-5 mr-2 text-gray-400" /> Detail Dasar
                    </h2>

                    {/* Name */}
                    <FormField isRequired={true} id="name" label="Nama Inventory" icon={Tag} errors={errors.name}>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => {
                                setData("name", e.target.value)
                                setData("product_id", null);
                            }}
                            placeholder="Contoh: Kopi Arabica Gayo"
                            required
                            className={inputClasses('name')}
                        />
                        <button type="button" onClick={() => setIsProductModalOpen(true)} className="text-sm mt-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500">
                            Pilih dari produk
                        </button>
                    </FormField>

                    {/* SKU */}
                    <FormField isRequired={true} id="name" label="SKU" icon={Tag} errors={errors.name}>
                        <input
                            id="name"
                            type="text"
                            value={data.sku}
                            readOnly
                            placeholder="Klik Generate SKU"
                            required
                            className={inputClasses('name')}
                        />
                        <button
                            type="button"
                            className="text-sm mt-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                            onClick={async () => {
                                if (!data.name) {
                                    toast.error('Mohon mengisi nama inventory terlebih dahulu');
                                    return;
                                }
                                setIsGeneratingSku(true);
                                const response = await axios.post(route('generate.sku'));
                                setData('sku', response.data.sku);
                                toast.success(`SKU berhasil dibuat: ${response.data.sku}`);
                                setIsGeneratingSku(false);
                            }}
                        >
                            {
                                isGeneratingSku ? 'Tunggu Sebentar...' : 'Generate SKU Otomatis'
                            }
                        </button>
                    </FormField>

                    {/* Description */}
                    <FormField id="description" label="Deskripsi Inventory" icon={List} errors={errors.description}>
                        <textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Deskripsi lengkap Inventory Anda..."
                            rows={3}
                            className={inputClasses('description') + ' resize-y'}
                        />
                    </FormField>

                    {/* Price and Category (Side by Side) */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Price */}
                        <FormField isRequired={true} id="price" label="Harga (IDR)" icon={DollarSign} errors={errors.price} halfWidth>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                                placeholder="Cth: 150000.00"
                                required
                                className={inputClasses('price')}
                            />
                        </FormField>

                        {/* measurement */}
                        <FormField id="measurement" label="Satuan" icon={Scale} errors={errors.measurement}>
                            <select
                                id="measurement"
                                value={data.measurement}
                                onChange={(e) => setData("measurement", e.target.value)}
                                className={inputClasses('measurement') + ' appearance-none'}
                            >
                                {MOCK_MEASUREMENTS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </FormField>

                        {/* Stock */}
                        <FormField id="stock" label="Stock" icon={DecimalsArrowLeft} errors={errors.measurement}>
                            <input
                                id="stock"
                                type="number"
                                step="0.01"
                                value={data.stock}
                                onChange={(e) => setData("stock", e.target.value)}
                                placeholder="Cth: 5"
                                required
                                className={inputClasses('stock')}
                            />
                        </FormField>
                    </div>
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
                                ? "Simpan Perubahan Inventory"
                                : "Tambah Inventory"}
                    </button>
                </div>
            </form>
        </div>
    );
};