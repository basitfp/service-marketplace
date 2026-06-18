<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            $user = $request->user();
            $dashboard = match (true) {
                $user->isAdmin()  => route('admin.dashboard', absolute: false),
                $user->isWorker() => route('worker.dashboard', absolute: false),
                default           => route('client.dashboard', absolute: false),
            };
            return redirect()->intended($dashboard);
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
