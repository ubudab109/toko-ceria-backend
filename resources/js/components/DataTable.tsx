import React from "react";
import { router } from "@inertiajs/react";
import { FileDown, Plus, RefreshCcwIcon, Search } from "lucide-react";
import Select, { MultiValue } from 'react-select';
import { useSelectStyles } from "@/hooks/useSelectStyle";
import { OptionType } from "@/types/option.type";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  links: PaginationLink[];
}


export interface FilterConfig {
  name: string;
  label: string;
  options?: OptionType[]; // optional karena date_range ga pake options
  value?: string | number | (string | number)[] | { startDate?: string; endDate?: string };
  isMultiple?: boolean;
  onChange: (value: string | (string | number)[] | { startDate?: string; endDate?: string }) => void;
}

interface AddButtonConfig {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: PaginatedData<T>;
  search?: string;
  onSearch?: (value: string) => void;
  filters?: FilterConfig[];
  addButton?: AddButtonConfig;
  scrollToTopOnPaginate?: boolean;
  onExport?: () => void;
  showExport?: boolean;
  buttonAdd?: boolean
}

export function DataTable<T extends { id: number }>({
  title,
  columns,
  data,
  search,
  onSearch,
  filters,
  addButton,
  scrollToTopOnPaginate = true,
  showExport = false,
  onExport,
}: DataTableProps<T>) {
  const selectStyles = useSelectStyles<OptionType, true>({
    width: '15rem'
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement> | MultiValue<OptionType>,
    filter: FilterConfig
  ) => {
    if (filter.isMultiple) {
      const selectedOptions = e as MultiValue<OptionType>;
      const values = selectedOptions.map(option => option.value);
      filter.onChange(values);
    } else {
      const event = e as React.ChangeEvent<HTMLSelectElement>;
      filter.onChange(event.target.value);
    }
  };

  const getNativeSelectValue = (value: FilterConfig['value']): string => {
    return value ? String(value) : '';
  };

  const getReactSelectValue = (filter: FilterConfig): MultiValue<OptionType> => {
    if (!filter.options || !filter.value) return [];
    const currentValues = Array.isArray(filter.value) ? filter.value : [filter.value];
    return currentValues
      .map(val => filter.options?.find(opt => String(opt.value) === String(val)))
      .filter((opt): opt is OptionType => !!opt);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        )}

        {addButton && (
          <button
            onClick={() => {
              if (addButton.href) router.visit(addButton.href);
              else addButton.onClick?.();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            {addButton.label}
          </button>
        )}
      </div>

      {/* Filters + Search */}
      {(onSearch || (filters && filters.length > 0)) && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {onSearch && (
            <div className="relative">
              <input
                type="text"
                value={search || ""}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Cari..."
                className="pl-10 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-64 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-400" />
            </div>
          )}

          {filters?.map((filter) => (
            <div key={filter.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label htmlFor={filter.name} className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {filter.label}:
              </label>
              {filter.name === 'date_range' ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={(filter.value as any)?.startDate || ''}
                    onChange={(e) =>
                      filter.onChange({
                        ...(filter.value as any),
                        startDate: e.target.value || undefined,
                      })
                    }
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="date"
                    value={(filter.value as any)?.endDate || ''}
                    onChange={(e) =>
                      filter.onChange({
                        ...(filter.value as any),
                        endDate: e.target.value || undefined,
                      })
                    }
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : filter.isMultiple ? (
                <Select
                  isMulti
                  options={filter.options}
                  value={getReactSelectValue(filter)}
                  onChange={(selectedOptions) => handleFilterChange(selectedOptions as MultiValue<OptionType>, filter)}
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  placeholder={`Select ${filter.label}...`}
                />
              ) : (
                <select
                  value={getNativeSelectValue(filter.value)}
                  onChange={(e) => handleFilterChange(e, filter)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg py-2 bg-white dark:bg-gray-700 
      text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors px-3 appearance-none w-36"
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <button
          onClick={() => router.reload()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition shadow-md dark:bg-gray-700 dark:hover:bg-gray-800"
        >
          <RefreshCcwIcon className="w-4 h-4" />
          Refresh
        </button>
        {
          showExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition shadow-md dark:bg-gray-700 dark:hover:bg-gray-800"
            >
              <FileDown className="w-4 h-4" />
              Export
            </button>
          )
        }
      </div>
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="text-left p-3 text-gray-600 dark:text-gray-300 font-semibold text-sm whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.data.length > 0 ? (
              data.data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className="p-3 text-gray-700 dark:text-gray-300 text-sm"
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center sm:justify-start">
        {data.links.map((link, index) => (
          <button
            key={index}
            disabled={!link.url}
            onClick={() => {
              if (!link.url) return;
              router.get(link.url, {}, {
                preserveScroll: !scrollToTopOnPaginate,
                preserveState: true,
                replace: true,
              });
            }}
            className={`px-3 py-1 border rounded-lg text-sm font-medium transition-colors ${link.active
              ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              } ${!link.url && "opacity-50 cursor-not-allowed"}`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </div>
  );
}
