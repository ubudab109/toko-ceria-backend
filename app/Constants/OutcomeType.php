<?php

namespace App\Constants;

/**
 * @method static OutcomeType INVENTORY()
 * @method static OutcomeType ORDER_CANCEL()
 * @method static OutcomeType MARKETING()
 * @method static OutcomeType ADVERTISEMENT()
 * @method static OutcomeType OPERATIONAL()
 * @method static OutcomeType SALARY()
 */
class OutcomeType extends Enum
{
    const INVENTORY = 'inventory';
    const ORDER_CANCEL = 'cancelled_order';
    const MARKETING = 'marketing';
    const ADVERTISEMENT = 'advertisement';
    const OPERATIONAL = 'operational';
    const SALARY = 'salary';

    public static function getCustomSelecOptions(): array
    {
        $data = [
            [
                'label' => 'Inventory/Bahan Baku',
                'value' => Self::INVENTORY()->getValue()
            ],
            [
                'label' => 'Pembatalan Order',
                'value' => Self::ORDER_CANCEL()->getValue()
            ],
            [
                'label' => 'Pemasaran/Marketing',
                'value' => Self::MARKETING()->getValue()
            ],
            [
                'label' => 'Iklan',
                'value' => Self::ADVERTISEMENT()->getValue()
            ],
            [
                'label' => 'Operasional',
                'value' => Self::OPERATIONAL()->getValue()
            ],
            [
                'label' => 'Gaji',
                'value' => Self::SALARY()->getValue()
            ],
        ];

        return $data;
    }

    public static function getDescriptionOutcomeType(?string $key): array|string
    {
        $data = [
            self::INVENTORY()->getValue() => [
                'name' => 'Inventory/Bahan Baku'
            ],
            self::ORDER_CANCEL()->getValue() => [
                'className' => 'Pembatalan Order'
            ],
            self::MARKETING()->getValue() =>
            [
                'className' => 'Pemasaran/Marketing'
            ],
            self::ADVERTISEMENT()->getValue() => [
                'className' => 'Iklan'
            ],
            self::OPERATIONAL()->getValue() => [
                'className' => 'Operasional'
            ],
            self::SALARY()->getValue() => [
                'className' => 'Gaji'
            ],
        ];

        if ($key) {
            return $data[$key];
        }

        return $data;
    }

    public static function getBadgeOutcomeType(?string $key): array|string
    {

        $data = [
            self::INVENTORY()->getValue() => [
                'className' => 'bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-amber-900 dark:text-amber-200'
            ],
            self::ORDER_CANCEL()->getValue() => [
                'className' => 'bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-sky-900 dark:text-sky-200'
            ],
            self::MARKETING()->getValue() =>
            [
                'className' => 'bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-emerald-900 dark:text-emerald-200'
            ],
            self::ADVERTISEMENT()->getValue() => [
                'className' => 'bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-rose-900 dark:text-rose-200'
            ],
            self::OPERATIONAL()->getValue() => [
                'className' => 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-indigo-900 dark:text-indigo-200'
            ],
            self::SALARY()->getValue() => [
                'className' => 'bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-teal-900 dark:text-teal-200'
            ],
        ];

        if ($key) {
            return $data[$key];
        }

        return $data;
    }
}
