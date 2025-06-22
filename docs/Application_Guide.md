# Nodal Staging Analysis Tool: Application Guide (Version 4.2.0)

## 1. Introduction

### 1.1. Purpose and Scope
The **Nodal Staging: Avocado Sign vs. T2 Criteria** Analysis Tool is a client-side web application designed as a specialized instrument for **scientific research** in the radiological diagnosis of rectal cancer. It provides an interactive platform for the in-depth analysis and comparison of the diagnostic performance of various MRI-based criteria for assessing mesorectal lymph node status (N-status).

The scientific focus of the application is the rigorous evaluation of the innovative, contrast-enhancement-based **Avocado Sign (AS)** in direct comparison with:
*   Established, literature-based T2-weighted (T2w) morphological criteria.
*   Data-driven, cohort-optimized T2w criteria, determined via an integrated brute-force analysis.

The application supports the entire research workflow, from data exploration and detailed statistical analysis to the generation of manuscript drafts formatted according to the publication requirements of medical imaging journals (e.g., *Radiology*).

### 1.2. Important Notice: Research Instrument
**Disclaimer:** This application is designed exclusively for **research and educational purposes**. The data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not be used for clinical diagnostics, direct treatment decisions, or other primary medical applications.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

### 1.3. System Requirements & Setup
*   **System Requirements:** A modern desktop web browser (e.g., latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari). Support for Web Workers is required for full functionality (brute-force optimization).
*   **Setup:** No server-side component or installation is necessary. The application is launched by opening the `index.html` file directly in the browser. An internet connection is required for the initial loading of external libraries (e.g., Bootstrap, D3.js) from Content Delivery Networks (CDNs).

## 2. Global UI Concepts

The user interface is designed to support an intuitive and efficient scientific workflow.

### 2.1. Application Layout
*   **Header:** A fixed header at the top of the page contains the application title, a "Quick Guide" button, and the global cohort selection controls.
*   **Navigation Bar (Tabs):** A horizontal tab navigation bar is positioned below the header, allowing for quick switching between the five main modules of the application.
*   **Content Area:** The central workspace where the specific content and tools of the currently active tab are displayed.

### 2.2. Global Cohort Selection vs. Analysis Context
The application utilizes a dual-context system to ensure both user flexibility and methodological rigor:

*   **Global Cohort Selection:** Three buttons in the header (`Overall`, `Surgery alone`, `Neoadjuvant therapy`) filter the dataset for general exploration in the `Data` and `Analysis` tabs. This selection represents the primary, user-defined view of the data.

*   **Analysis Context (Methodological Lock):** For specific, scientifically valid comparisons, the application automatically activates a temporary **Analysis Context**. This is most relevant in the `Comparison` tab.
    *   **Activation:** When a literature-based T2 criterion is selected for comparison (e.g., ESGAR 2016), the application automatically sets the context to the methodologically correct patient cohort (e.g., "Surgery alone").
    *   **Effect:** While an Analysis Context is active, the Global Cohort Selection buttons in the header are **disabled (locked)** to prevent invalid comparisons. All statistical calculations and charts within that context (e.g., the comparison table and chart) are performed exclusively on the locked cohort. A banner within the tab clearly indicates which context is active.
    *   **Deactivation:** The context is automatically cleared when you switch to another main tab (like `Data` or `Publication`) or change the comparison view back to a non-context-specific option.
    *   **Transparency:** The UI provides clear feedback (e.g., a notice in the `Comparison` tab) to inform you which context is currently active.

This system ensures that direct statistical tests (like DeLong or McNemar) are always performed on the same, appropriate patient group, which is a critical requirement for a valid scientific publication.

### 2.3. Interactive Help
*   **Tooltips:** Nearly all UI elements are equipped with detailed tooltips that explain the element's function or the definition of a metric on mouse-over.
*   **Quick Guide:** A **?** button in the header opens a modal window with a comprehensive quick guide to all features.

## 3. The Application Modules in Detail (Tabs)

The application is divided into five main modules, accessible via the navigation bar.

### 3.1. Data Tab
*   **Purpose:** To display and explore the underlying patient dataset based on the **Global Cohort Selection**.
*   **Components & Workflow:**
    *   **Patient Table:** An interactive, sortable table lists all patients of the selected global cohort. Columns include ID, Name, Sex, Age, Therapy, a combined N/AS/T2 status, and Notes.
    *   **Sorting:** Clicking on column headers sorts the table. The "N/AS/T2" column offers special sub-sorting by clicking the "N", "AS", or "T2" labels in the column header.
    *   **Detail View (Lymph Nodes):** Rows of patients with T2 lymph node data are expandable (by clicking the row or the arrow icon) to show a detailed list of the morphological properties of each node (size, shape, etc.).
    *   **"Expand/Collapse All Details" Button:** Toggles the detail view for all patients in the table simultaneously.

### 3.2. Analysis Tab
*   **Purpose:** To interactively define T2 criteria, perform optimization analyses, and examine the criteria's impact at the patient level. This tab always operates on the **Global Cohort Selection**.
*   **Components & Workflow:**
    *   **Dashboard:** Provides a graphical overview of age, sex, therapy, and status marker distributions in the current global cohort.
    *   **"Define T2 Malignancy Criteria" Card:** The interactive tool for defining T2 criteria.
        *   **Criteria Configuration:** Features (size, shape, etc.) can be enabled/disabled via checkboxes, and their values (e.g., size threshold) can be adjusted via sliders or button clicks.
        *   **Logic Switch:** Toggles the logical combination of active criteria between **AND** (all criteria must be met) and **OR** (at least one criterion must be met).
        *   **"Apply & Save" Button:** Applies the configured T2 criteria globally to the entire application and saves them for future sessions. An unsaved state is indicated by a dashed card border.
    *   **"Diagnostic Performance (Current T2)" Card:** Displays the diagnostic performance (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) of the currently defined (but not yet necessarily applied) T2 settings in real-time.
    *   **Brute-Force Optimization:** This section is twofold:
        1.  **"Criteria Optimization (Brute-Force)" Card (Runner):** A new optimization analysis can be started here. The user selects a target metric (e.g., "Balanced Accuracy") and starts the process. A progress bar indicates the status. After completion, the best-found criteria can be applied directly ("Apply Best") or the top-10 results can be viewed in a detail window ("Top 10").
        2.  **"Brute-Force Optima (Saved Results)" Card (Overview):** This table provides a persistent overview of the **best saved results** for each cohort and each target metric that has already been run. This data is preserved even after closing the browser.
    *   **Analysis Table:** Visualizes the impact of the *currently applied* criteria at the patient level. Expandable rows show which criteria are met for each individual lymph node.

### 3.3. Statistics Tab
*   **Purpose:** Provides a formal and comprehensive statistical evaluation of diagnostic performance.
*   **Components & Workflow:**
    *   **View Switch ("Single View" / "Comparison View"):** Toggles between the analysis of a single cohort (based on the **Global Cohort Selection**) and the direct statistical comparison of two user-selectable cohorts.
    *   **Statistics Cards:** Present detailed results on:
        *   **Descriptive Statistics:** Demographics, status distributions, and lymph node counts for the selected cohort(s).
        *   **Diagnostic Performance:** Detailed metrics with 95% CIs for both the Avocado Sign and the applied T2 criteria.
        *   **Statistical Comparison:** McNemar and DeLong tests comparing AS vs. applied T2 criteria.
        *   **Association Analysis:** Odds Ratios and Risk Differences for individual features.
        *   **Added Diagnostic Value (in 'Surgery alone' cohort):** A special analysis showing how well the Avocado Sign performs in cases where the ESGAR 2016 T2 criteria failed.
    *   **Criteria Comparison Table (in "Single View" only):** Compares the performance of the Avocado Sign against the applied T2 criteria and predefined criteria sets from the literature. For literature criteria, the performance is calculated on the methodologically correct cohort, which may differ from the currently selected global cohort.

### 3.4. Comparison Tab
*   **Purpose:** Formats selected analysis results visually for presentations and direct comparisons, enforcing methodological correctness via the **Analysis Context**.
*   **Components & Workflow:**
    *   **View Selection:** Focuses on either the standalone performance of the AS ("AS Performance") or the direct comparison with T2 criteria ("AS vs. T2 Comparison").
    *   **T2 Comparison Basis:** In "AS vs. T2" mode, the user can choose to compare the AS against the interactively set criteria or one of the predefined literature criteria sets from a dropdown menu.
    *   **Automatic Context Switching:** When a literature-based criterion is selected for comparison, the application automatically establishes an **Analysis Context**. It locks the cohort to the one most appropriate for that criterion (e.g., "Surgery alone" for ESGAR criteria) to ensure a methodologically sound comparison. The UI provides clear feedback about this automatic switch, and the global cohort selectors in the header are disabled.
    *   **Dynamic Content:** Automatically generates comparison tables, statistical tests, and a bar chart based on the active context.

### 3.5. Publication Tab
*   **Purpose:** An assistant for creating a scientific manuscript according to the style guidelines of the journal *Radiology*.
*   **Components & Workflow:**
    *   **Title Page & Outline:** The view starts with a *Radiology*-compliant title page (including Key Results and Abbreviations) and is clearly structured into main sections (Abstract, Introduction, etc.), which are navigable via a sticky sidebar.
    *   **Dynamic Text Generation:** The application generates professionally formulated, English-language text for each section, dynamically integrating the **latest analysis results** (from comparisons with literature and brute-force criteria) and correctly formatting all values and citations (e.g., *P* < .001).
    *   **Embedded Content:** Tables and figures are generated directly within the text flow, including a rendered flowchart in the results section and a STARD checklist.
    *   **BF Metric Selection:** A dropdown menu allows the user to select which brute-force optimization result should be cited in the text.
    *   **Word Count Monitoring:** The navigation sidebar displays a live word/item count for each section with a defined limit, providing color-coded feedback (green/orange/red) to aid in adhering to journal guidelines.

## 4. Technical Appendix

### 4.1. Key Technologies
*   **Core:** HTML5, CSS3, JavaScript (ES6+)
*   **UI/Layout:** Bootstrap 5
*   **Data Visualization:** D3.js
*   **Asynchronous Computation:** Web Workers
*   **UI Enhancements:** Tippy.js

### 4.2. Glossary
*   **AS:** Avocado Sign
*   **AUC:** Area Under the Curve. A measure of the overall performance of a diagnostic test.
*   **BF:** Brute-Force. An exhaustive search method for identifying optimal parameters.
*   **CI:** Confidence Interval.
*   **nCRT:** Neoadjuvant Chemoradiotherapy.
*   **NPV:** Negative Predictive Value.
*   **OR:** Odds Ratio.
*   **PPV:** Positive Predictive Value.
*   **RD:** Risk Difference.
*   **T2w:** T2-weighted. A specific type of MRI sequence.