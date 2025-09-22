# Product Mission

## Pitch

MTX Product Configurator is a fully dynamic, API-driven configuration tool that helps contractors, designers, and consumers easily configure and quote custom-made mirror and lighting products by providing real-time visualization and seamless product customization that adapts instantly to backend data changes without requiring code updates.

## Users

### Primary Customers

- **Contractors**: Building professionals who need to quickly spec and quote custom mirrors for commercial and residential projects
- **Interior Designers**: Design professionals who require precise customization options for their clients' spaces
- **End Consumers**: Homeowners and businesses purchasing custom mirrors directly for their properties

### User Personas

**Commercial Contractor** (35-55 years old)
- **Role:** Project Manager / Purchasing Agent
- **Context:** Managing multiple construction or renovation projects simultaneously
- **Pain Points:** Time-consuming manual quote processes, difficulty visualizing custom products, managing multiple vendor relationships
- **Goals:** Streamline product selection, get accurate quotes quickly, ensure product specifications match project requirements

**Interior Designer** (28-45 years old)
- **Role:** Lead Designer / Design Consultant
- **Context:** Working with high-end residential and commercial clients
- **Pain Points:** Limited visualization tools, complex SKU systems, difficulty communicating custom options to clients
- **Goals:** Present professional proposals, match exact design specifications, simplify client approval process

**Homeowner** (30-65 years old)
- **Role:** Direct Purchaser
- **Context:** Renovating bathroom or updating home lighting
- **Pain Points:** Overwhelming number of options, uncertainty about sizing, unclear pricing for custom products
- **Goals:** Find the perfect mirror for their space, understand all options clearly, get transparent pricing

## The Problem

### Rigid Configuration Systems

Traditional product configurators hard-code product options and business rules, requiring expensive development cycles for every product change. This results in inflexible systems that can't adapt to new products or rule changes.

**Our Solution:** Fully API-driven architecture where ALL configuration options, product lines, and business rules are dynamically loaded from the Supabase backend, enabling instant updates without code deployment.

### Complex Product Configuration

Custom mirror and lighting products have dozens of configuration options across multiple categories that change based on product lines and compatibility rules. Manual configuration leads to errors, missed options, and frustrated customers.

**Our Solution:** Intelligent, rules-based configuration interface that dynamically presents only valid options based on backend-defined compatibility rules and product line specifications.

### Inefficient Quoting Process

Traditional quoting requires back-and-forth communication, manual calculations, and delays that can lose sales. This results in 40% longer sales cycles and increased administrative costs.

**Our Solution:** Instant quote generation with all specifications documented and exportable, powered by real-time API data.

### Visualization Challenges

Customers struggle to envision how different options will look together. Static catalogs and sample photos don't show the exact configuration being considered.

**Our Solution:** Dynamic SVG-based rendering that updates in real-time as options are selected, with images and styling controlled by backend rules.

## Differentiators

### Fully Dynamic, Data-Driven Architecture

Unlike competitors with hard-coded product catalogs, our configurator is 100% API-driven. Product Lines (Deco, Thin, Tech), configuration categories, and business rules are all loaded dynamically from Supabase. Backend administrators can add new products, modify options, or change business rules without touching code or requiring deployments.

### Real-Time Visual Configuration

Unlike traditional catalog-based systems, we provide instant visual feedback using dynamic SVG layers controlled by backend rules. This results in 60% fewer revision requests and higher customer satisfaction.

### Backend-Agnostic Flexibility

Unlike monolithic configurators, our presentation layer is completely separated from business logic. All product definitions, compatibility rules, and pricing logic live in the Supabase backend, enabling rapid business changes and A/B testing without frontend modifications.

## Key Features

### Core Features

- **Dynamic Product Line Loading:** Product Lines (Deco, Thin, Tech) and their available options are loaded directly from the Supabase API in real-time
- **API-Driven Configuration Categories:** All 13+ configuration categories are dynamically determined by backend data, not hard-coded in the frontend
- **Rules Engine Integration:** Compatibility rules, pricing logic, and option filtering are processed from backend-defined rules stored in Supabase
- **Real-Time Visual Rendering:** Dynamic SVG generation based on API-provided styling rules and product images
- **Instant Quote Generation:** Generate detailed quotes with specifications dynamically assembled from API data

### Dynamic Architecture Features

- **Zero-Deployment Product Updates:** Backend administrators can add new product lines, modify options, or change rules without requiring code changes
- **API-Driven Business Logic:** All product compatibility, pricing calculations, and SKU generation rules are defined in Supabase tables
- **Dynamic Option Filtering:** Available options automatically adjust based on backend-defined product relationships and rules
- **Flexible Product Taxonomy:** Product hierarchies, option categories, and relationships are entirely data-driven from the API
- **Runtime Configuration:** The configurator adapts its interface and behavior based on real-time API responses

### Collaboration Features

- **Quote Export:** Share configurations as JSON with all data sourced from live API
- **Multi-Product Cart:** Configure multiple products with dynamic cross-product compatibility checking
- **Customer Data Collection:** Capture contact information with backend-configurable form fields
- **Dynamic SKU Generation:** Automatic product code creation based on API-defined rules and hierarchies
- **Backend-Controlled Accessibility:** Include accessories and options dynamically loaded from product line definitions