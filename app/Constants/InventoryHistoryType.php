<?php

namespace App\Constants;

/**
 * @method static InventoryHistoryType CHANGING()
 * @method static InventoryHistoryType STOCK_ADJUSMENT() 
 */
class InventoryHistoryType extends Enum
{
    const CHANGING = 'perubahan';
    const STOCK_ADJUSMENT = 'penyesuain_stock';
}