<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Notifications/Index', [
            'notificationsList' => $request->user()
                ->notifications()
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return redirect()->back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return redirect()->back();
    }

    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return redirect()->back();
    }
}
