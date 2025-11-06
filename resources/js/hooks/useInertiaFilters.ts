import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useState } from "react";

type FilterValue = string | number | string[] | undefined;

interface UseInertiaFiltersOptions<T extends Record<string, any>> {
  initialFilters: T;
  baseRoute: string;
}

export function useInertiaFilters<T extends Record<string, any>>({
  initialFilters,
  baseRoute,
}: UseInertiaFiltersOptions<T>) {
  const [localFilters, setLocalFilters] = useState<Record<string, FilterValue>>(() => {
    const parsed: Record<string, FilterValue> = {};
    Object.entries(initialFilters).forEach(([key, value]) => {
      // auto-split string list into array
      parsed[key] =
        typeof value === "string" && value.includes(",")
          ? value.split(",")
          : value ?? "";
    });
    return parsed;
  });

  // 🔍 Handle search input
  const handleSearch = (value: string, param?: number | string) => {
    setLocalFilters((prev) => ({ ...prev, search: value }));
    let routes: string = '';
    if (param) {
      routes = route(baseRoute, param);
    } else {
      routes = route(baseRoute);
    }
    router.get(
      routes,
      { ...initialFilters, search: value || null, page: 1 },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  // 🎛️ Handle any filter change
  const handleFilterChange = (key: keyof T, value: string | number | (string | number)[], param?: number | string) => {
    let newValue: string | string[] | undefined;
    let finalValue: string | null;

    if (Array.isArray(value)) {
      // Multi-select
      newValue = value.map(String);
      finalValue = value.length ? value.map(String).join(",") : null;
    } else {
      // Single select or text
      newValue = value ? String(value) : "";
      finalValue = value ? String(value) : null;
    }

    setLocalFilters((prev) => ({ ...prev, [key]: newValue }));
    let routes: string = '';
    if (param) {
      routes = route(baseRoute, param);
    } else {
      routes = route(baseRoute);
    }
    router.get(
      routes,
      { ...initialFilters, [key]: finalValue, page: 1 },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  return {
    localFilters,
    setLocalFilters,
    handleSearch,
    handleFilterChange,
  };
}
