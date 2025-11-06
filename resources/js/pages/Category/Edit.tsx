import DashboardLayout from '@/layouts/DashboardLayout';
import React from 'react';
import CategoryForm from './components/CategoryForm';
import { CategoryI } from '@/interfaces/CategoryInterface';
import { usePage } from '@inertiajs/react';

export default function Edit(): React.ReactNode {
    const { category } = usePage().props;
    return (
        <DashboardLayout>
            <div>
                <CategoryForm
                    isEdit={true}
                    category={category as CategoryI}
                />
            </div>
        </DashboardLayout>
    )
};
