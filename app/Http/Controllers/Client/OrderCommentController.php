<?php

namespace App\Http\Controllers\Client;

use App\Events\CommentPosted;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderAsset;
use App\Models\OrderComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderCommentController extends Controller
{
    public function store(Request $request, Order $order): RedirectResponse
    {
        // Clients may only comment on their own orders
        $this->authorize('view', $order);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'files'   => ['nullable', 'array', 'max:5'],
            'files.*' => ['file', 'max:20480'], // 20 MB per file
        ]);

        $comment = OrderComment::create([
            'order_id' => $order->id,
            'user_id'  => auth()->id(),
            'content'  => $validated['content'],
        ]);

        // Persist any attached files as comment-type assets
        foreach ($request->file('files', []) as $file) {
            $path = $file->store('order-assets', 'public');

            OrderAsset::create([
                'order_id'      => $order->id,
                'type'          => 'comment',
                'file_path'     => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type'     => $file->getMimeType(),
            ]);
        }

        event(new CommentPosted($comment));

        return redirect()->back()->with('success', 'Comment posted.');
    }
}
