<?php

namespace App\Services;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Exception;

class WalletService
{
    /**
     * Deduct credits from user's wallet. Throws if insufficient balance.
     */
    public function spend(
        User $user, 
        int $credits, 
        string $type, 
        ?int $orderId = null, 
        ?string $description = null, 
        ?string $reference = null
    ): void {
        DB::transaction(function () use ($user, $credits, $type, $orderId, $description, $reference) {
            $wallet = $user->wallet()->lockForUpdate()->firstOrCreate(['user_id' => $user->id]);

            if ($wallet->balance < $credits) {
                throw new Exception('Insufficient wallet balance.');
            }

            $wallet->balance -= $credits;
            $wallet->save();

            WalletTransaction::create([
                'user_id' => $user->id,
                'order_id' => $orderId,
                'type' => $type,
                'credits' => $credits,
                'amount' => null,
                'reference' => $reference,
                'description' => $description,
            ]);
        });
    }

    /**
     * Add credits to user's wallet.
     */
    public function topup(
        User $user, 
        int $credits, 
        ?float $amount, 
        string $reference, 
        string $type = 'credit_purchase', 
        ?int $orderId = null, 
        ?string $description = null
    ): void {
        DB::transaction(function () use ($user, $credits, $amount, $reference, $type, $orderId, $description) {
            $wallet = $user->wallet()->lockForUpdate()->firstOrCreate(['user_id' => $user->id]);

            $wallet->balance += $credits;
            $wallet->save();

            WalletTransaction::create([
                'user_id' => $user->id,
                'order_id' => $orderId,
                'type' => $type,
                'credits' => $credits,
                'amount' => $amount,
                'reference' => $reference,
                'description' => $description,
            ]);
        });
    }

    /**
     * Return current wallet balance.
     */
    public function balance(User $user): int
    {
        return $user->wallet()->firstOrCreate(['user_id' => $user->id])->balance;
    }
}
