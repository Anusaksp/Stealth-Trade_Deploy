<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:9999999999.99'],
            'description' => ['nullable', 'string'],
            'item_type_id' => ['required', 'integer', 'exists:item_types,id'],
            'pickup_address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'images' => ['required', 'array', 'min:1', 'max:5'],
            'images.*' => ['image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'ต้องอัปโหลดรูปอย่างน้อย 1 รูป',
            'images.min' => 'ต้องมีรูปอย่างน้อย 1 รูป',
            'images.max' => 'อัปโหลดได้สูงสุด 5 รูป',
            'images.*.image' => 'ไฟล์ต้องเป็นรูปภาพเท่านั้น',
            'images.*.max' => 'รูปต้องมีขนาดไม่เกิน 2MB',
        ];
    }
}
