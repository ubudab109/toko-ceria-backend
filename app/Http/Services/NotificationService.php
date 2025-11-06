<?php

namespace App\Http\Services;

use App\Events\NotificationSent;
use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public static function sendNotification(array $data)
    {
        $users = User::select('id', 'name', 'email')->get();
        foreach($users as $user) {
            $notification = Notification::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'link' => $data['link'],
                'is_read' => false,
            ]);
    
            broadcast(new NotificationSent($notification));
        }
    }
}