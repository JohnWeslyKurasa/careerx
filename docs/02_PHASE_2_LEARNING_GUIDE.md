# CAREERX — Phase 2: Beginner-Friendly Learning Guide & Implementation Plan
> **Mastering Document Ingestion: The Resume & Job Description Parsing Engine**  
> *Target Audience: Written from absolute basics for students and engineers learning how unstructured documents become structured data.*

---

# PART 1: The Learning Guide (Concepts from Absolute Basics)

## 1. What Does "Document Parsing" Mean?

To a computer, a document file (like a PDF or Word document) is not a list of projects or work experiences. It is just a massive stream of binary zeros and ones (`01101001...`) containing font tables, drawing instructions, vector lines, and raw character codes.

**Document Parsing** is the automated process of:
1. Opening that raw binary file.
2. Reading and decoding the text characters and layout coordinates.
3. Filtering out stylistic noise (headers, footers, margins, font styling).
4. Converting the human-readable visual document into clean digital text.

In short: **Parsing takes a document designed for human eyes and translates it into data a computer program can understand and manipulate.**

---

## 2. Why Does CAREERX Need Document Parsing?

Everything in CAREERX depends on having high-quality, trustworthy data:
- To match a candidate against a job, we must know **what skills they have** and **what projects they built**.
- To calculate the Job Readiness Score ($JRS$), we must know **what the employer is asking for**.
- To run an adaptive mock interview, the AI agent must read **the candidate's actual accomplishments**.

Candidates do not hand us clean database records; they upload **PDF resumes**, **Word documents (.docx)**, or paste **Job Descriptions from LinkedIn or company portals**.

> **The Golden Rule of AI**: *Garbage In, Garbage Out (GIGO).*  
> If our parser mangles the text, skips a project, or scrambles dates, every downstream system (RAG, scoring, mock interviews) will produce flawed, inaccurate results. Phase 2 is the foundational gatekeeper of all data quality.

---

## 3. PDF vs. DOCX vs. TXT: Understanding File Formats

| Format | Internal Structure | Difficulty to Parse | Why It's Built That Way |
| :--- | :--- | :--- | :--- |
| **Plain Text (`.txt`)** | Pure stream of characters (ASCII / UTF-8) with simple newlines (`\n`). | ⭐ Very Easy | Contains zero styling, layout, or font information. Just pure words. |
| **Word Document (`.docx`)** | A zipped archive containing structured XML files (`word/document.xml`). | ⭐⭐ Medium | Text is organized into explicit XML tags: `<w:p>` (paragraphs) and `<w:r>` (runs/formatting). |
| **Portable Document Format (`.pdf`)** | A visual drawing canvas. | ⭐⭐⭐⭐ Hard | PDF was designed to look identical on every printer and screen. It does not store "paragraphs"; it stores instructions like: *"Draw character 'P' at coordinates (x=72, y=140)"*. |

---

## 4. How Text is Extracted from Each Format

### 4.1 Plain Text (`.txt` or Raw String)
- **Mechanism**: Standard file reading (`open(file, 'r', encoding='utf-8')`).
- **Complexity**: Trivial. We only need to normalize line endings and trim extra whitespace.

### 4.2 Word Documents (`.docx`)
- A `.docx` file is secretly a `.zip` file!
- If you rename `resume.docx` to `resume.zip` and extract it, you will find `word/document.xml`.
- Inside `document.xml`, text is hierarchically organized:
  $$\text{Document} \longrightarrow \text{Body} \longrightarrow \text{Paragraphs} \longrightarrow \text{Runs of Text}$$
- **Tool**: We use `python-docx`. It traverses these XML trees and extracts paragraph text in reading order, preserving bullet points and lists.

### 4.3 PDF Documents (`.pdf`)
- In a PDF, words don't inherently know which line or column they belong to.
- If a resume has a **two-column layout** (e.g., Skills on the left, Work Experience on the right), a naive PDF reader might read horizontally across both columns, producing gibberish:
  > *"Skills: Python TechStart Inc Backend Intern Developed APIs Docker 2025"*
- **Tool**: We use `pdfplumber`. `pdfplumber` analyzes visual bounding boxes (`x0, top, x1, bottom`), grouping characters into words and lines based on geometric proximity. This ensures multi-column resumes are parsed in correct visual reading order.

---

## 5. What Does "Resume Parsing" Mean?

**Resume Parsing** is the transition from **Raw Text** to a **Semantic Entity Graph**:
1. Identifying distinct sections (Contact Info, Education, Experience, Projects, Skills, Certifications).
2. Segmenting bullet points inside each project or job.
3. Extracting technical entities (languages, frameworks, databases, cloud tools).
4. Recognizing chronological dates and durations.

---

## 6. What Does "Job Description (JD) Parsing" Mean?

A Job Description is an employer's wishlist. JDs are often unstructured, filled with company marketing, generic HR policies, and bulleted skill lists.

**JD Parsing** means:
1. Filtering out boilerplate text (e.g., *"We are an equal opportunity employer..."*).
2. Extracting **Role Metadata**: Job Title, Company, Minimum Experience required.
3. Decomposing expectations into **Atomic Requirement Items**:
   - Hard Technical Skills (e.g., `FastAPI`, `MongoDB`, `Docker`).
   - Core Theoretical Competencies (e.g., `Data Structures`, `System Design`).
   - Soft / Professional Competencies (e.g., `Agile development`, `Technical documentation`).
4. Assigning **Importance Weights** (e.g., `3.0` for Must-Have vs `1.0` for Nice-to-Have).
5. Extracting **Interview Topics** to guide the mock interviewer.

---

## 7. Raw Extracted Text vs. Structured Information

Look at the difference:

### 🔴 Raw Extracted Text (Unusable for Math or RAG)
```text
Arjun Sharma | arjun@email.com | github.com/arjun-dev
EDUCATION
ABC Institute of Technology - B.Tech CS (2022-2026) GPA 8.6
PROJECTS
Distributed Task Runner (github.com/arjun-dev/task-runner)
- Built async task queue using Python and Redis.
- Implemented worker pool handling 500 tasks/sec.
SKILLS
Python, FastAPI, Redis, Docker, Git
```

### 🟢 Structured Information (Pydantic / BSON Model)
```json
{
  "candidate_name": "Arjun Sharma",
  "email": "arjun@email.com",
  "github_username": "arjun-dev",
  "education": [
    {
      "institution": "ABC Institute of Technology",
      "degree": "B.Tech CS",
      "gpa": 8.6,
      "grad_year": 2026
    }
  ],
  "projects": [
    {
      "title": "Distributed Task Runner",
      "repo_url": "https://github.com/arjun-dev/task-runner",
      "tech_stack": ["Python", "Redis"],
      "bullets": [
        "Built async task queue using Python and Redis.",
        "Implemented worker pool handling 500 tasks/sec."
      ],
      "metrics_detected": ["500 tasks/sec"]
    }
  ],
  "skills": ["Python", "FastAPI", "Redis", "Docker", "Git"]
}
```

Once data is in this structured format, our backend can query it, filter it, embed it for RAG, and compute mathematical scores.

---

## 8. What We Extract from a Resume

```
+-----------------------------------------------------------------------------------+
| CANDIDATE RESUME SCHEMA                                                           |
+-----------------------------------------------------------------------------------+
| 1. Contact & Identity: Full Name, Email, Phone, LinkedIn, GitHub Profile          |
| 2. Education: Institution, Degree, Major, GPA/Percentage, Graduation Year        |
| 3. Experience: Company, Role/Title, Start/End Dates, Bullet Points                |
| 4. Projects: Project Title, Repository Link, Live Demo URL, Tech Stack, Bullets   |
| 5. Skills: Categorized into Languages, Frameworks, Databases, Cloud/DevOps, Tools  |
| 6. Certifications: Certificate Name, Issuing Organization, Year                   |
+-----------------------------------------------------------------------------------+
```

---

## 9. What We Extract from a Job Description

```
+-----------------------------------------------------------------------------------+
| JOB DESCRIPTION SCHEMA                                                            |
+-----------------------------------------------------------------------------------+
| 1. Metadata: Job Title, Company Name, Location, Experience Level                  |
| 2. Raw Text: Cleaned original text for auditability                              |
| 3. Requirements: List of granular requirements, each with:                        |
|    - req_id: Unique identifier (e.g. "req_01")                                    |
|    - text: Original requirement sentence                                         |
|    - category: HARD_SKILL | DATABASE | ARCHITECTURE | TOOL                        |
|    - canonical_skills: Normalized names (e.g. ["Python", "FastAPI"])              |
|    - importance_weight: 1.0 (Bonus) to 3.0 (Mandatory)                            |
| 4. Interview Topics: List of 3-6 core technical themes for the interview agent   |
+-----------------------------------------------------------------------------------+
```

---

## 10. The Resume Parsing Flow

```
[ Uploaded File: .pdf / .docx ]
                │
                ▼
[ File Format Dispatcher ]
    ├── If .pdf  ──> pdfplumber text extraction
    └── If .docx ──> python-docx paragraph/table extraction
                │
                ▼
[ Document Normalization & Cleaning ]
(Strip null bytes, normalize unicode quotes/dashes, standardize newlines)
                │
                ▼
[ Section Header Detection (Regex / Pattern Matcher) ]
(Detects "Education", "Projects", "Technical Skills", "Experience")
                │
                ▼
[ Entity & Pattern Extractors ]
    ├── Email & Phone Regex
    ├── GitHub / LinkedIn URL Regex
    ├── Technical Skills Dictionary Lookup (2,000+ canonical terms)
    └── Project & Experience Block Segmenter
                │
                ▼
[ Pydantic Schema Validation: ParsedResume ]
(Enforces types, formats, and structural integrity)
```

---

## 11. The Job Description Parsing Flow

```
[ Raw JD Input: Text string or file ]
                │
                ▼
[ Text Normalization & Cleaning ]
(Remove HR boilerplate, bullet character standardization)
                │
                ▼
[ Section & Requirement Splitter ]
(Splits text into individual requirement sentences / bullet items)
                │
                ▼
[ Technical Entity Extraction & Skill Normalization ]
(Matches technical keywords against canonical skill catalog)
                │
                ▼
[ Category & Importance Weight Assignment ]
(Classifies into HARD_SKILL, DATABASE, etc., and computes weights)
                │
                ▼
[ Interview Topic Synthesis ]
(Identifies top 3-5 technical themes for future interview probing)
                │
                ▼
[ Pydantic Schema Validation: ParsedJobDescription ]
```

---

## 12. Document Cleaning and Normalization

Raw documents are notoriously messy. Before trying to extract structured data, we run a **Text Cleaning Pipeline**:

1. **Unicode Normalization (`unicodedata.normalize('NFKD')`)**:
   - Converts fancy curly quotes (`“`, `”`) into standard ASCII quotes (`"`).
   - Converts em-dashes (`—`) into standard hyphens (`-`).
2. **Whitespace Collapsing**:
   - Converts multiple spaces, tabs, and non-breaking spaces (`\u00a0`) into single spaces.
3. **Bullet Point Standardization**:
   - Converts various bullet symbols (`•`, `▪`, `*`, `➢`, `-`) into a uniform `- `.
4. **Header Normalization**:
   - Maps varied header names to canonical section keys:
     - `WORK HISTORY`, `EXPERIENCE`, `EMPLOYMENT` $\longrightarrow$ `EXPERIENCE`
     - `TECHNICAL COMPETENCIES`, `SKILLS & TOOLS` $\longrightarrow$ `SKILLS`
     - `ACADEMIC BACKGROUND`, `EDUCATION` $\longrightarrow$ `EDUCATION`

---

## 13. How Parsing Errors Can Happen (And How We Prevent Them)

| Failure Case | What Goes Wrong | CAREERX Defensive Solution |
| :--- | :--- | :--- |
| **Scanned Image PDF** | The PDF contains images of text without an embedded text layer. | The parser detects zero extractable text and raises a clear `ScannedDocumentError` with instructions to use a text-based PDF. |
| **Corrupted File** | Incomplete upload or broken byte header. | Wrapped in `try...except` block raising `InvalidFileFormatError` returning HTTP 400. |
| **Two-Column Layout** | Left column and right column text get merged horizontally. | `pdfplumber` layout-aware extraction with vertical coordinate grouping. |
| **Unrecognized Header** | Candidate uses *"Where I Learned"* instead of *"Education"*. | Fallback regex dictionary with fuzzy match aliases for common section names. |
| **Spam / Huge File** | Candidate uploads a 100MB video disguised as a PDF. | Strict file-size validation ($\le 10\text{MB}$) before reading bytes. |

---

## 14. Which Libraries We Plan to Use and WHY

| Library | Version | Why We Chose It (Engineering Rationale) |
| :--- | :--- | :--- |
| **`pdfplumber`** | `^0.11.0` | Best open-source Python library for layout-aware PDF text extraction. Captures character coordinates, tables, and multi-column streams accurately. |
| **`python-docx`** | `^1.1.2` | The gold standard for reading `.docx` files natively by traversing Microsoft Word's underlying OpenXML DOM. |
| **`pypdf`** | `^4.2.0` | Lightweight, fast fallback reader for simple single-page PDFs and metadata inspection. |
| **`pydantic v2`** | `^2.7.0` | Validates that all extracted entities strictly conform to our domain models before any database write or API response. |

---

## 15. Where the Parsing Engine Sits in the Architecture

Referring back to our Layered Clean Architecture from Phase 0:

```
[ API Layer: /api/v1/profile/upload & /api/v1/jd/analyze ]  <-- Controllers
                            │
                            ▼
[ Deterministic Service Layer: app/services/parser/ ]        <-- HERE IS PHASE 2!
  ├── resume_parser.py  (PDF/DOCX extraction & entity regex)
  ├── jd_parser.py      (Requirement extraction & skill mapping)
  └── normalizer.py     (Unicode cleaning, section segmentation)
                            │
                            ▼
[ Models Layer: app/models/profile.py & app/models/jd.py ]   <-- Strict Schemas
```

Notice that Phase 2 lives entirely inside the **Deterministic Service Layer**. It does not use heavy LLMs or vector databases. It is fast, predictable, and 100% reproducible.

---

## 16. How Phase 2 Connects to Phase 1

- **API Versioning**: Phase 2 routes will mount directly under our Phase 1 API router (`api_v1_router` in `backend/app/api/v1/router.py`).
- **Configuration & Limits**: Uses `settings` from `backend/app/core/config.py` for file size limits and allowed extensions.
- **Error Handling**: Uses the Phase 1 global exception handler to return safe, structured JSON errors if parsing fails.

---

## 17. How Phase 2 Will Later Connect to Phase 3 and RAG

1. **To Phase 3 (Database Ingestion)**:
   - Phase 2 outputs validated Pydantic objects (`ParsedResume`, `ParsedJobDescription`).
   - Phase 3 will take those objects and save them into MongoDB collections (`profiles` and `job_descriptions`).
2. **To Phase 4 (RAG & Retrieval Engine)**:
   - Phase 2 segments projects into individual bullet points.
   - Phase 4 will convert those individual bullet points into **Evidence Nodes** and calculate Sentence-BERT vector embeddings for semantic search.

---

## 18. Complete End-to-End Walkthrough Example

Let's trace what happens when Arjun uploads his resume:

1. **Candidate Action**: Arjun uploads `arjun_resume.pdf` via the web app.
2. **FastAPI Endpoint (`POST /api/v1/profile/upload`)**:
   - Reads the raw bytes using `UploadFile`.
   - Validates file type (`application/pdf`) and size ($< 10\text{MB}$).
3. **`ResumeParserService`**:
   - Invokes `pdfplumber` to extract text from each page.
   - Calls `TextNormalizer` to clean up dashes and line breaks.
   - Identifies sections: `EDUCATION`, `PROJECTS`, `SKILLS`.
   - Regex extracts email: `arjun@example.com`, GitHub: `https://github.com/arjun-dev`.
   - Projects extractor identifies:
     - Title: `Distributed Task Runner`
     - URL: `https://github.com/arjun-dev/task-runner`
     - Bullets: `["Built async task queue using Python and Redis", "Handled 500 tasks/sec"]`
4. **Validation**: Pydantic validates the extracted data into a `ParsedResume` object.
5. **Response**: FastAPI returns HTTP 200 with the structured JSON payload.

---

## 19. What Phase 2 Will NOT Do Yet

To keep our architecture modular and strictly phased, Phase 2 will **NOT**:
- ❌ Save documents to MongoDB (that is **Phase 3**).
- ❌ Generate vector embeddings or call Sentence-Transformers (that is **Phase 4**).
- ❌ Calculate the Job Readiness Score ($JRS$) (that is **Phase 5**).
- ❌ Call OpenAI or Gemini for conversational generation (that is **Phase 6 & 7**).
- ❌ Clone or inspect GitHub repositories (that is **Phase 11**).

---

## 20. Expected Inputs and Outputs (Contract Specifications)

### Input: Resume Upload
- **Content-Type**: `multipart/form-data`
- **Field**: `file: UploadFile` (PDF or DOCX)

### Output: Resume Parse JSON (`HTTP 200`)
```json
{
  "full_name": "Arjun Sharma",
  "email": "arjun@example.com",
  "phone": "+91 9876543210",
  "github_url": "https://github.com/arjun-dev",
  "linkedin_url": "https://linkedin.com/in/arjun-dev",
  "education": [
    {
      "institution": "ABC Institute of Technology",
      "degree": "B.Tech Computer Science",
      "gpa": 8.6,
      "grad_year": 2026
    }
  ],
  "experiences": [],
  "projects": [
    {
      "title": "Distributed Task Runner",
      "repo_url": "https://github.com/arjun-dev/task-runner",
      "tech_stack": ["Python", "Redis", "FastAPI"],
      "bullets": [
        "Built async task queue using Python and Redis.",
        "Implemented worker pool handling 500 tasks/sec."
      ]
    }
  ],
  "skills": ["Python", "FastAPI", "Redis", "Docker", "Git"],
  "extraction_metadata": {
    "file_type": "pdf",
    "pages_parsed": 1,
    "parsing_time_ms": 142
  }
}
```

### Input: Job Description Text (`POST /api/v1/jd/analyze`)
```json
{
  "title": "Junior Python Backend Engineer",
  "company": "Apex Cloud Systems",
  "raw_text": "We need a Python Backend Engineer with strong FastAPI and MongoDB skills. Must have experience with Redis caching and building RESTful APIs."
}
```

### Output: JD Analysis JSON (`HTTP 200`)
```json
{
  "title": "Junior Python Backend Engineer",
  "company": "Apex Cloud Systems",
  "requirements": [
    {
      "req_id": "req_01",
      "category": "HARD_SKILL",
      "text": "strong FastAPI and MongoDB skills",
      "canonical_skills": ["FastAPI", "MongoDB"],
      "importance_weight": 3.0
    },
    {
      "req_id": "req_02",
      "category": "DATABASE",
      "text": "experience with Redis caching",
      "canonical_skills": ["Redis"],
      "importance_weight": 2.5
    },
    {
      "req_id": "req_03",
      "category": "ARCHITECTURE",
      "text": "building RESTful APIs",
      "canonical_skills": ["REST"],
      "importance_weight": 2.0
    }
  ],
  "interview_topics": ["FastAPI Dependency Injection", "Redis Invalidation", "Async Event Loops"]
}
```

---

## What I Should Understand Before Coding (Checklist)

- [ ] I understand what document parsing does and why GIGO (Garbage In, Garbage Out) matters for AI.
- [ ] I know why PDFs are harder to parse than DOCX or plain text (coordinate-based drawing vs paragraph XML).
- [ ] I understand why `pdfplumber` is used for PDFs and `python-docx` for Word documents.
- [ ] I know the difference between raw text strings and validated Pydantic models.
- [ ] I can list what fields we extract from a resume and from a JD.
- [ ] I understand why Phase 2 is purely deterministic logic and does not write to MongoDB or call LLMs yet.

---

# PART 2: Phase 2 Implementation Plan

## 1. Directory & File Plan

```
backend/
├── app/
│   ├── models/
│   │   ├── profile.py           # [NEW] Pydantic schemas for parsed resume data
│   │   └── jd.py                # [NEW] Pydantic schemas for parsed JD requirements
│   ├── services/
│   │   ├── parser/
│   │   │   ├── __init__.py      # [NEW] Service package exports
│   │   │   ├── normalizer.py    # [NEW] Unicode cleaning, text sanitizer, regex utilities
│   │   │   ├── resume_parser.py # [NEW] PDF & DOCX text extractor and section splitter
│   │   │   └── jd_parser.py     # [NEW] JD requirements, weights, and topic extractor
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── __init__.py  # [NEW] Endpoints package
│   │       │   ├── profile.py   # [NEW] Route: POST /api/v1/profile/parse
│   │       │   └── jd.py        # [NEW] Route: POST /api/v1/jd/parse
│   │       └── router.py        # [MODIFY] Register profile and jd routers under /api/v1
└── tests/
    ├── fixtures/
    │   ├── sample_resume.txt    # [NEW] Test resume text
    │   └── sample_jd.txt        # [NEW] Test job description text
    ├── test_resume_parser.py    # [NEW] Unit tests for resume extraction & edge cases
    └── test_jd_parser.py        # [NEW] Unit tests for JD requirement extraction & weights
```

## 2. Purpose of Every Planned File

| File | Purpose |
| :--- | :--- |
| `backend/app/models/profile.py` | Defines `ParsedResume`, `EducationItem`, `ExperienceItem`, `ProjectItem` Pydantic models with strict validation. |
| `backend/app/models/jd.py` | Defines `ParsedJobDescription`, `RequirementItem`, `CategoryEnum` Pydantic models. |
| `backend/app/services/parser/normalizer.py` | Pure utility functions: unicode cleaning, header regex matching, email/URL extraction, skill keyword dictionary lookup. |
| `backend/app/services/parser/resume_parser.py` | Orchestrates file reading (`pdfplumber` / `docx`), section segmentation, and returns structured `ParsedResume`. |
| `backend/app/services/parser/jd_parser.py` | Decomposes raw JD text into categorized requirement items, weights, and interview topics. |
| `backend/app/api/v1/endpoints/profile.py` | FastAPI route handling `POST /api/v1/profile/parse` (file upload). |
| `backend/app/api/v1/endpoints/jd.py` | FastAPI route handling `POST /api/v1/jd/parse` (JSON payload). |
| `backend/app/api/v1/router.py` | Mounts the new endpoints into the `/api/v1` namespace. |
| `backend/tests/test_resume_parser.py` | Tests parsing correctness across valid PDFs, DOCX, empty files, and corrupted files. |
| `backend/tests/test_jd_parser.py` | Tests JD requirement breakdown, skill categorization, and weight assignments. |

## 3. Dependencies to Install

From `backend/requirements.txt`:
```bash
pdfplumber>=0.11.0,<0.12.0
python-docx>=1.1.2,<2.0.0
pypdf>=4.2.0,<5.0.0
```

## 4. Testing Strategy (Target: $\ge 90\%$ Coverage on Parsers)

1. **Unit Tests (`test_resume_parser.py`)**:
   - Extract contact info from various header formats.
   - Extract projects with and without GitHub URLs.
   - Handle empty file upload $\rightarrow$ HTTP 400.
   - Handle corrupted/unsupported file $\rightarrow$ HTTP 415 / 422.
   - Clean unicode characters without crashing.
2. **Unit Tests (`test_jd_parser.py`)**:
   - Extract requirements from bulleted lists and paragraph blocks.
   - Verify canonical skill normalization (`"fastapi"` $\rightarrow$ `"FastAPI"`, `"reactjs"` $\rightarrow$ `"React"`).
   - Ensure importance weights are within range `[1.0, 3.0]`.
3. **API Integration Tests**:
   - Verify `POST /api/v1/profile/parse` returns valid schema matching `ParsedResume`.
   - Verify `POST /api/v1/jd/parse` returns valid schema matching `ParsedJobDescription`.

## 5. Edge Cases Handled

1. **Scanned PDF (No text layer)**: Returns `HTTP 400` with message *"The uploaded PDF contains scanned images or no extractable text. Please upload a text-based PDF."*
2. **Large File Upload**: Rejects files larger than 10MB (`HTTP 413 Payload Too Large`).
3. **Corrupted File**: Catches decoding errors and returns `HTTP 400 Bad Request`.
4. **Missing Sections**: Resumes missing optional sections (e.g. no certifications or no experience) gracefully default to empty lists (`[]`) instead of throwing key errors.

---

# PART 3: Post-Implementation Architecture & Learning Review

## 1. What Was Actually Built in Phase 2

Phase 2 successfully delivered the complete **Deterministic Resume & Job Description Parsing Engine**:

1. **Multi-Format Document Extraction**:
   - `pdfplumber` + `pypdf` fallback for PDF layout parsing.
   - `python-docx` for OpenXML Word document parsing.
   - Plain text decoder with Latin-1 fallback for `.txt`.
2. **Robust Text Normalizer & Canonical Taxonomy**:
   - NFKD Unicode normalization to eliminate smart quotes, em-dashes, and special bullets.
   - 300+ entry canonical skill dictionary mapping non-standard aliases (`"fastapi"` $\rightarrow$ `"FastAPI"`, `"postgres"` $\rightarrow$ `"PostgreSQL"`, `"k8s"` $\rightarrow$ `"Kubernetes"`) with negative lookahead/lookbehind regex matching around punctuation.
   - Regex extractors for email, phone, GitHub profile/repos, LinkedIn, and accomplishment metrics (`500 req/s`, `28%`).
3. **Structured Resume Parser**:
   - Segmenter dividing lines into `EDUCATION`, `PROJECTS`, `EXPERIENCE`, `SKILLS`, and `CERTIFICATIONS`.
   - Project entity builder linking GitHub URLs, bullet points, tech stack tags, and quantifiable metrics.
   - Experience builder with heuristic distinction between roles (e.g. *"Intern"*, *"Engineer"*) and companies (e.g. *"TechStart Inc"*).
4. **Job Description Decomposer**:
   - Requirement clause splitter identifying technical expectations from bullet points and sentences.
   - Importance weighting: `3.0` for mandatory/critical skills (*"must have"*, *"required"*), `1.0` for bonus skills (*"nice to have"*, *"plus"*), `2.0` for standard skills.
   - Interview topic synthesizer generating 3–5 core technical themes.
5. **REST API Endpoints**:
   - `POST /api/v1/profile/parse`: Accepts multipart file upload (PDF, DOCX, TXT) and returns validated `ParsedResume`.
   - `POST /api/v1/jd/parse`: Accepts JSON payload (`raw_text`, `title`, `company`) and returns validated `ParsedJobDescription`.
6. **Zero Phase 3+ Bleed**:
   - Zero writes to MongoDB (Phase 3).
   - Zero vector embeddings or RAG (Phase 4).
   - Zero LLM prompts (Phase 6/7).

---

## 2. Files Created and Modified

| File | Status | Purpose |
| :--- | :---: | :--- |
| `backend/app/models/profile.py` | **NEW** | Pydantic v2 domain schemas: `ParsedResume`, `ProjectItem`, `EducationItem`, `ExperienceItem`. |
| `backend/app/models/jd.py` | **NEW** | Pydantic v2 domain schemas: `ParsedJobDescription`, `RequirementItem`, `CategoryEnum`, `JDParseRequest`. |
| `backend/app/services/parser/__init__.py` | **NEW** | Service package exports: `ResumeParser`, `JobDescriptionParser`. |
| `backend/app/services/parser/normalizer.py` | **NEW** | Unicode cleaner, regex matchers, canonical skill catalog, and section detectors. |
| `backend/app/services/parser/resume_parser.py` | **NEW** | Multi-format reader (`pdfplumber`/`docx`), section segmenter, and project builder. |
| `backend/app/services/parser/jd_parser.py` | **NEW** | Requirement clause extractor, importance weight assigner, and interview topic generator. |
| `backend/app/api/v1/endpoints/__init__.py` | **NEW** | Endpoints package initialization. |
| `backend/app/api/v1/endpoints/profile.py` | **NEW** | API Controller: `POST /api/v1/profile/parse` with file size & format validation. |
| `backend/app/api/v1/endpoints/jd.py` | **NEW** | API Controller: `POST /api/v1/jd/parse` with length validation. |
| `backend/app/api/v1/router.py` | **MODIFIED** | Mounted `profile_router` (`/profile`) and `jd_router` (`/jd`) into `/api/v1`. |
| `backend/tests/test_resume_parser.py` | **NEW** | 7 unit and integration tests for resume parsing (TXT, DOCX, empty, invalid formats, endpoints). |
| `backend/tests/test_jd_parser.py` | **NEW** | 4 unit and integration tests for JD extraction, weights, interview topics, and endpoints. |

---

## 3. Data Flow Through Phase 2

```
[ Client: Browser / Postman ]
             │
             │ HTTP POST (multipart/form-data or JSON)
             ▼
[ FastAPI Route Controller: endpoints/profile.py or endpoints/jd.py ]
             │
             ├── Validates file size (<= 10MB) & extension (.pdf, .docx, .txt)
             │
             ▼
[ Deterministic Service: ResumeParser or JobDescriptionParser ]
             │
             ├── 1. Format-specific byte decoding (pdfplumber / docx)
             ├── 2. normalizer.normalize_text() (NFKD unicode, bullets, spaces)
             ├── 3. Section chunking via SECTION_PATTERNS
             ├── 4. normalizer.extract_skills_from_text() (Canonical dictionary)
             ├── 5. Metric & URL extraction via regex
             │
             ▼
[ Pydantic Validation: ParsedResume or ParsedJobDescription ]
             │
             │ Returns HTTP 200 JSON
             ▼
[ Client receives structured, validated data ]
```

---

## 4. Real Example Input & Output

### 4.1 Sample Resume Input Text
```text
Arjun Sharma
arjun.sharma@example.com | +91 9876543210
https://github.com/arjun-dev | https://linkedin.com/in/arjun-dev

EDUCATION
ABC Institute of Technology
B.Tech in Computer Science and Engineering | GPA: 8.6
2022 - 2026

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: FastAPI, React, Node.js, Next.js
Databases & Cloud: MongoDB, Redis, PostgreSQL, Docker, AWS

PROJECTS
Distributed Task Runner
https://github.com/arjun-dev/task-runner
- Built an asynchronous distributed task runner using Python and Redis.
- Implemented worker pool handling 500 req/s with 99.9% uptime.
- Containerized using Docker for scalable deployment.

EXPERIENCE
TechStart Inc - Backend Intern
May 2025 - Aug 2025
- Contributed to production REST APIs in FastAPI.
- Authored automated unit tests with 85% test coverage.
```

### 4.2 Actual Extracted Output (`ParsedResume`)
```json
{
  "full_name": "Arjun Sharma",
  "email": "arjun.sharma@example.com",
  "phone": "+91 9876543210",
  "github_url": "https://github.com/arjun-dev",
  "linkedin_url": "https://linkedin.com/in/arjun-dev",
  "portfolio_url": null,
  "education": [
    {
      "institution": "ABC Institute of Technology",
      "degree": "B.Tech in Computer Science and Engineering",
      "gpa": 8.6,
      "start_year": 2022,
      "grad_year": 2026
    }
  ],
  "experiences": [
    {
      "company": "TechStart Inc",
      "role": "Backend Intern",
      "duration": "May 2025 - Aug 2025",
      "bullets": [
        "Contributed to production REST APIs in FastAPI.",
        "Authored automated unit tests with 85% test coverage."
      ]
    }
  ],
  "projects": [
    {
      "title": "Distributed Task Runner",
      "repo_url": "https://github.com/arjun-dev/task-runner",
      "live_url": null,
      "tech_stack": ["Asynchronous Programming", "Docker", "Python", "Redis"],
      "bullets": [
        "Built an asynchronous distributed task runner using Python and Redis.",
        "Implemented worker pool handling 500 req/s with 99.9% uptime.",
        "Containerized using Docker for scalable deployment."
      ],
      "metrics_detected": ["500 req/s"]
    }
  ],
  "skills": [
    "AWS", "Asynchronous Programming", "Docker", "FastAPI", "JavaScript",
    "MongoDB", "Next.js", "Node.js", "PostgreSQL", "Python", "REST",
    "React", "Redis", "SQL", "TypeScript"
  ],
  "extraction_metadata": {
    "filename": "resume.txt",
    "file_type": "txt",
    "pages_parsed": 1,
    "character_count": 1042,
    "parsing_time_ms": 3
  }
}
```

---

## 5. Automated Test Results

Test suite was executed using `.venv\Scripts\python -m pytest -v`:

```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\abhip\Videos\pr\major project
configfile: pytest.ini
testpaths: backend/tests
plugins: anyio-4.14.2, asyncio-1.4.0
collected 16 items

backend/tests/test_health.py::test_root_endpoint PASSED                  [  6%]
backend/tests/test_health.py::test_health_endpoint_schema PASSED         [ 12%]
backend/tests/test_health.py::test_cors_headers PASSED                   [ 18%]
backend/tests/test_health.py::test_health_endpoint_degraded_when_db_disconnected PASSED [ 25%]
backend/tests/test_health.py::test_database_manager_ping PASSED          [ 31%]
backend/tests/test_jd_parser.py::test_jd_parser_direct_extraction PASSED [ 37%]
backend/tests/test_jd_parser.py::test_jd_parser_too_short_text PASSED    [ 43%]
backend/tests/test_jd_parser.py::test_jd_api_endpoint_success PASSED     [ 50%]
backend/tests/test_jd_parser.py::test_jd_api_endpoint_validation_error PASSED [ 56%]
backend/tests/test_resume_parser.py::test_resume_parser_txt_format PASSED [ 62%]
backend/tests/test_resume_parser.py::test_resume_parser_docx_format PASSED [ 68%]
backend/tests/test_resume_parser.py::test_resume_parser_empty_file PASSED [ 75%]
backend/tests/test_resume_parser.py::test_resume_parser_unsupported_format PASSED [ 81%]
backend/tests/test_resume_parser.py::test_resume_api_endpoint_success PASSED [ 87%]
backend/tests/test_resume_parser.py::test_resume_api_endpoint_empty_file PASSED [ 93%]
backend/tests/test_resume_parser.py::test_resume_api_endpoint_invalid_extension PASSED [100%]

============================= 16 passed in 1.49s ==============================
```

---

## 6. Real Failure Cases Discovered & Resolved During Engineering

During implementation, we encountered 4 real-world engineering bugs and resolved them deterministically:

1. **Standalone URL Lines Treated as Project Titles**:
   - *Problem*: In `Distributed Task Runner\nhttps://github.com/arjun-dev/task-runner`, the parser saw the second line as short text without a period and treated the URL itself as a separate project title!
   - *Fix*: Added an explicit check: if a line starts with `http://` or `https://`, it is recognized as a link belonging to the active project rather than a title.
2. **Punctuation Boundary on Skill Keywords (`"Redis."`)**:
   - *Problem*: When a bullet point ended with `Redis.`, the trailing period was excluded from positive lookaheads in character classes, causing `Redis` to be missed in sentence-ending bullets.
   - *Fix*: Switched to alphanumeric lookarounds: `rf"(?<![a-zA-Z0-9]){re.escape(alias)}(?![a-zA-Z0-9])"` which gracefully handles trailing periods, commas, and parentheses.
3. **Experience Company vs. Role Heuristic**:
   - *Problem*: Resumes write experiences inconsistently. Some write `TechStart Inc - Backend Intern` (Company - Role), while others write `Backend Intern - TechStart Inc` (Role - Company).
   - *Fix*: Added a keyword heuristic (`ROLE_KEYWORDS = ["intern", "engineer", "developer", "lead", ...]`) that inspects both sides of the delimiter to accurately identify which is the role and which is the company.
4. **FastAPI Multipart Dependency**:
   - *Problem*: Uploading files using `UploadFile = File(...)` requires `python-multipart` to parse HTTP multipart form boundaries.
   - *Fix*: Installed `python-multipart>=0.0.9` into the virtual environment and registered it in dependencies.

---

## 7. What I Should Be Able to Explain in a Viva (Q&A)

### Q1: Why did you build a deterministic parser instead of sending the entire resume to an LLM like GPT-4?
> **Answer**:  
> *"Three reasons: cost, speed, and determinism. Resume parsing is a high-volume, structured extraction task. Running an LLM on every uploaded PDF costs money, introduces 3–5 seconds of latency, and carries hallucination risks (LLMs might invent skills or alter dates). Our deterministic regex and layout parser runs in under 150 milliseconds, costs $0.00, and is 100% reproducible for academic evaluation. We save LLMs for where reasoning is truly needed — like adaptive mock interviews in Phase 7."*

### Q2: How do you handle two-column or multi-column resumes?
> **Answer**:  
> *"Standard PDF parsers concatenate characters horizontally across the page, which scrambles two-column layouts. We use `pdfplumber`, which inspects geometric bounding boxes (`x0, top, x1, bottom`) and extracts words based on spatial proximity. This preserves the visual reading order of separate columns."*

### Q3: What happens if a candidate uploads a scanned image PDF?
> **Answer**:  
> *"A scanned PDF has no digital font or character layer. Our parser measures the extractable character count. If the normalized character count is below 20 characters, it detects that the document is a scanned image and raises a custom `ScannedDocumentError`, returning an HTTP 400 with a clear message explaining why text-based PDFs are required."*

### Q4: How does the JD parser determine the importance weight of a requirement?
> **Answer**:  
> *"It applies a rule-based weighting algorithm. If a requirement contains imperative, mandatory phrasing like 'must have', 'required', 'minimum', or 'essential', it receives a high weight of 3.0. If it contains bonus phrasing like 'nice to have', 'plus', or 'preferred', it receives a 1.0 weight. Otherwise, standard requirements default to 2.0. This feeds directly into our Job Readiness Score ($JRS$) calculation in Phase 5."*

---

## 8. Short Revision Checklist (Before Moving to Phase 3)

- [x] I know what libraries are used: `pdfplumber` for PDFs, `python-docx` for Word documents, `pydantic` for schemas.
- [x] I can explain the route structure: `POST /api/v1/profile/parse` and `POST /api/v1/jd/parse`.
- [x] I understand why text normalization (unicode, smart quotes, bullets) is necessary before extraction.
- [x] I can trace a project from a resume bullet point into a `ProjectItem` with a `tech_stack` and `metrics_detected`.
- [x] I know that Phase 2 does NOT write to MongoDB or call vector search yet (that is Phase 3 and Phase 4).

