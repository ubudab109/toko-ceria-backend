import ButtonBack from '@/components/ButtonBack';
import { CategoryI } from '@/interfaces/CategoryInterface';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';

interface CategoryFormProps {
    isEdit: boolean;
    category?: CategoryI;
}

export default function CategoryForm({
    isEdit = false,
    category,
}: CategoryFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? "",
        description: category?.description ?? "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && category) {
            put(route("categories.update", category.id));
        } else {
            post(route("categories.store"));
        }
    };

    return (
        <div className="max-w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <ButtonBack backTo="categories.index" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {isEdit ? "Edit Kategori" : "Tambah Kategori"}
            </h1>
            <form onSubmit={(handleSubmit)} className="max-w-full space-y-5">

                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Nama Kategori
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Contoh: Balinese"
                        required
                        className={`bg-gray-50 border ${errors.name ? "border-red-500" : "border-gray-300"
                            } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Deskripsi
                    </label>
                    <textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Deskripsi kategori..."
                        className={`bg-gray-50 border ${errors.description ? "border-red-500" : "border-gray-300"
                            } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
                        rows={4}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none 
                    focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
                    dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                    >
                        {processing
                            ? "Menyimpan..."
                            : isEdit
                                ? "Simpan Perubahan"
                                : "Tambah Kategori"}
                    </button>
                </div>
            </form>
        </div>
    );
}