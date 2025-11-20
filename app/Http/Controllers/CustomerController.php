<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $query = Customer::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone_number', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")
                ->orWhere('know_from', 'like', "%{$search}%");
        }
        $customers = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Customer/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'fullname' => ['required'],
            'email' => ['unique:customers'],
            'phone_code' => ['nullable'],
            'phone_number' => ['nullable'],
            'age' => ['nullable'],
            'address' => ['nullable'],
            'known_from' => ['nullable']
        ], [
            'fullname.required' => 'Nama customer diperlukan',
            'email.required' => 'Email customer diperlukan',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email customer telah ada pada data',
        ]);

        $input = $request->all();
        Customer::create($input);
        return redirect()->route('customers.index')->with('success', 'Data customer berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = Customer::find($id);
        $orders = $customer->orders()->paginate(10);
        return Inertia::render('Customer/Edit', [
            'customer' => $customer,
            'orders' => $orders,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'fullname' => ['required'],
            'email' => ['required', 'email', Rule::unique('customers', 'email')->ignore($id),],
            'phone_code' => ['nullable'],
            'phone_number' => ['nullable'],
            'age' => ['nullable'],
            'address' => ['nullable'],
            'known_from' => ['nullable']
        ], [
            'fullname.required' => 'Nama customer diperlukan',
            'email.required' => 'Email customer diperlukan',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email customer telah ada pada data',
        ]);

        Customer::where('id', $id)->update($request->all());
        return Inertia::render('Customer/Edit', [
            'customer' => Customer::find($id),
            'flash' => ['success' => 'Data customer dirubah!'],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
