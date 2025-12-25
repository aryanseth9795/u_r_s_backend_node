# API Quick Reference - Product Endpoints

## Endpoint Summary Table

| Method | Endpoint                             | Description                       | Key Features                          |
| ------ | ------------------------------------ | --------------------------------- | ------------------------------------- |
| GET    | `/api/products/:id`                  | Get single product                | Full product details with variants    |
| GET    | `/api/products/landing`              | Landing page products             | 10 products per level 0 category      |
| GET    | `/api/products/landing/filtered`     | **NEW** Filtered landing products | 20 products per category with filters |
| GET    | `/api/products/category/:categoryId` | Category products                 | Adaptive based on category level      |
| GET    | `/api/products/similar/:categoryId`  | Similar products                  | Related products in same category     |
| GET    | `/api/products/search`               | Advanced search                   | Full-text search with filters         |
| GET    | `/api/products/search/suggestions`   | Autocomplete                      | Product/brand/category suggestions    |

---

## New Endpoint: Filtered Landing Products

### Endpoint

```
GET /api/products/landing/filtered
```

### Usage Examples

**Get Cheapest Products:**

```bash
curl "http://localhost:3000/api/products/landing/filtered?isCheap=true"
```

**Get Latest Products:**

```bash
curl "http://localhost:3000/api/products/landing/filtered?isLatestProduct=true"
```

**Get Top Discounted Products:**

```bash
curl "http://localhost:3000/api/products/landing/filtered?isTopDiscount=true"
```

**Get Top Sellers:**

```bash
curl "http://localhost:3000/api/products/landing/filtered?topSeller=true"
```

### Filter Behavior

| Filter            | Sorting Logic                                          | Products Returned |
| ----------------- | ------------------------------------------------------ | ----------------- |
| `isCheap`         | Minimum selling price (ascending)                      | 20 per category   |
| `isLatestProduct` | Creation date (newest first)                           | 20 per category   |
| `isTopDiscount`   | Discount % = (MRP - MinPrice) / MRP × 100 (descending) | 20 per category   |
| `topSeller`       | Creation date (newest first)\*                         | 20 per category   |

\*Note: `topSeller` currently uses `createdAt` as a proxy. Update this if you have actual sales data.

### Response Structure

```json
{
  "success": true,
  "filter": "isTopDiscount",
  "totalCategories": 3,
  "data": [
    {
      "categoryId": "...",
      "categoryName": "Electronics",
      "products": [
        {
          "_id": "...",
          "name": "Product Name",
          "brand": "Brand Name",
          "thumbnail": {...},
          "variants": [...]
        }
      ]
    }
  ]
}
```

---

## Testing the New Endpoint

### Using Postman/Thunder Client

1. Method: GET
2. URL: `http://localhost:3000/api/products/landing/filtered`
3. Add query parameter: `isTopDiscount` = `true`

### Using Browser

Navigate to:

```
http://localhost:3000/api/products/landing/filtered?isTopDiscount=true
```

### Expected Behavior

- ✅ Returns products grouped by level 0 categories
- ✅ Each category has up to 20 products
- ✅ Products are sorted according to the filter
- ✅ Only one filter parameter is allowed at a time
- ❌ Error if no filter is provided
- ❌ Error if multiple filters are provided

---

## Implementation Details

### Discount Calculation (isTopDiscount)

```javascript
// For each variant:
discount = ((MRP - MinSellingPrice) / MRP) * 100;

// Example:
// MRP: ₹10,000
// Selling Price: ₹7,000
// Discount: ((10000 - 7000) / 10000) * 100 = 30%
```

### Category Hierarchy

```
Level 0 (Parent Category)
  └── Level 1 (Subcategory)
      └── Level 2 (Sub-subcategory / Leaf)
```

The endpoint fetches products from all descendant categories of each level 0 category.

---

## Related Files

- **Controller:** `src/controllers/user/productController.ts`
- **Route:** `src/routes/user/productRoute.ts`
- **Model:** `src/models/productModel.ts`
- **Full Documentation:** `docs/API_PRODUCT_ENDPOINTS.md`
