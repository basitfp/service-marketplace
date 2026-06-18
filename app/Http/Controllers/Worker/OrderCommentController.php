<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderComment;
use App\Models\OrderAsset;
use App\Events\CommentPosted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderCommentController extends Controller
{
    public function store(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        $request->validate([
            'content' => 'required|string|max:5000',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB
        ]);

        $comment = OrderComment::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'content' => $request->content,
        ]);

        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = Storage::put("order-assets/order_{$order->id}/comments", $file);
                
                OrderAsset::create([
                    'order_id' => $order->id,
                    'type' => 'comment',
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        event(new CommentPosted($comment));

        return back()->with('success', 'Comment posted successfully.');
    }
}
