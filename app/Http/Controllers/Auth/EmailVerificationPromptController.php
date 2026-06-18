<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if (! $request->user()->hasVerifiedEmail()) {
            return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
        }

        $user = $request->user();
        $dashboard = match (true) {
            $user->isAdmin()  => route('admin.dashboard', absolute: false),
            $user->isWorker() => route('worker.dashboard', absolute: false),
            default           => route('client.dashboard', absolute: false),
        };

        return redirect()->intended($dashboard);
    }
}
