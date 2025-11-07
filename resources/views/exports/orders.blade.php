<table>
    <thead>
        <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Tanggal Order</th>
            <th>Data Produk</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($orders as $order)
        <tr>
            <td>{{ $order->order_number }}</td>
            <td>{{ $order->customerName() }}</td>
            <td>{{ $order->status }}</td>
            <td>{{ number_format($order->total, 2) }}</td>
            <td>{{ $order->created_at->format('d-m-Y H:i') }}</td>
            <td>
                @foreach ($order->productOrders as $po)
                {{ $po->product?->name ?? '-' }} (x{{ $po->quantity }})
                @if(!$loop->last), @endif
                @endforeach
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="3" class="text-right font-bold">Total:</td>
            <td class="font-bold">{{ number_format($orders->sum('total'), 2) }}</td>
            <td colspan="2"></td>
        </tr>
    </tfoot>
</table>