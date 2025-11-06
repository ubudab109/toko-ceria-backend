import OrderStatusBadge from '@/components/OrderStatusBadge';
import { OrderStatusDescriptionI } from '@/interfaces/OrderInterface';
import { X } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ModalStatusDescriptionProps {
    statusDescriptions: OrderStatusDescriptionI[];
    isShow: boolean;
    onClose: () => void;
}

export default function ModalStatusDescription({
    statusDescriptions,
    isShow,
    onClose,
}: ModalStatusDescriptionProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isShow) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isShow, onClose]);

    if (!isShow) {
        return <></>;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                ref={modalRef}
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 space-y-2 p-4 animate-fadeIn"
            >
                {/* Tombol Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                    aria-label="Close"
                >
                    <X size={18} strokeWidth={2} />
                </button>

                {/* Isi Modal */}
                {statusDescriptions.map((statusDesc: OrderStatusDescriptionI) => (
                    <div
                        key={statusDesc.status}
                        className="flex flex-wrap sm:flex-nowrap items-start gap-8 py-3 px-2"
                    >
                        {/* Badge Status */}
                        <div className="flex-shrink-0 w-full sm:w-36">
                            <OrderStatusBadge 
                                status={statusDesc.key}
                                className="inline-block text-center w-full sm:w-auto"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                                {statusDesc.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
