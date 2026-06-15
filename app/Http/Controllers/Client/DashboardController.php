<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Client/Dashboard/Index');
    }
}
