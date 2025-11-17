<?php

namespace App\Http\Controllers;

use App\Constants\OutcomeType;
use App\Models\Outcome;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OutcomeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $query = Outcome::query();

        if ($search) {
            $query->where('title', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->has('types') && !empty($request->types)) {
            $type = $request->types;
            $query->whereIn('type', explode(',', $type));
        }

        $outcomes = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $types = OutcomeType::getCustomSelecOptions();
        return Inertia::render('Outcome/Index', [
            'outcomes' => $outcomes,
            'types' => $types,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        $types = OutcomeType::getCustomSelecOptions();
        return Inertia::render('Outcome/Create', [
            'types' => $types
        ]);
    }

    public function show(int $id)
    {
        $outcome = Outcome::find($id);
        $types = OutcomeType::getCustomSelecOptions();
        return Inertia::render('Outcome/Edit', [
            'outcome' => $outcome,
            'types' => $types,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required'],
            'type' => ['required'],
            'total' => ['required'],
            'description' => ['required']
        ], [
            'title.required' => 'Mohon mengisi judul',
            'type.required' => 'Mohon memilih tipe pengeluaran',
            'total.required' => 'Mohon mengisi total pengeluaran',
            'description.required' => 'Mohon mengisi deskripsi'
        ]);

        $input = $request->all();
        Outcome::create($input);
        return redirect()->route('outcomes.index')->with('success', 'Data pengeluaran berhasil ditambahkan');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'title' => ['required'],
            'type' => ['required'],
            'total' => ['required'],
            'description' => ['required']
        ], [
            'title.required' => 'Mohon mengisi judul',
            'type.required' => 'Mohon memilih tipe pengeluaran',
            'total.required' => 'Mohon mengisi total pengeluaran',
            'description.required' => 'Mohon mengisi deskripsi'
        ]);

        $input = $request->except('created_at');
        Outcome::where('id', $id)->update($input);
        return redirect()->back()->with('success', 'Data pengeluaran berhasil diubah');
    }

    public function destroy(int $id)
    {
        Outcome::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Data pengeluaran berhasil dihapus');
    }
}
