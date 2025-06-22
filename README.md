# Nodal Staging Analysis Tool (v4.2.0)

This repository contains the source code for the "Nodal Staging: Avocado Sign vs. T2 Criteria" analysis tool, a client-side web application for advanced research in medical imaging.

For a comprehensive guide on the scientific background, application features, and user workflow, please refer to the detailed **[Application Guide](./docs/Application_Guide.md)**.

## 1. Introduction

### 1.1. Project Purpose
This application is a specialized research instrument designed for the in-depth, reproducible analysis and comparison of diagnostic performance between different MRI-based criteria for assessing mesorectal lymph node status (N-status) in rectal cancer. Its primary scientific goal is to rigorously evaluate the contrast-based **Avocado Sign (AS)** against a spectrum of T2-weighted (T2w) morphological criteria.

### 1.2. Core Features
*   **Interactive Data Exploration:** A high-performance, filterable table view of the patient dataset.
*   **Flexible Criteria Definition:** A dynamic control panel for defining and combining T2w malignancy criteria.
*   **Methodologically Sound Comparisons:** An "Analysis Context" system ensures that all statistical comparisons between diagnostic methods are performed on the correct, identical patient cohorts, a critical requirement for scientific validity.
*   **Automated Criteria Optimization:** An integrated brute-force algorithm, running in a dedicated Web Worker, to systematically identify the mathematically optimal criteria combination for a user-selected diagnostic metric.
*   **Comprehensive Statistical Analysis:** Automated calculation of all relevant diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) including 95% confidence intervals and statistical comparison tests (e.g., DeLong, McNemar).
*   **Publication Assistant:** A dedicated module that generates formatted, English-language text, tables, and figures for a scientific manuscript, precisely adhering to the style guidelines of the journal *Radiology*.

### 1.3. Disclaimer: Research Instrument Only
**This application is designed exclusively for research and educational purposes.** The presented data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not, under any circumstances, be used for clinical diagnosis, direct treatment decisions, or any other primary medical applications.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

## 2. Setup and Usage

### 2.1. System Requirements
*   A modern desktop web browser (e.g., Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).
*   Web Worker support is required for the brute-force optimization feature.

### 2.2. Installation
No installation or server-side setup is required. The application runs entirely in the client's browser.

1.  Clone or download this repository.
2.  Open the `index.html` file in a compatible web browser.
3.  An internet connection is needed on the first run to load external libraries (e.g., Bootstrap, D3.js) from their respective CDNs.

## 3. Technical Overview

### 3.1. Application Architecture
The application follows a modular architecture that separates data logic, service functions, and UI rendering:

1.  **Event Handler (`event_manager.js`):** Captures user interactions and dispatches them to the App Controller.
2.  **State Manager (`state.js`):** Manages the global application state (e.g., active cohort, sort order) and a temporary `analysisContext` to ensure methodologically sound comparisons.
3.  **App Controller (`main.js`):** Orchestrates the data flow. Upon state changes, it triggers data filtering, recalculation of all statistics, and re-rendering of the UI, passing the correct data context to each module.
4.  **Core Modules (`core/`):** Process and evaluate the raw data (`data_processor.js`, `t2_criteria_manager.js`, `study_criteria_manager.js`).
5.  **Service Layer (`services/`):** Contains the complex business logic for statistics, brute-force optimization, and publication generation. The `publication_service.js` module specifically orchestrates a suite of sub-modules within `services/publication_service/` to assemble the manuscript.
6.  **UI Layer (`ui/`):** Responsible for rendering all data and components based on the data provided by the App Controller.

### 3.2. Directory Structure
<details>
<summary>Click to expand a full list of all project files and their locations.</summary>

```
/
├── css/
│   └── style.css
├── data/
│   └── data.js
├── docs/
│   ├── Al-Sukhni_2012_summary.txt
│   ├── Application_Guide.md
│   ├── Barbaro_2024_summary.txt
│   ├── Bates_2022_summary.txt
│   ├── Beets-Tan_2018_summary.txt
│   ├── Borgheresi_2022_summary.txt
│   ├── Garcia-Aguilar_2022_summary.txt
│   ├── Hao_2025_summary.txt
│   ├── Heijnen_2016_summary.txt
│   ├── Horvat_2023_summary.txt
│   ├── Kim_2019_summary.txt
│   ├── Koh_2008_summary.txt
│   ├── Kreis_2021_summary.txt
│   ├── Lambregts_2012_summary.txt
│   ├── Lord_2019_summary.txt
│   ├── Lurz_Schaefer_AvocadoSign_2025.pdf.txt
│   ├── Lurz_Schaefer_AvocadoSign_2025_summary.txt
│   ├── Pangarkar_2021_summary.txt
│   ├── Radiology_Publication_Instructions_for_Authors.md
│   ├── Radiology_Scientific_Style_Guide.md
│   ├── Rutegard_2025_summary.txt
│   ├── Sauer_2004_summary.txt
│   ├── Schrag_2023_summary.txt
│   ├── Stelzner_2022_summary.txt
│   ├── Zhang_2023_summary.txt
│   └── Zhuang_2021_summary.txt
├── js/
│   ├── app/
│   │   ├── main.js
│   │   └── state.js
│   ├── core/
│   │   ├── data_processor.js
│   │   ├── study_criteria_manager.js
│   │   └── t2_criteria_manager.js
│   ├── services/
│   │   ├── publication_service/
│   │   │   ├── abstract_generator.js
│   │   │   ├── discussion_generator.js
│   │   │   ├── introduction_generator.js
│   │   │   ├── methods_generator.js
│   │   │   ├── publication_helpers.js
│   │   │   ├── references_generator.js
│   │   │   ├── results_generator.js
│   │   │   ├── stard_generator.js
│   │   │   └── title_page_generator.js
│   │   ├── brute_force_manager.js
│   │   ├── publication_service.js
│   │   └── statistics_service.js
│   ├── ui/
│   │   ├── components/
│   │   │   ├── chart_renderer.js
│   │   │   ├── flowchart_renderer.js
│   │   │   ├── table_renderer.js
│   │   │   └── ui_components.js
│   │   ├── tabs/
│   │   │   ├── analysis_tab.js
│   │   │   ├── comparison_tab.js
│   │   │   ├── data_tab.js
│   │   │   ├── publication_tab.js
│   │   │   └── statistics_tab.js
│   │   ├── event_manager.js
│   │   └── ui_manager.js
│   ├── config.js
│   └── utils.js
├── workers/
│   └── brute_force_worker.js
├── index.html
└── README.md
```

</details>

### 3.3. Glossary
*   **AS:** Avocado Sign
*   **AUC:** Area Under the Curve
*   **BF:** Brute-Force
*   **CI:** Confidence Interval
*   **nCRT:** Neoadjuvant Chemoradiotherapy
*   **NPV:** Negative Predictive Value
*   **OR:** Odds Ratio
*   **PPV:** Positive Predictive Value
*   **RD:** Risk Difference
*   **T2w:** T2-weighted
