import { Column, DataTable } from "@/components/DataTable";
import DashboardLayout from "@/layouts/DashboardLayout";
import { formatDate, formatRupiah } from "@/utils/helpert";
import { router, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { route } from "ziggy-js";
import { PaginationI } from "@/interfaces/PaginationInterface";
import { UserI } from "@/interfaces/UserInterface";
import { useInertiaFilters } from "@/hooks/useInertiaFilters";


interface PettyCashHistoryI {
    id: number;
    user_id: number;
    type: 'add' | 'reduce';
    value: number;
    before_balance: number;
    description?: string;
    created_at: string;
    user?: UserI;
}

interface CompanyAssetI {
    id: number;
    name: string;
    value: string;
}

interface PettyCashPageProps extends PageProps {
    pettyCash: CompanyAssetI;
    histories: PaginationI<PettyCashHistoryI>;
    filters: {
        search: string;
    };
}

export default function Index(): React.ReactNode {
    const { props } = usePage<PettyCashPageProps>();
    const { pettyCash, histories, filters } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'add',
        value: '',
        description: ''
    });
    const { localFilters, handleSearch } = useInertiaFilters({
        initialFilters: filters,
        baseRoute: "petty-cash.index",
    });

    const columns: Column<PettyCashHistoryI>[] = [
        {
            key: 'created_at',
            label: 'Tanggal',
            render: (row) => formatDate(row.created_at)
        },
        {
            key: 'user',
            label: 'User',
            render: (row) => row.user?.name || '-'
        },
        {
            key: 'type',
            label: 'Tipe',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'add'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {row.type === 'add' ? 'Penambahan' : 'Pengurangan'}
                </span>
            )
        },
        {
            key: 'before_balance',
            label: 'Saldo Awal',
            render: (row) => formatRupiah(row.before_balance, true)
        },
        {
            key: 'value',
            label: 'Nominal',
            render: (row) => formatRupiah(row.value, true)
        },
        {
            key: 'description',
            label: 'Keterangan',
            render: (row) => row.description || '-'
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('petty-cash.store'), formData, {
            onSuccess: () => {
                setIsModalOpen(false);
                setFormData({ type: 'add', value: '', description: '' });
                toast.success('Petty Cash berhasil disesuaikan');
            },
            onError: () => {
                toast.error('Terjadi kesalahan');
            }
        });
    };

    return (
        <DashboardLayout>
            <div className="p-8 space-y-6">
                {/* Card Current Value */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Saldo Petty Cash Saat Ini
                            </h2>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                {formatRupiah(parseFloat(pettyCash?.value || '0'), true)}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Sesuaikan Petty Cash
                        </button>
                    </div>
                </div>

                {/* DataTable */}
                <DataTable<PettyCashHistoryI>
                    title="Riwayat Petty Cash"
                    columns={columns}
                    data={histories}
                    search={typeof localFilters.search === 'string' ? localFilters.search : ''}
                    onSearch={handleSearch}
                // No edit/delete actions as requested
                />

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center p-4">
                        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Sesuaikan Petty Cash
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tipe Penyesuaian
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    >
                                        <option value="add">Penambahan (Add)</option>
                                        <option value="reduce">Pengurangan (Reduce)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nominal
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="Masukkan nominal"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Keterangan
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="Masukkan keterangan (opsional)"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
