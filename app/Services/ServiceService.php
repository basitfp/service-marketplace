<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class ServiceService
{
    public function store(array $data): Service
    {
        return DB::transaction(function () use ($data) {
            if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
                $data['image'] = $data['image']->store('services', 'public');
            }

            if (!isset($data['is_active'])) $data['is_active'] = false;
            if (!isset($data['is_featured'])) $data['is_featured'] = false;
            if (!isset($data['is_deliverable'])) $data['is_deliverable'] = false;

            $service = Service::create($data);
            $service->eligibleWorkers()->sync($data['worker_ids'] ?? []);

            if (!empty($data['dynamic_fields']) && is_array($data['dynamic_fields'])) {
                foreach ($data['dynamic_fields'] as $fieldKey => $value) {
                    $categoryField = \App\Models\CategoryField::where('category_id', $service->category_id)
                        ->where('field_key', $fieldKey)
                        ->first();

                    if ($categoryField) {
                        if (is_array($value)) {
                            $value = json_encode($value);
                        } elseif ($value instanceof \Illuminate\Http\UploadedFile) {
                            $value = $value->store('service_fields', 'public');
                        }

                        $service->fieldValues()->create([
                            'category_field_id' => $categoryField->id,
                            'value' => $value
                        ]);
                    }
                }
            }

            return $service;
        });
    }

    public function update(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data) {
            if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
                if ($service->image) {
                    Storage::disk('public')->delete($service->image);
                }
                $data['image'] = $data['image']->store('services', 'public');
            }

            if (!isset($data['is_active'])) $data['is_active'] = false;
            if (!isset($data['is_featured'])) $data['is_featured'] = false;
            if (!isset($data['is_deliverable'])) $data['is_deliverable'] = false;

            $service->update($data);
            $service->eligibleWorkers()->sync($data['worker_ids'] ?? []);

            if (isset($data['dynamic_fields']) && is_array($data['dynamic_fields'])) {
                // Delete old dynamic field values and re-create them
                foreach ($service->fieldValues as $fv) {
                    if ($fv->categoryField && in_array($fv->categoryField->field_type, ['image_upload', 'file_upload'])) {
                        if ($fv->value && Storage::disk('public')->exists($fv->value)) {
                            Storage::disk('public')->delete($fv->value);
                        }
                    }
                }
                
                $service->fieldValues()->delete();

                foreach ($data['dynamic_fields'] as $fieldKey => $value) {
                    $categoryField = \App\Models\CategoryField::where('category_id', $service->category_id)
                        ->where('field_key', $fieldKey)
                        ->first();

                    if ($categoryField) {
                        if (is_array($value)) {
                            $value = json_encode($value);
                        } elseif ($value instanceof \Illuminate\Http\UploadedFile) {
                            $value = $value->store('service_fields', 'public');
                        }

                        $service->fieldValues()->create([
                            'category_field_id' => $categoryField->id,
                            'value' => $value
                        ]);
                    }
                }
            }

            return $service;
        });
    }

    public function delete(Service $service): void
    {
        if (method_exists($service, 'orders') && $service->orders()->exists()) {
            throw new Exception('Cannot delete service with active orders.');
        }

        if ($service->image) {
            Storage::disk('public')->delete($service->image);
        }

        foreach ($service->fieldValues as $fv) {
            if ($fv->categoryField && in_array($fv->categoryField->field_type, ['image_upload', 'file_upload'])) {
                if ($fv->value) {
                    Storage::disk('public')->delete($fv->value);
                }
            }
        }

        $service->delete();
    }

    public function toggleStatus(Service $service): Service
    {
        $service->is_active = !$service->is_active;
        $service->save();
        return $service;
    }
}
