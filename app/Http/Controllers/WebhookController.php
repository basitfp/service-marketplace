<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private WalletService $walletService
    ) {}

    public function handleStripe(Request $request)
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sig,
                config('services.stripe.webhook_secret')
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Stripe webhook: Invalid payload', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Stripe webhook: Invalid signature', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Only handle checkout.session.completed event
        if ($event->type !== 'checkout.session.completed') {
            return response()->json(['status' => 'ignored'], 200);
        }

        $session = $event->data->object;
        $stripeReference = 'stripe_' . $session->id;

        // IDEMPOTENCY CHECK
        $existing = WalletTransaction::where('reference', $stripeReference)->first();
        if ($existing) {
            Log::info('Stripe webhook: Already processed', ['reference' => $stripeReference]);
            return response()->json(['status' => 'already_processed'], 200);
        }

        // Extract metadata
        $userId = $session->metadata->user_id;
        $packageId = $session->metadata->package_id;
        $credits = (int) $session->metadata->credits;
        $amountPaid = $session->amount_total / 100; // Convert cents to dollars

        try {
            $user = User::findOrFail($userId);

            // Add credits to wallet
            $this->walletService->topup(
                user: $user,
                credits: $credits,
                amount: $amountPaid,
                reference: $stripeReference,
                type: 'credit_purchase',
                orderId: null,
                description: "Credit purchase - Package #{$packageId}"
            );

            Log::info('Stripe webhook: Credits added', [
                'user_id' => $userId,
                'credits' => $credits,
                'amount' => $amountPaid,
                'reference' => $stripeReference,
            ]);

            return response()->json(['status' => 'success'], 200);
        } catch (\Exception $e) {
            Log::error('Stripe webhook: Error processing payment', [
                'error' => $e->getMessage(),
                'session_id' => $session->id,
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }
}
