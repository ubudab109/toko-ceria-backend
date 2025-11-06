// src/components/OrderStatusBadge.tsx
import React from 'react';
// Import the status type and the statusMap from where you defined them
import { OrderStatus, statusMap } from '../types/order';
// NOTE: You may need to import the statusMap from a separate file if it's not defined here

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
    const config = statusMap[status];

    if (!config) {
        return null;
    }

    const { icon: IconComponent, color, label } = config;

    const badgeClasses = `
    inline-flex items-center 
    px-3 py-0.5 rounded-full text-xs sm:text-sm font-medium 
    ${color.text} ${color.bg} ${color.darkText} ${color.darkBg}
    whitespace-nowrap
  `;

    return (
        <span className={`${badgeClasses} ${className}`}>
            <IconComponent className="w-3 h-3 mr-1.5" aria-hidden="true" />
            {label}
        </span>
    );
};

export default OrderStatusBadge;