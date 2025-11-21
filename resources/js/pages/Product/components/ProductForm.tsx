import ButtonBack from "@/components/ButtonBack";
import { CategoryI } from "@/interfaces/CategoryInterface";
import { ProductI, ProductImageI } from "@/interfaces/ProductInterface";
import { MOCK_MEASUREMENTS } from "@/utils/constant";
import { DollarSign, Image, List, MapPin, Package, PlusCircle, Save, Scale, Tag, Trash, Wine } from "lucide-react";

interface ProductFormProps {
    isEdit: boolean;
    data: ProductI;
    setData: (key: keyof ProductI, value: any) => void;
    errors: Partial<Record<keyof ProductI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    categories: CategoryI[];
}

interface FieldProps {
    id?: keyof ProductI | keyof ProductImageI;
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


export default function ProductForm({
    isEdit,
    data,
    setData,
    errors,
    handleSubmit,
    processing,
    categories,
}: ProductFormProps) {
    if (!data.productImages) {
        data.productImages = [];
    }
    // Helper function for standard input styling
    const inputClasses = (key: keyof ProductI) => `
        w-full p-3 text-sm rounded-lg transition-all duration-200
        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
        border ${errors[key] ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}
        focus:ring-1 focus:outline-none
    `;

    const handleImageChange = (index: number, url: string | File) => {
        const newImages = [...(data.productImages || [])];
        newImages[index] = {
            ...newImages[index],
            image_url: url,
        };
        setData('productImages', newImages);
    };

    const addImageField = () => {
        const newImages = [...(data.productImages || []), { product_id: data.id || 0, image_url: '' }];
        setData('productImages', newImages);
    };

    const removeImageField = (index: number) => {
        if (!isEdit) {
            const newImages = (data.productImages || []).filter((_, i) => i !== index);
            setData('productImages', newImages);
        } else {
            const newImages = (data.productImages || []).map((img, i) => {
                if (i === index) {
                    return {
                        ...img,
                        is_deleted: true,
                        is_thumbnail: false,
                    };
                }
                return img;
            });
            setData('productImages', newImages);
        }
    };


    return (
        // Card Container
        <div className="w-full max-w-full p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 mx-auto">
            <ButtonBack backTo="products.index" />
            {/* Form Title */}
            <h1 className="flex items-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">

                {/* --- SECTION 1: CORE PRODUCT INFO --- */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <List className="w-5 h-5 mr-2 text-gray-400" /> Detail Dasar
                    </h2>

                    {/* Name */}
                    <FormField isRequired={true} id="name" label="Nama Produk" icon={Tag} errors={errors.name}>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Contoh: Kopi Arabica Gayo"
                            required
                            className={inputClasses('name')}
                        />
                    </FormField>

                    {/* Description */}
                    <FormField id="description" label="Deskripsi Produk" icon={List} errors={errors.description}>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Deskripsi lengkap produk Anda..."
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

                        {/* Category ID */}
                        <FormField isRequired={true} id="category_id" label="Kategori" icon={Tag} errors={errors.category_id} halfWidth>
                            <select
                                id="category_id"
                                value={data.category_id ?? ''}
                                onChange={(e) => setData("category_id", parseInt(e.target.value, 10) || null)}
                                required
                                className={inputClasses('category_id') + ' appearance-none'}
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                </div>

                {/* --- SECTION 2: SPECIFICATIONS (Origin, ABV, Volume) --- */}
                <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <Scale className="w-5 h-5 mr-2 text-gray-400" /> Spesifikasi Produk
                    </h2>

                    {/* Origin */}
                    <FormField isRequired={true} id="origin" label="Asal Produk (Origin)" icon={MapPin} errors={errors.origin}>
                        <input
                            id="origin"
                            type="text"
                            value={data.origin}
                            onChange={(e) => setData("origin", e.target.value)}
                            placeholder="Cth: Bandung, Jawa Barat"
                            className={inputClasses('origin')}
                        />
                    </FormField>

                    {/* ABV, Volume, Measurement (3 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ABV */}
                        <FormField isRequired={true} id="abv" label="ABV (Kadar Alkohol)" icon={Wine} errors={errors.abv}>
                            <input
                                id="abv"
                                type="text"
                                value={data.abv}
                                onChange={(e) => setData("abv", e.target.value)}
                                placeholder="Cth: 5% atau 40%"
                                className={inputClasses('abv')}
                            />
                        </FormField>

                        {/* Volume */}
                        <FormField isRequired={true} id="volume" label="Volume" icon={Scale} errors={errors.volume}>
                            <input
                                id="volume"
                                type="number"
                                value={data.volume}
                                onChange={(e) => setData("volume", e.target.value)}
                                placeholder="Cth: 750"
                                className={inputClasses('volume')}
                            />
                        </FormField>

                        {/* Measurement */}
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
                    </div>

                    {/* Limited Stock Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Stok Terbatas (Limited Stock)
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Aktifkan jika produk ini memiliki stok terbatas yang perlu dipantau.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={data.limited_stock}
                                onChange={(e) => setData('limited_stock', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Is Public Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mt-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Publikasikan Produk
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Aktifkan agar produk terlihat oleh pelanggan di toko.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={data.is_public}
                                onChange={(e) => setData('is_public', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>


                {/* --- SECTION 3: PRODUCT IMAGES --- */}
                <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <Image className="w-5 h-5 mr-2 text-gray-400" /> Gambar Produk
                    </h2>

                    <div className="space-y-4">
                        {data.productImages?.map((img, index) => {
                            if (!img.is_deleted) {
                                return (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <div className="flex-1 w-full">
                                            <FormField
                                                idHtmlFor={`image_file_${index}`}
                                                label={`Gambar ${index + 1}`}
                                                icon={Image}
                                                errors={errors[`productImages.${index}.image_url`] as string}
                                                isRequired={true}
                                            >
                                                <input
                                                    id={`image_file_${index}`}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageChange(index, file);
                                                        }
                                                    }}
                                                    className="w-full p-2 text-sm text-gray-900 bg-gray-50 dark:bg-gray-300 border border-gray-300 dark:border-gray-600 dart:text-gray-100 rounded-lg cursor-pointer focus:ring-1 focus:ring-blue-500"
                                                />
                                                <div className="flex items-center mt-2">
                                                    <input
                                                        id={`thumbnail-radio-${index}`}
                                                        type="radio"
                                                        value="true"
                                                        name="thumbnail-radio"
                                                        checked={!!img.is_thumbnail}
                                                        onChange={() => {
                                                            const newImages = (data.productImages || []).map((item, i) => ({
                                                                ...item,
                                                                is_thumbnail: i === index,
                                                            }));
                                                            setData('productImages', newImages);
                                                        }}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label
                                                        htmlFor={`thumbnail-radio-${index}`}
                                                        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                    >
                                                        Jadikan Thumbnail
                                                    </label>
                                                    {errors.productImages && (
                                                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">{errors.productImages}</p>
                                                    )}
                                                </div>
                                            </FormField>

                                            {/* Preview image */}
                                            {img.image_url && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                                                    <img
                                                        src={typeof img.image_url === 'string' ? img.image_url : URL.createObjectURL(img.image_url)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="max-h-48 rounded-md border border-gray-300 dark:border-gray-600 object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Tombol Hapus */}
                                        <button
                                            type="button"
                                            onClick={() => removeImageField(index)}
                                            className="self-start mt-2 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                            title="Hapus Gambar"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                )
                            }
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={addImageField}
                        className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 dark:text-blue-400 dark:border-blue-400 dark:hover:text-blue-300 dark:hover:border-blue-300 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" /> Tambah Gambar
                    </button>
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
                                ? "Simpan Perubahan Produk"
                                : "Tambah Produk"}
                    </button>
                </div>
            </form>
        </div>
    );
};