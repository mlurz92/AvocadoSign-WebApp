# **Nodal Staging Analysis Tool - Technical Documentation (v3.0.1)**

## **1. Overview**

This document provides a comprehensive technical overview of the **Nodal Staging Analysis Tool**, a client-side, single-page web application designed for advanced medical data analysis. The application is built with vanilla JavaScript (ES6+), leveraging a modular, service-oriented architecture to ensure maintainability, scalability, and robustness. It is designed to be self-contained, running directly in a modern web browser without requiring a server-side backend.

### **1.1. Core Technologies**

* **Frontend:** HTML5, CSS3
* **Logic & Interactivity:** JavaScript (ES6+)
* **UI Framework & Layout:** Bootstrap 5
* **Data Visualization:** D3.js
* **Asynchronous Tasks:** Web Workers
* **UI Enhancements:** Tippy.js (for tooltips)
* **File Handling & Utilities:** PapaParse (CSV parsing/unparsing), JSZip (ZIP archiving), html2canvas (Image rendering)

## **2. Project Structure**

The codebase is organized into a logical, feature-based directory structure to promote a clear separation of concerns.

```
/
├── index.html
├── README.md
├── css/
│   └── style.css
├── data/
│   └── data.js
├── workers/
│   └── brute_force_worker.js
└── js/
    ├── config.js
    ├── utils.js
    ├── app/
    │   ├── main.js
    │   └── state.js
    ├── core/
    │   ├── data_processor.js
    │   ├── t2_criteria_manager.js
    │   └── study_criteria_manager.js
    ├── services/
    │   ├── statistics_service.js
    │   ├── export_service.js
    │   └── brute_force_manager.js
    └── ui/
        ├── ui_manager.js
        ├── event_manager.js
        ├── components/
        │   ├── table_renderer.js
        │   ├── chart_renderer.js
        │   └── ui_components.js
        └── tabs/
            ├── data_tab.js
            ├── analysis_tab.js
            ├── statistics_tab.js
            ├── presentation_tab.js
            ├── publication_tab.js
            └── export_tab.js
```

* **`css/`**: Contains all custom stylesheets.
* **`data/`**: Holds the static, raw patient dataset.
* **`workers/`**: Contains scripts for Web Workers that run in the background (e.g., for brute-force analysis).
* **`js/`**: The main directory for all JavaScript source code.
    * **`config.js`**: Central configuration file for the entire application.
    * **`utils.js`**: Global helper and utility functions.
    * **`app/`**: Core application logic, including the main entry point and state management.
    * **`core/`**: Foundational business logic modules (data processing, criteria management).
    * **`services/`**: Modules that provide specific services like statistical calculations or file exports.
    * **`ui/`**: All modules related to UI rendering, management, and event handling.

## **3. Architecture & Core Concepts**

The application follows a modular, singleton-based pattern orchestrated by a central `App` class.

### **3.1. Application Lifecycle (`main.js`)**

The application's entry point is `js/app/main.js`. An instance of the `App` class is created on `DOMContentLoaded`. The `app.init()` method orchestrates the startup sequence:
1.  **Dependency Check:** Verifies that all required modules are defined.
2.  **Module Initialization:** Initializes key singleton modules in a specific order: `state`, `t2CriteriaManager`, `bruteForceManager`, and finally `eventManager`.
3.  **Data Processing:** The raw data from `data/data.js` is processed by `dataProcessor.processAllData()` into a consistent, application-ready format.
4.  **Initial Render:** The `refreshCurrentTab()` method is called to perform the initial filtering, UI updates, and rendering of the default tab's content.

### **3.2. State Management (`state.js`)**

A singleton module that acts as the single source of truth for the application's UI state.
* **Responsibilities:** Manages transient state such as the currently selected cohort, active tab, table sorting preferences, and user selections within various tabs.
* **Persistence:** Leverages `localStorage` (via helpers in `utils.js`) to persist user settings between sessions. All storage keys are centrally managed in `config.js`.
* **Encapsulation:** All state modifications are handled through dedicated setter methods (e.g., `setCurrentCohort`), ensuring controlled and predictable state changes.

### **3.3. Data Pipeline (`data_processor.js`)**

This core module transforms the raw data into a clean, consistent data model.
* **`processSinglePatient()`:** Takes a raw patient object and standardizes it, performing data validation, type coercion, and calculating derived fields like `age`.
* **`filterDataByCohort()`:** Provides a consistent method for filtering the master dataset based on the user-selected cohort. It now robustly returns an empty array for unknown cohort IDs.

### **3.4. Criteria Management (`t2_criteria_manager.js`, `study_criteria_manager.js`)**

This pair of modules handles all logic related to T2-weighted criteria.
* **`t2_criteria_manager.js`:** Manages the user-defined, interactive T2 criteria. It maintains both a `currentCriteria` state (for editing) and an `appliedCriteria` state (for global calculations), with an `isUnsaved` flag to track discrepancies. The `evaluateDataset()` method is key, applying the defined criteria to any given dataset.
* **`study_criteria_manager.js`:** Manages the static, predefined criteria sets from scientific literature, which are defined in `PUBLICATION_CONFIG`. It includes special logic to handle complex, multi-layered criteria sets (e.g., ESGAR 2016).

### **3.5. Asynchronous Optimization (Web Worker)**

To prevent the UI from freezing during the computationally intensive brute-force analysis, the application uses a Web Worker.
* **`brute_force_worker.js`:** A self-contained script that runs in a background thread. It receives a `start` message, generates and tests all criteria combinations, and communicates its status (`started`, `progress`, `result`, `error`) back to the main thread via `postMessage`.
* **`brute_force_manager.js`:** A robust singleton on the main thread that manages the worker's lifecycle, including initialization and re-initialization after errors. It provides a clean API (`startAnalysis`, `cancelAnalysis`) and uses a callback system to communicate with the main `App` instance.

### **3.6. Statistical Engine (`statistics_service.js`)**

A pure logic module that centralizes all statistical calculations.
* **Core Metrics:** Calculates descriptive statistics and a full suite of diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC, etc.).
* **Confidence Intervals & Tests:** Implements robust methods for 95% CIs (Wilson Score for proportions, Bootstrap Percentile for effect sizes) and key comparative tests (McNemar, DeLong, Fisher's Exact, Mann-Whitney U).
* **`calculateAllPublicationStats()`:** A high-level function that computes a comprehensive set of statistics for all cohorts and criteria types in a single pass, ensuring data consistency for the Publication and Export tabs.

### **3.7. UI Rendering & Management (`ui_manager.js`)**

A central singleton responsible for all direct DOM manipulations and UI state updates.
* **Responsibilities:** Shows toasts, initializes tooltips, updates text/HTML of elements, and orchestrates the rendering of tab content via `renderTabContent`.
* **Component-Based Rendering:** It relies on helper modules in the `components/` directory to generate reusable HTML structures (e.g., cards, tables, charts).
* **`tabs/` Directory:** Each file in this directory is responsible for generating the complete HTML content for one of the main application tabs.

### **3.8. Event Handling (`event_manager.js`)**

A centralized event delegation model is used for performance and maintainability.
* **Central Dispatcher:** A minimal number of event listeners are attached to `document.body`. The `handleBodyClick`, `handleBodyChange`, and `handleBodyInput` functions act as central dispatchers.
* **Structured Handling:** The `handleBodyClick` function uses a mapping of element IDs to handler functions for clarity and robustness, eliminating the fragile `if/else if` chain of the previous implementation. This ensures that all clicks are routed correctly and reliably.

## **4. Data Schema**

### **4.1. Raw Data (`data.js`)**

The initial data is structured with consistent keys.

```javascript
{
  id: 1,
  lastName: "John",
  firstName: "Lothar",
  birthDate: "1953-07-13",
  sex: "m",
  therapy: "neoadjuvantTherapy",
  examDate: "2015-11-24",
  asStatus: "+",
  nStatus: "+",
  pathologyTotalNodeCount: 14,
  t2Nodes: [
    { size: 27.0, shape: "round", border: "irregular", homogeneity: "heterogeneous", signal: "lowSignal" }
  ]
}
```

### **4.2. Processed Data Model (Application-Internal)**

The `data_processor.js` module transforms the raw data into a consistent object model used throughout the application.

```javascript
{
  id: 1,
  lastName: "John",
  firstName: "Lothar",
  birthDate: "1953-07-13",
  age: 62, // Calculated
  therapy: "neoadjuvantTherapy",
  nStatus: "+",
  asStatus: "+",
  t2Status: null, // Populated by criteria managers
  countPathologyNodes: 14,
  countT2Nodes: 1,
  countT2NodesPositive: 0, // Populated by criteria managers
  t2Nodes: [
    { size: 27.0, shape: "round", border: "irregular", ... }
  ],
  t2NodesEvaluated: [] // Populated by criteria managers
}
```

## **5. Setup and Installation**

The application is designed to run without a build process or a web server.

1.  **Prerequisites:** A modern desktop web browser (e.g., Chrome, Firefox, Edge).
2.  **Execution:**
    * Clone or download the project repository.
    * Open the `index.html` file directly in your web browser.
3.  **Dependencies:** All external libraries are loaded via CDN links in `index.html` and do not require manual installation.
