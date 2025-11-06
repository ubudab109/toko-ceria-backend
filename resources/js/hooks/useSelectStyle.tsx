import { useState, useEffect } from 'react'
import { StylesConfig, GroupBase } from 'react-select'

interface SelectStyleInterface {
  width?: string;
}

export const useSelectStyles = <
  T,
  IsMulti extends boolean = false
>({
  width = '12rem',
}: SelectStyleInterface): StylesConfig<T, IsMulti, GroupBase<T>> => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      borderRadius: '0.5rem',
      borderColor: state.isFocused
        ? 'rgb(59 130 246)'
        : isDark
        ? 'rgb(75 85 99)'
        : 'rgb(209 213 219)',
      backgroundColor: isDark ? 'rgb(55 65 81)' : 'white',
      boxShadow: state.isFocused ? `0 0 0 1px rgb(59 130 246)` : 'none',
      '&:hover': {
        borderColor: state.isFocused
          ? 'rgb(59 130 246)'
          : isDark
          ? 'rgb(75 85 99)'
          : 'rgb(156 163 175)',
      },
      color: isDark ? 'rgb(209 213 219)' : 'rgb(31 41 55)',
      width: width,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? 'rgb(55 65 81)' : 'white',
      borderRadius: '0.5rem',
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor:
        state.isFocused || state.isSelected
          ? 'rgb(37 99 235)'
          : isDark
          ? 'rgb(55 65 81)'
          : 'white',
      color:
        state.isFocused || state.isSelected
          ? 'white'
          : isDark
          ? 'rgb(209 213 219)'
          : 'rgb(31 41 55)',
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
    input: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(209 213 219)' : 'rgb(31 41 55)',
    }),
  };
};

