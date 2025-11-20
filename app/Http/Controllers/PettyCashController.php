<?php

namespace App\Http\Controllers;

use App\Models\CompanyAsset;
use App\Models\PettyCashHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PettyCashController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $pettyCash = CompanyAsset::where('name', 'petty_cash')->first();


        $query = PettyCashHistory::query();

        if ($search) {
            $query->where('description', 'like', "%{$search}%")
                ->orWhereHas('user', function ($row) use ($search) {
                    $row->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        }

        $histories = $query->with('user')->latest()->paginate(10);

        return \Inertia\Inertia::render('PettyCash/Index', [
            'pettyCash' => $pettyCash,
            'histories' => $histories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:add,reduce',
            'value' => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request) {
            $pettyCash = CompanyAsset::where('name', 'petty_cash')->lockForUpdate()->first();

            if (!$pettyCash) {
                // Should be seeded, but just in case
                $pettyCash = CompanyAsset::create([
                    'name' => 'petty_cash',
                    'value' => '0'
                ]);
            }

            $currentValue = floatval($pettyCash->value);
            $newValue = $request->type === 'add'
                ? $currentValue + $request->value
                : $currentValue - $request->value;

            $pettyCash->update(['value' => (string) $newValue]);

            PettyCashHistory::create([
                'user_id' => Auth::user()->id,
                'type' => $request->type,
                'value' => $request->value,
                'before_balance' => $currentValue,
                'description' => $request->description,
            ]);
        });

        return redirect()->back()->with('success', 'Petty Cash berhasil disesuaikan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
