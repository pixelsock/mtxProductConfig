# Requirements

This section outlines the functional and non-functional requirements for the project, grounded in the context of your existing system. These requirements are designed to be unambiguous and testable, providing a clear basis for verification.

### Functional

* **FR1**: The system must include a centralized `configuration_ui` to serve as a registry for option sets, enabling dynamic UI rendering and rules.
* **FR2**: Implement a generic `getOptions` function to replace per-collection fetchers, centralizing logic for expanding relations, handling file IDs, and applying status filters and sorting.
* **FR3**: The UI must dynamically render component types (e.g., `multi`, `color-swatch`) based on the `configuration_ui` metadata.
* **FR4**: The rules engine must be generalized to use a canonical field addressing scheme, ensuring rules remain stable even if field names change.
* **FR5**: The engine will support core actions like `Require/disable/hide options`, `Set default/force value`, and `Mutually exclude/require groups`.
* **FR6**: SKU generation logic will be moved to Directus, with a safe expression evaluator and mapping tables for special-case overrides.
* **FR7**: The UI will dynamically render images based on layering metadata defined in a new `image_layers` collection.
* **FR8**: Implement a real-time system to subscribe to changes in `configuration_ui`, `rules`, and other option collections, with a fallback polling mechanism.

### Non-Functional

* **NFR1**: All enhancements must not break existing functionality. New features must be designed for seamless integration and backward compatibility.
* **NFR2**: The UI must maintain visual and interaction consistency with the existing application.
* **NFR3**: The performance impact of the new features should be negligible. The system must maintain existing performance characteristics and not exceed current resource usage.
* **NFR4**: The new rules validation script must prevent the creation of invalid rules that reference non-existent collections, fields, or options.
