import { ArrowLeft } from "lucide-react";

export default function ButtonBack(): React.ReactNode {
    return (
        <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-3 py-2.5 font-semibold rounded-xl text-sm transition duration-200 shadow-sm whitespace-nowrap 
    text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:outline-none 
    dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600 mb-3"
        >
            <ArrowLeft width={16} height={16} className="text-gray-600 dark:text-gray-300" />
            <span>Kembali</span>
        </button>
    )
}