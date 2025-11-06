import DashboardLayout from '@/layouts/DashboardLayout';
import React from 'react';
import CategoryForm from './components/CategoryForm';

export default function Create(): React.ReactNode {
    return (
        <DashboardLayout>
            <div>
                <CategoryForm isEdit={false} />
            </div>
        </DashboardLayout>
    )
};
