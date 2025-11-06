<?php


namespace App\Constants;


class Enum extends \MyCLabs\Enum\Enum
{

    /**
     * Check if is valid enum value
     *
     * Overriding to allow for passing of enum class directly instead of having to call ->getValue()
     *
     * @param $value
     *
     * @return bool
     */
    public static function isValid($value): bool
    {
        if ($value instanceof \MyCLabs\Enum\Enum) {
            $value = $value->getValue();
        }
        return in_array($value, static::toArray(), true);
    }


    /**
     * Determines if Enum should be considered equal with the variable passed as a parameter.
     * Returns false if an argument is an object of different class or not an object.
     *
     * This method is final, for more information read https://github.com/myclabs/php-enum/issues/4
     *
     * @param mixed|null $variable
     * @return bool
     */
    public function same($variable = null): bool
    {
        return ($variable instanceof self
            && $this->getValue() === $variable->getValue()
            && \get_called_class() === \get_class($variable)) || ($this->getValue() === $variable);
    }

    /**
     * Search value by key
     *
     * @param $key
     *
     * @return mixed
     */
    public static function searchKey($key): mixed
    {
        return static::toArray()[$key];
    }
    
    /**
     * Search key by value
     *
     * @param $value
     *
     * @return mixed
     */
    public static function searchValue($value): mixed
    {
        return array_flip(static::toArray())[$value];
    }

    public static function getSelectOption(): array
    {
        $data = static::toArray();
        $returned = [];
        foreach($data as $opt) {
            $returned[] = [
                'label' => ucwords(str_replace('_', ' ', $opt)),
                'value' => $opt
            ];
        }
        return $returned;
    }
}