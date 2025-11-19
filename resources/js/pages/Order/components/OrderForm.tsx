import ButtonBack from "@/components/ButtonBack";
import { useSelectStyles } from "@/hooks/useSelectStyle";
import { CustomerI } from "@/interfaces/CustomerInterface";
import {
    OrderI,
    OrderStatusDescriptionI,
    ProductOrderI,
} from "@/interfaces/OrderInterface";
import { ProductI } from "@/interfaces/ProductInterface";
import { OptionType } from "@/types/option.type";
import { PAYMENT_TYPE } from "@/utils/constant";
import axios from "axios";
import {
    Calendar1Icon,
    Info,
    List,
    MinusSquare,
    Package,
    PlusCircle,
    PlusSquare,
    Save,
    Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select, { SingleValue } from "react-select";
import { route } from "ziggy-js";
import ModalStatusDescription from "./ModalStatusDescription";

interface OrderFormProps {
    isEdit: boolean;
    data: OrderI;
    setData: (key: keyof OrderI, value: any) => void;
    errors: Partial<Record<keyof OrderI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    customers: CustomerI[];
    statuses: OptionType[];
    statusDescriptions: OrderStatusDescriptionI[];
    products: ProductI[];
}

interface FieldProps {
    id?: keyof OrderI;
    idHtmlFor?: string;
    label: string;
    icon: React.ElementType;
    errors: string | null | undefined;
    children: React.ReactNode;
    halfWidth?: boolean;
    isRequired?: boolean;
}

const FormField: React.FC<FieldProps> = ({
    idHtmlFor,
    label,
    icon: Icon,
    errors,
    children,
    halfWidth = false,
    isRequired = false,
}) => (
    <div className={halfWidth ? "w-full md:w-1/2" : "w-full"}>
        <label
            htmlFor={String(idHtmlFor)}
            className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            <Icon className="w-4 h-4 mr-2 text-blue-500" />
            {label} {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {errors && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">
                {errors}
            </p>
        )}
    </div>
);

export default function OrderForm({
    isEdit,
    data,
    setData,
    errors,
    handleSubmit,
    processing,
    customers,
    statuses,
    products,
    statusDescriptions,
}: OrderFormProps) {
    const selectStyles = useSelectStyles<OptionType, false>({
        width: "100%",
    });

    const [isGeneratingOrderNumber, setIsGeneratingOrderNumber] =
        useState<boolean>(false);
    const [isDescriptionStatusShow, setIsDescriptionStatusShow] =
        useState<boolean>(false);

    // Helper function for standard input styling
    const inputClasses = (key: keyof OrderI) => `
        w-full p-3 text-sm rounded-lg transition-all duration-200
        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
        border ${
            errors[key]
                ? "border-red-500 ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        }
        focus:ring-1 focus:outline-none
    `;

    const handleAdd = () => {
        const updated = [
            ...data.product_orders,
            { product_id: null, quantity: 1, is_deleted: false },
        ];
        setData("product_orders", updated);
    };

    const handleRemove = (index: number) => {
        const updated = [...data.product_orders];
        const item = updated[index];

        if (item.id) {
            updated[index] = { ...item, is_deleted: true };
        } else {
            updated.splice(index, 1);
        }
        setData("product_orders", updated);
    };

    const handleProductChange = (
        selected: SingleValue<{ label: string; value: string | number }>,
        index: number
    ) => {
        const updated = [...data.product_orders];
        if (selected) {
            updated[index].product_id =
                typeof selected.value === "string"
                    ? parseInt(selected.value)
                    : selected.value;
            setData("product_orders", updated);
        }
    };

    const handleQuantityChange = (index: number, value: number) => {
        const updated = [...data.product_orders];
        updated[index].quantity = value;
        setData("product_orders", updated);
    };

    const subtotal = useMemo(() => {
        return data.product_orders
            .filter((p: ProductOrderI) => !p.is_deleted)
            .reduce((sum, prod) => {
                const selected = products.find(
                    (p: ProductI) => p.id === prod.product_id
                );
                return (
                    sum + (selected ? selected.price * (prod.quantity || 1) : 0)
                );
            }, 0);
    }, [data.product_orders, products]);

    useEffect(() => {
        setData("total", subtotal);
    }, [subtotal]);

    return (
        // Card Container
        <div className="w-full max-w-full p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 mx-auto">
            <ButtonBack backTo="orders.index" />
            {/* Form Title */}
            <h1 className="flex items-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                {isEdit ? "Edit Order" : "Tambah Order Baru"}
            </h1>

            <ModalStatusDescription
                isShow={isDescriptionStatusShow}
                statusDescriptions={statusDescriptions}
                onClose={() => setIsDescriptionStatusShow(false)}
                key="status-description"
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-8"
                encType="multipart/form-data"
            >
                {/* --- SECTION 1: CORE ORDER INFO --- */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <List className="w-5 h-5 mr-2 text-gray-400" /> Detail
                        Dasar
                    </h2>

                    {/* ORDER NUMBER */}
                    <FormField
                        isRequired={true}
                        id="order_number"
                        label="Nomor Order"
                        icon={Tag}
                        errors={errors.order_number}
                    >
                        <input
                            id="name"
                            type="text"
                            value={data.order_number}
                            placeholder="Klik generate nomor order secara otomatis"
                            required
                            readOnly
                            className={inputClasses("order_number")}
                        />

                        <button
                            type="button"
                            className="text-sm mt-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                            onClick={async () => {
                                setIsGeneratingOrderNumber(true);
                                const response = await axios.post(
                                    route("generate.order-number")
                                );
                                setData(
                                    "order_number",
                                    response.data.order_number
                                );
                                toast.success(
                                    `Order Number berhasil dibuat: ${response.data.order_number}`
                                );
                                setIsGeneratingOrderNumber(false);
                            }}
                        >
                            {isGeneratingOrderNumber
                                ? "Tunggu Sebentar..."
                                : "Generate Order Number Otomatis"}
                        </button>
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CUSTOMER */}
                        <FormField
                            isRequired={true}
                            idHtmlFor="customer_id"
                            id="customer_id"
                            label="Customer"
                            icon={List}
                            errors={errors.customer_id}
                        >
                            <Select<OptionType, false>
                                id="customer_id"
                                options={customers.map((cus: CustomerI) => ({
                                    label: `${cus.fullname} - ${cus.email}`,
                                    value: cus.id,
                                }))}
                                onChange={(
                                    selectedOption: SingleValue<OptionType>
                                ) =>
                                    setData(
                                        "customer_id",
                                        selectedOption?.value ?? null
                                    )
                                }
                                value={
                                    customers
                                        .map((cus: CustomerI) => ({
                                            label: `${cus.fullname} - ${cus.email}`,
                                            value: cus.id,
                                        }))
                                        .find(
                                            (opt) =>
                                                opt.value === data.customer_id
                                        ) || null
                                }
                                styles={selectStyles}
                                classNamePrefix="react-select"
                                placeholder="Pilih Customer"
                            />
                        </FormField>

                        {/* CHECKOUT TYPE */}
                        <FormField
                            isRequired={true}
                            idHtmlFor="checkout_type"
                            id="checkout_type"
                            label="Tipe Checkout"
                            icon={List}
                            errors={errors.checkout_type}
                        >
                            <Select<OptionType, false>
                                id="checkout_type"
                                options={PAYMENT_TYPE}
                                onChange={(
                                    selectedOption: SingleValue<OptionType>
                                ) =>
                                    setData(
                                        "checkout_type",
                                        selectedOption?.value ?? null
                                    )
                                }
                                value={
                                    PAYMENT_TYPE.map((cus: OptionType) => ({
                                        label: `${cus.label}`,
                                        value: cus.value,
                                    })).find(
                                        (opt) =>
                                            opt.value === data.checkout_type
                                    ) || null
                                }
                                styles={selectStyles}
                                classNamePrefix="react-select"
                                placeholder="Pilih Tipe Checkout"
                            />
                        </FormField>

                        {/* ORDER STATUS */}
                        <FormField
                            isRequired={true}
                            idHtmlFor="status"
                            id="status"
                            label="Status Order"
                            icon={List}
                            errors={errors.status}
                        >
                            <Select<OptionType, false>
                                id="status"
                                options={statuses}
                                onChange={(
                                    selectedOption: SingleValue<OptionType>
                                ) =>
                                    setData(
                                        "status",
                                        selectedOption?.value ?? null
                                    )
                                }
                                value={
                                    statuses
                                        .map((cus: OptionType) => ({
                                            label: `${cus.label}`,
                                            value: cus.value,
                                        }))
                                        .find(
                                            (opt) => opt.value === data.status
                                        ) || null
                                }
                                styles={selectStyles}
                                classNamePrefix="react-select"
                                placeholder="Pilih Order Status"
                            />
                            <span
                                onClick={() => setIsDescriptionStatusShow(true)}
                                className="mt-2 cursor-pointer flex space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                <Info className="mr-1" /> Klik disini untuk
                                lihat deskripsi status
                            </span>
                        </FormField>
                    </div>

                    {/* Created AT */}
                    <FormField
                        isRequired={true}
                        idHtmlFor="created_at"
                        id="created_at"
                        label="Tanggal Order"
                        icon={Calendar1Icon}
                        errors={errors.created_at}
                    >
                        <input
                            id="name"
                            type="date"
                            onChange={(e) => setData('created_at', e.target.value)}
                            value={data.created_at?.toString() || ""}
                            required
                            className={inputClasses("created_at")}
                        />
                    </FormField>
                    {/* NOTES */}
                    <FormField
                        id="notes"
                        label="Notes/Catatan Tambahan"
                        icon={List}
                        errors={errors.notes}
                    >
                        <textarea
                            id="notes"
                            value={data.notes || ""}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Catatan tambahan pada order..."
                            rows={3}
                            className={inputClasses("notes") + " resize-y"}
                        />
                    </FormField>
                </div>

                {/* --- SECTION 2: PRODUCT ORDERS */}
                <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-gray-400" />{" "}
                        Produk
                    </h2>

                    <div className="overflow-x-auto">
                        <div className="min-w-[950px] space-y-4">
                            {/* Header */}
                            {errors.product_orders && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">
                                    {errors.product_orders}
                                </p>
                            )}
                            <div className="flex justify-between font-semibold text-sm text-gray-600 dark:text-gray-300 border-b pb-1">
                                <span className="w-[30%]">
                                    Product{" "}
                                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                                        *
                                    </span>
                                </span>
                                <span className="w-[15%] text-center">
                                    Harga
                                </span>
                                <span className="w-[15%] text-center">
                                    Quantity{" "}
                                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                                        *
                                    </span>
                                </span>
                                <span className="w-[20%] text-center">
                                    Total
                                </span>
                                <span className="w-[20%] text-center">
                                    Action
                                </span>
                            </div>

                            {/* Rows */}
                            {data.product_orders
                                .filter((p) => !p.is_deleted)
                                .map((prod, index) => {
                                    const selectedProduct = products.find(
                                        (p) => p.id === prod.product_id
                                    );
                                    const total =
                                        selectedProduct?.price && prod.quantity
                                            ? selectedProduct.price *
                                              prod.quantity
                                            : 0;

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-2"
                                        >
                                            {/* Product Select */}
                                            <div className="w-[30%]">
                                                <Select
                                                    id={`product_${index}`}
                                                    options={products
                                                        .filter(
                                                            (p) =>
                                                                !data.product_orders.some(
                                                                    (
                                                                        order,
                                                                        i
                                                                    ) =>
                                                                        order.product_id ===
                                                                            p.id &&
                                                                        i !==
                                                                            index &&
                                                                        !order.is_deleted
                                                                )
                                                        )
                                                        .map((p) => ({
                                                            label: `${p.name} - Stok ${p.stock}`,
                                                            value: p.id,
                                                        }))}
                                                    onChange={(selected) =>
                                                        handleProductChange(
                                                            selected,
                                                            index
                                                        )
                                                    }
                                                    value={
                                                        prod.product_id
                                                            ? (() => {
                                                                  const selectedProduct =
                                                                      products.find(
                                                                          (p) =>
                                                                              p.id ===
                                                                              prod.product_id
                                                                      );
                                                                  return selectedProduct
                                                                      ? {
                                                                            label: `${selectedProduct.name} - Stok ${selectedProduct.stock}`,
                                                                            value: selectedProduct.id,
                                                                        }
                                                                      : null;
                                                              })()
                                                            : null
                                                    }
                                                    styles={selectStyles}
                                                    placeholder="Pilih produk..."
                                                />
                                                {/* IF STOCK IS EMPTY */}
                                                {prod.product_id &&
                                                products.find(
                                                    (p: ProductI) =>
                                                        p.id === prod.product_id
                                                )?.stock === 0 ? (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Stok produk ini habis
                                                    </p>
                                                ) : null}
                                            </div>

                                            {/* Harga */}
                                            <div className="w-[15%] text-center text-gray-800 dark:text-gray-200">
                                                {selectedProduct
                                                    ? `Rp ${selectedProduct.price.toLocaleString()}`
                                                    : "-"}
                                            </div>

                                            {/* Quantity */}
                                            <div className="w-[15%] flex flex-col items-center">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    className="w-20 text-center border rounded-md dark:bg-gray-700 dark:text-gray-100"
                                                    value={prod.quantity}
                                                    disabled={
                                                        !prod.product_id ||
                                                        products.find(
                                                            (p: ProductI) =>
                                                                p.id ===
                                                                prod.product_id
                                                        )?.stock === 0
                                                    }
                                                    onChange={(e) =>
                                                        handleQuantityChange(
                                                            index,
                                                            parseInt(
                                                                e.target.value
                                                            ) || 1
                                                        )
                                                    }
                                                />
                                            </div>

                                            {/* Total */}
                                            <div className="w-[20%] text-center text-gray-800 dark:text-gray-200">
                                                {total > 0
                                                    ? `Rp ${total.toLocaleString()}`
                                                    : "-"}
                                            </div>

                                            {/* Actions */}
                                            <div className="w-[10%] flex justify-center gap-2">
                                                {data.product_orders.length >
                                                    1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemove(index)
                                                        }
                                                        className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                                                    >
                                                        <MinusSquare />
                                                    </button>
                                                )}
                                                {index ===
                                                    data.product_orders.length -
                                                        1 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAdd}
                                                        className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        <PlusSquare />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* Subtotal */}
                            <div className="flex justify-end border-t border-gray-300 dark:border-gray-600 pt-3 mt-2">
                                <div className="text-right font-semibold text-gray-800 dark:text-gray-100">
                                    Subtotal:&nbsp;
                                    <span className="text-blue-600 dark:text-blue-400">
                                        Rp {subtotal.toLocaleString()}
                                    </span>
                                    <input
                                        type="hidden"
                                        name="total"
                                        value={subtotal}
                                    />
                                </div>
                            </div>
                        </div>
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
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        )}
                        {!processing &&
                            (isEdit ? (
                                <Save className="w-5 h-5 mr-2" />
                            ) : (
                                <PlusCircle className="w-5 h-5 mr-2" />
                            ))}
                        {processing
                            ? "Menyimpan..."
                            : isEdit
                            ? "Simpan Perubahan Order"
                            : "Tambah Order"}
                    </button>
                </div>
            </form>
        </div>
    );
}
