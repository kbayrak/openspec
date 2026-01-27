## Purpose
Define admin management requirements for categories and products.

## ADDED
### Requirement: Business owner can create categories
### Requirement: Business owner can update categories
### Requirement: Business owner can delete categories
### Requirement: Business owner can create products
### Requirement: Business owner can update products
### Requirement: Business owner can delete products
### Requirement: Multi-language product management
### Requirement: Data isolation between businesses
### Requirement: Real-time menu updates
### Requirement: Bulk operations support

## Requirements

### Requirement: Business owner can create categories
The system SHALL allow authenticated business owners to create new menu categories.

#### Scenario: Successful category creation
- **WHEN** a business owner submits a valid category name
- **THEN** the system creates the category and adds it to the business's menu
- **AND** the category appears in the admin panel category list

#### Scenario: Duplicate category name
- **WHEN** a business owner attempts to create a category with a name that already exists
- **THEN** the system rejects the request and displays an error message

#### Scenario: Empty category name
- **WHEN** a business owner submits an empty category name
- **THEN** the system rejects the request and displays a validation error

### Requirement: Business owner can update categories
The system SHALL allow authenticated business owners to update existing category information.

#### Scenario: Successful category update
- **WHEN** a business owner updates a category name
- **THEN** the system saves the changes and reflects them immediately in both admin panel and public menu

#### Scenario: Update category order
- **WHEN** a business owner changes the display order of categories
- **THEN** the system updates the order and displays categories in the new order

### Requirement: Business owner can delete categories
The system SHALL allow authenticated business owners to delete categories from their menu.

#### Scenario: Delete empty category
- **WHEN** a business owner deletes a category with no products
- **THEN** the system removes the category permanently

#### Scenario: Delete category with products
- **WHEN** a business owner attempts to delete a category that contains products
- **THEN** the system displays a confirmation warning about orphaned products
- **AND** requires explicit confirmation before deletion

#### Scenario: Cascade delete confirmation
- **WHEN** a business owner confirms deletion of a category with products
- **THEN** the system deletes the category and all associated products

### Requirement: Business owner can create products
The system SHALL allow authenticated business owners to create new products within a category.

#### Scenario: Successful product creation
- **WHEN** a business owner submits a valid product with name, price, and category
- **THEN** the system creates the product and displays it in the selected category

#### Scenario: Product with image upload
- **WHEN** a business owner uploads an image while creating a product
- **THEN** the system stores the image and associates it with the product

#### Scenario: Product without image
- **WHEN** a business owner creates a product without an image
- **THEN** the system creates the product and uses a placeholder image

#### Scenario: Invalid product price
- **WHEN** a business owner submits a negative or non-numeric price
- **THEN** the system rejects the request and displays a validation error

### Requirement: Business owner can update products
The system SHALL allow authenticated business owners to update existing product information.

#### Scenario: Successful product update
- **WHEN** a business owner updates product fields (name, description, price)
- **THEN** the system saves the changes and reflects them in the public menu

#### Scenario: Update product image
- **WHEN** a business owner uploads a new image for a product
- **THEN** the system replaces the old image with the new one

#### Scenario: Move product to different category
- **WHEN** a business owner changes the category of a product
- **THEN** the system moves the product to the new category

### Requirement: Business owner can delete products
The system SHALL allow authenticated business owners to delete products from their menu.

#### Scenario: Successful product deletion
- **WHEN** a business owner deletes a product
- **THEN** the system removes the product permanently from the menu

#### Scenario: Bulk product deletion
- **WHEN** a business owner selects multiple products and deletes them
- **THEN** the system removes all selected products after confirmation

### Requirement: Multi-language product management
The system SHALL allow business owners to manage product information in multiple languages.

#### Scenario: Add product translation
- **WHEN** a business owner adds a translation for product name and description
- **THEN** the system stores the translation and displays it to customers who select that language

#### Scenario: Edit existing translation
- **WHEN** a business owner updates a translation
- **THEN** the system saves the changes for that specific language without affecting other languages

#### Scenario: Delete translation
- **WHEN** a business owner removes a translation
- **THEN** the system falls back to the default language for customers who selected the removed language

### Requirement: Data isolation between businesses
The system MUST ensure that business owners can only view and modify their own menu data.

#### Scenario: Unauthorized category access
- **WHEN** a business owner attempts to access another business's category
- **THEN** the system denies access and returns a 403 Forbidden error

#### Scenario: Unauthorized product modification
- **WHEN** a business owner attempts to modify a product belonging to another business
- **THEN** the system denies the request and logs the attempt

### Requirement: Real-time menu updates
The system SHALL ensure that changes made in the admin panel are reflected in the public menu view immediately.

#### Scenario: Product created
- **WHEN** a business owner creates a new product
- **THEN** customers viewing the menu see the new product within 60 seconds

#### Scenario: Category deleted
- **WHEN** a business owner deletes a category
- **THEN** customers viewing the menu no longer see that category within 60 seconds

### Requirement: Bulk operations support
The system SHALL allow business owners to perform bulk operations on multiple items.

#### Scenario: Bulk category reordering
- **WHEN** a business owner reorders multiple categories via drag-and-drop
- **THEN** the system updates the display order for all affected categories

#### Scenario: Bulk product status change
- **WHEN** a business owner selects multiple products and marks them as active/inactive
- **THEN** the system updates the visibility status for all selected products
