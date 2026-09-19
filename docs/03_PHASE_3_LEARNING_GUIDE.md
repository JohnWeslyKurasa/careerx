# CAREERX — Phase 3: Beginner-Friendly Learning Guide & Implementation Plan
> **Mastering Data Persistence: The Career Profile & Career Memory Ingestion Engine**  
> *Target Audience: Written from first principles for students and engineers learning how parsed resume artifacts become persistent, auditable career memory in MongoDB.*

---

# PART 1 — Basic Concepts

## 1. What is Data Persistence?
When a computer runs a program, all active variables, parsed objects, and function outputs live in **RAM (Random Access Memory)**.
RAM is **volatile memory**: the moment the server restarts, crashes, or reboots, every piece of data stored in RAM vanishes instantly.

**Data Persistence** means saving data onto a permanent storage medium (like an SSD or hard drive) in a structured format so that:
1. It survives server restarts, operating system crashes, and network reboots.
2. It can be retrieved, queried, updated, and linked weeks or months later.

In CAREERX, persistence means that once Arjun uploads his resume and our Phase 2 parser extracts his projects and skills, that data is permanently stored. When Arjun logs in tomorrow or next week, his profile and accomplishments are immediately available.

---

## 2. Why Can't We Keep the Parsed Resume Only in Memory?
In Phase 2, we built:
$$\text{Resume File (PDF/DOCX)} \longrightarrow \text{Parser} \longrightarrow \text{In-Memory ParsedResume Object} \longrightarrow \text{HTTP Response}$$

If we stop here without database persistence:
- **No Multi-Page Workflows**: The user would have to re-upload their resume on every single web page transition (e.g., going from Profile view to Mock Interview view).
- **No Historical Progress Tracking**: CAREERX cannot calculate whether a candidate is improving over time if yesterday's readiness score and projects disappear from RAM.
- **No Cross-Target Comparisons**: When a candidate applies to Job A (Backend) and then Job B (Full-Stack), we would need to re-parse their resume from scratch every single time instead of querying their persistent portfolio.
- **Server Memory Overload**: If 1,000 students use the platform simultaneously, keeping full PDF text and structured objects in RAM will crash the Python server with `OutOfMemory` errors.

---

## 3. What is a Database?
A **Database** is specialized, highly optimized software designed specifically to store, organize, protect, and rapidly retrieve structured data on permanent disk storage.

Instead of writing custom code to save text files to a folder, a database provides:
- **ACID or Base Guarantees**: Guarantees that writes succeed completely or fail cleanly (no half-saved corrupted files).
- **Fast Querying**: Finds specific records in milliseconds using indexes, even among millions of documents.
- **Concurrent Access**: Handles hundreds of users reading and writing simultaneously without file conflicts.

---

## 4. What is a Document Database?
Traditional databases (like MySQL or PostgreSQL) are **Relational Databases**. They store data in rigid 2-dimensional tables with fixed columns and rows:
```text
Table: candidates (id, name, email)
Table: projects   (id, candidate_id, title, repo_url)  <-- Joined by foreign key
Table: skills     (id, project_id, skill_name)         <-- Another join
```
If you want to fetch a candidate's full profile, SQL has to perform multiple slow, expensive `JOIN` operations across 4 or 5 tables.

A **Document Database** (NoSQL) takes a completely different approach:
- It stores data as **independent, self-contained JSON/BSON documents**.
- Related data (like education, projects, and skills) is **embedded directly inside the parent document**.
- A candidate's entire career history can be fetched in **one single lightning-fast read operation** without any joins.

---

## 5. What is MongoDB?
**MongoDB** is the world's leading open-source document database.
Instead of tables and rows, MongoDB organizes data into:
$$\text{Database} \longrightarrow \text{Collections} \longrightarrow \text{Documents} \longrightarrow \text{Fields}$$

### Why MongoDB for CAREERX? (Architectural Justification)
1. **Semi-Structured Reality of Resumes**: One candidate has 6 projects and 0 work experiences; another has 3 jobs and 1 project. Relational schemas require dozens of nullable columns; MongoDB handles variable structures natively.
2. **Deeply Nested Trees**: Project bullet points, skill arrays, and education records map 1-to-1 with Python dictionaries and Pydantic models.
3. **Built-in Vector Search (Phase 4)**: Modern MongoDB Atlas and Community support native Vector Search (HNSW indexes over 384-dimensional dense embeddings), allowing us to store documents and semantic vectors in the same database.

---

## 6. What is a MongoDB Collection?
A **Collection** in MongoDB is the equivalent of a table in a relational database. It is a container that groups related documents together.

In CAREERX, our Phase 0 architecture defines 4 primary collections:
1. `profiles`: Stores candidate identity, education, work history, projects, and raw skills.
2. `evidence_nodes`: Stores granular, verifiable claims linked to proof artifacts and embeddings.
3. `job_descriptions`: Stores parsed target job postings and requirement weights.
4. `interviews`: Stores mock interview sessions, transcripts, and evaluation reports.

---

## 7. What is a MongoDB Document?
A **Document** is a single record stored inside a collection, represented internally in **BSON** (Binary JSON) format.

A document looks like a standard JSON object:
```json
{
  "_id": "66d3a8f198b1e42f9011a2bc",
  "candidate_id": "usr_98a7f1e2",
  "full_name": "Arjun Sharma",
  "raw_skills": ["Python", "FastAPI", "Redis"]
}
```
Documents can store strings, numbers, booleans, dates, arrays of items, and nested sub-documents.

---

## 8. What is a MongoDB `ObjectId`?
Every document in MongoDB automatically receives a unique 12-byte identifier stored in the `_id` field.
An `ObjectId` consists of:
- 4 bytes representing the Unix timestamp of creation.
- 5 bytes of random machine/process identifier.
- 3 bytes of an incrementing counter.

**Why CAREERX uses both `_id` and `candidate_id`:**
- `_id` is MongoDB's internal primary key (e.g. `ObjectId("66d3a8f198b1...")`).
- `candidate_id` is our application-level business identifier (e.g. `"usr_98a7f1e2"`).
- Using a human-readable business key like `"usr_98a7f1e2"` makes API URLs clean (`/api/v1/profile/usr_98a7f1e2`) and decouples our domain logic from MongoDB's internal object IDs.

---

## 9. What is a Schema / Model?
Even though MongoDB is technically "schema-less" (it will allow you to save anything), professional production systems must **never** save random, unvalidated data.

A **Schema / Model** is a strict blueprint that defines:
- Exactly what fields are allowed.
- The required data types (e.g., `grad_year` must be an integer, not a string).
- Which fields are mandatory vs optional.
- Default values (e.g., `confidence_score` defaults to `0.5`).

---

## 10. Difference Between Pydantic Models and MongoDB Documents

| Concept | Pydantic Model (`backend/app/models/`) | MongoDB Document (`careerx_db`) |
| :--- | :--- | :--- |
| **Where it lives** | Python runtime memory (RAM) | On the hard drive/SSD (Disk) |
| **Primary Job** | Validates incoming API requests and enforces data types in Python code. | Efficient long-term storage, indexing, and querying. |
| **Format** | Python classes (`BaseModel`) with type annotations. | BSON (Binary JSON) data structures. |
| **Handling of IDs** | Handles strings and numbers cleanly. | Uses `ObjectId` for its primary key `_id`. |
| **Example** | `ParsedResume(full_name="Arjun", ...)` | `{ "_id": ObjectId(...), "candidate_id": "usr_..." }` |

**The Bridge**: In Phase 3, Motor and Pydantic work together:
$$\text{HTTP Request} \longrightarrow \text{Pydantic Validates} \longrightarrow \text{dict()} \longrightarrow \text{Motor writes BSON to MongoDB}$$
$$\text{MongoDB reads BSON} \longrightarrow \text{Motor dict} \longrightarrow \text{Pydantic Model} \longrightarrow \text{HTTP Response}$$

---

## 11. What is CRUD?
**CRUD** is the foundation of all persistent software. It stands for:
- **C - Create**: Inserting a new record (e.g., `db.profiles.insert_one(...)`).
- **R - Read**: Querying existing data (e.g., `db.profiles.find_one({"candidate_id": "usr_..."})`).
- **U - Update**: Modifying an existing record (e.g., `db.profiles.update_one(...)`).
- **D - Delete**: Removing a record (e.g., `db.profiles.delete_one(...)`).

---

## 12. What is Indexing?
Imagine a phonebook with 1,000,000 names printed in completely random order. Finding *"Arjun Sharma"* would require reading every single page from front to back (**Full Table Scan** — extremely slow!).
If the phonebook is sorted alphabetically, you can flip directly to the letter *"S"* and find the number in 2 seconds.

An **Index** is a specialized sorted lookup data structure (typically a B-Tree) that MongoDB maintains in RAM.
- Without an index on `candidate_id`, MongoDB has to inspect every document in the database to find one candidate.
- With a **unique index** on `candidate_id`, lookups take **less than 1 millisecond** ($O(\log N)$ time complexity).

---

## 13. Why Does CAREERX Need Persistent Career Data?
CAREERX is not a one-time "resume rating widget". It is an **evidence-based career intelligence platform**:
1. Candidates upload resumes, get evaluated, and receive a learning plan.
2. Two weeks later, they complete a project, push code to GitHub, and return to prove their progress.
3. CAREERX retrieves their **Career Memory**, adds the new evidence node, recalculates their readiness trajectory, and shows their score climbing from 62% to 78%.

Without persistence, this entire core value proposition is impossible.

---

# PART 2 — The Career Profile in CAREERX

## 1. What Exactly is a "Career Profile"?
In traditional websites, a profile is just a static user account (username, password, email).
In CAREERX, a **Career Profile** is an auditable, structured technical portfolio representing a candidate's real-world software engineering capabilities.

It represents the candidate's verified identity, educational background, work history, and concrete software projects.

---

## 2. Core Entities and Their Relationships

```
+---------------------------------------------------------------------------------+
|                                 CANDIDATE                                       |
|                  (Identity: candidate_id, email, full_name)                     |
+---------------------------------------------------------------------------------+
                                         │ 1:1
                                         ▼
+---------------------------------------------------------------------------------+
|                              CAREER PROFILE                                     |
|                       (Collection: `profiles`)                                  |
+---------------------------------------------------------------------------------+
          │ 1:N                     │ 1:N                   │ 1:N
          ▼                         ▼                       ▼
   [ Education ]              [ Experience ]           [ Projects ]
   - Institution              - Company                - Title
   - Degree, GPA              - Role, Duration         - Repo URL, Demo URL
   - Grad Year                - Action Bullets         - Tech Stack & Bullets
                                                            │
                                                            │ Generates
                                                            ▼
+---------------------------------------------------------------------------------+
|                              EVIDENCE NODES                                     |
|                    (Collection: `evidence_nodes`)                               |
|  - claim_text, source_type, verifiable_url, verified_skills, confidence_tier    |
+---------------------------------------------------------------------------------+
```

### Entity Breakdown:
1. **Candidate**: The user entity owning the data (`candidate_id`, `email`).
2. **Profile**: The aggregate document storing structured career records in the `profiles` collection.
3. **Resume**: The raw uploaded file (PDF/DOCX) acting as the initial ingestion source.
4. **Education**: Formal academic credentials (`institution`, `degree`, `gpa`, `grad_year`).
5. **Experience**: Professional work or internship history (`company`, `role`, `duration`, `bullets`).
6. **Projects**: Concrete technical software built (`title`, `repo_url`, `tech_stack`, `bullets`).
7. **Skills**: The aggregated set of canonical skills recognized across all sections.
8. **Evidence**: An individual, granular claim that can be verified and evaluated against job requirements.
9. **Evidence Source**: Where the claim came from (`experience_bullet`, `project_bullet`, `github_ast`, `interview_transcript`).
10. **Evidence Strength (Confidence Tier)**:
    - **Tier 1 (UNVERIFIED)**: Skill claimed in a keyword list with no contextual proof ($S_j = 0.30$).
    - **Tier 2 (CONTEXTUAL)**: Described inside an experience/project bullet with actions and outcomes ($S_j = 0.75$).
    - **Tier 3 (ARTIFACT)**: Backed by a verified public GitHub repo link or certified artifact ($S_j = 1.00$).
    - **Tier 4 (DEMONSTRATED)**: Successfully defended during an adaptive mock interview.

---

# PART 3 — Career Memory

## 1. What Do We Mean by "Career Memory"?
**Career Memory** is the concept that a candidate's portfolio of verified skills, projects, and evidence exists **independently of any single piece of paper or any single job description**.

Think of a traditional resume like a **printed photograph** (frozen in time, easily outdated).
Career Memory is like a **dynamic digital album**:
- You can add new photos (new projects).
- You can edit captions (optimized bullet points).
- You can create different custom views for different audiences (targeting a Python backend job vs a DevOps job).

---

## 2. Why Career Memory is Different from "Storing a Resume"
Simply storing a resume means storing a static file: `arjun_resume_v2_final_FINAL.pdf`.
When Arjun applies to a job, the system re-reads that PDF from scratch.

In contrast, **Career Memory**:
- Decomposes the resume into independent, atomic **Evidence Nodes**.
- Each project bullet point becomes its own searchable record:
  - Text: *"Built async task queue using Python and Redis handling 500 req/s"*
  - Verified Skills: `["Python", "Redis", "Asynchronous Programming"]`
  - Verifiable URL: `https://github.com/arjun-dev/task-runner`
  - Confidence Tier: `STRONG` (Tier 3)
- When Arjun targets 10 different job postings, CAREERX queries his persistent **Career Memory** to pull the best evidence for each specific posting.

---

## 3. Persistent Portfolio vs. Job-Specific Data

```
+-------------------------------------------+-------------------------------------------+
| Persistent Career Memory (Job-Agnostic)   | Ephemeral / Job-Specific Analysis         |
+-------------------------------------------+-------------------------------------------+
| - Full candidate identity & contact info  | - Target Job Description requirements     |
| - Education history & degrees             | - Requirement Importance Weights (1.0-3.0)|
| - Real project code & repository links    | - Job Readiness Score (JRS) for Job X     |
| - Verified Evidence Nodes in DB           | - Critical Skill Gaps relative to Job X   |
| - Technical interview evaluation records  | - Tailored resume diff for Job X          |
+-------------------------------------------+-------------------------------------------+
```

---

## 4. How Evidence is Linked to a Candidate
Every Evidence Node stored in the `evidence_nodes` collection has a foreign key reference:
```json
{
  "evidence_id": "ev_01j7x8a9",
  "candidate_id": "usr_98a7f1e2",
  "claim_text": "Implemented Redis caching layer for top 100 queries reducing latency by 28%",
  "source_type": "experience_bullet",
  "source_reference": "TechStart Inc — Backend Intern",
  "verifiable_url": "https://github.com/arjun-dev/task-runner",
  "verified_skills": ["Redis", "FastAPI"],
  "confidence_tier": "STRONG",
  "confidence_score": 0.92
}
```
Because `candidate_id` is indexed, fetching a candidate's complete evidence graph takes less than a millisecond:
`db.evidence_nodes.find({"candidate_id": "usr_98a7f1e2"})`.

---

## 5. How Career Memory Powers Future Phases

1. **Powers Phase 4 (Hybrid RAG & Retrieval Engine)**:
   - In Phase 4, we generate SBERT dense embeddings for each Evidence Node.
   - When a JD asks for *"Experience with high-throughput in-memory caching"*, the RAG engine searches through the candidate's pre-computed Evidence Nodes and immediately retrieves the Redis bullet point.
2. **Powers Phase 5 (Deterministic JRS Scoring)**:
   - The scoring engine inspects the retrieved evidence nodes, reads their `confidence_tier`, and mathematically computes the exact Job Readiness Score.
3. **Powers Phase 7 (Adaptive Mock Interview Agent)**:
   - The LangGraph interviewer looks at the candidate's Career Memory, picks a real project (`"Distributed Task Runner"`), and asks: *"I see in your task runner you handled 500 req/s with Redis. How did you handle worker timeout failures?"*

---

## 6. What Should NOT Be Stored as Permanent Career Evidence?
To maintain research integrity and system quality, the following must **never** be saved as permanent evidence:
- ❌ **Unsubstantiated generic claims**: Words like *"Hard-working team player"* or *"Passionate about AI"* (these are personality statements, not verifiable skills).
- ❌ **Temporary test tokens or session IDs**: Mock interview WebSocket connection tokens belong in memory/Redis, not permanent MongoDB career memory.
- ❌ **Raw binary files (PDFs/DOCXs)**: Storing 10MB PDF binaries directly in MongoDB documents bloats database RAM; only store the structured extracted data and metadata.

---

# PART 4 — Database Design (Based on Phase 0 Specifications)

## 1. Collection Specifications

### 1.1 `profiles` Collection
- **Purpose**: Stores the core candidate profile, educational history, work experience, and structured project tree.
- **Document Schema**:
```json
{
  "_id": "ObjectId(...)",
  "candidate_id": "usr_98a7f1e2",
  "full_name": "Arjun Sharma",
  "email": "arjun@example.com",
  "phone": "+91 9876543210",
  "github_username": "arjun-dev",
  "linkedin_url": "https://linkedin.com/in/arjun-dev",
  "education": [
    {
      "institution": "ABC Institute of Technology",
      "degree": "B.Tech Computer Science",
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
        "Built REST APIs in FastAPI reducing response time by 28%",
        "Implemented Redis caching layer for top 100 queries"
      ]
    }
  ],
  "projects": [
    {
      "project_id": "proj_task_runner",
      "title": "Distributed Task Runner",
      "repo_url": "https://github.com/arjun-dev/task-runner",
      "summary": "Distributed async task queue using Python and Redis.",
      "tech_stack": ["Python", "FastAPI", "Redis", "Docker"],
      "bullets": [
        "Built async task queue using Python and Redis.",
        "Implemented worker pool handling 500 tasks/sec."
      ],
      "metrics_detected": ["500 tasks/sec"]
    }
  ],
  "raw_skills": ["Python", "FastAPI", "Docker", "Redis", "MongoDB", "Git"],
  "created_at": "2026-09-01T10:00:00Z",
  "updated_at": "2026-09-01T10:00:00Z"
}
```

### 1.2 `evidence_nodes` Collection
- **Purpose**: Stores atomic, verifiable claims generated from projects, work experience, and certifications.
- **Document Schema**:
```json
{
  "_id": "ObjectId(...)",
  "evidence_id": "ev_01j7x8a9",
  "candidate_id": "usr_98a7f1e2",
  "claim_text": "Built REST APIs in FastAPI reducing response time by 28%",
  "source_type": "experience_bullet",
  "source_reference": "TechStart Inc — Backend Intern",
  "verifiable_url": "https://github.com/arjun-dev/task-runner",
  "verified_skills": ["FastAPI", "Python", "REST"],
  "confidence_tier": "STRONG",
  "confidence_score": 0.92,
  "embedding": null,
  "created_at": "2026-09-01T10:05:00Z"
}
```
*(Note: `embedding` defaults to `null` in Phase 3 and will be populated with 384-dimensional dense vectors in Phase 4).*

### 1.3 `job_descriptions` Collection
- **Purpose**: Stores decomposed target job descriptions, requirement importance weights, and synthesized interview topics.
- **Document Schema**:
```json
{
  "_id": "ObjectId(...)",
  "jd_id": "jd_backend_001",
  "title": "Junior Python Backend Engineer",
  "company": "Apex Cloud Systems",
  "raw_text": "We are seeking a Python Backend Engineer...",
  "requirements": [
    {
      "req_id": "req_01",
      "category": "HARD_SKILL",
      "text": "Proficiency in Python and asynchronous frameworks (FastAPI)",
      "importance_weight": 3.0,
      "canonical_skills": ["Python", "FastAPI"]
    }
  ],
  "interview_topics": ["FastAPI Dependency Injection", "Redis Invalidation", "Async Event Loop"],
  "created_at": "2026-09-01T10:10:00Z"
}
```

---

## 2. Embedded vs. Referenced Information Design Decision

Why are projects and education **embedded** inside the profile document, but Evidence Nodes are **referenced** in a separate collection?

- **Education & Experience (Embedded)**:
  - These belong 100% to this single candidate and are always read together when viewing a profile. Embedding them avoids slow multi-table lookups.
- **Evidence Nodes (Referenced in separate collection)**:
  - In Phase 4, the RAG search engine needs to perform vector search and BM25 search across thousands of individual claim snippets. If evidence was buried deep inside an embedded array in `profiles`, vector search would be inefficient and slow. Keeping `evidence_nodes` in their own indexed collection enables rapid, direct vector retrieval.

---

## 3. Required MongoDB Indexes

```
+------------------+-----------------------+-------------------+-----------------------------------------+
| Collection       | Index Field(s)        | Type              | Purpose                                 |
+------------------+-----------------------+-------------------+-----------------------------------------+
| profiles         | candidate_id          | Unique            | Instant candidate profile lookup (O(1)) |
| profiles         | email                 | Unique (Sparse)   | Prevents duplicate account creation     |
| evidence_nodes   | evidence_id           | Unique            | Instant evidence node resolution        |
| evidence_nodes   | candidate_id          | Standard          | Fast retrieval of candidate's evidence  |
| evidence_nodes   | verified_skills       | Multikey          | Fast skill-based filtering              |
| job_descriptions | jd_id                 | Unique            | Instant target JD retrieval             |
+------------------+-----------------------+-------------------+-----------------------------------------+
```

---

## 4. Architectural Questions & Decisions Required

> [!NOTE]
> **DECISION REQUIRED (Profile Updating Strategy)**:  
> When an existing candidate (`usr_98a7f1e2`) uploads a new resume, should CAREERX:
> - **Option A (Full Overwrite)**: Completely overwrite existing projects and re-generate all evidence nodes.
> - **Option B (Intelligent Merge)**: Match projects by title/repository link, update modified bullets, preserve existing verified interview depth (Tier 4), and add newly discovered projects.
> 
> *Phase 0 Recommendation*: For Phase 3, implement **Option A (Clean Replacement with Timestamp Audit)** as the foundational baseline, with explicit support for appending standalone projects. Intelligent diff merging will be expanded in Phase 6.

---

# PART 5 — Data Flow in Phase 3

```
[ Uploaded Resume File ]
           │
           ▼
[ Phase 2: ResumeParser.parse_bytes() ]
           │
           │ Outputs in-memory ParsedResume
           ▼
[ Phase 3: ProfileService.ingest_parsed_resume() ]
           │
           ├── 1. Generates or resolves unique candidate_id ("usr_...")
           ├── 2. Constructs CandidateProfile document model
           ├── 3. Decomposes projects & experiences into atomic EvidenceNodes
           │      - Assigns Confidence Tiers (STRONG for repos, CONTEXTUAL for bullets)
           │
           ▼
[ Database Repository Layer: ProfileRepository & EvidenceRepository ]
           │
           ├── Inserts / Updates profile in MongoDB `profiles` collection
           ├── Bulk-inserts EvidenceNodes in MongoDB `evidence_nodes` collection
           │
           ▼
[ MongoDB Database: careerx_db ]
           │
           │ Confirms BSON write
           ▼
[ Returns HTTP 201 Created with persisted CandidateProfile & Evidence count ]
```

### Flow Scenarios:
1. **First-Time Resume Upload**:
   - Generates a new `candidate_id` (`"usr_" + uuid4().hex[:8]`).
   - Writes new document to `profiles` collection.
   - Extracts 5–15 atomic `evidence_nodes` with initial confidence tiers (Tier 2/3).
2. **Adding a Standalone Project**:
   - Candidate provides project title, GitHub link, tech stack, and bullets via UI.
   - Endpoint `POST /api/v1/profile/{candidate_id}/projects` appends the project to `profiles.projects`.
   - Creates corresponding `evidence_nodes` tagged with `source_type: "project_bullet"`.
3. **Targeting a New Job Description**:
   - Candidate submits new JD text.
   - `JobDescriptionParser` parses requirements and weights.
   - Saves document to `job_descriptions` collection with unique `jd_id`.
   - Candidate profile remains completely untouched (clean separation of candidate memory from target jobs).

---

# PART 6 — Phase 3 API Design

According to our Phase 0 API specification (`05_DATABASE_SCHEMA_AND_API_PLAN.md`), Phase 3 introduces persistent data endpoints:

### 1. Ingest & Persist Candidate Profile
- **Method**: `POST`
- **Endpoint**: `/api/v1/profile/ingest`
- **Input**: `multipart/form-data` (file: UploadFile, optional candidate_id: str)
- **Output**: `CandidateProfileResponse` (HTTP 201)
- **Purpose**: Parses resume bytes (via Phase 2 parser), persists profile in `profiles`, generates initial `evidence_nodes`, and returns the persistent profile.

### 2. Fetch Full Candidate Profile
- **Method**: `GET`
- **Endpoint**: `/api/v1/profile/{candidate_id}`
- **Input**: Path parameter `candidate_id: str`
- **Output**: `CandidateProfileResponse` (HTTP 200)
- **Purpose**: Retrieves candidate's complete persistent profile, projects, and skills.

### 3. Fetch Candidate Evidence Nodes
- **Method**: `GET`
- **Endpoint**: `/api/v1/profile/{candidate_id}/evidence`
- **Input**: Path parameter `candidate_id: str`
- **Output**: `List[EvidenceNodeResponse]` (HTTP 200)
- **Purpose**: Retrieves all atomic evidence items supporting the candidate's career memory.

### 4. Ingest & Persist Target Job Description
- **Method**: `POST`
- **Endpoint**: `/api/v1/jd/ingest`
- **Input**: `JDParseRequest` (`{ raw_text, title, company }`)
- **Output**: `JobDescriptionResponse` (HTTP 201)
- **Purpose**: Parses raw JD text, decomposes requirements and weights, saves into `job_descriptions`, and returns persistent `jd_id`.

### 5. Fetch Target Job Description
- **Method**: `GET`
- **Endpoint**: `/api/v1/jd/{jd_id}`
- **Input**: Path parameter `jd_id: str`
- **Output**: `JobDescriptionResponse` (HTTP 200)
- **Purpose**: Retrieves stored job description requirements and interview themes.

---

# PART 7 — Security, Privacy & Data Quality

1. **Schema Validation Before Write**:
   - Every document passes through Pydantic v2 schemas before being sent to Motor/MongoDB. Malformed or invalid data is rejected at the API gateway level before touching the database.
2. **Duplicate Prevention**:
   - Unique database indexes on `candidate_id`, `jd_id`, and `evidence_id` guarantee no duplicate primary entities exist.
3. **Data Anonymization & PII Protection**:
   - We store only professional contact info (name, email, github, linkedin).
   - Sensitive personal information (passwords, government IDs, physical street addresses) is neither extracted nor saved.
4. **Database Connection Safety**:
   - All operations utilize Motor's connection pool established in Phase 1 with credential masking in logs.
5. **Atomic Operations**:
   - Profile updates and evidence node insertions use MongoDB bulk write operations to ensure performance and prevent partial data corruption.

---

# PART 8 — Connection to Future Phases

```
[ Phase 2: Parsers ]
        │  Produces raw extracted text & structured entities
        ▼
[ Phase 3: Career Profile & Memory ]  <-- (WE ARE HERE)
        │  Stores persistent profiles, JDs, and Evidence Nodes in MongoDB
        ▼
[ Phase 4: Hybrid RAG & Retrieval Engine ]
        │  Reads Evidence Nodes from Phase 3 -> Computes SBERT embeddings (384-dim)
        │  Builds BM25 sparse index over claim_text
        ▼
[ Phase 5: Deterministic JRS Scoring ]
        │  Matches Phase 3 JD requirements against Phase 3 Evidence Nodes
        │  Computes explainable Job Readiness Score (0-100%)
        ▼
[ Phase 7: LangGraph Adaptive Interview Agent ]
        │  Reads candidate projects from Phase 3 Career Memory to generate technical questions
```

### Exactly What Phase 4 Will Read from Phase 3:
In Phase 4, the RAG engine will query:
`db.evidence_nodes.find({"candidate_id": candidate_id})`
It will take each `claim_text`, generate a dense Sentence-BERT vector embedding, and update the `embedding` field in the document.

---

# PART 9 — Phase 3 Implementation Plan

## 1. Directory & File Structure Plan

```
backend/
├── app/
│   ├── db/
│   │   ├── __init__.py           # [NEW] Database layer exports
│   │   ├── collections.py        # [NEW] Collection name constants & index definitions
│   │   └── repositories/
│   │       ├── __init__.py       # [NEW] Repositories package
│   │       ├── profile_repo.py   # [NEW] CRUD operations for `profiles` collection
│   │       ├── evidence_repo.py  # [NEW] CRUD & bulk operations for `evidence_nodes`
│   │       └── jd_repo.py        # [NEW] CRUD operations for `job_descriptions`
│   ├── models/
│   │   ├── profile.py            # [MODIFY] Add DB document schemas (CandidateProfileDB, EvidenceNodeDB)
│   │   └── jd.py                 # [MODIFY] Add DB document schema (JobDescriptionDB)
│   ├── services/
│   │   ├── profile_service.py    # [NEW] Business logic: transforms ParsedResume into Profile + EvidenceNodes
│   │   └── jd_service.py         # [NEW] Business logic: handles JD parsing + MongoDB storage
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── profile.py    # [MODIFY] Add POST /ingest, GET /{candidate_id}, GET /{candidate_id}/evidence
│   │           └── jd.py         # [MODIFY] Add POST /ingest, GET /{jd_id}
└── tests/
    ├── test_profile_persistence.py # [NEW] Tests for profile repository, service, and retrieval endpoints
    └── test_jd_persistence.py      # [NEW] Tests for JD repository, service, and retrieval endpoints
```

## 2. Purpose of Every Planned File

| File | Purpose |
| :--- | :--- |
| `backend/app/db/collections.py` | Centralizes collection names (`profiles`, `evidence_nodes`, `job_descriptions`) and defines database indexing routines. |
| `backend/app/db/repositories/profile_repo.py` | Data Access Object (DAO) for MongoDB `profiles` collection (insert, find_by_id, update, delete). |
| `backend/app/db/repositories/evidence_repo.py` | DAO for MongoDB `evidence_nodes` collection (bulk_insert, find_by_candidate, delete_by_candidate). |
| `backend/app/db/repositories/jd_repo.py` | DAO for MongoDB `job_descriptions` collection (insert, find_by_id). |
| `backend/app/services/profile_service.py` | Orchestrates Phase 2 resume parsing $\rightarrow$ entity structuring $\rightarrow$ evidence node extraction $\rightarrow$ DB persistence. |
| `backend/app/services/jd_service.py` | Orchestrates Phase 2 JD parsing $\rightarrow$ requirement structuring $\rightarrow$ DB persistence. |
| `backend/tests/test_profile_persistence.py` | Automated tests verifying profile and evidence node insertion, retrieval, and edge cases. |
| `backend/tests/test_jd_persistence.py` | Automated tests verifying JD insertion, retrieval by `jd_id`, and not-found error handling. |

---

# PART 10 — Research Connection & Academic Grounding

## 1. How Phase 3 Supports Our Research Objectives

- **O1 (Evidence Representation)**: Phase 3 creates the physical database manifestation of the 4-tier Evidence Model. By storing atomic `evidence_nodes` with explicit `confidence_tier` and `verifiable_url` tags, we prove that skill claims can be mathematically audited rather than assumed.
- **O2 (Job-Specific Analysis)**: By persisting `job_descriptions` independently of candidate profiles, CAREERX enables $M \times N$ comparative evaluations (evaluating $M$ candidates across $N$ diverse engineering roles).
- **O3 (Explainable Improvement)**: Because evidence nodes are tracked with timestamps, future phases can show a candidate's readiness score increasing chronologically as new evidence is appended.

## 2. Support for Planned Research Articles

- **Article 1: "Evidence-Grounded Career Analysis & Deterministic Readiness Scoring"**:
  - Phase 3 provides the ground-truth database of candidate claims and evidence tiers. It enables our benchmark evaluations comparing traditional keyword matches against evidence-grounded records.
- **Article 2: "Hybrid Retrieval & State-Machine Agents for Adaptive Technical Interviewing"**:
  - Phase 3 establishes the structured search corpus (`evidence_nodes`) that the Phase 4 Hybrid RAG engine (SBERT + BM25) will retrieve against during mock interviews.

*(Note: Phase 3 itself does not prove a scientific hypothesis; it builds the persistent empirical data foundation required to conduct those experiments in later phases).*

---

# PART 11 — Viva Preparation (Questions & Model Answers)

### Q1: Why did you choose MongoDB instead of PostgreSQL with tables for candidates, projects, and skills?
> **Answer**:  
> *"Resumes have inherently variable, semi-structured schemas. One candidate has five projects and no work experience; another has three corporate jobs and no personal projects. In a relational database, this requires complex polymorphic foreign keys and expensive multi-table JOIN operations every time a candidate profile is loaded. In MongoDB, a candidate's profile is a self-contained BSON document that reads in a single O(1) query. Furthermore, storing evidence nodes in MongoDB seamlessly prepares us for MongoDB Atlas native Vector Search in Phase 4 without needing a separate vector database."*

### Q2: What is the difference between an embedded document and a referenced document in your schema?
> **Answer**:  
> *"We embed Education, Experience, and Project details directly inside the `profiles` collection because they are always viewed together as part of the candidate's core identity. However, we keep `evidence_nodes` in a separate referenced collection using `candidate_id` as a foreign key. This is because in Phase 4, our RAG retrieval engine must search across individual claim snippets independently. Referencing them in their own collection allows us to index and query evidence nodes directly without scanning entire candidate profiles."*

### Q3: How do you prevent duplicate candidate profiles in the database?
> **Answer**:  
> *"We enforce unique compound indexing at the database level. The `candidate_id` field has a unique B-Tree index, and the `email` field has a sparse unique index. Even if two concurrent requests attempt to insert the same candidate simultaneously, MongoDB's unique constraint immediately rejects the second write, preventing data corruption."*

### Q4: Why do you store both a MongoDB `_id` and a `candidate_id`?
> **Answer**:  
> *"The `_id` is MongoDB's internal primary key (a 12-byte BSON ObjectId). The `candidate_id` is an application-level business identifier (e.g. `usr_98a7f1e2`). Separating business keys from internal database keys decouples our API contracts and URL routing from MongoDB's internal implementation, making the system cleaner and easier to migrate or test."*

---

# PART 12 — Checklist: What I Should Understand Before Phase 3

Before writing any Phase 3 code, make sure you can answer YES to all of the following:

- [x] I understand what data persistence means and why in-memory variables are lost on restart.
- [x] I know why MongoDB was chosen (JSON/BSON document model, nested structures, future vector search).
- [x] I understand the difference between the `profiles` collection and the `evidence_nodes` collection.
- [x] I can explain why Education is embedded in `profiles`, while Evidence Nodes live in their own collection.
- [x] I understand what unique indexes do and why we index `candidate_id` and `jd_id`.
- [x] I understand the flow: Phase 2 Parser $\rightarrow$ Pydantic validation $\rightarrow$ Profile Service $\rightarrow$ MongoDB Repository.
- [x] I know that Phase 3 does NOT calculate embeddings (Phase 4) or score readiness (Phase 5).
- [x] I understand the Pre-Phase 3 architectural decision regarding profile overwrites vs merging.

---

# PART 13 — Post-Implementation Architecture & Live Verification Review

## 1. What Was Actually Built in Phase 3

Phase 3 successfully delivered the complete **Career Profile & Career Memory Ingestion Engine**:

1. **MongoDB Database & Indexing Layer**:
   - `backend/app/db/collections.py`: Defines constants for `profiles`, `evidence_nodes`, and `job_descriptions`.
   - `ensure_indexes()`: Idempotently creates 11 B-Tree indexes across collections on application startup:
     - `profiles`: `candidate_id` (unique), `email` (sparse, unique).
     - `evidence_nodes`: `evidence_id` (unique), `candidate_id` (standard), `is_active` (standard), compound `(candidate_id, is_active)`, `verified_skills` (multikey).
     - `job_descriptions`: `jd_id` (unique).
2. **Repository (DAO) Layer**:
   - `ProfileRepository`: Insert, lookup by `candidate_id`, lookup by `email`, update, project appending.
   - `EvidenceRepository`: Bulk insert, active node queries, full history queries, selective deactivation (`deactivate_resume_evidence`).
   - `JobDescriptionRepository`: Insert, lookup by `jd_id`.
3. **Domain & Document Models (Pydantic v2)**:
   - `CandidateProfile`: Stores persistent identity, education, experiences, projects, canonical skills, `version`, and `audit_history`.
   - `EvidenceNode`: Granular, auditable claims tagged with `source_type`, `confidence_tier`, `confidence_score`, `verifiable_url`, `is_active`, and `created_at`.
   - `JobDescription`: Persistent target posting with requirements, weights, and interview topics.
   - `AuditSnapshot`: Archives previous profile versions and summaries upon re-upload.
4. **Service Layer**:
   - `ProfilePersistenceService`: Orchestrates Phase 2 resume parsing $\rightarrow$ profile versioning $\rightarrow$ evidence node decomposition $\rightarrow$ database storage under the approved **Clean Replacement + Timestamp Audit** strategy.
   - `JDPersistenceService`: Orchestrates Phase 2 JD parsing $\rightarrow$ requirement decomposition $\rightarrow$ database storage.
5. **REST API Endpoints**:
   - `POST /api/v1/profile/ingest`: Accepts resume file $\rightarrow$ parses $\rightarrow$ persists profile & evidence in MongoDB (`HTTP 201`).
   - `GET /api/v1/profile/{candidate_id}`: Retrieves complete candidate profile (`HTTP 200`).
   - `GET /api/v1/profile/{candidate_id}/evidence`: Retrieves candidate's active or full evidence graph (`HTTP 200`).
   - `POST /api/v1/profile/{candidate_id}/projects`: Appends standalone portfolio project $\rightarrow$ mints new evidence nodes (`HTTP 200`).
   - `POST /api/v1/jd/ingest`: Ingests JD text $\rightarrow$ decomposes requirements & weights $\rightarrow$ persists in MongoDB (`HTTP 201`).
   - `GET /api/v1/jd/{jd_id}`: Retrieves persistent target JD (`HTTP 200`).
6. **Zero Phase 4+ Functionality**:
   - Zero vector embeddings or SBERT models called (Phase 4).
   - Zero vector search or hybrid BM25 indexes (Phase 4).
   - Zero Job Readiness Scores ($JRS$) calculated (Phase 5).
   - Zero LangGraph agents or mock interview evaluations (Phase 7).

---

## 2. Files Created and Modified

| File | Status | Purpose |
| :--- | :---: | :--- |
| `backend/app/db/__init__.py` | **NEW** | Exports collection constants and indexing functions. |
| `backend/app/db/collections.py` | **NEW** | Centralizes collection names and `ensure_indexes()` routine. |
| `backend/app/db/repositories/__init__.py` | **NEW** | Exports repository classes. |
| `backend/app/db/repositories/profile_repo.py` | **NEW** | DAO for `profiles` MongoDB collection. |
| `backend/app/db/repositories/evidence_repo.py` | **NEW** | DAO for `evidence_nodes` MongoDB collection. |
| `backend/app/db/repositories/jd_repo.py` | **NEW** | DAO for `job_descriptions` MongoDB collection. |
| `backend/app/models/profile.py` | **MODIFIED** | Added `CandidateProfile`, `EvidenceNode`, `AuditSnapshot`, `ProfileIngestResponse`, and `AddProjectRequest`. |
| `backend/app/models/jd.py` | **MODIFIED** | Added `JobDescription` and `JDIngestResponse`. |
| `backend/app/services/profile_service.py` | **NEW** | Orchestrates profile lifecycle, versioning, evidence decomposition, and persistence. |
| `backend/app/services/jd_service.py` | **NEW** | Orchestrates JD parsing and MongoDB persistence. |
| `backend/app/core/database.py` | **MODIFIED** | Added `get_database()` method to `DatabaseManager`. |
| `backend/app/main.py` | **MODIFIED** | Added automatic index verification to `lifespan` startup. |
| `backend/app/api/v1/endpoints/profile.py` | **MODIFIED** | Added `/ingest`, `/{candidate_id}`, `/{candidate_id}/evidence`, and `/{candidate_id}/projects`. |
| `backend/app/api/v1/endpoints/jd.py` | **MODIFIED** | Added `/ingest` and `/{jd_id}`. |
| `backend/tests/test_profile_persistence.py` | **NEW** | Automated tests for first upload, version update, evidence deactivation, standalone projects, and 404s. |
| `backend/tests/test_jd_persistence.py` | **NEW** | Automated tests for JD ingestion, retrieval, not-found handling, and length validation. |
| `scripts/verify_phase3_mongodb.py` | **NEW** | Direct live audit script querying physical MongoDB storage and index configurations. |

---

## 3. Data Flow Diagram: Ingestion & Versioning

```
[ Candidate Uploads Resume File ]
              │
              ▼
[ Phase 2 Parser: ResumeParser.parse_bytes() ]
              │
              ▼ (In-Memory ParsedResume)
[ ProfilePersistenceService.ingest_resume_bytes() ]
              │
              ├── Does candidate exist?
              │
     ┌────────┴────────────────────────────────────────┐
     ▼ YES                                             ▼ NO
[ Profile Update Flow ]                       [ First-Time Ingestion Flow ]
- Save snapshot to `audit_history`            - Generate candidate_id ("usr_...")
- Increment `version` (e.g. 1 -> 2)            - Set version = 1
- `deactivate_resume_evidence()`               - Insert into `profiles`
  (sets `is_active: false` on old nodes)      - Decompose projects/experiences
- Decompose new projects/experiences           - Bulk-insert new `EvidenceNode`s
- Bulk-insert new `EvidenceNode`s             - Return HTTP 201 Created
- Replace active profile state
- Return HTTP 201 Created
```

---

## 4. Live MongoDB Verification Results

Directly executed via:
```bash
.venv\Scripts\python -m scripts.verify_phase3_mongodb
```

```text
Connecting to MongoDB at: mongodb://localhost:27017...
[OK] MongoDB Ping response: {'ok': 1.0}
[OK] Verified all required B-Tree and unique indexes.
  - Collection 'profiles' has 3 indexes: ['_id_', 'idx_profiles_candidate_id_unique', 'idx_profiles_email_sparse_unique']
  - Collection 'evidence_nodes' has 6 indexes: ['_id_', 'idx_evidence_id_unique', 'idx_evidence_candidate_id', 'idx_evidence_is_active', 'idx_evidence_candidate_active', 'idx_evidence_verified_skills_multikey']
  - Collection 'job_descriptions' has 2 indexes: ['_id_', 'idx_jd_id_unique']

--- Physical MongoDB Storage Status ---
Total Profiles stored: 4
Total Evidence Nodes stored: 36 (Active: 19, Archived: 17)
Total Job Descriptions stored: 2

[Sample Profile] candidate_id='usr_82b51259', name='Arjun Sharma', version=1
  - Projects (3): ['Distributed Task Runner', 'Weather Scraper', 'Distributed Cache Invalidation Service']
  - Skills: ['Asynchronous Programming', 'Docker', 'FastAPI', 'GitHub', 'JavaScript']...

[Sample Active Evidence Node] id='ev_4644563b', tier='STRONG'
  - Claim: 'Implemented distributed pub/sub cache invalidation handling 20k events/sec.'
  - Verifiable URL: https://github.com/arjun-dev/cache-invalidator
  - Skills: ['Python', 'Redis', 'Kafka']

[Sample Job Description] jd_id='jd_cc4184f6', title='Senior Python Backend Developer'
  - Requirements (4):
    * [req_01] (Weight: 2.0): 3+ years of experience with Python, FastAPI, and PostgreSQL.
    * [req_02] (Weight: 3.0): Must have experience with Redis caching and message queues (Kafka or RabbitMQ).

[SUCCESS] Direct MongoDB storage and retrieval audit verified successfully.
```

---

## 5. Automated Test Results Across All Phases

Executed via `.venv\Scripts\python -m pytest -v`:

```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\abhip\Videos\pr\major project
configfile: pytest.ini
testpaths: backend/tests
plugins: anyio-4.14.2, asyncio-1.4.0
collected 23 items

backend/tests/test_health.py::test_root_endpoint PASSED                  [  4%]
backend/tests/test_health.py::test_health_endpoint_schema PASSED         [  8%]
backend/tests/test_health.py::test_cors_headers PASSED                   [ 13%]
backend/tests/test_health.py::test_health_endpoint_degraded_when_db_disconnected PASSED [ 17%]
backend/tests/test_health.py::test_database_manager_ping PASSED          [ 21%]
backend/tests/test_jd_parser.py::test_jd_parser_direct_extraction PASSED [ 26%]
backend/tests/test_jd_parser.py::test_jd_parser_too_short_text PASSED    [ 30%]
backend/tests/test_jd_parser.py::test_jd_api_endpoint_success PASSED     [ 34%]
backend/tests/test_jd_parser.py::test_jd_api_endpoint_validation_error PASSED [ 39%]
backend/tests/test_jd_persistence.py::test_jd_ingest_and_retrieval PASSED [ 43%]
backend/tests/test_jd_persistence.py::test_jd_not_found PASSED           [ 47%]
backend/tests/test_jd_persistence.py::test_jd_validation_error_on_short_text PASSED [ 52%]
backend/tests/test_profile_persistence.py::test_profile_first_time_ingestion PASSED [ 56%]
backend/tests/test_profile_persistence.py::test_profile_version_update_clean_replacement PASSED [ 60%]
backend/tests/test_profile_persistence.py::test_standalone_project_addition PASSED [ 65%]
backend/tests/test_profile_persistence.py::test_profile_not_found_handling PASSED [ 69%]
backend/tests/test_resume_parser.py::test_resume_parser_txt_format PASSED [ 73%]
backend/tests/test_resume_parser.py::test_resume_parser_docx_format PASSED [ 78%]
backend/tests/test_resume_parser.py::test_resume_parser_empty_file PASSED [ 82%]
backend/tests/test_resume_parser.py::test_resume_parser_unsupported_format PASSED [ 86%]
backend/tests/test_resume_api_endpoint_success PASSED                   [ 91%]
backend/tests/test_resume_parser.py::test_resume_api_endpoint_empty_file PASSED [ 95%]
backend/tests/test_resume_parser.py::test_resume_api_endpoint_invalid_extension PASSED [100%]

============================= 23 passed in 1.75s ==============================
```

---

## 6. Real Engineering Bugs Encountered and Resolved

1. **`AttributeError: 'DatabaseManager' object has no attribute 'get_database'`**:
   - *Problem*: Repositories called `db_manager.get_database()`, but `DatabaseManager` exposed the database attribute as `self.db`.
   - *Fix*: Added `def get_database(self) -> AsyncIOMotorDatabase:` to `DatabaseManager` with connection validation, providing an authoritative accessor.
2. **Inter-Test State Pollution across Test Runs**:
   - *Problem*: `test_profile_first_time_ingestion` and `test_profile_version_update_clean_replacement` both used the same hardcoded email (`arjun.sharma@example.com`). When the second test ran, it discovered the existing candidate from the first test and incremented `version` from 2 $\rightarrow$ 3 instead of 1 $\rightarrow$ 2.
   - *Fix*: Parameterized test sample generators with unique email namespaces (`arjun.{uuid4().hex[:6]}@example.com`), guaranteeing total test isolation.

---

## 7. What I Should Understand Before Phase 4 (Checklist)

- [x] Phase 3 stores **clean, structured Career Memory** in MongoDB collections (`profiles`, `evidence_nodes`, `job_descriptions`).
- [x] When a resume is updated, previous resume evidence is cleanly archived (`is_active: false`), leaving only active claims.
- [x] Phase 4 (Hybrid RAG) will query: `db.evidence_nodes.find({"candidate_id": candidate_id, "is_active": True})`.
- [x] Phase 4 will compute 384-dimensional dense SBERT embeddings on `claim_text` and build a BM25 sparse index over active evidence.
- [x] Phase 4 will match active evidence nodes against decomposed JD requirements.

