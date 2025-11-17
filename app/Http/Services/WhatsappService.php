<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    public static function sendFonnteBroadcast(array $recipients, string $message, ?string $fileUrl = null)
    {
        $url = 'https://api.fonnte.com/send';
        $apiKey = env('FONNTE_API_KEY');

        foreach ($recipients as $to) {
            $payload = [
                'target' => $to,
                'message' => $message,
            ];

            if ($fileUrl) {
                $payload['file'] = $fileUrl;
            }

            $response = Http::withHeaders([
                'Authorization' => $apiKey,
            ])->post($url, $payload);

            Log::info("Fonnte send to {$to}", $response->json());
        }
    }
}
