<?php

namespace App\Constants;

/**
 * @method static OrderStatus PENDING()
 * @method static OrderStatus PROCESS_PAYMENT()
 * @method static OrderStatus PAID()
 * @method static OrderStatus CANCELLED()
 * @method static OrderStatus ON_DELIVERY()
 * @method static OrderStatus DELIVERED()
 * @method static OrderStatus COMPLETED()
 */
class OrderStatus extends Enum
{
    const PENDING = 'pending';
    const PROCESS_PAYMENT = 'process_payment';
    const PAID = 'paid';
    const CANCELLED = 'cancelled';
    const ON_DELIVERY = 'on_delivery';
    const DELIVERED = 'delivered';
    const COMPLETED = 'completed';

    public static function getStatusDetails(): array
    {
        return [
            [
                'status' => ucwords(str_replace('_', ' ', self::PENDING()->getValue())),
                'key' => self::PENDING()->getValue(),
                'desc' => 'Customer telah checkout keranjang namun belum memilih tipe pembayaran',
                'className' => 'bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-amber-900 dark:text-amber-200'
            ],
            [
                'status' => ucwords(str_replace('_', ' ', self::PROCESS_PAYMENT()->getValue())),
                'key' => self::PROCESS_PAYMENT()->getValue(),
                'desc' => 'Customer telah memilih tipe pembayaran tapi belum melakukan pembayaran',
                'className' => 'bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-sky-900 dark:text-sky-200'
            ],
            [
                'status' => ucwords(str_replace('_', ' ', self::PAID()->getValue())),
                'key' => self::PAID()->getValue(),
                'desc' => 'Customer melakukan pembayaran, untuk selanjutnya pihak Toko Ceria bisa mengirim barang, melakukan perubahan status order atau mungkin melakukan pembatalan. Tergantung dari kondisi transaksi',
                'className' => 'bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-emerald-900 dark:text-emerald-200'
            ],
            [
                'status' => ucwords(str_replace('_', ' ', self::CANCELLED()->getValue())),
                'key' => self::CANCELLED()->getValue(),
                'desc' => 'Customer telah melakukan pembatalan pesanan atau pihak Toko Ceria telah membatalkan pesanan',
                'className' => 'bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-rose-900 dark:text-rose-200'
            ],
            [
                'status' => ucwords(str_replace('_', ' ', self::ON_DELIVERY()->getValue())),
                'key' => self::ON_DELIVERY()->getValue(),
                'desc' => 'Pihak Toko Ceria sedang melakukan pengiriman barang yang sudah dipesan atau dibayar',
                'className' => 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-indigo-900 dark:text-indigo-200'
            ],
            [
                'status' => ucwords(str_replace('_', ' ', self::DELIVERED()->getValue())),
                'key' => self::DELIVERED()->getValue(),
                'desc' => 'Customer telah menerima barang yang sudah dikirim oleh pihak Toko Ceria',
                'className' => 'bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-teal-900 dark:text-teal-200'
            ],
            [
                'status' => ucwords(str_replace('_', ' ', self::COMPLETED()->getValue())),
                'key' => self::COMPLETED()->getValue(),
                'desc' => 'Transaksi order telah selesai semua. Barang telah sampai pada Customer dan pembayaran telah diterima pihak Toko Ceria',
                'className' => 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-200'
            ],
        ];
    }

    public static function getBadgeStatus(?string $key): array|string
    {

        $data = [
            self::PENDING()->getValue() => [
                'className' => 'bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-amber-900 dark:text-amber-200'
            ],
            self::PROCESS_PAYMENT()->getValue() => [
                'className' => 'bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-sky-900 dark:text-sky-200'
            ],
            self::PAID()->getValue() => 
            [
               'className' => 'bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-emerald-900 dark:text-emerald-200'
            ],
            self::CANCELLED()->getValue() => [
                'className' => 'bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-rose-900 dark:text-rose-200'
            ],
            self::ON_DELIVERY()->getValue() => [
                'className' => 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-indigo-900 dark:text-indigo-200'
            ],
            self::DELIVERED()->getValue() => [
                'className' => 'bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-teal-900 dark:text-teal-200'
            ],
            self::COMPLETED()->getValue() => [
                'className' => 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-200'
            ],
        ];

        if ($key) {
            return $data[$key];
        }

        return $data;
    }
}
