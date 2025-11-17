import ButtonBack from "@/components/ButtonBack";
import { useSelectStyles } from "@/hooks/useSelectStyle";
import { HPPCompositionI, HPPCompositionItemI, HPPCompositionCategoryI } from "@/interfaces/HPPCompositionInterface";
import { InventoryI } from "@/interfaces/InventoryInterface";
import { OptionType } from "@/types/option.type";
import { CurrencyIcon, List, MinusSquare, Package, PackageOpenIcon, PlusCircle, PlusSquare, Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import Select, { SingleValue } from 'react-select';

interface HPPFormProps {
    isEdit: boolean;
    data: HPPCompositionI;
    setData: (key: keyof HPPCompositionI, value: any) => void;
    errors: Partial<Record<keyof HPPCompositionI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    inventoryProducts: InventoryI[]; // main product select options (top product)
    inventories: InventoryI[]; // options for hpp items
}

/**
 * Important:
 * - We keep data.hpp_items as flat array (HPPCompositionItemI[])
 * - UI groups items by hpp_category_id / category_name for table view
 * - New categories use temporary negative ids (e.g. -163...).
 */

const FormField: React.FC<{
    id?: keyof HPPCompositionI;
    idHtmlFor?: string;
    label: string;
    icon: React.ElementType;
    errors: string | null | undefined;
    children: React.ReactNode;
    halfWidth?: boolean;
    isRequired?: boolean;
}> = ({ idHtmlFor, label, icon: Icon, errors, children, halfWidth = false, isRequired = false }) => (
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

export default function HPPForm({
    isEdit,
    data,
    setData,
    errors,
    handleSubmit,
    inventories,
    inventoryProducts,
    processing,
}: HPPFormProps) {
    const selectStyles = useSelectStyles<OptionType, false>({ width: '100%' });

    const inputClasses = (key: keyof HPPCompositionI) => `
        w-full p-3 text-sm rounded-lg transition-all duration-200
        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
        border ${errors[key] ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}
        focus:ring-1 focus:outline-none
    `;

    /* -------------------------
       Helpers: grouping hpp_items by category
       ------------------------- */
    const categories = useMemo(() => {
        const map = new Map<number, { hpp_category_id: number; category_name: string; items: HPPCompositionItemI[] }>();
        (data.hpp_items || []).forEach((it: HPPCompositionItemI) => {
            if (!it.hpp_category.is_deleted) {
                // if item marked deleted keep logic but filter later
                const cid = it.hpp_category_id ?? 0;
                const name = it.category_name ?? (it.hpp_category?.category_name ?? 'Uncategorized');
                if (!map.has(cid)) {
                    map.set(cid, { hpp_category_id: cid, category_name: name, items: [] });
                }
                map.get(cid)!.items.push(it);
            }
        });
        // return array sorted by category_name or original order
        return Array.from(map.values());
    }, [data.hpp_items]);

    /* -------------------------
       Inventory options
       ------------------------- */
    const inventoryOptions = inventories.map((p: InventoryI) => ({
        label: `${p.name} - Stok ${p.stock}`,
        value: p.id,
    }));

    /* -------------------------
       CRUD operations on flat hpp_items (kept in parent state via setData)
       ------------------------- */

    // create temporary category id (negative) for new categories
    const makeTempCategoryId = () => -Math.floor(Date.now());

    const addCategory = () => {
        const tempCatId = makeTempCategoryId();
        const placeholder: HPPCompositionItemI = {
            id: 0,
            hpp_composition_id: data.id ?? 0,
            hpp_category_id: tempCatId,
            hpp_category: { id: tempCatId, hpp_composition_id: data.id ?? 0, category_name: "Kategori Baru" } as HPPCompositionCategoryI,
            inventory_id: 0,
            inventory: ({} as any) as InventoryI,
            stock_used: 0,
            total_price_inventory: 0,
            category_name: "Kategori Baru",
            is_deleted: false
        };
        const updated = [...(data.hpp_items || []), placeholder];
        setData('hpp_items', updated);
    };

    const removeCategory = (hpp_category_id: number) => {
        const updated = (data.hpp_items || []).map(it => {
            if (it.hpp_category_id === hpp_category_id) {
                if (it.id && it.id > 0) {
                    return { ...it, hpp_category: {...it.hpp_category, is_deleted: true} };
                }
                return null;
            }
            return it;
        }).filter(Boolean) as HPPCompositionItemI[];
        setData('hpp_items', updated);
    };

    const addItemToCategory = (hpp_category_id: number, category_name?: string, hpp_category?: HPPCompositionCategoryI) => {
        const newItem: HPPCompositionItemI = {
            id: 0,
            hpp_composition_id: data.id ?? 0,
            hpp_category_id: hpp_category_id,
            hpp_category: hpp_category ?? ({ id: hpp_category_id, hpp_composition_id: data.id ?? 0, category_name: category_name ?? '' } as HPPCompositionCategoryI),
            inventory_id: 0,
            inventory: ({} as any) as InventoryI,
            stock_used: null,
            total_price_inventory: 0,
            category_name: category_name ?? (hpp_category?.category_name ?? ''),
            is_deleted: false
        };
        const updated = [...(data.hpp_items || []), newItem];
        setData('hpp_items', updated);
    };

    const removeItem = (indexInFlat: number) => {
        const flat = [...(data.hpp_items || [])];
        const item = flat[indexInFlat];
        if (!item) return;
        if (item.id && item.id > 0) {
            flat[indexInFlat] = { ...item, is_deleted: true };
        } else {
            flat.splice(indexInFlat, 1);
        }
        setData('hpp_items', flat);
    };

    const updateItemFieldByFlatIndex = (indexInFlat: number, patch: Partial<HPPCompositionItemI>) => {
        const flat = [...(data.hpp_items || [])];
        const it = flat[indexInFlat];
        if (!it) return;
        const updatedItem = { ...it, ...patch };
        // if stock_used changed OR inventory changed -> recalc total_price_inventory using inventory.price
        if (patch.inventory_id !== undefined || patch.stock_used !== undefined) {
            const invId = patch.inventory_id ?? updatedItem.inventory_id;
            const inv = inventories.find(i => i.id === invId);
            const price = inv ? Number(inv.price ?? 0) : Number((updatedItem.inventory && (updatedItem.inventory as InventoryI).price) ?? 0);
            const qty = Number(patch.stock_used ?? updatedItem.stock_used ?? 0);
            updatedItem.total_price_inventory = price * qty;
            if (inv) {
                updatedItem.inventory = inv;
            }
        }
        flat[indexInFlat] = updatedItem;
        setData('hpp_items', flat);
    };

    /* Utility: find flat index of item by category group index & row index */
    const getFlatIndexFromCategory = (catId: number, rowInCat: number) => {
        const flat = data.hpp_items || [];
        let count = -1;
        for (let i = 0; i < flat.length; i++) {
            const it = flat[i];
            if (it.hpp_category_id === catId && !it.is_deleted) {
                count++;
                if (count === rowInCat) return i;
            }
        }
        return -1;
    };

    /* -------------------------
       Subtotal calculation (sum of total_price_inventory for not deleted)
       ------------------------- */
    const subtotal = useMemo(() => {
        return (data.hpp_items || []).filter(it => !it.is_deleted).reduce((s, it) => s + Number(it.total_price_inventory || 0), 0);
    }, [data.hpp_items, inventories]);

    useEffect(() => {
        setData('total', subtotal);
    }, [subtotal]);

    /* -------------------------
       render
       ------------------------- */

    return (
        <div className="w-full max-w-full p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 mx-auto">
            <ButtonBack backTo="hpp-compositions.index" />
            <h1 className="flex items-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <CurrencyIcon className="w-8 h-8 mr-3 text-blue-600" />
                {isEdit ? "Edit HPP" : "Tambah HPP Baru"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <List className="w-5 h-5 mr-2 text-gray-400" /> Detail HPP
                    </h2>

                    <FormField isRequired={true} id="inventory_id" label="Produk" icon={Package} errors={errors.inventory_id}>
                        <Select
                            id="inventory_id"
                            options={inventoryProducts.map((p: InventoryI) => ({ label: `${p.name} - Stok ${p.stock}`, value: p.id }))}
                            onChange={(selected) => setData('inventory_id', selected?.value)}
                            value={
                                data.inventory_id
                                    ? (() => {
                                        const selectedProduct = inventoryProducts.find((p) => p.id === data.inventory_id);
                                        return selectedProduct ? { label: `${selectedProduct.name} - Stok ${selectedProduct.stock}`, value: selectedProduct.id } : null;
                                    })()
                                    : null
                            }
                            styles={selectStyles}
                            placeholder="Pilih produk..."
                        />
                    </FormField>



                    <FormField isRequired={true} id="production_batch" label="Production Batch" icon={PackageOpenIcon} errors={errors.production_batch}>
                        <input
                            id="production_batch"
                            type="number"
                            value={data.production_batch ?? 0}
                            onChange={(e) => setData('production_batch', Number(e.target.value || 0))}
                            placeholder="Biaya tenaga kerja"
                            className={inputClasses('production_batch')}
                        />
                    </FormField>

                    <FormField isRequired={false} id="labor_cost" label="Biaya Tenaga Kerja" icon={CurrencyIcon} errors={errors.labor_cost}>
                        <input
                            id="labor_cost"
                            type="number"
                            value={data.labor_cost ?? 0}
                            onChange={(e) => setData('labor_cost', Number(e.target.value || 0))}
                            placeholder="Biaya tenaga kerja"
                            className={inputClasses('labor_cost')}
                        />
                    </FormField>
                </div>

                {/* --- CATEGORY TABLE (grouped view) --- */}
                <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-gray-400" /> Produk
                    </h2>

                    <div className="overflow-x-auto">
                        <div className="min-w-[950px] space-y-4">
                            {errors.hpp_items && (<p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">{errors.hpp_items}</p>)}

                            {/* Render categories from grouped data */}
                            {categories.length === 0 && (
                                <div className="text-sm text-gray-500">Belum ada kategori. Tambah kategori untuk mulai menambahkan bahan.</div>
                            )}

                            {categories.map((cat) => {
                                const visibleItems = cat.items.filter(it => !it.is_deleted);
                                return (
                                    <div key={cat.hpp_category_id} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                                        {/* Category header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={cat.category_name}
                                                    onChange={(e) => {
                                                        // update all items' category_name and hpp_category prop in flat array
                                                        const flat = (data.hpp_items || []).map(it => {
                                                            if (it.hpp_category_id === cat.hpp_category_id) {
                                                                return {
                                                                    ...it,
                                                                    category_name: e.target.value,
                                                                    hpp_category: { ...(it.hpp_category || {}), category_name: e.target.value } as HPPCompositionCategoryI
                                                                };
                                                            }
                                                            return it;
                                                        });
                                                        setData('hpp_items', flat);
                                                    }}
                                                    placeholder="Nama Kategori..."
                                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-64 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => addItemToCategory(cat.hpp_category_id, cat.category_name, { id: cat.hpp_category_id, hpp_composition_id: data.id ?? 0, category_name: cat.category_name } as HPPCompositionCategoryI)} className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
                                                    <PlusSquare />
                                                </button>
                                                <button type="button" onClick={() => removeCategory(cat.hpp_category_id)} className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">
                                                    <MinusSquare />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Table header */}
                                        <div className="flex justify-between font-semibold text-sm text-gray-600 dark:text-gray-300 border-b pb-1">
                                            <span className="w-[5%]">No</span>
                                            <span className="w-[20%]">Nama Bahan</span>
                                            <span className="w-[20%] text-center">Satuan</span>
                                            <span className="w-[20%] text-center">Stok yang digunakan</span>
                                            <span className="w-[20%] text-center">Harga Bahan/Pack</span>
                                            <span className="w-[15%] text-center">Total Bahan Pokok</span>
                                        </div>

                                        {/* Items rows */}
                                        {visibleItems.map((item, rowIndex) => {
                                            const flatIndex = getFlatIndexFromCategory(cat.hpp_category_id, rowIndex);
                                            const selectedInventory = inventories.find(i => i.id === item.inventory_id);
                                            const totalDisplay = item.total_price_inventory && item.total_price_inventory > 0 ? `Rp ${Number(item.total_price_inventory.toFixed()).toLocaleString()}` : '-';
                                            return (
                                                <div key={rowIndex} className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 py-2">
                                                    <div className="w-[5%] text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{rowIndex + 1}</div>

                                                    {/* Inventory */}
                                                    <div className="w-[20%]">
                                                        <Select
                                                            id={`cat_${cat.hpp_category_id}_item_${rowIndex}`}
                                                            options={inventoryOptions.filter((opt: any) => {
                                                                const usedInventoryIds = categories
                                                                    .flatMap(c => c.items)
                                                                    .filter(i => !i.is_deleted)
                                                                    .map(i => i.inventory_id);
                                                                const usedExceptCurrent = usedInventoryIds.filter(id => id !== item.inventory_id);
                                                                return !usedExceptCurrent.includes(opt.value);
                                                            })}
                                                            onChange={(selected) => {
                                                                const val = selected ? (typeof selected.value === 'string' ? parseInt(selected.value) : selected.value) : 0;
                                                                updateItemFieldByFlatIndex(flatIndex, { inventory_id: val });
                                                            }}
                                                            value={item.inventory_id ? (() => {
                                                                const sel = inventories.find(i => i.id === item.inventory_id);
                                                                return sel ? { label: `${sel.name} - Stok ${sel.stock}`, value: sel.id } : null;
                                                            })() : null}
                                                            styles={selectStyles}
                                                            placeholder="Pilih bahan..."
                                                        />
                                                    </div>

                                                    {/* Measurement */}
                                                    <div className="w-[20%] text-center">
                                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.inventory?.measurement ?? '-'}</div>
                                                    </div>

                                                    {/* Stock Used */}
                                                    <div className="w-[20%] text-center">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step={
                                                                item.inventory.measurement === 'pcs' || 
                                                                item.inventory.measurement === 'bottel' ? '1' : '0.01'
                                                            }
                                                            disabled={!item.inventory_id}
                                                            className={`w-full ${inputClasses('hpp_items')}`}
                                                            value={item.stock_used ?? ''}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                if (v === "") {
                                                                    updateItemFieldByFlatIndex(flatIndex, { stock_used: null });
                                                                    return;
                                                                }
                                                                updateItemFieldByFlatIndex(flatIndex, { stock_used: Number(v) });
                                                            }}
                                                        />
                                                    </div>

                                                    {/* total perPack */}
                                                    <div className="w-[20%] text-center text-gray-800 dark:text-gray-200">
                                                        {selectedInventory ? `Rp ${Number(selectedInventory.price || 0).toLocaleString()}` : '-'}
                                                    </div>

                                                    {/* Total */}
                                                    <div className="w-[15%] text-center text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                                                        <div>{totalDisplay}</div>

                                                        <div className="flex items-center gap-1">
                                                            <button type="button" onClick={() => removeItem(flatIndex)} className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">
                                                                <MinusSquare />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    </div>
                                );
                            })}

                            {/* Controls */}
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={addCategory} className="px-3 py-1 bg-green-600 text-white rounded">+ Tambah Kategori</button>
                                </div>

                                <div className="text-right font-semibold text-gray-800 dark:text-gray-100">
                                    Subtotal:&nbsp;
                                    <span className="text-blue-600 dark:text-blue-400">
                                        Rp {subtotal.toLocaleString()}
                                    </span>
                                    <br />
                                    Fixed:&nbsp;
                                    <span className="text-blue-600 dark:text-blue-400">
                                        Rp {new Intl.NumberFormat("id-ID").format(
                                            Math.round(subtotal / 100) * 100
                                        )}
                                    </span>
                                    <input type="hidden" name="total" value={subtotal} />
                                </div>


                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit button (unchanged style) */}
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
                                ? "Simpan Perubahan HPP"
                                : "Tambah HPP"}
                    </button>
                </div>
            </form>
        </div>
    );
}
