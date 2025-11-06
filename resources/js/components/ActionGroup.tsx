import { SquarePen, Trash } from "lucide-react";
import { ReactNode } from "react";

interface ActionGroupProps {
    onEdit: () => void;
    onDelete: () => void;
    isDeleteShown?: boolean;
    otherButton?: React.ReactNode;
}

export default function ActionGroup({ 
    onDelete, 
    onEdit, 
    otherButton,
    isDeleteShown = true 
}: ActionGroupProps): ReactNode {
    return (
        <div className="inline-flex rounded-lg shadow-md" role="group">
            {/* Edit Button - Primary Action */}
            <button
                title="Edit"
                type="button"
                onClick={onEdit}
                className="
                    p-2 text-sm font-medium transition-all duration-200
                    text-gray-700 dark:text-gray-300
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-l-lg
                    
                    /* Hover/Focus States */
                    hover:bg-gray-50 dark:hover:bg-gray-700 
                    hover:text-blue-600 dark:hover:text-blue-400
                    focus:z-10 focus:ring-1 focus:ring-blue-500 focus:text-blue-600 dark:focus:text-blue-400
                "
            >
                <SquarePen className="w-4 h-4" />
            </button>

            {/* Delete Button - Destructive Action */}
            {
                isDeleteShown && (
                    <button
                        title="Delete"
                        type="button"
                        onClick={onDelete}
                        className="
                            p-2 text-sm font-medium transition-all duration-200
                            text-gray-700 dark:text-gray-300
                            bg-white dark:bg-gray-800
                            /* Border separates from Edit button */
                            border-y border-r border-gray-200 dark:border-gray-700
                            rounded-r-lg
                            
                            /* Hover/Focus States - Clear Red for Danger */
                            hover:bg-red-50 dark:hover:bg-red-900 
                            hover:text-red-600 dark:hover:text-red-400
                            focus:z-10 focus:ring-1 focus:ring-red-500 focus:text-red-600 dark:focus:text-red-400
                        "
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                )
            }
            {otherButton}
        </div>
    );
}
