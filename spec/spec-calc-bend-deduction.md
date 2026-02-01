---
title: Bend Deduction Calculator Specification
calculator_id: bend-deduction
category: fabrication
date_created: 2026-02-01
author: Engineering Calculator Spec Agent
tags: [calculator, engineering, fabrication, sheet-metal, bend-deduction, k-factor]
---

# Bend Deduction Calculator

## 1. Calculator Overview

### Use Case

This calculator computes the bend deduction (BD) for sheet-metal fabrication. Bend deduction represents the amount to subtract from the sum of flange lengths to obtain the correct flat pattern length. It is derived from the bend allowance (BA) and setback (SB), based on bend angle, inside bend radius, material thickness, and K-factor. Useful for press brake programming, flat layout, and design verification.

### Category

**Category ID**: fabrication
**Rationale**: Sheet-metal fabrication workflow tool. The Fabrication category groups calculators like bend allowance, bend deduction, and flat pattern length.

### Calculator Metadata

- **Calculator ID**: `bend-deduction`
- **Display Name**: Bend Deduction
- **Short Description**: Compute bend deduction from angle, radius, thickness, K-factor.

## 2. Input Specifications

| Field ID     | Label              | Type          | Units/Options                                                                            | Default | Description                                               |
| ------------ | ------------------ | ------------- | ---------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| angleDeg     | Bend Angle         | number        | degrees (0–180)                                                                          | -       | Bend angle in degrees. Typical press brake bends: 0–180°. |
| insideRadius | Inside Bend Radius | number        | mm, in                                                                                   | -       | Inside radius of the bend. Must be ≥ 0.                   |
| thickness    | Material Thickness | number        | mm, in                                                                                   | -       | Thickness of the sheet/plate. Must be > 0.                |
| kFactor      | K-factor           | number/select | numeric input (0–1); presets: Mild Steel (0.40), Aluminum (0.33), Stainless Steel (0.45) | 0.40    | Neutral axis location factor. Typical range 0.30–0.50.    |
| unitSystem   | Units              | select        | mm, in                                                                                   | mm      | Unit system for inputs and output.                        |

### Input Notes

- All dimensional inputs must be in the same unit system (mm or in); the outputs use the selected unit system.
- Recommended ranges: `angleDeg` ∈ [0, 180], `insideRadius` ≥ 0, `thickness` > 0, `kFactor` ∈ [0, 1].
- Unit toggle: when switching `unitSystem` between mm and in, automatically convert all dimensional inputs and recompute outputs to maintain equivalence.
- Presets: if a preset is selected for `kFactor`, prefill the numeric value but keep the field editable; users can override any preset.

## 3. Calculation Logic

### Formula/Algorithm

```
Setback (SB) = (R + T) × tan(θ / 2)
Bend Allowance (BA) = θ × (π/180) × (R + K·T)
Bend Deduction (BD) = 2 × SB − BA
```

Where:

- `θ`: Bend angle in degrees
- `R`: Inside bend radius
- `T`: Material thickness
- `K`: K-factor (neutral axis location as a fraction of thickness)

Step-by-step:

1. Validate inputs and ensure consistent unit system (mm or in).
2. Convert bend angle from degrees to radians: `θ_rad = θ × (π/180)`.
3. Compute `SB = (R + T) × tan(θ / 2)` using degrees for the angle term.
4. Compute `BA = θ_rad × (R + K × T)`.
5. Compute `BD = 2 × SB − BA`.
6. Return BD (and optionally SB and BA) in the selected unit system.

### Variables & Constants

- **θ (angleDeg)**: Bend angle [degrees]
- **R (insideRadius)**: Inside bend radius [mm or in]
- **T (thickness)**: Material thickness [mm or in]
- **K (kFactor)**: Neutral axis factor [dimensionless, typically 0.30–0.50]
- **π**: 3.141592653589793

### Calculation Notes

- K-factor depends on material, tooling, and bend process; typical values: Mild Steel ~0.40, Aluminum ~0.33, Stainless ~0.45.
- For small angles (θ in radians), `BD ≈ θ × T × (1 − K)` (since `tan(θ/2) ≈ θ/2`), implying BD ≥ 0 for θ > 0 when `K < 1`.
- Angle limits: restrict to 0–180°. Return 0 for `θ = 0`. Reject negatives.
- Use degree-based `tan(θ/2)` carefully; ensure proper conversion or use a degree-based trig helper.

## 4. Output Specifications

### Primary Output

| Output ID     | Label          | Format                           | Units  | Description                                                          |
| ------------- | -------------- | -------------------------------- | ------ | -------------------------------------------------------------------- |
| bendDeduction | Bend Deduction | 3 decimals (mm); 4 decimals (in) | mm, in | Amount to subtract from flange sums to get flat length for the bend. |

### Secondary Outputs

| Output ID     | Label          | Format                           | Units  | Description                                             |
| ------------- | -------------- | -------------------------------- | ------ | ------------------------------------------------------- |
| setback       | Setback (SB)   | 3 decimals (mm); 4 decimals (in) | mm, in | Geometric offset per flange due to bending.             |
| bendAllowance | Bend Allowance | 3 decimals (mm); 4 decimals (in) | mm, in | Arc length consumed by the bend along the neutral axis. |

### Output Formatting

- Display with the selected unit system (`mm` or `in`).
- Use standard rounding (half-up). Default precision: 3 decimals for metric, 4 decimals for imperial.
- Recompute and display converted values if the unit system is switched.

## 5. User Experience

### Form Layout

- Simple form: all inputs visible at once.
- Optional presets for K-factor via a dropdown; numeric field remains editable.

### Interaction Pattern

- On-submit: require clicking a "Calculate" button to compute BD.
- Validate inputs and show inline errors; disable calculation until required fields are valid.

### Result Rendering

- Inline result card beneath the form showing the computed BD and unit.
- Show secondary outputs (SB and BA) in smaller text for transparency and verification.
- Provide a brief note/reminder of the formulas via an info tooltip.

### Visual Elements

- Render a responsive SVG illustrating a sheet-metal bend with:
  - Inner and outer arcs (inside radius and outside radius = R + T)
  - Neutral axis indicated with a dashed arc (R + K×T)
  - Angle arc (θ) annotation
  - Setback (SB) dimension from tangent points to the apex (per flange)
  - Bend allowance (BA) highlighted along the neutral axis arc
  - Bend deduction (BD) indicated as `2×SB − BA` with a labeled dimension
- Ensure the visualization updates when results are available and keep it accessible with `role="img"` and a descriptive `aria-label`.
- Maintain aspect ratio and center the visualization; avoid distortion.

#### SVG Specification

- **Viewport**: `viewBox="0 0 320 240"` (responsive sizing via CSS)
- **Center point**: bend center at `(80, 180)`
- **Layout**:
  - Straight section leading into the bend
  - Bend arc sweeping from 0° to the specified angle
- **Elements**:
  - Inner arc (inside radius R)
  - Outer arc (outside radius R + T)
  - Neutral axis (dashed arc at R + K×T)
  - Angle arc with label (θ)
  - SB dimension markers (from tangency to apex)
  - BA label along neutral axis
  - BD label, computed as `2×SB − BA`
- **Auto-scaling**:
  - Base radius in pixels: `r_px = clamp(40 + log-scale based on radius, 30, 80)`
  - Scale thickness proportionally to keep visuals readable
- **Styling**: theme primary for material fill (opacity ~0.15), construction lines for dimensions
- **Zero angle**: render straight sheet with thickness and show SB = 0, BA = 0, BD = 0

## 6. Examples

### Example 1: Metric bend (90°)

**Inputs**:

- `angleDeg`: 90°
- `insideRadius`: 2 mm
- `thickness`: 1 mm
- `kFactor`: 0.40
- `unitSystem`: mm

**Calculation**:

- `θ_rad = 90 × (π/180) = π/2 ≈ 1.5707963268`
- `SB = (R + T) × tan(θ/2) = (2 + 1) × tan(45°) = 3 × 1 = 3`
- `BA = θ_rad × (R + K·T) = 1.5707963268 × (2 + 0.40 × 1) = 1.5707963268 × 2.4 ≈ 3.769911184`
- `BD = 2 × SB − BA = 2 × 3 − 3.769911184 = 2.230088816`

**Expected Output**:

- `bendDeduction`: 2.230 mm (rounded to 3 decimals)
- `setback`: 3.000 mm
- `bendAllowance`: 3.770 mm

### Example 2: Imperial bend (45°)

**Inputs**:

- `angleDeg`: 45°
- `insideRadius`: 0.125 in
- `thickness`: 0.0625 in
- `kFactor`: 0.38
- `unitSystem`: in

**Calculation**:

- `θ_rad = 45 × (π/180) ≈ 0.7853981634`
- `SB = (R + T) × tan(θ/2) = (0.125 + 0.0625) × tan(22.5°) = 0.1875 × 0.414213562 ≈ 0.077664`
- `BA = θ_rad × (R + K·T) = 0.7853981634 × (0.125 + 0.38 × 0.0625) = 0.7853981634 × 0.14875 ≈ 0.116762`
- `BD = 2 × SB − BA ≈ 2 × 0.077664 − 0.116762 = 0.038566`

**Expected Output**:

- `bendDeduction`: 0.0386 in (rounded to 4 decimals)
- `setback`: 0.0777 in
- `bendAllowance`: 0.1168 in

### Edge Cases Validated

- Zero angle: `θ = 0` → `SB = 0`, `BA = 0`, `BD = 0`.
- Negative angle: reject input with validation error.
- Angle > 180°: reject input with validation error.
- Negative radius or thickness: reject input with validation error.
- K-factor outside [0, 1]: warn and prevent calculation; suggest typical range 0.30–0.50.

---

## Implementation Notes

- Category: use `fabrication`; if not present in `src/data/categories.ts`, add it with an appropriate icon (e.g., `Build`) and map in `src/components/Layout.tsx` and `src/components/HomePage.tsx`.
- Follow the existing calculator pattern: create component under `src/calculators`, register in `src/data/calculators.ts` with `id: 'bend-deduction'`.
- Use MUI v7 form components; provide a Calculate button and validation.
- Compute `SB`, `BA`, and `BD` per formulas above and display all three (BD primary).
- Consider future enhancements: combine with flat pattern length calculator and add material/process presets.
