# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure





  - Initialize Vite + React 18 project with TypeScript support
  - Install and configure dependencies (React-Konva, Zustand, TailwindCSS, shadcn/ui, jsPDF, JSZip, PapaParse, QRCode, bwip-js, Day.js, fast-check)
  - Set up project folder structure (components, stores, hooks, lib, services, types)
  - Configure TailwindCSS with custom theme
  - Set up ESLint and Prettier
  - _Requirements: All_

- [x] 1.1 Set up Vitest testing framework


  - Install Vitest and React Testing Library
  - Configure test environment
  - Create test utilities and helpers
  - _Requirements: All_

- [ ] 2. Implement Zustand State Stores
  - Create Canvas Store (elements, selection, transformations)
  - Create Project Store (projects, current project, save/load)
  - Create Data Store (CSV data, photos, current record)
  - Create UI Store (zoom, pan, active panels, theme, modals)
  - Create History Store (undo/redo stack)
  - _Requirements: 1.1, 1.2, 14.1, 14.2, 15.1_

- [ ] 2.1 Write property test for Canvas Store element operations
  - **Property 1: Element Rendering Consistency**
  - **Validates: Requirements 1.2**

- [ ] 2.2 Write property test for selection logic
  - **Property 10: Multi-Selection Accumulation**
  - **Validates: Requirements 4.2**

- [ ] 2.3 Write property test for undo/redo
  - **Property 43: Undo/Redo Round Trip**
  - **Validates: Requirements 15.2, 15.3**

- [ ] 3. Build shadcn/ui Component Library
  - Install shadcn/ui CLI and initialize
  - Add Button, Input, Label, Select, Slider, Switch, Card, Modal, Tabs, Tooltip components
  - Create custom theme with dark/light mode support
  - Build reusable UI primitives
  - _Requirements: 26.1, 26.4, 26.5_

- [ ] 4. Implement Utility Functions and Helpers
  - Create coordinate transformation utilities (mmToPixels, pixelsToMm, rotatePoint)
  - Create color conversion utilities
  - Create file validation utilities
  - Create serialization/deserialization utilities
  - Create error handling utilities
  - _Requirements: 17.1, 17.2, 25.1_

- [ ] 4.1 Write unit tests for transformation utilities
  - Test mmToPixels, pixelsToMm conversions
  - Test rotatePoint calculations
  - _Requirements: 17.1, 17.2_

- [ ] 4.2 Write unit tests for validation utilities
  - Test CSV file validation
  - Test image file validation
  - Test dimension validation
  - _Requirements: 25.1, 25.2_

- [ ] 5. Build CanvasEditor Component with React-Konva
  - Create base CanvasEditor component with Stage and Layer
  - Implement canvas background rendering
  - Set up zoom and pan controls
  - Add grid overlay (optional, toggleable)
  - _Requirements: 1.1, 6.1, 6.2, 6.3_

- [ ] 5.1 Write property test for zoom center invariance
  - **Property 16: Zoom Center Point Invariance**
  - **Validates: Requirements 6.3**

- [ ] 6. Implement Element Rendering System
  - Create base Element component wrapper
  - Create TextElement renderer with Konva.Text
  - Create ImageElement renderer with Konva.Image
  - Create QRCodeElement renderer
  - Create BarcodeElement renderer
  - Implement z-index layering
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 3.1_

- [ ] 6.1 Write property test for z-index ordering
  - **Property 5: Layer Z-Index Ordering**
  - **Validates: Requirements 3.1**

- [ ] 7. Implement Element Transformation System
  - Add Konva.Transformer for resize and rotate handles
  - Implement drag functionality with bounds checking
  - Implement resize with aspect ratio locking (shift key)
  - Implement rotation with center point preservation
  - Add transform event handlers
  - _Requirements: 1.3, 1.4, 1.5_

- [ ] 7.1 Write property test for aspect ratio preservation
  - **Property 2: Aspect Ratio Preservation During Resize**
  - **Validates: Requirements 1.4**

- [ ] 7.2 Write property test for rotation center invariance
  - **Property 3: Rotation Center Invariance**
  - **Validates: Requirements 1.5**

- [ ] 8. Implement Selection and Multi-Selection
  - Add single element selection on click
  - Add multi-selection with Ctrl+click
  - Add selection box drag functionality
  - Implement group bounding box calculation
  - Add group transformation logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 8.1 Write property test for selection box intersection
  - **Property 11: Selection Box Intersection**
  - **Validates: Requirements 4.3**

- [ ] 8.2 Write property test for group transformation proportionality
  - **Property 12: Group Transformation Proportionality**
  - **Validates: Requirements 4.5**

- [ ] 9. Implement Snap-to-Grid and Alignment
  - Add snap-to-grid logic during drag
  - Implement alignment guide detection
  - Render alignment guide lines
  - Add snap-to-alignment functionality
  - Create alignment tools (align left, center, right, top, middle, bottom)
  - Create distribution tools (horizontal, vertical)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9.1 Write property test for grid snapping
  - **Property 13: Grid Snapping Quantization**
  - **Validates: Requirements 5.1**

- [ ] 9.2 Write property test for horizontal distribution
  - **Property 15: Distribute Horizontal Equal Spacing**
  - **Validates: Requirements 5.5**

- [ ] 10. Build Text Element Styling System
  - Create TextStylePanel component
  - Add font family selector
  - Add font size slider with auto-fit logic
  - Add bold, italic, underline toggles
  - Add text alignment controls (left, center, right)
  - Add vertical alignment controls (top, middle, bottom)
  - Add text case transformation selector
  - Add gradient fill controls
  - Add stroke (outline) controls
  - Add shadow controls
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_

- [ ] 10.1 Write property test for text auto-fit
  - **Property 17: Text Auto-Fit Within Bounds**
  - **Validates: Requirements 7.2**

- [ ] 10.2 Write property test for text case transformation
  - **Property 19: Text Case Transformation**
  - **Validates: Requirements 7.11**

- [ ] 11. Build Image Element Features
  - Create ImageUpload component
  - Implement base64 image storage
  - Add image opacity controls
  - Add image stroke controls
  - Add image shadow controls
  - Implement transparent image detection
  - Apply drop-shadow filter for transparent images
  - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 11.1 Write property test for image upload storage
  - **Property 20: Image Upload Base64 Storage**
  - **Validates: Requirements 8.1**

- [ ] 11.2 Write property test for transparent image stroke
  - **Property 23: Transparent Image Stroke Rendering**
  - **Validates: Requirements 8.7**

- [ ] 12. Implement Photo Masking System
  - Create MaskUpload component
  - Implement mask application using canvas compositing
  - Add mask enable/disable toggle
  - Store masked and original images separately
  - Implement mask restoration on disable
  - _Requirements: 8.2, 12.5, 12.6, 12.7_

- [ ] 12.1 Write property test for mask clipping
  - **Property 21: Mask Clipping Correctness**
  - **Validates: Requirements 8.2**

- [ ] 12.2 Write property test for mask enable/disable round trip
  - **Property 39: Mask Enable/Disable Round Trip**
  - **Validates: Requirements 12.7**

- [ ] 13. Build QR Code and Barcode Elements
  - Create QRCodeElement component with QRCode.js
  - Add QR code settings panel (format, content, CSV fields)
  - Implement barcode generation with bwip-js
  - Add barcode format selector (Code128, DataMatrix, PDF417)
  - Implement content reactivity (regenerate on change)
  - Ensure high-resolution rendering (300 DPI)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 13.1 Write property test for QR code content encoding
  - **Property 24: QR Code Content Encoding**
  - **Validates: Requirements 9.2, 9.3**

- [ ] 13.2 Write property test for barcode format generation
  - **Property 25: Barcode Format Generation**
  - **Validates: Requirements 9.4**

- [ ] 13.3 Write property test for QR/barcode reactivity
  - **Property 26: QR/Barcode Reactivity**
  - **Validates: Requirements 9.5**

- [ ] 14. Implement CSV Import and Data Management
  - Create CSVUpload component
  - Implement CSV parsing with PapaParse
  - Create CSVEditor component with editable table
  - Add row addition and deletion
  - Add cell editing functionality
  - Implement data validation
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 14.1 Write property test for CSV parsing completeness
  - **Property 28: CSV Parsing Completeness**
  - **Validates: Requirements 10.1**

- [ ] 14.2 Write property test for CSV row operations
  - **Property 30: CSV Row Addition**
  - **Property 31: CSV Row Deletion**
  - **Validates: Requirements 10.4, 10.5**

- [ ] 15. Implement Data Binding System
  - Create element-to-column linking UI
  - Implement token replacement logic
  - Add record navigation controls
  - Update all linked elements on record change
  - Display current record data in canvas
  - _Requirements: 10.6, 10.7_

- [ ] 15.1 Write property test for element-column data binding
  - **Property 32: Element-Column Data Binding**
  - **Validates: Requirements 10.6**

- [ ] 15.2 Write property test for record navigation updates
  - **Property 33: Record Navigation Updates All Linked Elements**
  - **Validates: Requirements 10.7**

- [ ] 16. Build Photo Gallery and Management
  - Create PhotoGallery component
  - Implement photo upload with drag-and-drop
  - Add photo thumbnail grid
  - Implement photo rotation controls
  - Add photo deletion
  - Implement photo-to-CSV filename matching
  - Display placeholder for missing photos
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 16.1 Write property test for photo unique identification
  - **Property 34: Photo Upload Unique Identification**
  - **Validates: Requirements 11.1**

- [ ] 16.2 Write property test for photo filename matching
  - **Property 36: Photo Filename Matching**
  - **Validates: Requirements 11.6**

- [ ] 17. Implement Photo Cropping System
  - Create CropModal component
  - Implement manual crop with adjustable handles
  - Add crop dimension inputs (width, height in mm)
  - Implement aspect ratio locking
  - Add batch cropping mode
  - Auto-advance to next photo after crop
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 17.1 Write property test for crop dimension application
  - **Property 37: Crop Dimension Application**
  - **Validates: Requirements 12.3**

- [ ] 17.2 Write property test for batch crop consistency
  - **Property 38: Batch Crop Consistency**
  - **Validates: Requirements 12.4**

- [ ] 18. Implement Background Management
  - Create BackgroundUpload component
  - Add static background mode
  - Add dynamic background mode with group configuration
  - Implement background group creation
  - Add value-to-background mapping
  - Implement "All Values" and "Blank Values" special groups
  - Add background selection logic during generation
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 18.1 Write property test for dynamic background selection
  - **Property 40: Dynamic Background Selection**
  - **Validates: Requirements 13.7**

- [ ] 19. Build LayersPanel Component
  - Create LayersPanel with layer list
  - Implement drag-and-drop reordering
  - Add visibility toggle icons
  - Add lock toggle icons
  - Add delete, duplicate, rename actions
  - Display layer thumbnails
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 19.1 Write property test for layer reordering
  - **Property 6: Layer Reordering Correctness**
  - **Validates: Requirements 3.2**

- [ ] 19.2 Write property test for visibility toggle
  - **Property 7: Visibility Toggle Consistency**
  - **Validates: Requirements 3.3**

- [ ] 19.3 Write property test for lock prevents transformation
  - **Property 8: Lock Prevents Transformation**
  - **Validates: Requirements 3.4**

- [ ] 19.4 Write property test for duplicate creates exact copy
  - **Property 9: Duplicate Creates Exact Copy**
  - **Validates: Requirements 3.5**

- [ ] 20. Build ToolsPanel Component
  - Create ToolsPanel with tool buttons
  - Add "Add Text" button
  - Add "Add Image" button
  - Add "Add QR Code" button
  - Add "Add Barcode" button
  - Add CSV upload button
  - Add project import/export buttons
  - Add card size configuration
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.1, 14.6, 14.7, 17.1_

- [ ] 21. Build TopBar Component
  - Create TopBar with project controls
  - Add project selector dropdown
  - Add save button with last saved timestamp
  - Add undo/redo buttons
  - Add zoom level display and controls
  - Add export buttons (PNG, PDF, ZIP)
  - _Requirements: 14.2, 15.2, 15.3, 19.1, 20.1, 21.1_

- [ ] 22. Implement Project Management System
  - Create project CRUD operations
  - Implement project save to localStorage
  - Implement project load from localStorage
  - Add project rename functionality
  - Add project delete with confirmation
  - Implement project export to JSON file
  - Implement project import from JSON file
  - Add last opened project restoration
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [ ] 22.1 Write property test for project save/load round trip
  - **Property 41: Project Save/Load Round Trip**
  - **Validates: Requirements 14.3**

- [ ] 22.2 Write property test for project export/import round trip
  - **Property 42: Project Export/Import Round Trip**
  - **Validates: Requirements 14.7**

- [ ] 23. Implement Undo/Redo System
  - Create history stack management
  - Implement change recording
  - Add undo functionality (Ctrl+Z)
  - Add redo functionality (Ctrl+Y)
  - Implement redo stack clearing on new change
  - Update UI button states based on stack status
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 23.1 Write property test for history stack clearing
  - **Property 44: History Stack Clearing After New Change**
  - **Validates: Requirements 15.6**

- [ ] 24. Implement Keyboard Shortcuts
  - Create keyboard event handler hook
  - Add Delete key for element deletion
  - Add Ctrl+C for copy
  - Add Ctrl+V for paste
  - Add Ctrl+D for duplicate
  - Add Ctrl+A for select all
  - Add Ctrl+S for save
  - Add Arrow keys for nudge (1px)
  - Add Shift+Arrow keys for nudge (10px)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 25. Implement Card Size Configuration
  - Create CardSizePanel component
  - Add width and height inputs (in mm)
  - Add preset size buttons (CR80, A4, custom)
  - Implement canvas resize on dimension change
  - Maintain element relative positions on resize
  - Update export dimensions
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 25.1 Write property test for card dimension resize
  - **Property 45: Card Dimension Resize**
  - **Validates: Requirements 17.2, 17.3**

- [ ] 25.2 Write property test for element position invariance
  - **Property 46: Element Position Invariance on Canvas Resize**
  - **Validates: Requirements 17.5**

- [ ] 26. Implement Front/Back Card Sides
  - Add side selector (Front/Back tabs)
  - Store elements separately for each side
  - Switch canvas view on side change
  - Ensure side independence
  - Render both sides during generation
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

- [ ] 26.1 Write property test for front/back side independence
  - **Property 53: Front/Back Side Independence**
  - **Validates: Requirements 23.3**

- [ ] 27. Build Batch Card Generator
  - Create BatchGenerator component
  - Implement card range parsing
  - Add progress indicator
  - Implement token replacement for each record
  - Render cards at 300 DPI
  - Generate card previews
  - Handle generation errors gracefully
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [ ] 27.1 Write property test for token replacement
  - **Property 47: Token Replacement Completeness**
  - **Validates: Requirements 18.3**

- [ ] 27.2 Write property test for card generation resolution
  - **Property 48: Card Generation Resolution**
  - **Validates: Requirements 18.4**

- [ ] 27.3 Write property test for card range generation
  - **Property 49: Card Range Generation**
  - **Validates: Requirements 18.5**

- [ ] 28. Implement PNG Export
  - Create PNG export service
  - Render canvas to high-resolution image (300 DPI, pixelRatio 3)
  - Include all elements with correct styling
  - Apply masks and backgrounds
  - Trigger browser download
  - Handle export errors
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [ ] 28.1 Write property test for PNG export quality
  - **Property 50: PNG Export Quality**
  - **Validates: Requirements 19.2**

- [ ] 29. Implement PDF Export
  - Create PDFExportModal component
  - Add page size selector
  - Add margin and spacing controls
  - Implement card position calculation
  - Generate PDF with jsPDF
  - Handle multi-page layouts
  - Trigger browser download
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

- [ ] 29.1 Write property test for PDF layout calculations
  - **Property 51: PDF Layout Card Positioning**
  - **Validates: Requirements 20.3, 20.4, 20.5**

- [ ] 30. Implement ZIP Export
  - Create ZIP export service
  - Generate PNG for each card
  - Implement filename generation from CSV data
  - Compress files with JSZip
  - Display progress indicator
  - Trigger browser download
  - Handle export errors
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

- [ ] 30.1 Write property test for ZIP file naming
  - **Property 52: ZIP File Naming Convention**
  - **Validates: Requirements 21.3**

- [ ] 31. Implement Multi-Project Batch Generation
  - Create ProjectSelectionModal component
  - Add project search and filter
  - Add project checkboxes
  - Implement batch generation from multiple projects
  - Organize output by project folders
  - Generate combined ZIP file
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 32. Implement Autosave System
  - Create autosave timer hook
  - Implement 5-second inactivity detection
  - Save project automatically
  - Display subtle save notification
  - Handle autosave failures with retry
  - Reset timer on manual save
  - Save on application close
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

- [ ] 32.1 Write property test for autosave timing
  - **Property 54: Autosave Timing**
  - **Validates: Requirements 27.1**

- [ ] 33. Implement Error Handling System
  - Create centralized ErrorHandler class
  - Add error-to-message mapping
  - Implement toast notifications for errors
  - Add retry functionality for recoverable errors
  - Handle specific error types (storage, export, runtime)
  - Display user-friendly error messages
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_

- [ ] 34. Build Responsive UI Layout
  - Create three-panel layout (tools, canvas, layers)
  - Implement panel resizing
  - Add dark/light theme toggle
  - Implement theme persistence
  - Add tooltips to all buttons
  - Implement toast notification system
  - Make layout responsive to window resize
  - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7_

- [ ] 35. Optimize Performance
  - Add React.memo to expensive components
  - Implement useMemo for heavy calculations
  - Add useCallback for event handlers
  - Debounce mouse move events
  - Implement virtualization for large lists (layers, CSV table)
  - Optimize Konva rendering (disable hit detection where not needed)
  - Use Web Workers for batch generation
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_

- [ ] 36. Final Integration and Polish
  - Test complete workflows end-to-end
  - Fix any remaining bugs
  - Optimize bundle size
  - Add loading states and skeletons
  - Improve accessibility (ARIA labels, keyboard navigation)
  - Add onboarding tooltips or tutorial
  - Create example templates and CSV files
  - Write README with setup and usage instructions
  - _Requirements: All_

- [ ] 36.1 Run full property-based test suite
  - Execute all 54 property tests
  - Verify 100+ iterations per property
  - Fix any failing properties
  - _Requirements: All_

- [ ] 36.2 Run integration test suite
  - Test canvas interactions
  - Test CSV import and data binding
  - Test export workflows
  - Test project management
  - _Requirements: All_

- [ ] 37. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

