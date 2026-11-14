<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
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
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:10240'],
        ];
    }
}
