import { HPPBatchFormI, HPPCompositionI, HPPCompositionItemI } from "@/interfaces/HPPCompositionInterface";
import { useEffect, useState } from "react";

interface ModalBatchProps {
    isOpen: boolean;
    hppComposition: HPPCompositionI | null;
    processing: boolean;
    data: HPPBatchFormI;
    setData: (key: keyof HPPBatchFormI, value: any) => void;
    errors: Partial<Record<keyof HPPBatchFormI | string, string | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

export default function ModalBatch({
    isOpen = false,
    hppComposition,
    data,
    processing,
    handleSubmit,
    setData,
    onClose,
    errors,
}: ModalBatchProps): React.ReactNode {
    if (!isOpen) return null;

    const [totalBatch, setTotalBatch] = useState<number>(0);
    const [insufficientStock, setInsufficientStock] = useState(false);

    useEffect(() => {
        if (hppComposition?.hpp_items && totalBatch > 0) {
            const hasInsufficient = hppComposition.hpp_items.some((item: HPPCompositionItemI) => {
                const required = (item.stock_used || 0) * totalBatch;
                return required > item.inventory.stock;
            });
            setInsufficientStock(hasInsufficient);
        }
    }, [totalBatch, hppComposition]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Proses Produksi Batch
                        </h3>
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2"
                        >
                            ✕
                        </button>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(e);
                        }}
                        className="space-y-6 pt-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Produksi per Batch untuk `{hppComposition?.inventory.name}`
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="mt-1 w-full rounded-md border bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                    value={hppComposition?.production_batch || 0}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Jumlah Batch (Loop)
                                </label>
                                <input
                                    type="number"
                                    name="requested_batch"
                                    id="requested_batch"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 dark:bg-gray-700 dark:text-gray-300"
                                    placeholder="Jumlah batch..."
                                    value={data.requested_batch}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setData('requested_batch', '');
                                            setTotalBatch(0);
                                            return;
                                        }
                                        const requestedBatch = Number(val);
                                        setData('requested_batch', requestedBatch);

                                        const total = (hppComposition?.production_batch || 0) * requestedBatch;
                                        setTotalBatch(total);
                                    }}
                                />
                                {errors.requested_batch && (
                                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                        {errors.requested_batch}
                                    </p>
                                )}
                                <span className="block mt-2 text-sm font-medium dark:text-gray-300">
                                    Total Produksi: {totalBatch}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    (Jumlah produk akhir yang dihasilkan)
                                </span>
                            </div>
                        </div>

                        {hppComposition?.hpp_items && (
                            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                    Detail Penggunaan HPP Item
                                </h4>

                                <table className="w-full mt-3 text-sm">
                                    <thead>
                                        <tr className="bg-gray-200 dark:bg-gray-700 text-left">
                                            <th className="px-2 py-1 text-gray-800 dark:text-gray-100">Bahan</th>
                                            <th className="px-2 py-1 text-gray-800 dark:text-gray-100">Stok Saat Ini</th>
                                            <th className="px-2 py-1 text-gray-800 dark:text-gray-100">Bahan/Produk</th>
                                            <th className="px-2 py-1 text-gray-800 dark:text-gray-100">Diperlukan</th>
                                            <th className="px-2 py-1 text-gray-800 dark:text-gray-100">Sisa Setelah Batch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hppComposition.hpp_items.map((item, idx) => {
                                            const requiredStock = (item.stock_used || 0) * totalBatch;
                                            const remaining = item.inventory.stock - requiredStock;
                                            const isOver = requiredStock > item.inventory.stock;

                                            return (
                                                <tr
                                                    key={idx}
                                                    className={`border-t hover:bg-gray-100 dark:hover:bg-gray-800 ${isOver ? 'text-red-600 dark:text-red-400' : ''
                                                        }`}
                                                >
                                                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">{item.inventory.name}</td>
                                                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">{item.inventory.stock}</td>
                                                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">{item.stock_used}</td>
                                                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">{requiredStock}</td>
                                                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">{remaining < 0 ? 'Tidak Mencukupi' : remaining}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {insufficientStock && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        ⚠️ Beberapa stok tidak cukup. Proses batch tidak dapat dilakukan sepenuhnya.
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            disabled={data.requested_batch <= 0 || processing}
                            type="submit"
                            className={`w-full py-2 px-4 rounded-md font-medium text-white ${insufficientStock
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } disabled:opacity-50`}
                        >
                            {processing ? 'Memproses...' : 'Mulai Batch'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}