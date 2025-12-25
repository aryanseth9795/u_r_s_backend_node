# Product API Endpoints Documentation

## Base URL

```
/api/products
```

---

## 1. Get Product by ID

**Endpoint:** `GET /api/products/:id`

**Description:** Fetches detailed information about a single product by its ID.

### Request Parameters

- **Path Parameters:**
  - `id` (string, required) - Product ID

### Response Format

```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Samsung Galaxy S23",
    "brand": "Samsung",
    "description": "Latest flagship smartphone",
    "categoryId": "507f1f77bcf86cd799439012",
    "thumbnail": {
      "url": "https://example.com/image.jpg",
      "publicId": "products/abc123"
    },
    "variants": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "color": "Black",
        "size": "128GB",
        "stock": 50,
        "mrp": 79999,
        "sellingPrices": [
          {
            "quantity": 1,
            "price": 69999
          },
          {
            "quantity": 5,
            "price": 67999
          }
        ],
        "images": [
          {
            "url": "https://example.com/variant1.jpg",
            "publicId": "variants/xyz456"
          }
        ],
        "isActive": true
      }
    ],
    "tags": ["smartphone", "5g", "android"],
    "isActive": true,
    "createdAt": "2023-12-20T10:30:00.000Z",
    "updatedAt": "2023-12-20T10:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "No Product Found"
}
```

---

## 2. Get Landing Page Products

**Endpoint:** `GET /api/products/landing`

**Description:** Fetches 10 products from each level 0 category (parent categories) and their descendants for the landing page.

### Request Parameters

None

### Response Format

```json
{
  "success": true,
  "totalCategories": 3,
  "data": [
    {
      "categoryId": "507f1f77bcf86cd799439014",
      "categoryName": "Electronics",
      "products": [
        {
          "_id": "507f1f77bcf86cd799439015",
          "name": "iPhone 15 Pro",
          "brand": "Apple",
          "thumbnail": {
            "url": "https://example.com/iphone.jpg",
            "publicId": "products/iphone123"
          },
          "variants": [
            {
              "_id": "507f1f77bcf86cd799439016",
              "stock": 25,
              "mrp": 134900,
              "sellingPrices": [
                {
                  "quantity": 1,
                  "price": 129900
                }
              ]
            }
          ]
        }
        // ... 9 more products
      ]
    },
    {
      "categoryId": "507f1f77bcf86cd799439017",
      "categoryName": "Fashion",
      "products": [
        // ... up to 10 products
      ]
    }
  ]
}
```

---

## 3. Get Filtered Landing Products (NEW)

**Endpoint:** `GET /api/products/landing/filtered`

**Description:** Fetches 20 products from each level 0 category based on a specific filter (cheap, latest, top discount, or top seller). Only one filter can be applied at a time.

### Request Parameters

- **Query Parameters (one required):**
  - `isCheap` (boolean) - Get products with lowest selling price
  - `isLatestProduct` (boolean) - Get newest products
  - `isTopDiscount` (boolean) - Get products with maximum discount
  - `topSeller` (boolean) - Get top-selling products

### Example Requests

```
GET /api/products/landing/filtered?isCheap=true
GET /api/products/landing/filtered?isLatestProduct=true
GET /api/products/landing/filtered?isTopDiscount=true
GET /api/products/landing/filtered?topSeller=true
```

### Response Format

```json
{
  "success": true,
  "filter": "isTopDiscount",
  "totalCategories": 3,
  "data": [
    {
      "categoryId": "507f1f77bcf86cd799439014",
      "categoryName": "Electronics",
      "products": [
        {
          "_id": "507f1f77bcf86cd799439015",
          "name": "Samsung TV 55 inch",
          "brand": "Samsung",
          "thumbnail": {
            "url": "https://example.com/tv.jpg",
            "publicId": "products/tv123"
          },
          "variants": [
            {
              "_id": "507f1f77bcf86cd799439016",
              "stock": 15,
              "mrp": 89999,
              "sellingPrices": [
                {
                  "quantity": 1,
                  "price": 49999
                }
              ]
            }
          ]
        }
        // ... up to 20 products sorted by discount
      ]
    }
  ]
}
```

### Error Responses

**No filter provided:**

```json
{
  "success": false,
  "message": "Please provide one filter: isCheap, isLatestProduct, isTopDiscount, or topSeller"
}
```

**Multiple filters provided:**

```json
{
  "success": false,
  "message": "Please provide only one filter at a time"
}
```

---

## 4. Get Category Products

**Endpoint:** `GET /api/products/category/:categoryId`

**Description:** Fetches products for a specific category. Behavior depends on category level:

- **Level 2 (leaf category):** Returns up to 15 products directly
- **Level 0 or 1:** Returns products grouped by subcategories (15 per subcategory)

### Request Parameters

- **Path Parameters:**
  - `categoryId` (string, required) - Category ID

### Response Format (Level 2 Category)

```json
{
  "success": true,
  "level": 2,
  "categoryId": "507f1f77bcf86cd799439018",
  "categoryName": "Smartphones",
  "totalProducts": 15,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "name": "OnePlus 11",
      "brand": "OnePlus",
      "thumbnail": {
        "url": "https://example.com/oneplus.jpg",
        "publicId": "products/oneplus123"
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd79943901a",
          "stock": 30,
          "mrp": 56999,
          "sellingPrices": [
            {
              "quantity": 1,
              "price": 54999
            }
          ]
        }
      ]
    }
    // ... more products
  ]
}
```

### Response Format (Level 0 or 1 Category)

```json
{
  "success": true,
  "level": 0,
  "categoryId": "507f1f77bcf86cd799439014",
  "categoryName": "Electronics",
  "totalSubCategories": 3,
  "data": [
    {
      "subCategoryId": "507f1f77bcf86cd79943901b",
      "subCategoryName": "Mobile Phones",
      "products": [
        // ... up to 15 products
      ]
    },
    {
      "subCategoryId": "507f1f77bcf86cd79943901c",
      "subCategoryName": "Laptops",
      "products": [
        // ... up to 15 products
      ]
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "Category not found"
}
```

---

## 5. Get Similar Products

**Endpoint:** `GET /api/products/similar/:categoryId`

**Description:** Fetches similar products from the same level 2 (sub-sub-category). Useful for "Similar Products" sections on product detail pages.

### Request Parameters

- **Path Parameters:**
  - `categoryId` (string, required) - Level 2 Category ID
- **Query Parameters:**
  - `excludeProductId` (string, optional) - Product ID to exclude from results

### Example Request

```
GET /api/products/similar/507f1f77bcf86cd799439018?excludeProductId=507f1f77bcf86cd799439019
```

### Response Format

```json
{
  "success": true,
  "categoryId": "507f1f77bcf86cd799439018",
  "categoryName": "Smartphones",
  "totalProducts": 10,
  "products": [
    {
      "_id": "507f1f77bcf86cd79943901d",
      "name": "Xiaomi 13 Pro",
      "brand": "Xiaomi",
      "thumbnail": {
        "url": "https://example.com/xiaomi.jpg",
        "publicId": "products/xiaomi123"
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd79943901e",
          "stock": 20,
          "mrp": 59999,
          "sellingPrices": [
            {
              "quantity": 1,
              "price": 56999
            }
          ]
        }
      ]
    }
    // ... more similar products
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "Category not found or is not a sub-sub-category"
}
```

---

## 6. Search Products

**Endpoint:** `GET /api/products/search`

**Description:** Search and filter products with advanced options including text search, category filters, brand filters, price range, stock availability, and sorting.

### Request Parameters

- **Query Parameters:**
  - `q` (string, optional) - Search query for text search
  - `categoryId` (string, optional) - Filter by level 0 category
  - `subCategoryId` (string, optional) - Filter by level 1 category
  - `subSubCategoryId` (string, optional) - Filter by level 2 category
  - `brand` (string, optional) - Filter by brand (comma-separated for multiple)
  - `minPrice` (number, optional) - Minimum price filter
  - `maxPrice` (number, optional) - Maximum price filter
  - `inStock` (boolean, optional) - Filter only in-stock products
  - `sort` (string, optional) - Sort order: `relevance`, `price_asc`, `price_desc`, `newest` (default: `relevance`)
  - `page` (number, optional) - Page number (default: 1)
  - `limit` (number, optional) - Items per page (default: 20, max: 100)

### Example Requests

```
GET /api/products/search?q=samsung
GET /api/products/search?q=phone&brand=Apple,Samsung&minPrice=30000&maxPrice=80000
GET /api/products/search?categoryId=507f1f77bcf86cd799439014&inStock=true&sort=price_asc
GET /api/products/search?q=laptop&page=2&limit=30
```

### Response Format

```json
{
  "success": true,
  "searchQuery": "samsung",
  "filters": {
    "categoryId": null,
    "subCategoryId": null,
    "subSubCategoryId": null,
    "brand": "Samsung",
    "priceRange": {
      "min": 30000,
      "max": 80000
    },
    "inStock": true
  },
  "sort": "relevance",
  "page": 1,
  "limit": 20,
  "totalProducts": 45,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "products": [
    {
      "_id": "507f1f77bcf86cd79943901f",
      "name": "Samsung Galaxy S23 Ultra",
      "brand": "Samsung",
      "thumbnail": {
        "url": "https://example.com/s23.jpg",
        "publicId": "products/s23_123"
      },
      "categoryInfo": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Smartphones",
        "level": 2
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439021",
          "stock": 40,
          "mrp": 124999,
          "sellingPrices": [
            {
              "quantity": 1,
              "price": 119999
            }
          ]
        }
      ],
      "searchScore": 5.2
    }
    // ... more products
  ]
}
```

---

## 7. Search Suggestions (Autocomplete)

**Endpoint:** `GET /api/products/search/suggestions`

**Description:** Provides autocomplete suggestions for search queries, including products, brands, and categories.

### Request Parameters

- **Query Parameters:**
  - `q` (string, required) - Search query (minimum 2 characters)

### Example Request

```
GET /api/products/search/suggestions?q=sam
```

### Response Format

```json
{
  "success": true,
  "query": "sam",
  "totalSuggestions": 12,
  "suggestions": {
    "products": [
      {
        "id": "507f1f77bcf86cd799439022",
        "name": "Samsung Galaxy S23",
        "thumbnail": "https://example.com/s23.jpg",
        "type": "product"
      },
      {
        "id": "507f1f77bcf86cd799439023",
        "name": "Samsung Galaxy Tab S8",
        "thumbnail": "https://example.com/tab.jpg",
        "type": "product"
      }
      // ... up to 5 product suggestions
    ],
    "brands": [
      {
        "name": "Samsung",
        "productCount": 156,
        "type": "brand"
      },
      {
        "name": "Samsonite",
        "productCount": 23,
        "type": "brand"
      }
      // ... up to 5 brand suggestions
    ],
    "categories": [
      {
        "id": "507f1f77bcf86cd799439024",
        "name": "Smart Home",
        "level": 1,
        "type": "category"
      }
      // ... up to 5 category suggestions
    ]
  }
}
```

### Error Response (Query too short)

```json
{
  "success": true,
  "message": "Query must be at least 2 characters",
  "suggestions": {
    "products": [],
    "brands": [],
    "categories": []
  }
}
```

---

## Common Error Codes

- **400** - Bad Request (invalid parameters, validation errors)
- **404** - Not Found (product/category not found)
- **500** - Internal Server Error

## Notes

1. All responses include a `success` boolean field
2. All products include only active variants and categories (`isActive: { $ne: false }`)
3. Product variants include minimal fields for performance (stock, mrp, sellingPrices)
4. Category hierarchy: Level 0 (parent) → Level 1 (subcategory) → Level 2 (sub-subcategory/leaf)
5. Prices are in the smallest currency unit (e.g., paise for INR)
6. All timestamps are in ISO 8601 format
7. The `getFilteredLandingProducts` endpoint validates that exactly one filter is provided
