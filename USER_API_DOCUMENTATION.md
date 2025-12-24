# User API Documentation

**Base URL:** `/api/v1/user`

**Version:** 1.0

This document provides comprehensive details about the User API endpoints for the frontend team.

---

## Table of Contents

- [Authentication](#authentication)
  - [User Login](#user-login)
  - [User Registration](#user-registration)
  - [Refresh Token](#refresh-token)
- [User Management](#user-management)
  - [Get User Details](#get-user-details)
  - [Add Address](#add-address)
  - [Edit Address](#edit-address)
  - [Delete Address](#delete-address)
- [Products](#products)
  - [Get Landing Page Products](#get-landing-page-products)
  - [Get Category Products](#get-category-products)
  - [Get Product by ID](#get-product-by-id)
  - [Get Similar Products](#get-similar-products)
  - [Search Products](#search-products)
  - [Search Suggestions](#search-suggestions)
- [Orders](#orders)
  - [Create Order](#create-order)
  - [Get Orders List](#get-orders-list)
  - [Get Order Details](#get-order-details)
  - [Cancel Order](#cancel-order)

---

## Authentication

All authenticated endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <access_token>
```

### User Login

Authenticate a user and receive access and refresh tokens.

**Endpoint:** `POST /api/v1/user/auth/login`

**Authentication Required:** No

**Request Body:**

```json
{
  "mobilenumber": "9876543210",
  "password": "yourPassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `404` - No Accounts Available for this Credentials
- `400` - Missing required fields

---

### User Registration

Register a new user account.

**Endpoint:** `POST /api/v1/user/auth/signup`

**Authentication Required:** No

**Request Body:**

```json
{
  "name": "John Doe",
  "mobilenumber": "9876543210",
  "password": "securePassword123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Responses:**

- `400` - User with this mobile number already exists
- `400` - Missing required fields

---

### Refresh Token

Obtain a new access token using a refresh token.

**Endpoint:** `POST /api/v1/user/auth/refresh`

**Authentication Required:** No

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token Refreshed Successfully"
}
```

**Error Responses:**

- `400` - No refresh token provided
- `401` - Invalid refresh token

---

## User Management

### Get User Details

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /api/v1/user/user/details`

**Authentication Required:** Yes

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User Fetched Successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "mobilenumber": "9876543210",
    "role": "user",
    "addresses": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "Receiver_Name": "Jane Doe",
        "Receiver_MobileNumber": "9876543211",
        "Address_Line1": "123 Main Street",
        "Address_Line2": "Apt 4B",
        "City": "Mumbai",
        "pincode": "400001",
        "label": "Home"
      }
    ],
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-15T14:30:00.000Z"
  }
}
```

**Error Responses:**

- `401` - User not authenticated
- `404` - No User Found

---

### Add Address

Add a new delivery address to the user's account.

**Endpoint:** `POST /api/v1/user/user/address/add`

**Authentication Required:** Yes

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "Receiver_Name": "Jane Doe",
  "Receiver_MobileNumber": "9876543211",
  "Address_Line1": "123 Main Street",
  "Address_Line2": "Apt 4B",
  "City": "Mumbai",
  "pincode": "400001",
  "label": "Home"
}
```

**Required Fields:**

- `Receiver_Name` (string)
- `Receiver_MobileNumber` (string)
- `Address_Line1` (string)
- `City` (string)
- `pincode` (string)
- `label` (string) - Examples: "Home", "Office", "Other"

**Optional Fields:**

- `Address_Line2` (string)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Address added successfully",
  "addresses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "Receiver_Name": "Jane Doe",
      "Receiver_MobileNumber": "9876543211",
      "Address_Line1": "123 Main Street",
      "Address_Line2": "Apt 4B",
      "City": "Mumbai",
      "pincode": "400001",
      "label": "Home"
    }
  ]
}
```

**Error Responses:**

- `401` - User not authenticated
- `400` - Required fields missing
- `404` - User not found

---

### Edit Address

Update an existing delivery address.

**Endpoint:** `PUT /api/v1/user/user/address/edit/:addressId`

**Authentication Required:** Yes

**URL Parameters:**

- `addressId` (string, required) - The ID of the address to edit

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

All fields are optional. Only send the fields you want to update.

```json
{
  "Receiver_Name": "Jane Smith",
  "Receiver_MobileNumber": "9876543211",
  "Address_Line1": "456 New Street",
  "Address_Line2": "Suite 10",
  "City": "Delhi",
  "pincode": "110001",
  "label": "Office"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Address updated successfully",
  "addresses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "Receiver_Name": "Jane Smith",
      "Receiver_MobileNumber": "9876543211",
      "Address_Line1": "456 New Street",
      "Address_Line2": "Suite 10",
      "City": "Delhi",
      "pincode": "110001",
      "label": "Office"
    }
  ]
}
```

**Error Responses:**

- `401` - User not authenticated
- `400` - Address ID is required
- `404` - User not found
- `404` - Address not found

---

### Delete Address

Remove a delivery address from the user's account.

**Endpoint:** `DELETE /api/v1/user/user/address/delete/:addressId`

**Authentication Required:** Yes

**URL Parameters:**

- `addressId` (string, required) - The ID of the address to delete

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Address deleted successfully",
  "addresses": []
}
```

**Error Responses:**

- `401` - User not authenticated
- `400` - Address ID is required
- `404` - User not found

---

## Products

### Get Landing Page Products

Retrieve 10 products from each top-level category for the landing page.

**Endpoint:** `GET /api/v1/user/products/landing`

**Authentication Required:** No

**Success Response (200):**

```json
{
  "success": true,
  "totalCategories": 3,
  "data": [
    {
      "categoryId": "507f1f77bcf86cd799439011",
      "categoryName": "Electronics",
      "products": [
        {
          "_id": "507f1f77bcf86cd799439021",
          "name": "Smartphone XYZ",
          "brand": "BrandName",
          "thumbnail": {
            "url": "https://example.com/image.jpg",
            "publicId": "product_images/abc123"
          },
          "variants": [
            {
              "_id": "507f1f77bcf86cd799439031",
              "stock": 50,
              "mrp": 25000,
              "sellingPrices": [
                {
                  "minQuantity": 1,
                  "price": 22000
                },
                {
                  "minQuantity": 5,
                  "price": 21000
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Notes:**

- Returns only categories that have at least one product
- Maximum 10 products per category
- Products are sorted by creation date (newest first)

---

### Get Category Products

Get products for a category. The API intelligently handles different category levels:

- **Level 0 & 1 categories**: Returns products grouped by subcategories (15 products per subcategory)
- **Level 2 categories**: Returns products directly in an array (up to 15 products)

**Endpoint:** `GET /api/v1/user/products/category/:categoryId`

**Authentication Required:** No

**URL Parameters:**

- `categoryId` (string, required) - The ID of any category (level 0, 1, or 2)

**Example Requests:**

```
GET /api/v1/user/products/category/507f1f77bcf86cd799439011
```

**Success Response for Level 2 (Leaf Category):**

When a level 2 category has no children, products are returned directly.

```json
{
  "success": true,
  "level": 2,
  "categoryId": "507f1f77bcf86cd799439013",
  "categoryName": "Smart Phones",
  "totalProducts": 12,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "iPhone 15 Pro",
      "brand": "Apple",
      "thumbnail": {
        "url": "https://example.com/iphone.jpg",
        "publicId": "product_images/abc123"
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439031",
          "stock": 50,
          "mrp": 129900,
          "sellingPrices": [
            {
              "minQuantity": 1,
              "price": 119900
            }
          ]
        }
      ]
    }
  ]
}
```

**Success Response for Level 0 or 1 (Parent Categories):**

When a category has subcategories, products are grouped by subcategory.

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
          "_id": "507f1f77bcf86cd799439021",
          "name": "iPhone 15 Pro",
          "brand": "Apple",
          "thumbnail": {
            "url": "https://example.com/iphone.jpg",
            "publicId": "product_images/abc123"
          },
          "variants": [
            {
              "_id": "507f1f77bcf86cd799439031",
              "stock": 50,
              "mrp": 129900,
              "sellingPrices": [
                {
                  "minQuantity": 1,
                  "price": 119900
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "subCategoryId": "507f1f77bcf86cd799439015",
      "subCategoryName": "Laptops",
      "products": [
        {
          "_id": "507f1f77bcf86cd799439022",
          "name": "MacBook Pro",
          "brand": "Apple",
          "thumbnail": {
            "url": "https://example.com/macbook.jpg",
            "publicId": "product_images/def456"
          },
          "variants": [
            {
              "_id": "507f1f77bcf86cd799439032",
              "stock": 25,
              "mrp": 199900,
              "sellingPrices": [
                {
                  "minQuantity": 1,
                  "price": 189900
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**No Subcategories Response:**

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

**Error Responses:**

- `404` - Category not found

**Response Fields:**

| Field                | Type    | Present In     | Description                           |
| -------------------- | ------- | -------------- | ------------------------------------- |
| `success`            | Boolean | All            | Request success status                |
| `level`              | Number  | All            | Category level (0, 1, or 2)           |
| `categoryId`         | String  | All            | Requested category ID                 |
| `categoryName`       | String  | All            | Requested category name               |
| `totalProducts`      | Number  | Level 2 only   | Total products returned (max 15)      |
| `products`           | Array   | Level 2 only   | Direct array of products              |
| `totalSubCategories` | Number  | Level 0/1 only | Number of subcategories with products |
| `data`               | Array   | Level 0/1 only | Array of subcategory objects          |

**Frontend Integration:**

```javascript
const response = await fetch(`/api/v1/user/products/category/${categoryId}`);
const data = await response.json();

if (data.level === 2) {
  // Render products directly (flat list)
  data.products.forEach((product) => {
    renderProduct(product);
  });
} else {
  // Render products grouped by subcategories
  data.data.forEach((subcategory) => {
    renderSubcategorySection(subcategory.subCategoryName, subcategory.products);
  });
}
```

**Notes:**

- The API works for **any category level** (0, 1, or 2)
- Use the `level` field to determine how to render the response
- Maximum **15 products per subcategory** for level 0/1
- Maximum **15 products total** for level 2
- Only active products and categories are included
- Products are sorted by newest first
- For level 0/1, subcategories with no products are excluded

---

### Get Product by ID

Retrieve complete details of a specific product.

**Endpoint:** `GET /api/v1/user/products/:id`

**Authentication Required:** No

**URL Parameters:**

- `id` (string, required) - The product ID

**Success Response (200):**

```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Smartphone XYZ",
    "brand": "BrandName",
    "description": "High-end smartphone with advanced features",
    "category": "Electronics",
    "subCategory": "Mobile Phones",
    "subSubCategory": "Smartphones",
    "categoryId": "507f1f77bcf86cd799439011",
    "subCategoryId": "507f1f77bcf86cd799439012",
    "subSubCategoryId": "507f1f77bcf86cd799439013",
    "thumbnail": {
      "url": "https://example.com/image.jpg",
      "publicId": "product_images/abc123"
    },
    "variants": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "color": "Black",
        "size": "128GB",
        "stock": 50,
        "mrp": 25000,
        "sellingPrices": [
          {
            "minQuantity": 1,
            "price": 22000,
            "_id": "507f1f77bcf86cd799439041"
          },
          {
            "minQuantity": 5,
            "price": 21000,
            "_id": "507f1f77bcf86cd799439042"
          }
        ],
        "images": [
          {
            "url": "https://example.com/variant-image.jpg",
            "publicId": "product_images/variant_abc123"
          }
        ],
        "isActive": true
      }
    ],
    "tags": ["smartphone", "5g", "android"],
    "isActive": true,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-15T14:30:00.000Z"
  }
}
```

**Error Responses:**

- `404` - No Product Found

---

### Get Similar Products

Get similar products based on sub-sub-category (level 2).

**Endpoint:** `GET /api/v1/user/products/similar/:categoryId`

**Authentication Required:** No

**URL Parameters:**

- `categoryId` (string, required) - The sub-sub-category ID (must be level 2)

**Query Parameters:**

- `excludeProductId` (string, optional) - Product ID to exclude from results (useful for "similar products" on product detail page)

**Example Request:**

```
GET /api/v1/user/products/similar/507f1f77bcf86cd799439013?excludeProductId=507f1f77bcf86cd799439021
```

**Success Response (200):**

```json
{
  "success": true,
  "categoryId": "507f1f77bcf86cd799439013",
  "categoryName": "Smartphones",
  "totalProducts": 8,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Smartphone ABC",
      "brand": "AnotherBrand",
      "thumbnail": {
        "url": "https://example.com/image2.jpg",
        "publicId": "product_images/def456"
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439032",
          "stock": 30,
          "mrp": 20000,
          "sellingPrices": [
            {
              "minQuantity": 1,
              "price": 18000
            }
          ]
        }
      ]
    }
  ]
}
```

**Error Responses:**

- `404` - Category not found or is not a sub-sub-category

**Notes:**

- Maximum 10 similar products returned
- Sorted by newest first

---

### Search Products

Advanced product search with filters and sorting.

**Endpoint:** `GET /api/v1/user/products/search`

**Authentication Required:** No

**Query Parameters:**

| Parameter          | Type    | Required | Description                                                                         |
| ------------------ | ------- | -------- | ----------------------------------------------------------------------------------- |
| `q`                | string  | No       | Search query (searches in product names and tags)                                   |
| `categoryId`       | string  | No       | Filter by level 0 category ID                                                       |
| `subCategoryId`    | string  | No       | Filter by level 1 category ID                                                       |
| `subSubCategoryId` | string  | No       | Filter by level 2 category ID                                                       |
| `brand`            | string  | No       | Filter by brand name (comma-separated for multiple)                                 |
| `minPrice`         | number  | No       | Minimum price filter                                                                |
| `maxPrice`         | number  | No       | Maximum price filter                                                                |
| `inStock`          | boolean | No       | Filter only in-stock products (true/false)                                          |
| `sort`             | string  | No       | Sort order: `relevance`, `price_asc`, `price_desc`, `newest` (default: `relevance`) |
| `page`             | number  | No       | Page number (default: 1)                                                            |
| `limit`            | number  | No       | Items per page (default: 20, max: 100)                                              |

**Example Request:**

```
GET /api/v1/user/products/search?q=smartphone&brand=Samsung,Apple&minPrice=15000&maxPrice=50000&inStock=true&sort=price_asc&page=1&limit=20
```

**Success Response (200):**

```json
{
  "success": true,
  "searchQuery": "smartphone",
  "filters": {
    "categoryId": null,
    "subCategoryId": null,
    "subSubCategoryId": null,
    "brand": "Samsung,Apple",
    "priceRange": {
      "min": 15000,
      "max": 50000
    },
    "inStock": true
  },
  "sort": "price_asc",
  "page": 1,
  "limit": 20,
  "totalProducts": 45,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Samsung Galaxy S23",
      "brand": "Samsung",
      "thumbnail": {
        "url": "https://example.com/galaxy.jpg",
        "publicId": "product_images/galaxy123"
      },
      "categoryInfo": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Electronics",
        "level": 0
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439031",
          "stock": 50,
          "mrp": 45000,
          "sellingPrices": [
            {
              "minQuantity": 1,
              "price": 42000
            }
          ]
        }
      ],
      "searchScore": 2.5
    }
  ]
}
```

**Notes:**

- If `q` is provided, products are ranked by text search relevance
- Multiple brands can be specified using comma separation
- Price filtering considers the variant's selling prices
- Maximum 100 items per page

---

### Search Suggestions

Get autocomplete suggestions for search queries.

**Endpoint:** `GET /api/v1/user/products/search/suggestions`

**Authentication Required:** No

**Query Parameters:**

- `q` (string, required) - Search query (minimum 2 characters)

**Example Request:**

```
GET /api/v1/user/products/search/suggestions?q=smar
```

**Success Response (200):**

```json
{
  "success": true,
  "query": "smar",
  "totalSuggestions": 12,
  "suggestions": {
    "products": [
      {
        "id": "507f1f77bcf86cd799439021",
        "name": "Smartphone XYZ",
        "thumbnail": "https://example.com/image.jpg",
        "type": "product"
      },
      {
        "id": "507f1f77bcf86cd799439022",
        "name": "Smart Watch ABC",
        "thumbnail": "https://example.com/watch.jpg",
        "type": "product"
      }
    ],
    "brands": [
      {
        "name": "Smart Electronics",
        "productCount": 25,
        "type": "brand"
      }
    ],
    "categories": [
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "Smartphones",
        "level": 2,
        "type": "category"
      },
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Smart Home",
        "level": 1,
        "type": "category"
      }
    ]
  }
}
```

**Error Response:**

- If query is less than 2 characters, returns empty suggestions

**Notes:**

- Maximum 5 suggestions per type (products, brands, categories)
- Uses prefix matching for faster performance
- Returns products with thumbnails for better UX

---

## Orders

### Create Order

Place a new order with products and delivery address.

**Endpoint:** `POST /api/v1/user/orders/create`

**Authentication Required:** Yes

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439021",
      "variantId": "507f1f77bcf86cd799439031",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439022",
      "variantId": "507f1f77bcf86cd799439032",
      "quantity": 1
    }
  ],
  "address": {
    "Receiver_Name": "Jane Doe",
    "Receiver_MobileNumber": "9876543211",
    "Address_Line1": "123 Main Street",
    "Address_Line2": "Apt 4B",
    "City": "Mumbai",
    "pincode": "400001",
    "label": "Home"
  }
}
```

**Required Fields:**

Products Array:

- `productId` (string) - Product ID
- `variantId` (string) - Variant ID
- `quantity` (number) - Quantity (must be > 0)

Address Object:

- `Receiver_Name` (string)
- `Receiver_MobileNumber` (string)
- `Address_Line1` (string)
- `City` (string)
- `pincode` (string)
- `label` (string)

**Optional Fields:**

- `address.Address_Line2` (string)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439051",
    "userId": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "John Doe",
      "email": "john@example.com",
      "mobilenumber": "9876543210"
    },
    "products": [
      {
        "productId": {
          "_id": "507f1f77bcf86cd799439021",
          "name": "Smartphone XYZ",
          "brand": "BrandName",
          "thumbnail": {
            "url": "https://example.com/image.jpg",
            "publicId": "product_images/abc123"
          }
        },
        "variantId": "507f1f77bcf86cd799439031",
        "quantity": 2,
        "price": 22000,
        "_id": "507f1f77bcf86cd799439061"
      }
    ],
    "totalAmount": 44000,
    "address": {
      "Receiver_Name": "Jane Doe",
      "Receiver_MobileNumber": "9876543211",
      "Address_Line1": "123 Main Street",
      "Address_Line2": "Apt 4B",
      "City": "Mumbai",
      "pincode": "400001",
      "label": "Home"
    },
    "status": "Placed",
    "createdAt": "2023-12-20T10:00:00.000Z",
    "updatedAt": "2023-12-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `401` - User not authenticated
- `400` - Products are required
- `400` - Delivery address is required
- `400` - Missing address fields
- `400` - Each product must have productId, variantId, and quantity
- `400` - Quantity must be greater than 0
- `404` - Product not found
- `400` - Product is currently unavailable
- `404` - Variant not found
- `400` - Variant is currently unavailable
- `400` - Insufficient stock

**Notes:**

- Stock is automatically deducted upon successful order creation
- Price is calculated based on quantity tiers in `sellingPrices`
- The best price tier matching the quantity is automatically selected

---

### Get Orders List

Retrieve the user's order history.

**Endpoint:** `GET /api/v1/user/orders/list`

**Authentication Required:** Yes

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "userId": "507f1f77bcf86cd799439001",
      "products": [
        {
          "productId": "507f1f77bcf86cd799439021",
          "variantId": "507f1f77bcf86cd799439031",
          "quantity": 2,
          "price": 22000,
          "_id": "507f1f77bcf86cd799439061"
        }
      ],
      "totalAmount": 44000,
      "address": {
        "Receiver_Name": "Jane Doe",
        "Receiver_MobileNumber": "9876543211",
        "Address_Line1": "123 Main Street",
        "Address_Line2": "Apt 4B",
        "City": "Mumbai",
        "pincode": "400001",
        "label": "Home"
      },
      "status": "Placed",
      "createdAt": "2023-12-20T10:00:00.000Z",
      "updatedAt": "2023-12-20T10:00:00.000Z"
    }
  ]
}
```

**Notes:**

- Returns maximum 30 most recent orders
- Orders are sorted by creation date (newest first)

---

### Get Order Details

Retrieve detailed information about a specific order.

**Endpoint:** `POST /api/v1/user/orders/details`

**Authentication Required:** Yes

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "orderId": "507f1f77bcf86cd799439051"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439051",
    "userId": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "John Doe",
      "mobilenumber": "9876543210"
    },
    "products": [
      {
        "productId": {
          "_id": "507f1f77bcf86cd799439021",
          "name": "Smartphone XYZ",
          "thumbnail": {
            "url": "https://example.com/image.jpg",
            "publicId": "product_images/abc123"
          }
        },
        "variantId": "507f1f77bcf86cd799439031",
        "quantity": 2,
        "price": 22000,
        "_id": "507f1f77bcf86cd799439061"
      }
    ],
    "totalAmount": 44000,
    "address": {
      "Receiver_Name": "Jane Doe",
      "Receiver_MobileNumber": "9876543211",
      "Address_Line1": "123 Main Street",
      "Address_Line2": "Apt 4B",
      "City": "Mumbai",
      "pincode": "400001",
      "label": "Home"
    },
    "status": "Placed",
    "createdAt": "2023-12-20T10:00:00.000Z",
    "updatedAt": "2023-12-20T10:00:00.000Z"
  }
}
```

---

### Cancel Order

Cancel an existing order and restore stock.

**Endpoint:** `POST /api/v1/user/orders/cancel`

**Authentication Required:** Yes

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "orderId": "507f1f77bcf86cd799439051"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order cancelled successfully. Stock has been restored.",
  "order": {
    "_id": "507f1f77bcf86cd799439051",
    "userId": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "John Doe",
      "email": "john@example.com",
      "mobilenumber": "9876543210"
    },
    "products": [
      {
        "productId": {
          "_id": "507f1f77bcf86cd799439021",
          "name": "Smartphone XYZ",
          "brand": "BrandName",
          "thumbnail": {
            "url": "https://example.com/image.jpg",
            "publicId": "product_images/abc123"
          }
        },
        "variantId": "507f1f77bcf86cd799439031",
        "quantity": 2,
        "price": 22000,
        "_id": "507f1f77bcf86cd799439061"
      }
    ],
    "totalAmount": 44000,
    "address": {
      "Receiver_Name": "Jane Doe",
      "Receiver_MobileNumber": "9876543211",
      "Address_Line1": "123 Main Street",
      "Address_Line2": "Apt 4B",
      "City": "Mumbai",
      "pincode": "400001",
      "label": "Home"
    },
    "status": "cancelled",
    "createdAt": "2023-12-20T10:00:00.000Z",
    "updatedAt": "2023-12-20T10:15:00.000Z"
  }
}
```

**Error Responses:**

- `401` - User not authenticated
- `400` - Order ID is required
- `404` - Order not found
- `403` - You are not authorized to cancel this order
- `400` - Cannot cancel order. Order has already been shipped
- `400` - Cannot cancel order. Order has already been delivered
- `400` - Order is already cancelled

**Notes:**

- Stock is automatically restored when an order is cancelled
- Orders with status "Shipped" or "delivered" cannot be cancelled
- Only the user who placed the order can cancel it

---

## Common Response Codes

| Code  | Description                                               |
| ----- | --------------------------------------------------------- |
| `200` | Success                                                   |
| `201` | Created successfully                                      |
| `400` | Bad request - validation error or missing required fields |
| `401` | Unauthorized - authentication required or invalid token   |
| `403` | Forbidden - user doesn't have permission                  |
| `404` | Not found - resource doesn't exist                        |
| `500` | Internal server error                                     |

---

## Error Response Format

All errors follow this standard format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Data Models

### Product Variant Structure

```typescript
{
  _id: string;
  color?: string;
  size?: string;
  stock: number;
  mrp: number;
  sellingPrices: [
    {
      minQuantity: number;
      price: number;
      _id: string;
    }
  ];
  images?: [
    {
      url: string;
      publicId: string;
    }
  ];
  isActive: boolean;
}
```

### Address Structure

```typescript
{
  _id: string;
  Receiver_Name: string;
  Receiver_MobileNumber: string;
  Address_Line1: string;
  Address_Line2?: string;
  City: string;
  pincode: string;
  label: string; // "Home", "Office", "Other"
}
```

### Order Status Values

- `Placed` - Order has been placed
- `Shipped` - Order has been shipped
- `delivered` - Order has been delivered
- `cancelled` - Order has been cancelled

---

## Notes for Frontend Team

1. **Authentication Flow:**

   - Store both `access_token` and `refresh_token` securely (localStorage/secure storage)
   - Include `access_token` in Authorization header for protected endpoints
   - When access token expires, use `/auth/refresh` endpoint to get new tokens
   - If refresh fails, redirect user to login

2. **Price Calculation:**

   - Products have tiered pricing based on quantity
   - Always display the price that matches the selected quantity
   - The backend automatically selects the best price tier during order creation

3. **Stock Management:**

   - Check `variant.stock > 0` to determine if a product is available
   - Use the `inStock=true` filter in search to show only available products

4. **Pagination:**

   - Use `hasNextPage` and `hasPreviousPage` for pagination UI
   - Default page size is 10 for category products, 20 for search

5. **Image URLs:**

   - All image objects have `url` and `publicId` fields
   - Use the `url` field for displaying images

6. **Search Optimization:**

   - Use `/search/suggestions` endpoint for autocomplete features
   - Implement debouncing on search input (minimum 2 characters)
   - The search endpoint supports complex filtering - combine filters as needed

7. **Error Handling:**
   - Always check the `success` field in responses
   - Display `message` field to users for error feedback
   - Handle 401 errors by refreshing token or redirecting to login

---

## Example Usage (JavaScript/TypeScript)

### Login Example

```javascript
const login = async (mobilenumber, password) => {
  try {
    const response = await fetch(
      "https://your-api-domain.com/api/v1/user/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobilenumber, password }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
```

### Authenticated Request Example

```javascript
const getUserDetails = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      "https://your-api-domain.com/api/v1/user/user/details",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      return data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    throw error;
  }
};
```

### Search with Filters Example

```javascript
const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({
    q: query,
    ...filters, // { brand: 'Samsung', minPrice: 10000, inStock: true, ... }
  });

  try {
    const response = await fetch(
      `https://your-api-domain.com/api/v1/user/products/search?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};
```

---

## Support

For any questions or issues regarding the API, please contact the backend team.

**Last Updated:** December 23, 2025
**API Version:** 1.0
