---
title: Flat Pattern Length Calculator Specification
calculator_id: flat-pattern-length
category: fabrication
date_created: 2026-02-01
author: Engineering Calculator Spec Agent
tags: [calculator, engineering, fabrication, sheet-metal, flat-pattern, bend-allowance, k-factor]
---

# Flat Pattern Length Calculator

## 1. Calculator Overview

### Use Case

This calculator computes the total flat pattern length (developed length along the neutral axis) for a sheet-metal profile containing multiple bends. Users provide a sequence of straight segment lengths and bend angles, along with material thickness, inside bend radius (global or per-bend), and K-factor. The calculator sums the straight neutral-axis lengths and the bend allowances for each bend to produce the overall flat length. This is useful for press brake programming, nesting/layout, and design verification when creating parts with multiple bends.

### Category

**Category ID**: fabrication
**Rationale**: Part of the sheet-metal fabrication workflow alongside bend allowance, bend deduction, and related calculators.

### Calculator Metadata

- **Calculator ID**: `flat-pattern-length`
- **Display Name**: Flat Pattern Length
- **Short Description**: Compute total flat pattern length from multiple bends and straight segments.

## 2. Input Specifications

| Field ID            | Label                      | Type          | Units/Options                                                                                | Default            | Description                                                                                 |
| ------------------- | -------------------------- | ------------- | -------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| unitSystem          | Units                      | select        | mm, in                                                                                       | mm                 | Unit system for inputs and outputs.                                                         |
| thickness           | Material Thickness         | number        | mm, in                                                                                       | -                  | Material thickness. Must be > 0.                                                            |
| kFactor             | K-factor                   | number/select | numeric input (0–1); presets: Mild Steel (0.40), Aluminum (0.33), Stainless Steel (0.45)     | 0.40               | Neutral axis location factor. Typical range 0.30–0.50.                                      |
| defaultInsideRadius | Default Inside Bend Radius | number        | mm, in                                                                                       | -                  | Global inside radius. Can be overridden per bend. Must be ≥ 0.                              |
| lengthBasis         | Straight Length Basis      | select        | Tangent-to-Tangent (neutral axis), Edge-to-Tangent (outer/inner), Edge-to-Edge (outer/inner) | Tangent-to-Tangent | Defines how straight segment lengths are measured; see Input Notes.                         |
| segments            | Segments (list)            | list          | Each item: { length, angleDeg, insideRadius? }                                               | -                  | Dynamic list of straight segments and subsequent bend angles; see Segments Subfields below. |

### Segments Subfields

| Field ID     | Label         | Type   | Units/Options   | Default          | Description                                                                  |
| ------------ | ------------- | ------ | --------------- | ---------------- | ---------------------------------------------------------------------------- |
| length       | Straight Len. | number | mm, in          | -                | Straight neutral-axis length between bend tangency points (see Input Notes). |
| angleDeg     | Bend Angle    | number | degrees (0–180) | -                | Bend angle following this straight segment. Use 0–180°.                      |
| insideRadius | Inside Radius | number | mm, in          | (global default) | Optional per-bend override; must be ≥ 0.                                     |

### Input Notes

- All dimensional inputs must be in the selected unit system (mm or in); outputs use the same system.
- Recommended ranges: `angleDeg` ∈ [0, 180], `insideRadius` ≥ 0, `thickness` > 0, `kFactor` ∈ [0, 1].
- Length Basis:
  - Tangent-to-Tangent (neutral axis): Preferred. `length` entries represent straight distances between bend tangency points along the neutral axis. In this basis, the total flat length equals the sum of straight lengths plus the sum of bend allowances.
  - Edge-based entries (Edge-to-Tangent or Edge-to-Edge): If chosen, the UI should guide users and convert provided lengths to neutral-axis tangent-to-tangent equivalents using computed setbacks for the appropriate reference (outer = R+T, neutral = R+K·T, inner = R). See Calculation Notes.
- Presets: Selecting a K-factor preset fills the numeric field but remains editable; users can override.
- Unit toggle: When switching `unitSystem` between mm and in, automatically convert all dimensional inputs and recompute outputs.

## 3. Calculation Logic

### Formula/Algorithm

For each bend i with angle `θ_i` (degrees), inside radius `R_i`, material thickness `T`, and K-factor `K`:

```
θ_i_rad = θ_i × (π/180)
Bend Allowance (BA_i) = θ_i_rad × (R_i + K·T)
Setback (SB_i, basis X) = (R_basis + T_basis) × tan(θ_i / 2)
  where basis depends on measurement reference (see Calculation Notes)
```

Total flat pattern length (developed neutral-axis length):

```
FL = (Σ straight neutral-axis lengths) + (Σ BA_i)
```

If users provide straight lengths in an edge-based basis, convert each provided length to neutral-axis tangent-to-tangent equivalent before summing by adjusting with setbacks consistent with the selected basis.

### Variables & Constants

- **θ_i (angleDeg)**: Bend angle for bend i [degrees]
- **R_i (insideRadius)**: Inside bend radius for bend i [mm or in]; defaults to `defaultInsideRadius` when not specified
- **T (thickness)**: Material thickness [mm or in]
- **K (kFactor)**: Neutral axis factor [dimensionless]
- **BA_i**: Bend allowance for bend i [same units as inputs]
- **π**: 3.141592653589793

### Calculation Notes

- Preferred input basis is Tangent-to-Tangent along the neutral axis. In this case, FL is simply the sum of provided straight lengths plus the sum of BA.
- If Edge-to-Tangent or Edge-to-Edge bases are used, convert the straight lengths to neutral-axis tangent-to-tangent by subtracting/adding the appropriate setbacks:
  - Outer reference (outside surface): use `R_out = R + T` in setback.
  - Neutral axis reference: use `R_na = R + K·T` in setback.
  - Inner reference (inside surface): use `R_in = R` in setback.
  - Generic setback formula: `SB_basis = R_basis × tan(θ/2)` if thickness is already embedded in `R_basis`; otherwise use `(R_basis + T_adj) × tan(θ/2)` consistent with the chosen reference geometry.
- Angle limits: restrict to 0–180°. Return zero contributions for `θ = 0`. Reject negatives.
- For small angles (θ in radians), `BA_i ≈ θ_i × (R + K·T)` is already linear; `tan(θ/2) ≈ θ/2` simplifies setback conversions.
- Ensure consistent unit conversions and double-check degree vs. radian usage.

## 4. Output Specifications

### Primary Output

| Output ID  | Label               | Format                           | Units  | Description                                    |
| ---------- | ------------------- | -------------------------------- | ------ | ---------------------------------------------- |
| flatLength | Flat Pattern Length | 3 decimals (mm); 4 decimals (in) | mm, in | Total developed length along the neutral axis. |

### Secondary Outputs

| Output ID        | Label                   | Format                           | Units  | Description                                              |
| ---------------- | ----------------------- | -------------------------------- | ------ | -------------------------------------------------------- |
| sumStraight      | Sum of Straight Lengths | 3 decimals (mm); 4 decimals (in) | mm, in | Sum of converted straight neutral-axis lengths.          |
| sumBendAllowance | Sum of Bend Allowances  | 3 decimals (mm); 4 decimals (in) | mm, in | Σ BA_i across all bends.                                 |
| perBendTable     | Per-Bend Contributions  | table                            | mm, in | Table listing `θ_i`, `R_i`, `BA_i`, and optional `SB_i`. |

### Output Formatting

- Display using the selected unit system (mm or in).
- Use standard rounding (half-up). Default precision: 3 decimals for metric, 4 decimals for imperial.
- Recompute and display converted values if the unit system is switched.

## 5. User Experience

### Form Layout

- Simple form: all global inputs visible at top (Units, Thickness, K-factor, Default Inside Radius, Length Basis).
- Segments editor: dynamic list where each row includes `length`, `angleDeg`, and optional `insideRadius` override. Provide add/remove row actions.

### Interaction Pattern

- On-submit: require clicking a "Calculate" button to compute results.
- Validate inputs and show inline errors; disable calculation until required fields are valid.

### Result Rendering

- Inline result card beneath the form showing the computed Flat Pattern Length.
- Show secondary outputs: sum of straight lengths, sum of bend allowances, and a per-bend contribution table.
- Provide a brief note/reminder of the formulas via an info tooltip.

### Visualization (SVG)

- Render a responsive SVG illustrating the developed profile along the neutral axis with straight segments and bend arcs:
  - Neutral axis polyline with arcs at each bend using `R + K·T`.
  - Inner and outer outlines optional: `R` (inner) and `R + T` (outer) can be drawn lightly to provide context.
  - Angle arc labels (`θ_i`) at each bend.
  - Bend allowance (`BA_i`) indicated along each arc segment.
  - Aggregate length annotation for the overall developed profile.
- Accessibility: include `role="img"` and a descriptive `aria-label`. Maintain aspect ratio and center the visualization.

#### SVG Specification

- **Viewport**: `viewBox="0 0 480 280"` (responsive sizing via CSS)
- **Start point**: `(40, 200)` oriented to the right initially
- **Layout**:
  - Draw each straight segment scaled to pixels; connect with an arc whose central angle equals the bend angle and radius equals `R + K·T`.
  - Update heading vector after each bend: heading rotates by `θ_i`.
- **Auto-scaling**:
  - Compute total theoretical developed length `L_theoretical = Σ(lengths) + Σ(θ_i_rad × (R + K·T))`.
  - Map `L_theoretical` to a target pixel span (e.g., 360 px) and clamp segment/arc scale to keep within viewport.
- **Elements**:
  - Neutral axis path: primary stroke.
  - Optional inner/outer outlines: lighter strokes offset by ±T relative to neutral axis radius at arcs.
  - Angle arc with label near each bend.
  - `BA_i` labels near arc midpoints.
  - Overall `FL` label near the path.
- **Styling**: theme primary for neutral axis (opacity ~0.15 fill if closed shapes), construction lines for dimensions; dashed style for neutral axis if inner/outer outlines are shown.
- **Zero angles**: render straight line segments; arcs omitted; contributions for those bends are zero.

## 6. Examples

### Example 1: Metric profile with two bends (90°, 45°)

**Inputs**:

- `unitSystem`: mm
- `thickness`: 1 mm
- `kFactor`: 0.40
- `defaultInsideRadius`: 2 mm
- `lengthBasis`: Tangent-to-Tangent
- `segments`:
  - { length: 50, angleDeg: 90 }
  - { length: 80, angleDeg: 45 }
  - { length: 30, angleDeg: 0 } // terminal straight, no bend follows

**Calculation**:

- Bend 1: `θ1_rad = 90 × (π/180) = π/2 ≈ 1.5707963268`; `BA1 = 1.5707963268 × (2 + 0.40 × 1) = 1.5707963268 × 2.4 ≈ 3.769911184`
- Bend 2: `θ2_rad = 45 × (π/180) ≈ 0.7853981634`; `BA2 = 0.7853981634 × (2 + 0.40 × 1) = 0.7853981634 × 2.4 ≈ 1.885398`
- Sum straight lengths = `50 + 80 + 30 = 160`
- Flat length `FL = 160 + 3.769911184 + 1.885398 ≈ 165.655309`

**Expected Output**:

- `flatLength`: 165.655 mm
- `sumStraight`: 160.000 mm
- `sumBendAllowance`: 5.655 mm
- Per-bend: `BA1 ≈ 3.770 mm`, `BA2 ≈ 1.885 mm`

### Example 2: Imperial profile with three bends (30°, 90°, 60°)

**Inputs**:

- `unitSystem`: in
- `thickness`: 0.0625 in
- `kFactor`: 0.38
- `defaultInsideRadius`: 0.125 in
- `lengthBasis`: Tangent-to-Tangent
- `segments`:
  - { length: 2.50, angleDeg: 30 }
  - { length: 4.00, angleDeg: 90 }
  - { length: 1.25, angleDeg: 60 }
  - { length: 0.75, angleDeg: 0 }

**Calculation**:

- `R + K·T = 0.125 + 0.38 × 0.0625 = 0.125 + 0.02375 = 0.14875`
- `θ_rad` values: `30° → 0.523599`, `90° → 1.570796`, `60° → 1.047198`
- `BA` values: `0.523599 × 0.14875 ≈ 0.07791`, `1.570796 × 0.14875 ≈ 0.23449`, `1.047198 × 0.14875 ≈ 0.15583`
- Sum straight lengths = `2.50 + 4.00 + 1.25 + 0.75 = 8.50`
- Flat length `FL ≈ 8.50 + (0.07791 + 0.23449 + 0.15583) ≈ 8.96823`

**Expected Output**:

- `flatLength`: 8.9682 in
- `sumStraight`: 8.5000 in
- `sumBendAllowance`: 0.4682 in

### Edge Cases Validated

- Zero angle bends: `θ = 0` → no arc contribution (`BA = 0`), straight segments unchanged.
- Negative angle: reject input with validation error.
- Angle > 180°: reject input with validation error.
- Negative radius or thickness: reject input with validation error.
- K-factor outside [0, 1]: warn and prevent calculation; suggest typical range 0.30–0.50.
- Empty segments list or missing required fields: show validation messages; do not compute.
- Extremely large sums: auto-scale SVG and cap precision to maintain readability.

---

## Implementation Notes

- Category: use `fabrication`; if not present in `src/data/categories.ts`, add it with a suitable icon (e.g., `Build`) and map in `src/components/Layout.tsx` and `src/components/HomePage.tsx`.
- Follow existing calculator pattern: create component under `src/calculators`, register in `src/data/calculators.ts` with `id: 'flat-pattern-length'`.
- Use MUI v7 for form and dynamic segments list. Provide validation and a Calculate button.
- Computation:
  - Prefer Tangent-to-Tangent neutral-axis basis for `segments.length`.
  - If an edge-based basis is selected, convert to neutral-axis tangent lengths before summing. Use setbacks derived from appropriate references (inner, neutral, outer) per bend.
  - Compute `BA_i` for each bend and include per-bend details in the result table.
- Visualization: draw the neutral-axis developed profile with arcs and straight segments; annotate per-bend `θ_i` and `BA_i`, and the total `FL`.
- Consider future enhancements: per-bend material/process presets, export of per-bend table (CSV), and integration with bend deduction for outside-dimension conversions.
