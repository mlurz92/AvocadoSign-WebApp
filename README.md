# **Nodal Staging Analysis Tool \- Technical Documentation (v3.0.0)**

## **1\. Overview**

This document provides a comprehensive technical overview of the **Nodal Staging Analysis Tool**, a client-side, single-page web application designed for advanced medical data analysis. The application is built with vanilla JavaScript (ES6+), leveraging a modular, service-oriented architecture to ensure maintainability and scalability. It is designed to be self-contained, running directly in a web browser without requiring a server-side backend.

### **1.1. Core Technologies**

* **Frontend:** HTML5, CSS3  
* **Logic & Interactivity:** JavaScript (ES6+)  
* **UI Components & Layout:** Bootstrap 5  
* **Data Visualization:** D3.js  
* **Asynchronous Tasks:** Web Workers  
* **UI Enhancements:** Tippy.js (Tooltips)  
* **File Handling:** PapaParse (CSV), JSZip (Archiving)

## **2\. Project Structure**

The codebase is organized into a logical, feature-based directory structure to promote separation of concerns and code clarity.

```
/  
├── index.html  
├── css/  
│   └── style.css  
├── data/  
│   └── data.js  
├── workers/  
│   └── brute\_force\_worker.js  
└── js/  
    ├── config.js  
    ├── utils.js  
    ├── app/  
    │   ├── main.js  
    │   └── state.js  
    ├── core/  
    │   ├── data\_processor.js  
    │   ├── t2\_criteria\_manager.js  
    │   └── study\_criteria\_manager.js  
    ├── services/  
    │   ├── statistics\_service.js  
    │   ├── export\_service.js  
    │   └── brute\_force\_manager.js  
    └── ui/  
        ├── ui\_manager.js  
        ├── event\_manager.js  
        ├── components/  
        │   ├── table\_renderer.js  
        │   ├── chart\_renderer.js  
        │   └── ui\_components.js  
        └── tabs/  
            ├── data\_tab.js  
            ├── analysis\_tab.js  
            ├── statistics\_tab.js  
            ├── presentation\_tab.js  
            ├── publication\_tab.js  
            └── export\_tab.js
```

## **3\. Architecture & Core Concepts**

The application follows a modular, object-oriented pattern orchestrated by a central App class.

### **3.1. Application Lifecycle (main.js)**

The application's entry point is js/app/main.js. An instance of the App class is created upon DOMContentLoaded. The app.init() method orchestrates the entire startup sequence:

1. **Dependency Check:** Verifies that all required modules are defined and available.  
2. **Module Initialization:** Initializes key singleton modules in the correct order: state, t2CriteriaManager, eventManager, and bruteForceManager.  
3. **Data Processing:** The raw data from data/data.js is processed by dataProcessor.processAllData() into a consistent, application-ready format.  
4. **Initial State Setup:** The application's initial cohort data is filtered and prepared.  
5. **UI Rendering:** The global UI state is rendered for the first time.  
6. **Tab Initialization:** The default or last-viewed tab is activated and rendered.  
7. **Event Listeners:** The central eventManager is initialized to handle all user interactions.

### **3.2. State Management (state.js)**

A singleton module, state.js, acts as the single source of truth for the application's UI state.

* **Responsibilities:** It manages transient state such as the currently selected cohort, active tab, table sorting preferences, and selections within the Statistics and Presentation tabs.  
* **Persistence:** It leverages localStorage via the utils.js helper functions (saveToLocalStorage, loadFromLocalStorage) to persist user settings between sessions. All storage keys are centrally managed in config.js.  
* **Encapsulation:** All state modifications are handled through dedicated setter methods (e.g., setCurrentCohort), ensuring controlled and predictable state changes.

### **3.3. Data Pipeline (data\_processor.js)**

This core module is responsible for transforming the raw, static data into a clean, consistent data model for the entire application.

* **processSinglePatient():** This function is the heart of the pipeline. It takes a raw patient object (with German keys like geburtsdatum) and transforms it into a structured object with English keys (e.g., birthDate). It performs data validation, type coercion, and calculates derived fields like age.  
* **filterDataByCohort():** Provides a consistent method for filtering the master processed dataset based on the user-selected cohort (Overall, Upfront Surgery, nRCT).  
* **calculateHeaderStats():** A utility function that computes the summary statistics displayed in the application header.

### **3.4. Criteria Management (t2\_criteria\_manager.js, study\_criteria\_manager.js)**

This pair of modules handles the logic for T2-weighted criteria.

* **t2\_criteria\_manager.js:** Manages the user-defined, interactive T2 criteria.  
  * It maintains both a currentCriteria state (what the user is editing) and an appliedCriteria state (what is globally used for calculations).  
  * The isUnsaved flag tracks discrepancies between these two states.  
  * The applyCriteria() method commits the current state to the applied state and persists it to localStorage.  
  * evaluateDataset() is a key function that takes a dataset and applies the currently defined criteria to each patient, calculating the t2Status and other relevant fields.  
* **study\_criteria\_manager.js:** Manages the static, predefined criteria sets from scientific literature.  
  * It holds a frozen array of study objects, each defining a specific set of criteria, logic, and applicable cohort.  
  * It includes special handling for the complex, multi-layered logic of the ESGAR 2016 criteria (\_checkSingleNodeESGAR).  
  * Its applyStudyCriteriaToDataset() function evaluates a dataset against a specific, named study set.

### **3.5. Asynchronous Optimization (brute\_force\_worker.js, brute\_force\_manager.js)**

To prevent the UI from freezing during the computationally intensive search for optimal T2 criteria, the application uses a Web Worker.

* **brute\_force\_worker.js:** A self-contained script that runs in a separate background thread.  
  * It receives a start message with the patient data, target metric, and configuration.  
  * It systematically generates and tests thousands of criteria combinations against the provided data.  
  * It communicates its status back to the main thread via postMessage using a defined message protocol (started, progress, result, error, cancelled).  
* **brute\_force\_manager.js:** A singleton module on the main thread that acts as a facade for the worker.  
  * It manages the worker's lifecycle (initialization, termination).  
  * It provides a clean API (startAnalysis, cancelAnalysis) for the rest of the application.  
  * It listens for messages from the worker and invokes callbacks registered by the App class, effectively decoupling the main application logic from the worker implementation.  
  * It stores the results for each cohort, making them available for later use (e.g., in the Publication tab or for export).

### **3.6. Statistical Engine (statistics\_service.js)**

This module centralizes all statistical calculations, ensuring consistency and accuracy. It contains no UI logic.

* **Core Metrics:** Provides functions to calculate fundamental descriptive statistics (getMedian, getMean, getStdDev) and diagnostic performance metrics (calculateDiagnosticPerformance, which returns sensitivity, specificity, PPV, NPV, accuracy, F1-score, and AUC).  
* **Confidence Intervals:** Implements robust methods for calculating 95% CIs, including calculateWilsonScoreCI for proportions and a bootstrapCI function for metrics like AUC and F1-score where analytic methods are complex.  
* **Comparative Tests:** Includes implementations for calculateMcNemarTest (for paired accuracy comparison), calculateDeLongTest (for paired AUC comparison), and calculateFisherExactTest / calculateMannWhitneyUTest for association analyses.  
* **calculateAllPublicationStats():** A high-level function that computes a comprehensive set of statistics for all cohorts and criteria types (AS, applied T2, literature T2, brute-force T2) in a single pass. This is used by the Publication and Export tabs to ensure data consistency.

### **3.7. UI Rendering & Management**

The UI layer is modular and component-based.

* **ui\_manager.js:** A central singleton that replaces the previous ui\_helpers.js and view\_renderer.js. It is responsible for all direct DOM manipulations and UI state updates, such as showing toasts, managing tooltips, and rendering the content of the main tabs via its renderTabContent method.  
* **components/ Directory:** Contains modules for generating reusable HTML structures.  
  * ui\_components.js: Creates generic components like cards and buttons.  
  * table\_renderer.js: Specialized in rendering the complex, expandable rows for the Data and Analysis tables.  
  * chart\_renderer.js: Encapsulates all D3.js logic for creating charts (histograms, pie charts, bar charts).  
* **tabs/ Directory:** Each file in this directory is responsible for orchestrating the creation of the HTML content for a specific main tab. It gathers the necessary data, calls the appropriate UI components and renderers, and returns the final HTML string to the ui\_manager.

### **3.8. Event Handling (event\_manager.js)**

To optimize performance and simplify code, the application uses a centralized event delegation model.

* **Single Listeners:** The event\_manager.js attaches a minimal number of event listeners (click, change, input) to the document.body.  
* **Delegation Logic:** The handleBodyClick (and similar) function acts as a central dispatcher. It inspects the event.target to determine which element was interacted with and calls the appropriate handler function from the relevant module (e.g., app.handleCohortChange, t2CriteriaManager.updateLogic). This avoids attaching hundreds of individual listeners to elements.

## **4\. Data Schema**

### **4.1. Raw Data (data.js)**

The initial data is structured with German keys.  
Example:  

```
{  
    nr: 1,  
    name: "John",  
    vorname: "Lothar",  
    geburtsdatum: "1953-07-13",  
    therapie: "nRCT",  
    n: "+",  
    anzahl\_patho\_lk: 14,  
    lymphknoten\_t2: \[  
      { groesse: 27.0, form: "rund", kontur: "irregulär", ... },  
      // ...  
    \]  
}
```

### **4.2. Processed Data Model (Application-Internal)**

The data\_processor.js transforms the raw data into a consistent, English-keyed object model used throughout the application.  
Example:  

```
{  
    id: 1,  
    name: "John",  
    firstName: "Lothar",  
    birthDate: "1953-07-13",  
    age: 62,  
    therapy: "nRCT",  
    nStatus: "+",  
    asStatus: "+",  
    t2Status: null, // Populated by criteria managers  
    countPathologyNodes: 14,  
    countT2Nodes: 3,  
    countT2NodesPositive: 0, // Populated by criteria managers  
    t2Nodes: \[  
      { size: 27.0, shape: "rund", border: "irregulär", ... },  
      // ...  
    \],  
    t2NodesEvaluated: \[  
      // Populated by criteria managers with check results  
      { size: 27.0, shape: "rund", isPositive: true, checkResult: { size: true, ... } },  
      // ...  
    \]  
}
```

## **5\. Setup and Installation**

The application is designed to run without a web server.

1. **Prerequisites:** A modern web browser (e.g., Chrome, Firefox, Edge).  
2. **Execution:**  
   * Clone or download the project repository.  
   * Open the index.html file directly in your web browser.  
3. **Dependencies:** All external libraries (Bootstrap, D3.js, etc.) are loaded via CDN links in index.html and do not require manual installation.