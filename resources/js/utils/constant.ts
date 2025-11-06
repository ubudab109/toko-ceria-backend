
import { OptionType } from "@/types/option.type";
import { StylesConfig } from "react-select";


const isDark = document.documentElement.classList.contains('dark'); // detect dark mode
export const MOCK_MEASUREMENTS: string[] = ['ml', 'L', 'g', 'kg', 'pcs', 'bottle'];

export const customStyles: StylesConfig<OptionType, true> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '38px',
    borderRadius: '0.5rem',
    borderColor: state.isFocused
      ? isDark ? 'rgb(59 130 246)' : 'rgb(37 99 235)' // blue focus
      : isDark ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
    backgroundColor: isDark ? 'rgb(55 65 81)' : 'white',
    boxShadow: state.isFocused
      ? `0 0 0 1px ${isDark ? 'rgb(59 130 246)' : 'rgb(37 99 235)'}`
      : 'none',
    '&:hover': {
      borderColor: state.isFocused
        ? isDark ? 'rgb(59 130 246)' : 'rgb(37 99 235)'
        : isDark ? 'rgb(75 85 99)' : 'rgb(156 163 175)',
    },
    color: isDark ? 'rgb(209 213 219)' : 'rgb(31 41 55)',
    width: '12rem',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDark ? 'rgb(55 65 81)' : 'white',
    borderRadius: '0.5rem',
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused || state.isSelected
      ? 'rgb(37 99 235)' // blue-600
      : isDark ? 'rgb(55 65 81)' : 'white',
    color: state.isFocused || state.isSelected
      ? 'white'
      : isDark ? 'rgb(209 213 219)' : 'rgb(31 41 55)',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'rgb(29 78 216)',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(37 99 235)',
    borderRadius: '0.25rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgb(29 78 216)',
      color: 'white',
      borderRadius: '0.25rem',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDark ? 'rgb(209 213 219)' : 'rgb(31 41 55)',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDark ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
  }),
};

export const PAYMENT_TYPE = [
  { label: 'CASH', value: 'CASH' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'MIDTRANS', value: 'MIDTRANS' },
  { label: 'WHATSAPP', value: 'whatsapp' },
];