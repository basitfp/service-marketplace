<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Worker/Dashboard/Index');
    }
}
