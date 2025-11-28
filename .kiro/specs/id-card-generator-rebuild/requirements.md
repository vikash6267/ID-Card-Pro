# Requirements Document

## Introduction

This document specifies the requirements for rebuilding the ID Card Generator application from scratch. The system is a fully client-side web application that enables users to design professional ID cards using a visual canvas editor, import data from CSV files, and generate batch outputs in multiple formats (PNG, PDF, ZIP). The rebuild aims to modernize the architecture, improve performance, enhance UI/UX, and eliminate existing bugs while preserving all current functionality.

## Glossary

- **Canvas Editor**: The visual workspace where users design ID card templates using drag-and-drop elements
- **Element**: A visual component on the canvas (text, image, QR code, barcode, shape)
- **Template**: A reusable ID card design containing positioned elements and styling
- **Project**: A saved workspace containing template, CSV data, photos, and settings
- **Layer**: A z-indexed element in the canvas rendering order
- **Mask**: A PNG overlay that clips images to specific shapes
- **Token**: A placeholder in templates (e.g., {{name}}) replaced with CSV data during batch generation
- **Batch Generation**: The process of creating multiple ID cards from CSV data
- **Transform**: Operations including drag, resize, rotate on canvas elements
- **Snap Grid**: An invisible alignment grid for precise element positioning
- **Zoom Level**: The canvas magnification factor for detailed editing
- **Pan**: The ability to move the canvas viewport when zoomed
- **Export**: The process of saving designs as PNG, PDF, or ZIP files
- **CSV Import**: Loading tabular data from CSV files for batch generation
- **JSON Project**: A serialized project file containing all design and data
- **DPI**: Dots per inch, the resolution quality for exported images
- **Konva**: The React canvas library used for rendering and interactions
- **State Management**: Centralized application state using Zustand or Jotai
- **Component Library**: shadcn/ui components for consistent UI design

## Requirements

### Requirement 1: Canvas Editor Core

**User Story:** As a designer, I want to create and edit ID card templates on a visual canvas, so that I can design professional cards without coding.

#### Acceptance Criteria

1. WHEN the application loads THEN the Canvas Editor SHALL display a blank canvas with configurable dimensions
2. WHEN a user adds an element THEN the Canvas Editor SHALL render the element at the specified position with correct styling
3. WHEN a user drags an element THEN the Canvas Editor SHALL update the element position in real-time without lag
4. WHEN a user resizes an element THEN the Canvas Editor SHALL maintain aspect ratio when shift key is pressed
5. WHEN a user rotates an element THEN the Canvas Editor SHALL apply rotation transformation around the element center

### Requirement 2: Element Management

**User Story:** As a designer, I want to add, modify, and remove various element types, so that I can build complete ID card designs.

#### Acceptance Criteria

1. WHEN a user clicks "Add Text" THEN the Canvas Editor SHALL create a new text element with default styling
2. WHEN a user clicks "Add Image" THEN the Canvas Editor SHALL create a new image placeholder element
3. WHEN a user clicks "Add QR Code" THEN the Canvas Editor SHALL create a new QR code element with configurable content
4. WHEN a user clicks "Add Barcode" THEN the Canvas Editor SHALL create a new barcode element with configurable format
5. WHEN a user selects an element and presses Delete THEN the Canvas Editor SHALL remove the element from the canvas
6. WHEN a user double-clicks a text element THEN the Canvas Editor SHALL enable inline editing mode
7. WHEN a user double-clicks an image element THEN the Canvas Editor SHALL open an image upload dialog

### Requirement 3: Layer System

**User Story:** As a designer, I want to manage element layering and visibility, so that I can control the visual hierarchy of my design.

#### Acceptance Criteria

1. WHEN a user opens the layers panel THEN the System SHALL display all elements in z-index order
2. WHEN a user drags a layer in the panel THEN the System SHALL reorder the element z-index
3. WHEN a user clicks the visibility icon THEN the System SHALL toggle element visibility on the canvas
4. WHEN a user clicks the lock icon THEN the System SHALL prevent element transformations
5. WHEN a user clicks the duplicate icon THEN the System SHALL create an exact copy of the element
6. WHEN a user renames a layer THEN the System SHALL update the element identifier

### Requirement 4: Selection and Multi-Selection

**User Story:** As a designer, I want to select single or multiple elements, so that I can perform batch operations efficiently.

#### Acceptance Criteria

1. WHEN a user clicks an element THEN the System SHALL select that element and show transform handles
2. WHEN a user Ctrl+clicks multiple elements THEN the System SHALL add elements to the selection
3. WHEN a user drags a selection box THEN the System SHALL select all elements within the box bounds
4. WHEN multiple elements are selected THEN the System SHALL display a group bounding box with transform handles
5. WHEN a user transforms a group THEN the System SHALL apply transformations to all selected elements proportionally
6. WHEN a user clicks empty canvas THEN the System SHALL deselect all elements

### Requirement 5: Snap to Grid and Alignment

**User Story:** As a designer, I want elements to snap to grid lines and align with other elements, so that I can create pixel-perfect layouts.

#### Acceptance Criteria

1. WHEN snap to grid is enabled THEN the System SHALL snap element positions to the nearest grid point during drag
2. WHEN a user drags an element near another element edge THEN the System SHALL display alignment guides
3. WHEN alignment guides appear THEN the System SHALL snap the element to the aligned position
4. WHEN a user selects multiple elements and clicks "Align Left" THEN the System SHALL align all elements to the leftmost edge
5. WHEN a user selects multiple elements and clicks "Distribute Horizontally" THEN the System SHALL space elements evenly

### Requirement 6: Zoom and Pan

**User Story:** As a designer, I want to zoom and pan the canvas, so that I can work on detailed areas and navigate large designs.

#### Acceptance Criteria

1. WHEN a user scrolls with Ctrl pressed THEN the System SHALL zoom the canvas in or out
2. WHEN a user drags with Ctrl+left-click THEN the System SHALL pan the canvas viewport
3. WHEN zoom level changes THEN the System SHALL maintain the center point of the viewport
4. WHEN zoom level is below 100% THEN the System SHALL display the entire canvas with margins
5. WHEN zoom level is above 100% THEN the System SHALL enable scrollbars for navigation
6. WHEN a user clicks "Fit to Screen" THEN the System SHALL adjust zoom to show the entire canvas

### Requirement 7: Text Element Styling

**User Story:** As a designer, I want to style text elements with fonts, colors, and effects, so that I can create visually appealing text.

#### Acceptance Criteria

1. WHEN a user selects a text element THEN the System SHALL display font family, size, and color controls
2. WHEN a user changes font size THEN the System SHALL auto-adjust text to fit within element bounds
3. WHEN a user enables bold THEN the System SHALL apply bold font weight to the text
4. WHEN a user enables italic THEN the System SHALL apply italic font style to the text
5. WHEN a user enables underline THEN the System SHALL render an underline beneath the text
6. WHEN a user selects text alignment THEN the System SHALL align text left, center, or right within bounds
7. WHEN a user selects vertical alignment THEN the System SHALL align text top, middle, or bottom within bounds
8. WHEN a user enables gradient THEN the System SHALL apply gradient fill to text with configurable colors and angle
9. WHEN a user adds text stroke THEN the System SHALL render an outline around text characters
10. WHEN a user adds text shadow THEN the System SHALL render a shadow with configurable offset, blur, and color
11. WHEN a user selects text case THEN the System SHALL transform text to uppercase, lowercase, capitalize, or sentence case

### Requirement 8: Image Element Features

**User Story:** As a designer, I want to add and style images with borders, shadows, and masks, so that I can create professional photo layouts.

#### Acceptance Criteria

1. WHEN a user uploads an image THEN the System SHALL store the image as base64 data
2. WHEN a user applies a mask THEN the System SHALL clip the image to the mask shape
3. WHEN a user adds image stroke THEN the System SHALL render a border around the image
4. WHEN a user adds image shadow THEN the System SHALL render a shadow with configurable properties
5. WHEN a user rotates an image THEN the System SHALL maintain image quality without pixelation
6. WHEN a user sets image opacity THEN the System SHALL render the image with the specified transparency level
7. WHEN an image has transparency THEN the System SHALL apply stroke as a drop-shadow filter instead of border

### Requirement 9: QR Code and Barcode Elements

**User Story:** As a designer, I want to add QR codes and barcodes that encode dynamic data, so that I can create scannable ID cards.

#### Acceptance Criteria

1. WHEN a user adds a QR code element THEN the System SHALL display a settings panel for content configuration
2. WHEN a user selects CSV fields for QR content THEN the System SHALL encode the selected fields in the QR code
3. WHEN a user enters custom QR text THEN the System SHALL encode the custom text in the QR code
4. WHEN a user selects barcode format THEN the System SHALL generate the barcode in the selected format (Code128, DataMatrix, PDF417)
5. WHEN QR or barcode content changes THEN the System SHALL regenerate the code in real-time
6. WHEN a user exports cards THEN the System SHALL render QR codes and barcodes at high resolution (300 DPI)

### Requirement 10: CSV Data Import

**User Story:** As a user, I want to import CSV files with data, so that I can generate multiple ID cards with different information.

#### Acceptance Criteria

1. WHEN a user uploads a CSV file THEN the System SHALL parse the file and extract headers and rows
2. WHEN CSV data is loaded THEN the System SHALL display the data in an editable table
3. WHEN a user edits a cell in the table THEN the System SHALL update the corresponding data value
4. WHEN a user adds a new row THEN the System SHALL append the row to the dataset
5. WHEN a user deletes a row THEN the System SHALL remove the row from the dataset
6. WHEN a user links an element to a CSV column THEN the System SHALL display the current record's value in that element
7. WHEN a user navigates records THEN the System SHALL update all linked elements with the new record's data

### Requirement 11: Photo Upload and Management

**User Story:** As a user, I want to upload and manage photos for batch generation, so that each ID card can have a unique photo.

#### Acceptance Criteria

1. WHEN a user uploads photos THEN the System SHALL store photos with unique identifiers
2. WHEN a user uploads multiple photos THEN the System SHALL batch process all photos
3. WHEN a user views the photo gallery THEN the System SHALL display all uploaded photos with thumbnails
4. WHEN a user rotates a photo in the gallery THEN the System SHALL apply rotation to that photo instance
5. WHEN a user deletes a photo THEN the System SHALL remove the photo from storage
6. WHEN CSV data contains photo filenames THEN the System SHALL match filenames to uploaded photos
7. WHEN a photo is missing THEN the System SHALL display a placeholder image

### Requirement 12: Photo Cropping and Masking

**User Story:** As a user, I want to crop photos and apply masks, so that photos fit perfectly in the ID card design.

#### Acceptance Criteria

1. WHEN a user opens the crop tool THEN the System SHALL display a crop interface with adjustable handles
2. WHEN a user adjusts crop dimensions THEN the System SHALL update the crop area in real-time
3. WHEN a user saves a crop THEN the System SHALL generate a cropped image and update the photo
4. WHEN a user enables batch cropping THEN the System SHALL apply the same crop dimensions to all photos sequentially
5. WHEN a user uploads a mask PNG THEN the System SHALL store the mask for later application
6. WHEN a user enables mask application THEN the System SHALL clip all dynamic images to the mask shape
7. WHEN a user disables mask application THEN the System SHALL restore original uncropped images

### Requirement 13: Background Management

**User Story:** As a designer, I want to set static or dynamic backgrounds, so that cards can have different backgrounds based on data.

#### Acceptance Criteria

1. WHEN a user uploads a background image THEN the System SHALL set it as the canvas background
2. WHEN a user selects dynamic background mode THEN the System SHALL display background group configuration
3. WHEN a user creates a background group THEN the System SHALL associate CSV values with a background image
4. WHEN a user assigns values to a group THEN the System SHALL use that background when CSV data matches
5. WHEN a user creates an "All Values" group THEN the System SHALL use that background as a fallback
6. WHEN a user creates a "Blank Values" group THEN the System SHALL use that background for empty CSV cells
7. WHEN generating cards THEN the System SHALL select the correct background based on the current record's data

### Requirement 14: Project Management

**User Story:** As a user, I want to save, load, and manage multiple projects, so that I can work on different ID card designs.

#### Acceptance Criteria

1. WHEN a user creates a new project THEN the System SHALL initialize an empty project with default settings
2. WHEN a user saves a project THEN the System SHALL serialize the template, CSV data, photos, and settings to localStorage
3. WHEN a user loads a project THEN the System SHALL restore all project data and render the canvas
4. WHEN a user renames a project THEN the System SHALL update the project name in storage
5. WHEN a user deletes a project THEN the System SHALL remove the project from storage after confirmation
6. WHEN a user exports a project THEN the System SHALL generate a JSON file containing all project data
7. WHEN a user imports a project file THEN the System SHALL parse the JSON and load the project
8. WHEN the application loads THEN the System SHALL restore the last opened project automatically

### Requirement 15: Undo and Redo

**User Story:** As a designer, I want to undo and redo changes, so that I can experiment without fear of losing work.

#### Acceptance Criteria

1. WHEN a user makes a change THEN the System SHALL record the change in the history stack
2. WHEN a user presses Ctrl+Z THEN the System SHALL undo the last change
3. WHEN a user presses Ctrl+Y THEN the System SHALL redo the last undone change
4. WHEN the history stack is empty THEN the System SHALL disable the undo button
5. WHEN the redo stack is empty THEN the System SHALL disable the redo button
6. WHEN a new change is made after undo THEN the System SHALL clear the redo stack

### Requirement 16: Keyboard Shortcuts

**User Story:** As a designer, I want to use keyboard shortcuts, so that I can work efficiently without reaching for the mouse.

#### Acceptance Criteria

1. WHEN a user presses Delete THEN the System SHALL delete all selected elements
2. WHEN a user presses Ctrl+C THEN the System SHALL copy selected elements to clipboard
3. WHEN a user presses Ctrl+V THEN the System SHALL paste clipboard elements to canvas
4. WHEN a user presses Ctrl+D THEN the System SHALL duplicate selected elements
5. WHEN a user presses Ctrl+A THEN the System SHALL select all elements on the canvas
6. WHEN a user presses Ctrl+S THEN the System SHALL save the current project
7. WHEN a user presses Arrow keys THEN the System SHALL nudge selected elements by 1 pixel
8. WHEN a user presses Shift+Arrow keys THEN the System SHALL nudge selected elements by 10 pixels

### Requirement 17: Card Size Configuration

**User Story:** As a designer, I want to configure card dimensions, so that I can create cards in standard or custom sizes.

#### Acceptance Criteria

1. WHEN a user opens size settings THEN the System SHALL display width and height inputs in millimeters
2. WHEN a user changes card width THEN the System SHALL resize the canvas width
3. WHEN a user changes card height THEN the System SHALL resize the canvas height
4. WHEN a user selects a preset size THEN the System SHALL apply the preset dimensions
5. WHEN card size changes THEN the System SHALL maintain element positions relative to canvas
6. WHEN exporting THEN the System SHALL use the configured dimensions for output files

### Requirement 18: Batch Card Generation

**User Story:** As a user, I want to generate multiple ID cards from CSV data, so that I can produce cards for all records efficiently.

#### Acceptance Criteria

1. WHEN a user clicks "Generate Cards" THEN the System SHALL validate that template and CSV data exist
2. WHEN generation starts THEN the System SHALL display a progress indicator
3. WHEN generating each card THEN the System SHALL replace all token placeholders with CSV data
4. WHEN generating each card THEN the System SHALL render the card at 300 DPI resolution
5. WHEN a user specifies a card range THEN the System SHALL generate only cards within that range
6. WHEN generation completes THEN the System SHALL display all generated card previews
7. WHEN generation fails THEN the System SHALL display an error message with details

### Requirement 19: Export to PNG

**User Story:** As a user, I want to export individual cards as PNG images, so that I can use them in other applications.

#### Acceptance Criteria

1. WHEN a user clicks "Export PNG" on a card THEN the System SHALL generate a high-resolution PNG file
2. WHEN exporting PNG THEN the System SHALL render the card at 300 DPI with pixelRatio of 3
3. WHEN exporting PNG THEN the System SHALL include all elements with correct styling and transformations
4. WHEN exporting PNG THEN the System SHALL apply masks and backgrounds correctly
5. WHEN export completes THEN the System SHALL trigger a browser download with the PNG file
6. WHEN export fails THEN the System SHALL display an error message

### Requirement 20: Export to PDF

**User Story:** As a user, I want to export cards as PDF documents, so that I can print them professionally.

#### Acceptance Criteria

1. WHEN a user clicks "Export PDF" THEN the System SHALL display PDF layout configuration options
2. WHEN a user selects page size THEN the System SHALL calculate card positions for that page size
3. WHEN a user sets margins THEN the System SHALL adjust card positions to respect margins
4. WHEN a user sets spacing THEN the System SHALL space cards horizontally and vertically
5. WHEN generating PDF THEN the System SHALL fit maximum cards per page based on layout settings
6. WHEN generating PDF THEN the System SHALL create multiple pages if cards exceed one page
7. WHEN PDF generation completes THEN the System SHALL trigger a browser download with the PDF file

### Requirement 21: Export to ZIP

**User Story:** As a user, I want to export all cards as a ZIP archive, so that I can download all cards at once.

#### Acceptance Criteria

1. WHEN a user clicks "Export ZIP" THEN the System SHALL generate PNG files for all cards
2. WHEN generating ZIP THEN the System SHALL display progress for each card being processed
3. WHEN generating ZIP THEN the System SHALL name files based on CSV data (e.g., name_id.png)
4. WHEN generating ZIP THEN the System SHALL compress all PNG files into a single ZIP archive
5. WHEN ZIP generation completes THEN the System SHALL trigger a browser download with the ZIP file
6. WHEN ZIP generation fails THEN the System SHALL display an error message with details

### Requirement 22: Multi-Project Batch Generation

**User Story:** As a user, I want to generate cards from multiple projects simultaneously, so that I can produce cards for different departments or groups.

#### Acceptance Criteria

1. WHEN a user opens project selection THEN the System SHALL display all available projects with checkboxes
2. WHEN a user selects multiple projects THEN the System SHALL enable batch generation mode
3. WHEN a user starts batch generation THEN the System SHALL generate cards from all selected projects
4. WHEN generating from multiple projects THEN the System SHALL organize output by project name
5. WHEN batch generation completes THEN the System SHALL create a ZIP file with project folders

### Requirement 23: Front and Back Card Sides

**User Story:** As a designer, I want to design both front and back sides of ID cards, so that I can create double-sided cards.

#### Acceptance Criteria

1. WHEN a user switches to "Back" side THEN the System SHALL display the back side canvas
2. WHEN a user switches to "Front" side THEN the System SHALL display the front side canvas
3. WHEN a user adds elements to a side THEN the System SHALL store elements separately for each side
4. WHEN generating cards THEN the System SHALL render both front and back sides
5. WHEN exporting PDF THEN the System SHALL arrange front and back sides according to layout settings
6. WHEN exporting ZIP THEN the System SHALL name files with _front and _back suffixes

### Requirement 24: Performance Optimization

**User Story:** As a user, I want the application to perform smoothly without lag, so that I can work efficiently.

#### Acceptance Criteria

1. WHEN dragging elements THEN the System SHALL update positions without visible lag or stuttering
2. WHEN resizing elements THEN the System SHALL render transformations at 60 FPS minimum
3. WHEN rendering canvas THEN the System SHALL use memoization to prevent unnecessary re-renders
4. WHEN handling mouse events THEN the System SHALL debounce heavy operations
5. WHEN loading large images THEN the System SHALL display loading indicators
6. WHEN generating batch cards THEN the System SHALL process cards asynchronously without blocking UI
7. WHEN the canvas has many elements THEN the System SHALL maintain smooth interactions

### Requirement 25: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can understand and fix issues.

#### Acceptance Criteria

1. WHEN a file upload fails THEN the System SHALL display an error message with the failure reason
2. WHEN CSV parsing fails THEN the System SHALL display an error message with the problematic row
3. WHEN image loading fails THEN the System SHALL display a placeholder and error notification
4. WHEN export fails THEN the System SHALL display an error message with troubleshooting steps
5. WHEN localStorage is full THEN the System SHALL display a warning and suggest cleanup
6. WHEN an unexpected error occurs THEN the System SHALL log the error and display a user-friendly message

### Requirement 26: Responsive UI Design

**User Story:** As a user, I want a clean and intuitive interface, so that I can focus on designing without confusion.

#### Acceptance Criteria

1. WHEN the application loads THEN the System SHALL display a three-panel layout (tools, canvas, layers)
2. WHEN panels are resizable THEN the System SHALL save panel sizes to localStorage
3. WHEN the window resizes THEN the System SHALL adjust the layout responsively
4. WHEN using dark mode THEN the System SHALL apply dark theme colors consistently
5. WHEN using light mode THEN the System SHALL apply light theme colors consistently
6. WHEN hovering over buttons THEN the System SHALL display tooltips with descriptions
7. WHEN performing actions THEN the System SHALL display toast notifications for feedback

### Requirement 27: Autosave

**User Story:** As a user, I want my work to be saved automatically, so that I don't lose progress if I forget to save.

#### Acceptance Criteria

1. WHEN a user makes changes THEN the System SHALL autosave the project after 5 seconds of inactivity
2. WHEN autosave occurs THEN the System SHALL display a subtle notification
3. WHEN autosave fails THEN the System SHALL display a warning and retry
4. WHEN the user manually saves THEN the System SHALL reset the autosave timer
5. WHEN the application closes THEN the System SHALL save the current project state
