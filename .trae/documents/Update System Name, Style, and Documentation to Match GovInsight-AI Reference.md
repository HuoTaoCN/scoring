I will update the system to align with the "GovInsight-AI" reference and your specific naming requirements.

### 1. Project Renaming
- **Chinese Name**: Update to **`工单办理质量智能检测系统`** (as requested).
- **English Name**: Update to **`Intelligent Quality Inspection System for Work Order Handling`** (to match the Chinese name more accurately than the reference).

### 2. Backend Updates (`backend/app.py`)
- Update the system prompt to use the new project name.
- Refine the "Chain of Thought" (CoT) instruction in the prompt to ensure the AI explains *why* it gives a specific confidence score and handling suggestion, mirroring the reference system's logic.

### 3. Frontend Updates (`frontend/index.html` & `style.css`)
- **Header**: Update the page title and main heading to the new names.
- **Style**: Refine the CSS to match the modern, clean aesthetic of the reference (GovInsight-AI), using a card-based layout, clear typography, and the `#1a73e8` (Google Blue) color scheme.
- **Presentation**: Ensure the "Confidence", "Handling Suggestion", and "AI Reasoning" sections are displayed prominently, similar to the reference's design.

### 4. Documentation (`README.md`)
- **Structure**: Rewrite the README to strictly follow the structure of the reference `GovInsight-AI` README:
  - **Project Title & Subtitle**
  - **Background & Pain Points** (Efficiency, Standards, etc.)
  - **Core Values & Features** (Multi-dimensional Inspection, CoT, Triage Strategy, Auto-Revision)
  - **Scenarios** (High Score, Missing Info, Risk Downgrading, etc.)
  - **System Architecture** (Updated to reflect the Python/Flask stack)
  - **Tech Stack**
  - **Quick Start**
