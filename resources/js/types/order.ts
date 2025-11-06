// Import all necessary icons from lucide-react
import {
  Timer,
  CreditCard,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Trophy,
  LucideIcon, // This is the type for a Lucide React component
} from 'lucide-react';

// src/types/order.ts (as before)
export type OrderStatus =
  | 'pending'
  | 'process_payment'
  | 'paid'
  | 'cancelled'
  | 'on_delivery'
  | 'delivered'
  | 'completed';

// Updated config interface
interface StatusConfig {
  icon: LucideIcon; // Type is now the Lucide component itself
  color: {
    text: string;
    bg: string;
    darkText: string;
    darkBg: string;
  };
  label: string; // User-friendly label
}

export const statusMap: Record<OrderStatus, StatusConfig> = {
  pending: {
    icon: Timer, // Lucide Timer icon
    color: {
      text: 'text-yellow-800',
      bg: 'bg-yellow-100',
      darkText: 'dark:text-yellow-200',
      darkBg: 'dark:bg-yellow-900',
    },
    label: 'Pending',
  },
  process_payment: {
    icon: CreditCard, // Lucide CreditCard icon
    color: {
      text: 'text-indigo-800',
      bg: 'bg-indigo-100',
      darkText: 'dark:text-indigo-200',
      darkBg: 'dark:bg-indigo-900',
    },
    label: 'Processing Payment',
  },
  paid: {
    icon: CheckCircle, // Lucide CheckCircle icon
    color: {
      text: 'text-blue-800',
      bg: 'bg-blue-100',
      darkText: 'dark:text-blue-200',
      darkBg: 'dark:bg-blue-900',
    },
    label: 'Paid',
  },
  cancelled: {
    icon: XCircle, // Lucide XCircle icon
    color: {
      text: 'text-red-800',
      bg: 'bg-red-100',
      darkText: 'dark:text-red-200',
      darkBg: 'dark:bg-red-900',
    },
    label: 'Cancelled',
  },
  on_delivery: {
    icon: Truck, // Lucide Truck icon
    color: {
      text: 'text-orange-800',
      bg: 'bg-orange-100',
      darkText: 'dark:text-orange-200',
      darkBg: 'dark:bg-orange-900',
    },
    label: 'On Delivery',
  },
  delivered: {
    icon: Package, // Lucide Package icon
    color: {
      text: 'text-green-800',
      bg: 'bg-green-100',
      darkText: 'dark:text-green-200',
      darkBg: 'dark:bg-green-900',
    },
    label: 'Delivered',
  },
  completed: {
    icon: Trophy, // Lucide Trophy icon
    color: {
      text: 'text-purple-800',
      bg: 'bg-purple-100',
      darkText: 'dark:text-purple-200',
      darkBg: 'dark:bg-purple-900',
    },
    label: 'Completed',
  },
};