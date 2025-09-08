# MyProject Brownfield Enhancement PRD

## Intro Project Analysis and Context

This document outlines the plan to make the existing configurator fully data-driven from a Directus schema. It serves as a foundational guide for developers and will ensure seamless integration with the existing project.

### Existing Project Overview

* **Analysis Source**: This document is based on a comprehensive plan provided by the project team.
* **Current Project State**: A configurator application with core option collections, a UI driver, a rules engine, and some existing defaults/overrides.

### Available Documentation Analysis

* Using existing project analysis from the provided plan.

### Enhancement Scope Definition

* **Enhancement Type**: Major Feature Modification
* **Enhancement Description**: The configurator will be made fully data-driven from a Directus schema, allowing administrators to manage option sets, rules, UI layout, and SKU generation with no code changes.
* **Impact Assessment**: This is a major change requiring architectural modifications.

### Goals and Background Context

* **Goals**:
    * Empower administrators to manage all configurator metadata in Directus without code changes.
    * Centralize the definition of what constitutes an "option set."
    * Simplify the codebase by replacing hard-coded logic with a generic, data-driven approach.
* **Background Context**: The existing configurator has hard-coded elements that make it difficult to manage and extend. This enhancement aims to decouple the application logic from the data, making it more flexible and easier to maintain.

## Requirements

This section outlines the functional and non-functional requirements for the project, grounded in the context of your existing system. These requirements are designed to be unambiguous and testable, providing a clear basis for verification.

#### Functional

* **FR1**: The system must include a centralized `configuration_ui` to serve as a registry for option sets, enabling dynamic UI rendering and rules.
* **FR2**: Implement a generic `getOptions` function to replace per-collection fetchers, centralizing logic for expanding relations, handling file IDs, and applying status filters and sorting.
* **FR3**: The UI must dynamically render component types (e.g., `multi`, `color-swatch`) based on the `configuration_ui` metadata.
* **FR4**: The rules engine must be generalized to use a canonical field addressing scheme, ensuring rules remain stable even if field names change.
* **FR5**: The engine will support core actions like `Require/disable/hide options`, `Set default/force value`, and `Mutually exclude/require groups`.
* **FR6**: SKU generation logic will be moved to Directus, with a safe expression evaluator and mapping tables for special-case overrides.
* **FR7**: The UI will dynamically render images based on layering metadata defined in a new `image_layers` collection.
* **FR8**: Implement a real-time system to subscribe to changes in `configuration_ui`, `rules`, and other option collections, with a fallback polling mechanism.

#### Non-Functional

* **NFR1**: All enhancements must not break existing functionality. New features must be designed for seamless integration and backward compatibility.
* **NFR2**: The UI must maintain visual and interaction consistency with the existing application.
* **NFR3**: The performance impact of the new features should be negligible. The system must maintain existing performance characteristics and not exceed current resource usage.
* **NFR4**: The new rules validation script must prevent the creation of invalid rules that reference non-existent collections, fields, or options.

## Epic and Story Structure

For brownfield projects, favor a single comprehensive epic unless the user is clearly requesting multiple unrelated enhancements. Based on my analysis of your existing project, I believe this enhancement should be structured as multiple epics because the scope is significant and touches on several distinct areas (foundation, UI, rules, etc.). This aligns with your understanding of the work required.

### Epic 1: Foundation & Option Registry

This epic establishes the core data-driven architecture by creating the OptionSet Registry, centralizing fetching logic, and standardizing data conventions.

* **Epic Goal**: Establish the core data-driven architecture by creating the OptionSet Registry, centralizing fetching logic, and standardizing data conventions.

#### Story 1.1: Standardize Status Filtering
**As a** backend developer, **I want** a standardized way to filter options by their status, **so that** the client can generically fetch only active or published options.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A mechanism exists to define status fields and `published_values` for collections.
        2. The system defaults to filtering by an `active` status if no other status is present.
    * **Technical Requirements**:
        1. All new code adheres to C# best practices.
        2. Maintains a stable frame rate on target devices.
        3. No memory leaks or performance degradation.
* **Game Design Requirements**:
    1. This story is a foundational technical requirement and does not have a direct game design requirement.

#### Story 1.2: Implement OptionSet Registry
**As a** backend developer, **I want** to build an `OptionRegistry` that reads from `configuration_ui`, **so that** the system can dynamically discover and manage all option collections.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A new `OptionRegistry` class is created to read from the `configuration_ui` collection.
        2. The `OptionRegistry` can discover all collections tagged as option sets.
        3. The `OptionRegistry` can parse metadata such as `label`, `value_field`, `display_field`, `image_field`, and `status_mode`.
    * **Technical Requirements**:
        1. The `OptionRegistry` class is implemented with efficient caching to avoid redundant database calls.
        2. The implementation avoids direct database queries and uses a data access layer.
* **Game Design Requirements**:
    1. This is a foundational technical requirement and does not have a direct game design requirement.

#### Story 1.3: Create Generic Option Fetcher
**As a** backend developer, **I want** a single `getOptions` function, **so that** the front-end can fetch options for any collection generically, with built-in filtering and sorting.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A new `getOptions(optionSetName, filters)` function is created.
        2. This function will replace individual per-collection fetchers.
        3. The function will handle relations expansion, file IDs, status filtering, sorting, and pagination.
    * **Technical Requirements**:
        1. The `getOptions` function must be a single, reusable component that adheres to C# best practices.
        2. The implementation ensures that performance remains stable and there are no memory leaks.
* **Game Design Requirements**:
    1. This is a foundational technical requirement and does not have a direct game design requirement.

### Epic 2: Dynamic UI & Rules Engine

This epic is focused on making the user interface and the rules system fully dynamic, driven by the data we've now centralized in Directus. The stories below build upon the foundation of Epic 1.

* **Epic Goal**: Make the user interface and the rules system fully dynamic, driven by the data centralized in Directus.

#### Story 2.1: Dynamic UI Rendering
**As a** front-end developer, **I want** the configurator UI to render dynamically, **so that** new option sets and their layout can be managed in Directus without code changes.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. The UI renderer must map `ui_type` values (e.g., `multi`, `color-swatch`) from `configuration_ui` to the appropriate front-end components.
        2. The UI must read and apply component properties from the `OptionRegistry`.
        3. The layout should support grouping and sections based on `group`, `section_label`, and `section_sort` fields from `configuration_ui`.
    * **Technical Requirements**:
        1. The UI rendering must be performant and not introduce any noticeable lag.
        2. The implementation should be modular and easy to extend with new `ui_type`s.

#### Story 2.2: Generalize Rules Engine
**As a** backend developer, **I want** the rules engine to use a generic field addressing scheme and support core actions, **so that** rules can be created in Directus without being tied to specific field names.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. The rules engine will be updated to accept and process canonical field addresses (e.g., `optionSet.collection.field`) instead of relying on direct field names.
        2. The engine will support core actions like `Require/disable/hide options`, `Set default/force value`, and `Mutually exclude/require groups`.
    * **Technical Requirements**:
        1. The changes must be non-breaking and maintain the existing `if_this` and `then_that` JSON format.
        2. The implementation should prioritize performance to ensure rules are evaluated quickly on configuration changes.
        3. A "rules validator" script will be created to check if referenced collections, fields, and options exist in the schema, preventing invalid rules from being created.

### Epic 3: SKU Generation, Images & Realtime

This epic is focused on making the user interface and the rules system fully dynamic, driven by the data we've now centralized in Directus. The stories below build upon the foundation of Epic 1.

* **Epic Goal**: Implement advanced features such as SKU generation, dynamic image layering, and a real-time update system.

#### Story 3.1: SKU Generation as Content
**As a** backend developer, **I want** to implement a SKU formula system in Directus, **so that** administrators can define SKU generation logic as content without code changes.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A new system for managing SKU generation logic is created in Directus, using either a dedicated collection or by embedding the logic per `product_lines` row.
        2. The system must include a safe expression evaluator that supports a small DSL with functions like `concat`, `upper`, `map`, and conditionals.
        3. The system must support mapping tables for special-case overrides to handle exceptions to the main formula.
    * **Technical Requirements**:
        1. The expression evaluator must be secure and prevent arbitrary code execution (`no eval`).
        2. The implementation must be non-breaking and designed to integrate with the existing `products` collection.
* **Game Design Requirements**:
    1. This story is a foundational technical requirement and does not have a direct game design requirement.

#### Story 3.2: Dynamic Image Layering
**As a** front-end developer, **I want** the configurator to render dynamic image layers, **so that** administrators can change the product's visual representation in Directus without code changes.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A new `image_layers` collection is created to define image layering rules, referencing option combinations to file IDs.
        2. The renderer will dynamically read this table to display the correct layers.
    * **Technical Requirements**:
        1. The renderer must be performant and not introduce any noticeable lag.
        2. The solution must support `z-order`, `blend mode`, and `visibility conditions` (filter JSON).
* **Game Design Requirements**:
    1. This story is a foundational technical requirement and does not have a direct game design requirement.

#### Story 3.3: Real-time Updates & Cache Invalidation
**As a** backend developer, **I want** the system to react to data changes in real-time, **so that** caches are automatically invalidated and the UI is updated instantly.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. The system must subscribe to real-time events from Directus for changes in `configuration_ui`, `rules`, and all option collections.
        2. On a change event, the system must invalidate the `OptionRegistry` and data caches.
        3. The system must have a fallback polling mechanism for environments without WebSocket support.
    * **Technical Requirements**:
        1. The solution must be performant and not introduce any noticeable lag.
        2. The implementation must be robust enough to handle high-frequency updates without causing performance issues.
* **Game Design Requirements**:
    1. This story is a foundational technical requirement and does not have a direct game design requirement.

### Epic 4: Cleanup & Documentation

This epic finalizes the project by removing legacy code, consolidating validators, and creating documentation for administrators.

* **Epic Goal**: Finalize the project by removing legacy code, consolidating validators, and creating documentation for administrators.

#### Story 4.1: Consolidate Validators & Remove Legacy Code
**As a** backend developer, **I want** to consolidate duplicate validators and remove legacy code, **so that** the codebase is cleaner, more maintainable, and easier to understand.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A single, schema-driven validator is created to replace `browser-api-validator.ts` and `api-validator.ts`.
        2. Per-collection service calls are removed or redirected to the new generic `getOptions` function.
    * **Technical Requirements**:
        1. The implementation must be non-breaking and ensure that no functionality is lost during the refactoring process.
        2. The solution must ensure that strict status filtering is enforced across all collections.
* **Game Design Requirements**:
    1. This story is a foundational technical requirement and does not have a direct game design requirement.

#### Story 4.2: Update Documentation & Admin Guide
**As a** technical writer, **I want** to create a comprehensive admin guide and update the existing documentation, **so that** administrators can easily understand how to use the new data-driven configurator.
* **Acceptance Criteria**:
    * **Functional Requirements**:
        1. A new admin guide is created that explains how to add a new option set, configure `configuration_ui`, create rules, define SKU formulas, and add image layers.
        2. The documentation must be updated to reflect the new architecture and code structure.
    * **Technical Requirements**:
        1. The documentation must be clear, concise, and easy to understand for both technical and non-technical users.
        2. The documentation must be kept up-to-date with any future changes.
* **Game Design Requirements**:
    1. This story is a foundational technical requirement and does not have a direct game design requirement.