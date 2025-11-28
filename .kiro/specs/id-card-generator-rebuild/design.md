# Design Document

## Overview

The ID Card Generator rebuild is a modern, fully client-side web application built with React 18, Vite, React-Konva, and Zustand. The architecture emphasizes performance, maintainability, and user experience through clean separation of concerns, optimized rendering, and intuitive UI design.

### Key Technologies

- **React 18**: Latest React with concurrent features and automatic batching
- **Vite**: Lightning-fast build tool with HMR
- **React-Konva**: Canvas rendering library for high-performance graphics
- **Zustand**: Lightweight state management with minimal boilerplate
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library
- **jsPDF**: PDF generation
- **JSZip**: ZIP archive creation
- **PapaParse**: CSV parsing
- **QRCode.js**: QR code generation
- **bwip-js**: Barcode generation
- **Day.js**: Date/time utilities

### Architecture Principles

1. **Component-Based**: Modular, reusable components with single responsibilities
2. **State-Driven**: Centralized state management with Zustand stores
3. **Performance-First**: Memoization, virtualization, and optimized rendering
4. **Type-Safe**: JSDoc comments for better IDE support
5. **Accessible**: WCAG 2.1 AA compliant UI components
6. **Responsive**: Mobile-first design with adaptive layouts

## Architecture

### High-Level Structure

```
src/
├── app/                    # Next.js app router (or main entry)
├── components/
│   ├── canvas/            # Canvas-related components
│   ├── panels/            # UI panels (tools, layers, properties)
│   ├── modals/            # Modal dialogs
│   └── ui/                # shadcn/ui components
├── stores/                # Zustand state stores
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and helpers
├── services/              # Business logic services
└── types/                 # TypeScript types (or JSDoc types)
```

### State Management Architecture

The application uses Zustand with multiple stores for different concerns:

1. **Canvas Store**: Template, elements, selection, transformations
2. **Project Store**: Projects, current project, save/load operations
3. **Data Store**: CSV data, photos, current record index
4. **UI Store**: Zoom, pan, active panel, theme, modals
5. **History Store**: Undo/redo stack management

### Data Flow

```
User Action → Event Handler → Store Action → State Update → Component Re-render
                                    ↓
                              Side Effects (localStorage, exports)
```

## Components and Interfaces

### Core Components

#### 1. CanvasEditor

The main canvas component using React-Konva.

**Props:**
- `width: number` - Canvas width in pixels
- `height: number` - Canvas height in pixels
- `elements: Element[]` - Array of canvas elements
- `background: string` - Background image URL
- `onElementUpdate: (elements: Element[]) => void` - Element update callback

**Responsibilities:**
- Render all canvas elements using Konva
- Handle element transformations (drag, resize, rotate)
- Manage selection and multi-selection
- Implement snap-to-grid and alignment guides
- Handle zoom and pan interactions

#### 2. ToolsPanel

Left sidebar with element creation tools.

**Props:**
- `onAddElement: (type: ElementType) => void` - Add element callback
- `onImportCSV: (file: File) => void` - CSV import callback
- `onImportProject: (file: File) => void` - Project import callback

**Responsibilities:**
- Display tool buttons for adding elements
- Handle file uploads (CSV, images, projects)
- Provide card size configuration
- Display project selector dropdown

#### 3. LayersPanel

Right sidebar showing element hierarchy.

**Props:**
- `elements: Element[]` - Array of canvas elements
- `selectedIds: string[]` - Selected element IDs
- `onReorder: (fromIndex: number, toIndex: number) => void` - Reorder callback
- `onToggleVisibility: (id: string) => void` - Visibility toggle callback
- `onToggleLock: (id: string) => void` - Lock toggle callback
- `onDelete: (id: string) => void` - Delete callback
- `onDuplicate: (id: string) => void` - Duplicate callback
- `onRename: (id: string, name: string) => void` - Rename callback

**Responsibilities:**
- Display layers in z-index order
- Enable drag-and-drop reordering
- Show visibility and lock status
- Provide layer actions (delete, duplicate, rename)

#### 4. PropertiesPanel

Bottom or floating panel for element properties.

**Props:**
- `selectedElements: Element[]` - Selected elements
- `onUpdate: (updates: Partial<Element>) => void` - Update callback

**Responsibilities:**
- Display element-specific properties
- Provide styling controls (fonts, colors, effects)
- Handle alignment and distribution
- Show rotation and position inputs

#### 5. TopBar

Header with project controls and export options.

**Props:**
- `currentProject: Project | null` - Current project
- `onSave: () => void` - Save callback
- `onExportPNG: () => void` - PNG export callback
- `onExportPDF: () => void` - PDF export callback
- `onExportZIP: () => void` - ZIP export callback

**Responsibilities:**
- Display project name and last saved time
- Provide save and export buttons
- Show undo/redo buttons
- Display zoom level controls

#### 6. CSVEditor

Modal for editing CSV data.

**Props:**
- `data: CSVData` - CSV headers and rows
- `onSave: (data: CSVData) => void` - Save callback
- `onClose: () => void` - Close callback

**Responsibilities:**
- Display CSV data in an editable table
- Enable cell editing, row addition, and row deletion
- Provide search and filter functionality
- Support column reordering

#### 7. PhotoGallery

Modal for managing uploaded photos.

**Props:**
- `photos: Record<string, string>` - Photo name to URL mapping
- `onUpload: (files: File[]) => void` - Upload callback
- `onDelete: (name: string) => void` - Delete callback
- `onRotate: (name: string, degrees: number) => void` - Rotate callback

**Responsibilities:**
- Display photo thumbnails in a grid
- Enable photo upload via drag-and-drop or file picker
- Provide rotation controls for each photo
- Show photo metadata (size, dimensions)

#### 8. CropModal

Modal for cropping photos.

**Props:**
- `photo: string` - Photo URL
- `dimensions: { width: number, height: number }` - Crop dimensions in mm
- `onSave: (croppedPhoto: string) => void` - Save callback
- `onClose: () => void` - Close callback

**Responsibilities:**
- Display photo with crop overlay
- Enable manual crop area adjustment
- Lock aspect ratio based on dimensions
- Support batch cropping mode

#### 9. BatchGenerator

Component for generating multiple cards.

**Props:**
- `template: Template` - Card template
- `csvData: CSVData` - CSV data
- `photos: Record<string, string>` - Photos
- `range: string` - Card range (e.g., "1-10")
- `onComplete: (cards: GeneratedCard[]) => void` - Completion callback

**Responsibilities:**
- Generate cards for specified range
- Display progress indicator
- Render card previews
- Enable individual card export

#### 10. PDFExportModal

Modal for configuring PDF export.

**Props:**
- `cards: GeneratedCard[]` - Generated cards
- `onExport: (config: PDFConfig) => void` - Export callback
- `onClose: () => void` - Close callback

**Responsibilities:**
- Display page size options
- Provide margin and spacing controls
- Show preview of card layout on page
- Calculate cards per page

### Component Interfaces

```typescript
// Element types
type ElementType = 'text' | 'image' | 'qrcode' | 'barcode' | 'shape';

// Base element interface
interface Element {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  visible: boolean;
  locked: boolean;
  name: string;
  style: ElementStyle;
}

// Text element
interface TextElement extends Element {
  type: 'text';
  content: string;
  isStatic: boolean;
  heading?: string; // CSV column name
}

// Image element
interface ImageElement extends Element {
  type: 'image';
  content: string; // Photo key or URL
  isCustomImage: boolean;
  heading?: string; // CSV column name for dynamic images
}

// QR Code element
interface QRCodeElement extends Element {
  type: 'qrcode';
  qrConfig: {
    format: 'qrcode' | 'datamatrix' | 'pdf417';
    selectedFields: string[]; // CSV columns
    customText: string;
  };
}

// Barcode element
interface BarcodeElement extends Element {
  type: 'barcode';
  content: string;
  format: 'code128' | 'code39' | 'ean13';
}

// Element styling
interface ElementStyle {
  // Common
  opacity: number;
  zIndex: number;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  
  // Text-specific
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  textCase?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
  
  // Gradient
  gradient?: boolean;
  gradientType?: 'linear' | 'radial' | 'conic';
  gradientAngle?: number;
  gradientColors?: string[];
}

// Template
interface Template {
  id: string;
  front: TemplateSide;
  back: TemplateSide;
  size: { width: number; height: number }; // in mm
  orientation: 'horizontal' | 'vertical';
}

interface TemplateSide {
  elements: Element[];
  background: string;
  backgroundMode: 'static' | 'dynamic';
  backgroundColumn?: string;
  backgroundGroups?: BackgroundGroup[];
}

interface BackgroundGroup {
  id: string;
  name: string;
  values: string[]; // CSV values or special markers
  image: string;
}

// Project
interface Project {
  id: string;
  name: string;
  template: Template;
  csvData: CSVData;
  photos: Record<string, string>;
  maskSrc: string | null;
  applyMask: boolean;
  createdAt: string;
  updatedAt: string;
}

// CSV Data
interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

// Generated Card
interface GeneratedCard {
  id: string;
  frontImage: string; // base64 PNG
  backImage: string; // base64 PNG
  recordIndex: number;
  recordData: Record<string, string>;
}

// PDF Export Config
interface PDFConfig {
  pageSize: { width: number; height: number }; // in mm
  margins: { top: number; right: number; bottom: number; left: number }; // in mm
  spacing: { horizontal: number; vertical: number }; // in mm
  includeFront: boolean;
  includeBack: boolean;
}
```

## Data Models

### Storage Strategy

The application uses browser localStorage for persistence with the following structure:

```javascript
// localStorage keys
const STORAGE_KEYS = {
  PROJECTS: 'idcard_projects',
  LAST_PROJECT: 'idcard_last_project',
  UI_SETTINGS: 'idcard_ui_settings',
  AUTOSAVE: 'idcard_autosave'
};
```

### Data Serialization

Projects are serialized to JSON with base64-encoded images. Large projects may exceed localStorage limits, so the system implements:

1. **Compression**: Use LZ-string for compressing JSON before storage
2. **Chunking**: Split large projects into multiple localStorage entries
3. **Cleanup**: Provide UI for managing storage and deleting old projects
4. **Export**: Encourage users to export projects as files for backup

### State Persistence

```javascript
// Example Zustand store with persistence
const useCanvasStore = create(
  persist(
    (set, get) => ({
      elements: [],
      selectedIds: [],
      addElement: (element) => set((state) => ({
        elements: [...state.elements, element]
      })),
      // ... other actions
    }),
    {
      name: 'canvas-storage',
      partialize: (state) => ({
        // Only persist necessary fields
        elements: state.elements
      })
    }
  )
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Element Rendering Consistency
*For any* element with position, size, and styling properties, when added to the canvas, the rendered output should match the specified properties exactly.
**Validates: Requirements 1.2**

### Property 2: Aspect Ratio Preservation During Resize
*For any* element being resized with shift key pressed, the ratio of width to height should remain constant throughout the resize operation.
**Validates: Requirements 1.4**

### Property 3: Rotation Center Invariance
*For any* element being rotated, the center point coordinates should remain unchanged before and after rotation.
**Validates: Requirements 1.5**

### Property 4: Element Deletion Completeness
*For any* selected element, when delete operation is performed, the element should no longer exist in the canvas elements array.
**Validates: Requirements 2.5**

### Property 5: Layer Z-Index Ordering
*For any* set of elements, when displayed in the layers panel, elements should be ordered by z-index from lowest to highest (or highest to lowest consistently).
**Validates: Requirements 3.1**

### Property 6: Layer Reordering Correctness
*For any* two layers, when one is dragged above or below the other, their z-index values should be swapped or reordered accordingly.
**Validates: Requirements 3.2**

### Property 7: Visibility Toggle Consistency
*For any* element, toggling visibility twice should result in the original visibility state.
**Validates: Requirements 3.3**

### Property 8: Lock Prevents Transformation
*For any* locked element, attempting any transformation (drag, resize, rotate) should leave the element properties unchanged.
**Validates: Requirements 3.4**

### Property 9: Duplicate Creates Exact Copy
*For any* element, when duplicated, the new element should have identical properties except for a unique ID and slightly offset position.
**Validates: Requirements 3.5**

### Property 10: Multi-Selection Accumulation
*For any* sequence of Ctrl+click operations on elements, the selection set should contain exactly those elements that were clicked.
**Validates: Requirements 4.2**

### Property 11: Selection Box Intersection
*For any* selection box with bounds, all elements whose bounding boxes intersect with the selection box should be selected.
**Validates: Requirements 4.3**

### Property 12: Group Transformation Proportionality
*For any* group of selected elements, when the group is transformed (scaled, moved, rotated), the relative positions and sizes of elements within the group should be preserved proportionally.
**Validates: Requirements 4.5**

### Property 13: Grid Snapping Quantization
*For any* element position when snap-to-grid is enabled, the x and y coordinates should be multiples of the grid size.
**Validates: Requirements 5.1**

### Property 14: Alignment Guide Proximity Detection
*For any* two elements, when one is dragged within a threshold distance of the other's edge, an alignment guide should appear.
**Validates: Requirements 5.2**

### Property 15: Distribute Horizontal Equal Spacing
*For any* set of selected elements, after horizontal distribution, the horizontal spacing between consecutive element centers should be equal.
**Validates: Requirements 5.5**

### Property 16: Zoom Center Point Invariance
*For any* zoom operation, the canvas point at the center of the viewport should remain at the center after zoom.
**Validates: Requirements 6.3**

### Property 17: Text Auto-Fit Within Bounds
*For any* text element with content and bounds, the rendered text should fit entirely within the element bounds without overflow.
**Validates: Requirements 7.2**

### Property 18: Text Style Application
*For any* text element, when a style property (bold, italic, underline, alignment) is applied, the rendered text should reflect that style.
**Validates: Requirements 7.3, 7.4, 7.5, 7.6, 7.7**

### Property 19: Text Case Transformation
*For any* text content and case transformation type, the transformed text should match the expected case pattern (uppercase, lowercase, capitalize, sentence).
**Validates: Requirements 7.11**

### Property 20: Image Upload Base64 Storage
*For any* valid image file uploaded, the system should store it as a base64-encoded string.
**Validates: Requirements 8.1**

### Property 21: Mask Clipping Correctness
*For any* image and mask combination, the masked image should only show pixels where the mask is opaque.
**Validates: Requirements 8.2**

### Property 22: Image Opacity Application
*For any* image element with opacity value between 0 and 1, the rendered image should have the specified transparency level.
**Validates: Requirements 8.6**

### Property 23: Transparent Image Stroke Rendering
*For any* image with transparency, when stroke is applied, it should render as a drop-shadow filter rather than a border.
**Validates: Requirements 8.7**

### Property 24: QR Code Content Encoding
*For any* QR code element with selected CSV fields or custom text, the generated QR code should encode exactly that content.
**Validates: Requirements 9.2, 9.3**

### Property 25: Barcode Format Generation
*For any* barcode element with selected format (Code128, DataMatrix, PDF417), the generated barcode should be in that format.
**Validates: Requirements 9.4**

### Property 26: QR/Barcode Reactivity
*For any* QR or barcode element, when content changes, a new code should be generated reflecting the updated content.
**Validates: Requirements 9.5**

### Property 27: QR/Barcode Export Resolution
*For any* exported card containing QR or barcode elements, the codes should be rendered at 300 DPI resolution.
**Validates: Requirements 9.6**

### Property 28: CSV Parsing Completeness
*For any* valid CSV file, the parsed data should contain all headers and all rows from the file.
**Validates: Requirements 10.1**

### Property 29: CSV Cell Edit Persistence
*For any* cell in the CSV table, when edited, the new value should be stored in the corresponding data structure.
**Validates: Requirements 10.3**

### Property 30: CSV Row Addition
*For any* CSV dataset, when a new row is added, the dataset length should increase by one.
**Validates: Requirements 10.4**

### Property 31: CSV Row Deletion
*For any* CSV dataset, when a row is deleted, the dataset length should decrease by one and the row should no longer exist.
**Validates: Requirements 10.5**

### Property 32: Element-Column Data Binding
*For any* element linked to a CSV column, the element should display the value from the current record's column.
**Validates: Requirements 10.6**

### Property 33: Record Navigation Updates All Linked Elements
*For any* set of elements linked to CSV columns, when navigating to a different record, all linked elements should update to show the new record's values.
**Validates: Requirements 10.7**

### Property 34: Photo Upload Unique Identification
*For any* uploaded photo, the system should assign a unique identifier that doesn't conflict with existing photos.
**Validates: Requirements 11.1**

### Property 35: Photo Gallery Rotation Application
*For any* photo in the gallery, when rotated by N degrees, the photo should be transformed by exactly N degrees.
**Validates: Requirements 11.4**

### Property 36: Photo Filename Matching
*For any* CSV cell containing a photo filename, the system should match it to the corresponding uploaded photo by name.
**Validates: Requirements 11.6**

### Property 37: Crop Dimension Application
*For any* photo and crop dimensions, when crop is saved, the resulting image should have the specified dimensions.
**Validates: Requirements 12.3**

### Property 38: Batch Crop Consistency
*For any* set of photos and crop dimensions, when batch cropping is applied, all photos should be cropped to the same dimensions.
**Validates: Requirements 12.4**

### Property 39: Mask Enable/Disable Round Trip
*For any* set of images, enabling mask then disabling mask should restore the original uncropped images.
**Validates: Requirements 12.7**

### Property 40: Dynamic Background Selection
*For any* CSV record and background groups, the system should select the background whose values include the record's background column value.
**Validates: Requirements 13.7**

### Property 41: Project Save/Load Round Trip
*For any* project state, saving then loading the project should restore the exact same state (template, CSV data, photos, settings).
**Validates: Requirements 14.3**

### Property 42: Project Export/Import Round Trip
*For any* project, exporting to JSON then importing the JSON should restore the exact same project state.
**Validates: Requirements 14.7**

### Property 43: Undo/Redo Round Trip
*For any* change operation, performing the change then undo then redo should result in the same state as after the original change.
**Validates: Requirements 15.2, 15.3**

### Property 44: History Stack Clearing After New Change
*For any* state with non-empty redo stack, making a new change should clear the redo stack.
**Validates: Requirements 15.6**

### Property 45: Card Dimension Resize
*For any* card width or height value, when changed, the canvas dimensions should match the new values.
**Validates: Requirements 17.2, 17.3**

### Property 46: Element Position Invariance on Canvas Resize
*For any* set of elements, when canvas size changes, element positions relative to canvas dimensions should remain constant.
**Validates: Requirements 17.5**

### Property 47: Token Replacement Completeness
*For any* template with token placeholders and CSV record, when generating a card, all tokens should be replaced with corresponding CSV values.
**Validates: Requirements 18.3**

### Property 48: Card Generation Resolution
*For any* generated card, the output image should be rendered at 300 DPI resolution.
**Validates: Requirements 18.4**

### Property 49: Card Range Generation
*For any* specified card range (e.g., "1-10"), the system should generate exactly the cards within that range.
**Validates: Requirements 18.5**

### Property 50: PNG Export Quality
*For any* card exported as PNG, the image should be rendered at 300 DPI with pixelRatio of 3.
**Validates: Requirements 19.2**

### Property 51: PDF Layout Card Positioning
*For any* PDF configuration (page size, margins, spacing), the system should calculate card positions that respect all layout constraints.
**Validates: Requirements 20.3, 20.4, 20.5**

### Property 52: ZIP File Naming Convention
*For any* card in ZIP export, the filename should be based on CSV data in a consistent format.
**Validates: Requirements 21.3**

### Property 53: Front/Back Side Independence
*For any* template, elements added to the front side should not affect the back side elements, and vice versa.
**Validates: Requirements 23.3**

### Property 54: Autosave Timing
*For any* change operation, if no further changes occur within 5 seconds, the project should be automatically saved.
**Validates: Requirements 27.1**

## Error Handling

### Error Categories

1. **User Input Errors**
   - Invalid file formats (non-CSV, non-image files)
   - Malformed CSV data (inconsistent columns, encoding issues)
   - Invalid dimension values (negative, zero, or excessively large)
   - Missing required data (template without CSV, generation without photos)

2. **Storage Errors**
   - localStorage quota exceeded
   - localStorage access denied (private browsing)
   - Corrupted project data
   - Failed serialization/deserialization

3. **Export Errors**
   - Canvas rendering failures
   - PDF generation errors
   - ZIP compression failures
   - Browser download restrictions

4. **Runtime Errors**
   - Image loading failures
   - QR/Barcode generation errors
   - Mask application failures
   - Unexpected exceptions

### Error Handling Strategy

```javascript
// Centralized error handler
class ErrorHandler {
  static handle(error, context) {
    // Log error for debugging
    console.error(`[${context}]`, error);
    
    // Determine error type and user message
    const userMessage = this.getUserMessage(error, context);
    
    // Show toast notification
    toast.error(userMessage, {
      action: error.recoverable ? {
        label: 'Retry',
        onClick: () => error.retry()
      } : undefined
    });
    
    // Track error for analytics (if implemented)
    this.trackError(error, context);
  }
  
  static getUserMessage(error, context) {
    // Map technical errors to user-friendly messages
    const errorMessages = {
      'QuotaExceededError': 'Storage is full. Please delete old projects or export them as files.',
      'NetworkError': 'Network connection failed. Please check your internet connection.',
      'InvalidCSVError': 'CSV file is invalid. Please check the file format.',
      // ... more mappings
    };
    
    return errorMessages[error.name] || 'An unexpected error occurred. Please try again.';
  }
}

// Usage in components
try {
  await saveProject(project);
} catch (error) {
  ErrorHandler.handle(error, 'ProjectSave');
}
```

### Validation

```javascript
// Input validation utilities
const validators = {
  csvFile: (file) => {
    if (!file) throw new Error('No file provided');
    if (!file.name.endsWith('.csv')) throw new Error('File must be a CSV');
    if (file.size > 10 * 1024 * 1024) throw new Error('File too large (max 10MB)');
    return true;
  },
  
  imageFile: (file) => {
    if (!file) throw new Error('No file provided');
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) throw new Error('Invalid image format');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image too large (max 5MB)');
    return true;
  },
  
  dimensions: (width, height) => {
    if (width <= 0 || height <= 0) throw new Error('Dimensions must be positive');
    if (width > 1000 || height > 1000) throw new Error('Dimensions too large (max 1000mm)');
    return true;
  },
  
  cardRange: (range, maxRows) => {
    const match = range.match(/^(\d+)-(\d+)$/);
    if (!match) throw new Error('Invalid range format (use "1-10")');
    const [, start, end] = match.map(Number);
    if (start < 1 || end > maxRows || start > end) {
      throw new Error(`Invalid range (must be 1-${maxRows})`);
    }
    return true;
  }
};
```

### Graceful Degradation

1. **Missing Photos**: Display placeholder images instead of breaking
2. **Failed Exports**: Offer alternative export formats
3. **Storage Full**: Prompt user to export projects as files
4. **Slow Performance**: Show loading indicators and progress bars
5. **Browser Compatibility**: Detect unsupported features and show warnings

## Testing Strategy

### Unit Testing

Unit tests verify individual functions and components in isolation.

**Testing Framework**: Vitest (fast, Vite-native test runner)

**Coverage Areas**:
- Utility functions (coordinate transformations, color conversions, file parsing)
- State management actions (element CRUD, selection logic, history management)
- Validation functions (input validation, data validation)
- Serialization/deserialization (project save/load, JSON export/import)

**Example Unit Tests**:

```javascript
// lib/transforms.test.js
import { describe, it, expect } from 'vitest';
import { mmToPixels, pixelsToMm, rotatePoint } from './transforms';

describe('mmToPixels', () => {
  it('should convert millimeters to pixels at 300 DPI', () => {
    expect(mmToPixels(25.4, 300)).toBe(300);
    expect(mmToPixels(50.8, 300)).toBe(600);
  });
  
  it('should handle zero and negative values', () => {
    expect(mmToPixels(0, 300)).toBe(0);
    expect(mmToPixels(-10, 300)).toBe(-118);
  });
});

describe('rotatePoint', () => {
  it('should rotate point around center', () => {
    const point = { x: 100, y: 0 };
    const center = { x: 0, y: 0 };
    const rotated = rotatePoint(point, center, 90);
    
    expect(rotated.x).toBeCloseTo(0, 1);
    expect(rotated.y).toBeCloseTo(100, 1);
  });
});
```

### Property-Based Testing

Property-based tests verify universal properties across many randomly generated inputs.

**Testing Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging Convention**: Each property-based test must include a comment with the format:
```javascript
// **Feature: id-card-generator-rebuild, Property 1: Element Rendering Consistency**
```

**Coverage Areas**:
- Element transformations (drag, resize, rotate)
- Selection and multi-selection logic
- Data binding and token replacement
- Export quality and correctness
- Undo/redo operations
- Project serialization round-trips

**Example Property Tests**:

```javascript
// stores/canvas.test.js
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { useCanvasStore } from './canvas';

describe('Canvas Store Properties', () => {
  // **Feature: id-card-generator-rebuild, Property 3: Rotation Center Invariance**
  it('should maintain element center during rotation', () => {
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 10, max: 500 }),
          height: fc.integer({ min: 10, max: 500 }),
          rotation: fc.float({ min: 0, max: 360 })
        }),
        fc.float({ min: -180, max: 180 }),
        (element, rotationDelta) => {
          const centerBefore = {
            x: element.x + element.width / 2,
            y: element.y + element.height / 2
          };
          
          const rotated = {
            ...element,
            rotation: element.rotation + rotationDelta
          };
          
          const centerAfter = {
            x: rotated.x + rotated.width / 2,
            y: rotated.y + rotated.height / 2
          };
          
          return (
            Math.abs(centerBefore.x - centerAfter.x) < 0.01 &&
            Math.abs(centerBefore.y - centerAfter.y) < 0.01
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // **Feature: id-card-generator-rebuild, Property 7: Visibility Toggle Consistency**
  it('should restore original visibility after double toggle', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          visible: fc.boolean()
        }),
        (element) => {
          const store = useCanvasStore.getState();
          store.addElement(element);
          
          const originalVisibility = element.visible;
          
          store.toggleVisibility(element.id);
          store.toggleVisibility(element.id);
          
          const finalElement = store.elements.find(el => el.id === element.id);
          
          return finalElement.visible === originalVisibility;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // **Feature: id-card-generator-rebuild, Property 41: Project Save/Load Round Trip**
  it('should restore exact project state after save/load', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          template: fc.record({
            front: fc.record({
              elements: fc.array(fc.anything()),
              background: fc.string()
            }),
            back: fc.record({
              elements: fc.array(fc.anything()),
              background: fc.string()
            })
          }),
          csvData: fc.record({
            headers: fc.array(fc.string()),
            rows: fc.array(fc.dictionary(fc.string(), fc.string()))
          })
        }),
        (project) => {
          const store = useProjectStore.getState();
          
          // Save project
          store.saveProject(project);
          
          // Load project
          const loaded = store.loadProject(project.id);
          
          // Compare (deep equality)
          return JSON.stringify(project) === JSON.stringify(loaded);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests verify that multiple components work together correctly.

**Testing Framework**: Vitest + React Testing Library

**Coverage Areas**:
- Canvas interactions (add element, select, transform)
- CSV import and data binding
- Photo upload and gallery management
- Export workflows (PNG, PDF, ZIP)
- Project management (save, load, export, import)

**Example Integration Test**:

```javascript
// components/canvas/CanvasEditor.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasEditor } from './CanvasEditor';

describe('CanvasEditor Integration', () => {
  it('should add and select text element', async () => {
    const { container } = render(<CanvasEditor />);
    
    // Click "Add Text" button
    const addTextBtn = screen.getByRole('button', { name: /add text/i });
    fireEvent.click(addTextBtn);
    
    // Verify element was added
    const textElements = container.querySelectorAll('[data-type="text"]');
    expect(textElements).toHaveLength(1);
    
    // Click on the element to select it
    fireEvent.click(textElements[0]);
    
    // Verify element is selected (has selection class)
    expect(textElements[0]).toHaveClass('selected');
  });
  
  it('should bind element to CSV column', async () => {
    const csvData = {
      headers: ['Name', 'ID'],
      rows: [{ Name: 'John Doe', ID: '12345' }]
    };
    
    const { container } = render(
      <CanvasEditor csvData={csvData} />
    );
    
    // Add text element
    const addTextBtn = screen.getByRole('button', { name: /add text/i });
    fireEvent.click(addTextBtn);
    
    // Select element
    const textElement = container.querySelector('[data-type="text"]');
    fireEvent.click(textElement);
    
    // Open properties panel and select CSV column
    const columnSelect = screen.getByLabelText(/data column/i);
    fireEvent.change(columnSelect, { target: { value: 'Name' } });
    
    // Verify element displays CSV data
    expect(textElement).toHaveTextContent('John Doe');
  });
});
```

### End-to-End Testing

E2E tests verify complete user workflows from start to finish.

**Testing Framework**: Playwright (for browser automation)

**Coverage Areas**:
- Complete card design workflow
- CSV import and batch generation
- Export workflows
- Project management workflows

**Example E2E Test**:

```javascript
// e2e/card-generation.spec.js
import { test, expect } from '@playwright/test';

test('complete card generation workflow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Create new project
  await page.click('button:has-text("New Project")');
  await page.fill('input[name="projectName"]', 'Test Project');
  await page.click('button:has-text("Create")');
  
  // Add text element
  await page.click('button:has-text("Add Text")');
  await page.dblclick('[data-type="text"]');
  await page.fill('[data-type="text"] input', 'Employee Name');
  
  // Upload CSV
  await page.setInputFiles('input[type="file"][accept=".csv"]', 'test-data.csv');
  await expect(page.locator('text=3 rows loaded')).toBeVisible();
  
  // Link text to CSV column
  await page.click('[data-type="text"]');
  await page.selectOption('select[name="dataColumn"]', 'Name');
  
  // Generate cards
  await page.click('button:has-text("Generate Cards")');
  await expect(page.locator('text=Generating...')).toBeVisible();
  await expect(page.locator('text=3 cards generated')).toBeVisible({ timeout: 10000 });
  
  // Export as ZIP
  await page.click('button:has-text("Export ZIP")');
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
});
```

### Performance Testing

Performance tests ensure the application meets performance requirements.

**Tools**: Lighthouse, Chrome DevTools Performance Profiler

**Metrics**:
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Canvas interaction latency < 16ms (60 FPS)
- Batch generation throughput > 10 cards/second

**Example Performance Test**:

```javascript
// performance/canvas-interactions.test.js
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Canvas Performance', () => {
  it('should handle 100 elements without lag', () => {
    const store = useCanvasStore.getState();
    
    // Add 100 elements
    const startAdd = performance.now();
    for (let i = 0; i < 100; i++) {
      store.addElement({
        id: `element-${i}`,
        type: 'text',
        position: { x: Math.random() * 1000, y: Math.random() * 1000 },
        size: { width: 100, height: 50 },
        content: `Element ${i}`
      });
    }
    const endAdd = performance.now();
    
    expect(endAdd - startAdd).toBeLessThan(100); // Should take < 100ms
    
    // Measure selection time
    const startSelect = performance.now();
    store.selectAll();
    const endSelect = performance.now();
    
    expect(endSelect - startSelect).toBeLessThan(50); // Should take < 50ms
  });
});
```

### Test Organization

```
tests/
├── unit/
│   ├── lib/
│   │   ├── transforms.test.js
│   │   ├── validators.test.js
│   │   └── serialization.test.js
│   └── stores/
│       ├── canvas.test.js
│       ├── project.test.js
│       └── data.test.js
├── integration/
│   ├── canvas-editor.test.jsx
│   ├── csv-import.test.jsx
│   └── export-workflows.test.jsx
├── e2e/
│   ├── card-generation.spec.js
│   ├── project-management.spec.js
│   └── batch-export.spec.js
└── performance/
    ├── canvas-interactions.test.js
    └── batch-generation.test.js
```

### Continuous Testing

- Run unit and integration tests on every commit (pre-commit hook)
- Run full test suite on pull requests (CI/CD pipeline)
- Run E2E tests nightly or before releases
- Monitor test coverage (target: >80% for critical paths)
