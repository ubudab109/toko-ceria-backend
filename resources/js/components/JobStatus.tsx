import React from "react";

interface JobStatusProps {
    status: string;
}

export default function JobStatus({ status }: JobStatusProps): React.ReactNode {
    if (status === 'pending') {
        return (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-amber-900 dark:text-amber-200">Dalam Antrian</span>
        );
    } else if (status === 'processing') {
        return (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-emerald-900 dark:text-emerald-200">Sedang Proses</span>
        )
    } else if (status === 'failed') {
        return (
            <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-rose-900 dark:text-rose-200">Gagal</span>
        )
    } else {
        return (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-200">Sukses</span>
        );
    }
};
