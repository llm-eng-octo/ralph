### PART-018: Case Converter
**Purpose:** Convert between camelCase (JS) and snake_case (backend).
**Condition:** Game sends/receives data to/from backend.
**API:** `MathAIHelpers.CaseConverter.toSnakeCase(obj)` / `.toCamelCase(obj)`
**Key rules:**
- Handles nested objects, arrays, primitives recursively
- CaseConverter may NOT be in the Helpers bundle — verify before using
