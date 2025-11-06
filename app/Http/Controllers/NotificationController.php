<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function read(int $id)
    {
        Notification::where('id', $id)->update(['is_read' => true]);
        return response()->json(['data' => true]);
    }

    public function readAll()
    {
        Notification::where('user_id', Auth::user()->id)
        ->update(['is_read' => true]);
        return response()->json(['data' => true]);
    }
}
