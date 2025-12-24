# Get Category Products API

## Endpoint

```
GET /api/v1/products/category/:categoryId
```

## Description

Fetches products based on a category ID. The API intelligently handles different category levels and returns data in different formats:

- **Level 0 & 1 categories**: Returns products grouped by subcategories (15 products per subcategory)
- **Level 2 categories**: Returns products directly in a flat array (up to 15 products)

## Path Parameters

| Parameter    | Type              | Required | Description                          |
| ------------ | ----------------- | -------- | ------------------------------------ |
| `categoryId` | String (ObjectId) | Yes      | The MongoDB ObjectId of the category |

## Query Parameters

None

## Response Format

The response format varies based on the category level.

### Level 2 Category Response (Leaf Category)

When the category is at level 2 (has no children), products are returned directly.

```json
{
  "success": true,
  "level": 2,
  "categoryId": "507f1f77bcf86cd799439011",
  "categoryName": "Smart Phones",
  "totalProducts": 12,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "iPhone 15 Pro",
      "brand": "Apple",
      "thumbnail": {
        "url": "https://example.com/image.jpg",
        "publicId": "product_123"
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "stock": 50,
          "mrp": 129900,
          "sellingPrices": [
            {
              "quantity": 1,
              "price": 119900
            }
          ]
        }
      ]
    }
    // ... up to 15 products
  ]
}
```

### Level 0 or Level 1 Category Response (Parent Category)

When the category has subcategories, products are grouped by subcategory.

```json
{
  "success": true,
  "level": 0,
  "categoryId": "507f1f77bcf86cd799439011",
  "categoryName": "Electronics",
  "totalSubCategories": 3,
  "data": [
    {
      "subCategoryId": "507f1f77bcf86cd799439014",
      "subCategoryName": "Mobile Phones",
      "products": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "iPhone 15 Pro",
          "brand": "Apple",
          "thumbnail": {
            "url": "https://example.com/image.jpg",
            "publicId": "product_123"
          },
          "variants": [
            {
              "_id": "507f1f77bcf86cd799439013",
              "stock": 50,
              "mrp": 129900,
              "sellingPrices": [
                {
                  "quantity": 1,
                  "price": 119900
                }
              ]
            }
          ]
        }
        // ... up to 15 products per subcategory
      ]
    },
    {
      "subCategoryId": "507f1f77bcf86cd799439015",
      "subCategoryName": "Laptops",
      "products": [
        // ... up to 15 products
      ]
    }
  ]
}
```

### No Subcategories Found Response

```json
{
  "success": true,
  "level": 0,
  "categoryId": "507f1f77bcf86cd799439011",
  "categoryName": "Empty Category",
  "message": "No subcategories found",
  "data": []
}
```

## Response Fields

### Common Fields

| Field          | Type    | Description                             |
| -------------- | ------- | --------------------------------------- |
| `success`      | Boolean | Indicates if the request was successful |
| `level`        | Number  | The category level (0, 1, or 2)         |
| `categoryId`   | String  | The requested category's ID             |
| `categoryName` | String  | The requested category's name           |

### Level 2 Specific Fields

| Field           | Type   | Description                                |
| --------------- | ------ | ------------------------------------------ |
| `totalProducts` | Number | Total number of products returned (max 15) |
| `products`      | Array  | Direct array of product objects            |

### Level 0/1 Specific Fields

| Field                | Type   | Description                                |
| -------------------- | ------ | ------------------------------------------ |
| `totalSubCategories` | Number | Number of subcategories with products      |
| `data`               | Array  | Array of subcategory objects with products |

### Product Object Structure

| Field       | Type   | Description                                      |
| ----------- | ------ | ------------------------------------------------ |
| `_id`       | String | Product ID                                       |
| `name`      | String | Product name                                     |
| `brand`     | String | Product brand                                    |
| `thumbnail` | Object | Thumbnail image object with `url` and `publicId` |
| `variants`  | Array  | Array of product variants                        |

### Variant Object Structure

| Field           | Type   | Description                                      |
| --------------- | ------ | ------------------------------------------------ |
| `_id`           | String | Variant ID                                       |
| `stock`         | Number | Available stock quantity                         |
| `mrp`           | Number | Maximum Retail Price (in smallest currency unit) |
| `sellingPrices` | Array  | Array of price tiers based on quantity           |

## Error Responses

### Category Not Found

```json
{
  "success": false,
  "message": "Category not found"
}
```

**Status Code:** `404 Not Found`

## Business Logic

1. **Category Validation**: Verifies the category exists and is active
2. **Level Detection**: Automatically detects the category level
3. **Dynamic Response**:
   - Level 2: Returns products directly (no children to group by)
   - Level 0/1: Returns products grouped by subcategories
4. **Hierarchical Product Fetching**:
   - For each subcategory, fetches products from that subcategory AND its descendants
   - This ensures all relevant products are included even if they're in deeper levels
5. **Product Limit**: Maximum 15 products per subcategory (or 15 total for level 2)
6. **Filtering**: Only returns active products and active subcategories
7. **Empty Filtering**: Excludes subcategories that have no products

## Use Cases

### Frontend Integration Example - Level 0 Category

```javascript
// Fetch products for a top-level category (e.g., Electronics)
const response = await fetch(
  "/api/v1/products/category/507f1f77bcf86cd799439011"
);
const data = await response.json();

if (data.level === 0 || data.level === 1) {
  // Render subcategory sections
  data.data.forEach((subcategory) => {
    console.log(
      `${subcategory.subCategoryName}: ${subcategory.products.length} products`
    );
    // Render products for each subcategory
  });
} else if (data.level === 2) {
  // Render products directly
  console.log(`Total products: ${data.totalProducts}`);
  // Render flat product list
}
```

### Frontend Integration Example - Level 2 Category

```javascript
// Fetch products for a leaf category (e.g., Smart Phones)
const response = await fetch(
  "/api/v1/products/category/507f1f77bcf86cd799439022"
);
const data = await response.json();

if (data.level === 2) {
  // Direct product list, no subcategories
  data.products.forEach((product) => {
    console.log(product.name);
  });
}
```

## Notes

- The API is **generic** and works for any category level (0, 1, or 2)
- Products are sorted by creation date (newest first)
- Only **active** products and categories are included
- The `level` field in the response helps the frontend determine how to render the data
- For level 0/1 categories with no subcategories, an empty `data` array is returned
- Price is stored in the smallest currency unit (e.g., paise for INR, cents for USD)
