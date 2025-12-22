# Bulk Purchase API Endpoint

## Overview
This document describes the expected API endpoint for the bulk purchase functionality.

## Endpoint
`POST /api/stock-movements/bulk-purchase`

## Request Payload

```json
{
  "contact_id": 123,
  "location": "warehouse",
  "total_cost": 500.00,
  "description": "Invoice #12345, Box of mixed items",
  "date": "2025-10-01",
  "items": [
    {
      "product_id": 456,
      "quantity": 10.00,
      "allocated_cost": 200.00
    },
    {
      "product_id": 789,
      "quantity": 5.00,
      "allocated_cost": 300.00
    }
  ]
}
```

## Expected Behavior

The backend should:

1. **Validate** that the sum of all `allocated_cost` values equals `total_cost`
2. **Create stock movement records** for each item:
   - `product_id`: from the item
   - `contact_id`: from the main payload
   - `quantity`: from the item
   - `location`: from the main payload
   - `type`: "PURCHASE" or "BULK_PURCHASE"
   - `description`: from the main payload (or item-specific if needed)
   - `created_at`, `updated_at`: current timestamp

3. **Update stock levels** for each product at the specified location:
   - Add the quantity to the existing stock for that product/location combination

4. **Store cost allocation** (suggested approach):
   - Add an `allocated_cost` or `unit_cost` column to the `stock_movements` table
   - This allows tracking the cost per movement for future cost analysis
   - Calculate unit cost: `unit_cost = allocated_cost / quantity`

5. **Return success response**:
   ```json
   {
     "message": "Bulk purchase recorded successfully",
     "movements": [
       { "id": 1, "product_id": 456, "quantity": 10.00, "allocated_cost": 200.00 },
       { "id": 2, "product_id": 789, "quantity": 5.00, "allocated_cost": 300.00 }
     ]
   }
   ```

## Database Schema Suggestions

### Update `stock_movements` table:
```sql
ALTER TABLE stock_movements 
ADD COLUMN allocated_cost DECIMAL(15, 2) NULL AFTER quantity,
ADD COLUMN unit_cost DECIMAL(15, 2) NULL AFTER allocated_cost;
```

### Or create a separate `purchase_allocations` table:
```sql
CREATE TABLE purchase_allocations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    stock_movement_id BIGINT UNSIGNED NOT NULL,
    allocated_cost DECIMAL(15, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    purchase_reference VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (stock_movement_id) REFERENCES stock_movements(id) ON DELETE CASCADE
);
```

## Error Responses

### Cost Mismatch (422)
```json
{
  "message": "Total allocated cost (£450.00) does not match total cost (£500.00)"
}
```

### Invalid Product (404)
```json
{
  "message": "Product with ID 456 not found"
}
```

### Invalid Contact (404)
```json
{
  "message": "Contact with ID 123 not found"
}
```

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "items.0.quantity": ["The quantity field is required"],
    "items.1.product_id": ["The selected product is invalid"]
  }
}
```

## Example Laravel Controller Implementation

```php
public function bulkPurchase(Request $request)
{
    $validated = $request->validate([
        'contact_id' => 'required|exists:contacts,id',
        'location' => 'required|string',
        'total_cost' => 'required|numeric|min:0',
        'description' => 'nullable|string',
        'date' => 'required|date',
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|numeric|min:0.01',
        'items.*.allocated_cost' => 'required|numeric|min:0',
    ]);

    // Validate cost allocation
    $totalAllocated = collect($validated['items'])->sum('allocated_cost');
    if (abs($totalAllocated - $validated['total_cost']) > 0.01) {
        return response()->json([
            'message' => "Total allocated cost (£{$totalAllocated}) does not match total cost (£{$validated['total_cost']})"
        ], 422);
    }

    DB::beginTransaction();
    try {
        $movements = [];
        
        foreach ($validated['items'] as $item) {
            // Create stock movement
            $movement = StockMovement::create([
                'product_id' => $item['product_id'],
                'contact_id' => $validated['contact_id'],
                'quantity' => $item['quantity'],
                'location' => $validated['location'],
                'type' => 'PURCHASE',
                'description' => $validated['description'],
                'allocated_cost' => $item['allocated_cost'],
                'unit_cost' => $item['allocated_cost'] / $item['quantity'],
                'created_at' => $validated['date'],
            ]);

            // Update stock levels
            Stock::updateOrCreate(
                [
                    'product_id' => $item['product_id'],
                    'location' => $validated['location'],
                ],
                [
                    'quantity' => DB::raw('quantity + ' . $item['quantity'])
                ]
            );

            $movements[] = $movement;
        }

        DB::commit();

        return response()->json([
            'message' => 'Bulk purchase recorded successfully',
            'movements' => $movements
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to record bulk purchase',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

## Route Definition
```php
Route::post('/stock-movements/bulk-purchase', [StockMovementController::class, 'bulkPurchase']);
```

