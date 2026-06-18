<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientCreditsException extends RuntimeException
{
    public function __construct(string $message = 'Insufficient wallet balance.')
    {
        parent::__construct($message);
    }
}
