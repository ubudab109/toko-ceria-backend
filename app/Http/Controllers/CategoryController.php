<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $query = Category::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Category/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Category/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required'],
            'description' => ['nullable']
        ]);

        Category::create($request->only('name', 'description'));

        return redirect()->route('categories.index')->with('success', 'Kategori Berhasil Dibuat!');
    }

    public function show(int $id)
    {
        $category = Category::find($id);
        return Inertia::render('Category/Edit', [
            'category' => $category
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => ['required'],
            'description' => ['nullable']
        ]);

        Category::where('id', $id)->update($request->only('name', 'description'));
        return redirect()->route('categories.index')->with('success', 'Kategori Berhasil Diperbarui!');
    }

    public function destroy(int $id)
    {
        $category = Category::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Kategori Berhasil Dihapus!');
    }
}
