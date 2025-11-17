import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  BarChart,
  Bar,
} from "recharts";

type SaleData = {
  date: string;
  total: number;
};

type DateRange = {
  start: string;
  end: string;
};

type ChartProps = {
  dailySales: SaleData[];
  monthlySales: SaleData[];
  filteredSales: SaleData[];
  currentRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
};

export default function SalesCharts({
  dailySales,
  monthlySales,
  filteredSales,
  currentRange,
  onDateRangeChange,
}: ChartProps) {

  const handleDateChange = (key: keyof DateRange, value: string) => {
    const newRange = { ...currentRange, [key]: value };
    onDateRangeChange(newRange);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Grafik Penjualan Hari Ini */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Penjualan Hari Ini
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Penjualan Bulan Ini */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Penjualan Bulan Ini
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#34D399" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Filter Penjualan */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Filter Penjualan
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="date"
            className="rounded-md border-gray-300 dark:bg-gray-700 dark:text-white flex-1"
            value={currentRange.start}
            onChange={e => handleDateChange("start", e.target.value)}
          />
          <span className="text-gray-700 dark:text-gray-300">sampai</span>
          <input
            type="date"
            className="rounded-md border-gray-300 dark:bg-gray-700 dark:text-white flex-1"
            value={currentRange.end}
            onChange={e => handleDateChange("end", e.target.value)}
          />
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={filteredSales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
