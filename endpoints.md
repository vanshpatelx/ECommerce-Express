# Endpoints

## 1. Auth
- **POST** `/api/v1/register` - Adding new user
- **POST** `/api/v1/login` - Login user

## 2. Seller
- **POST** `/api/v1/seller` - Adding Seller
- **PATCH** `/api/v1/seller` - Updating Seller
- **GET** `/api/v1/inventory` - Get inventory - Seller

## 3. Product
- **POST** `/api/v1/product` - Adding Product - Seller
- **PATCH** `/api/v1/product` - Updating Product - Seller
- **DELETE** `/api/v1/product` - Delete Product - Seller
- **GET** `/api/v1/products` - Getting all products
- **GET** `/api/v1/product` - Getting Specific Product
- **GET** `/api/v1/products/seller` - Getting all specific seller Products
- **GET** `/api/v1/products/serach` - Get all products related


## 4. Order
- **POST** `/api/v1/order` - Creating order - Customer
- **PATCH** `/api/v1/order` - Updating order - Seller
- **PATCH** `/api/v1/order/status` - Updating order status - Seller

- **GET** `/api/v1/orders/customer` - Get all order details - Customer
- **GET** `/api/v1/order/customer` - Get order details - Customer
- **GET** `/api/v1/orders/seller` - Get all order details - Seller
- **GET** `/api/v1/order/seller` - Get order details - Seller



## 5. Customer
- **POST** `/api/v1/customer` - Adding customer
- **PATCH** `/api/v1/customer` - Updating customer

## 6. Wishlist
- **POST** `/api/v1/customer/wishlist` - Adding product to wishlist - Customer
- **PATCH** `/api/v1/customer/wishlist` - Updating product to wishlist - Customer
- **DELETE** `/api/v1/customer/wishlist` - Deleting product to wishlist - Customer
- **GET** `/api/v1/customer/wishlist` - Getting wishlist - Customer


## 7. Reviews
- **GET** `/api/v1/product/review` - Getting review for products - Customer
- **POST** `/api/v1/product/review` - Adding review for products - Customer
- **PATCH** `/api/v1/product/review` - Updating review for products - Customer
- **DELETE** `/api/v1/product/review` - Deleting review for products - Customer

- **GET** `/api/v1/product/review/seller` - Getting review for products from specific seller - Seller

## 8. Admin
- **GET** `/api/v1/admin/users` - Get all users
- **GET** `/api/v1/admin/customers` - Get all customers
- **GET** `/api/v1/admin/user/:userId` - Get specific user
- **GET** `/api/v1/admin/customer/:customerId` - Get specific customer

