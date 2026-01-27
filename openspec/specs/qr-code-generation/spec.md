## Purpose
Define QR code generation, customization, and slug requirements.

## ADDED
### Requirement: System generates unique QR code for each business
### Requirement: Business slug is unique and SEO-friendly
### Requirement: QR code is stored as SVG
### Requirement: Business owner can download QR code
### Requirement: QR code regeneration on slug change
### Requirement: QR code customization options
### Requirement: QR code error correction
### Requirement: QR code preview in admin panel
### Requirement: QR code analytics integration readiness
### Requirement: Bulk QR code generation for franchise support

## Requirements

### Requirement: System generates unique QR code for each business
The system SHALL automatically generate a unique QR code for each business upon registration.

#### Scenario: Business registration with QR code
- **WHEN** a new business is registered
- **THEN** the system generates a QR code that encodes the business's unique menu URL
- **AND** stores the QR code as an SVG string in the database

#### Scenario: QR code URL format
- **WHEN** a QR code is generated
- **THEN** the encoded URL follows the format `https://domain.com/menu/{businessSlug}`

### Requirement: Business slug is unique and SEO-friendly
The system MUST ensure that each business has a unique slug that is URL-safe and human-readable.

#### Scenario: Automatic slug generation
- **WHEN** a business is registered with a name
- **THEN** the system generates a slug by converting the name to lowercase, replacing spaces with hyphens, and removing special characters

#### Scenario: Duplicate slug prevention
- **WHEN** a business slug would conflict with an existing slug
- **THEN** the system appends a numeric suffix to ensure uniqueness

#### Scenario: Custom slug validation
- **WHEN** a business owner provides a custom slug
- **THEN** the system validates that the slug contains only lowercase letters, numbers, and hyphens
- **AND** ensures it does not exceed 50 characters

### Requirement: QR code is stored as SVG
The system SHALL store QR codes in SVG format for scalability and quality.

#### Scenario: SVG storage
- **WHEN** a QR code is generated
- **THEN** the system stores it as an SVG string in the Business table

#### Scenario: SVG rendering
- **WHEN** a business owner views their QR code in the admin panel
- **THEN** the system renders the SVG without quality loss at any size

### Requirement: Business owner can download QR code
The system SHALL allow business owners to download their QR code in multiple formats.

#### Scenario: Download QR code as SVG
- **WHEN** a business owner clicks "Download SVG"
- **THEN** the system downloads the QR code as a scalable SVG file

#### Scenario: Download QR code as PNG
- **WHEN** a business owner clicks "Download PNG"
- **THEN** the system converts the SVG to PNG at high resolution (1024x1024) and downloads it

#### Scenario: Download QR code as PDF
- **WHEN** a business owner clicks "Download PDF"
- **THEN** the system generates a print-ready PDF with the QR code centered on an A4 page

### Requirement: QR code regeneration on slug change
The system SHALL regenerate the QR code when a business slug is updated.

#### Scenario: Slug updated
- **WHEN** a business owner changes their business slug
- **THEN** the system generates a new QR code with the updated URL
- **AND** replaces the old QR code in the database

#### Scenario: Old URL redirect
- **WHEN** a customer scans an old QR code after slug change
- **THEN** the system redirects to the new menu URL

### Requirement: QR code customization options
The system SHALL provide basic customization options for QR codes.

#### Scenario: QR code with business logo
- **WHEN** a business owner uploads a logo
- **THEN** the system offers an option to embed the logo in the center of the QR code

#### Scenario: QR code color customization
- **WHEN** a business owner selects custom colors
- **THEN** the system generates the QR code with the specified foreground and background colors
- **AND** ensures sufficient contrast for scannability

#### Scenario: QR code validation after customization
- **WHEN** a QR code is customized
- **THEN** the system validates that the QR code is still scannable by testing error correction levels

### Requirement: QR code error correction
The system SHALL generate QR codes with medium error correction level (Level M) to ensure reliability.

#### Scenario: Damaged QR code scanning
- **WHEN** a printed QR code is slightly damaged or dirty
- **THEN** the QR code remains scannable due to error correction

### Requirement: QR code preview in admin panel
The system SHALL display a live preview of the QR code in the admin panel.

#### Scenario: QR code preview display
- **WHEN** a business owner navigates to the QR code management page
- **THEN** the system displays their current QR code with a live preview

#### Scenario: Test QR code functionality
- **WHEN** a business owner clicks "Test QR Code"
- **THEN** the system opens the menu page in a new tab to simulate customer experience

### Requirement: QR code analytics integration readiness
The system SHALL encode URLs in a way that supports future analytics tracking.

#### Scenario: URL with tracking parameters
- **WHEN** analytics are enabled in the future
- **THEN** the QR code URL can include tracking parameters without breaking existing codes

### Requirement: Bulk QR code generation for franchise support
The system SHALL support generating multiple QR codes for businesses with multiple locations.

#### Scenario: Multiple location QR codes
- **WHEN** a business has multiple locations registered as separate entities
- **THEN** each location receives a unique QR code with a location-specific slug
- **AND** all QR codes can be downloaded as a batch ZIP file
