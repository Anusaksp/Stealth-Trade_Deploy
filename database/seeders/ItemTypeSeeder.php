<?php

namespace Database\Seeders;

use App\Models\ItemType;
use Illuminate\Database\Seeder;

class ItemTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'อิเล็กทรอนิกส์' => 'electronics',
            'เสื้อผ้า' => 'clothing',
            'หนังสือ' => 'books',
            'ของใช้' => 'household',
            'อื่นๆ' => 'others',
        ];

        foreach ($types as $name => $slug) {
            ItemType::updateOrCreate(['slug' => $slug], ['name' => $name]);
        }
    }
}
