import re
import unicodedata
from typing import Dict, List, Optional, Set, Tuple

# Comprehensive Canonical Skill Taxonomy with common lowercase aliases
SKILL_TAXONOMY: Dict[str, Tuple[str, str]] = {
    # alias: (Canonical Name, Category)
    "python": ("Python", "HARD_SKILL"),
    "python3": ("Python", "HARD_SKILL"),
    "javascript": ("JavaScript", "HARD_SKILL"),
    "js": ("JavaScript", "HARD_SKILL"),
    "typescript": ("TypeScript", "HARD_SKILL"),
    "ts": ("TypeScript", "HARD_SKILL"),
    "java": ("Java", "HARD_SKILL"),
    "c++": ("C++", "HARD_SKILL"),
    "cpp": ("C++", "HARD_SKILL"),
    "c": ("C", "HARD_SKILL"),
    "c#": ("C#", "HARD_SKILL"),
    "csharp": ("C#", "HARD_SKILL"),
    "golang": ("Go", "HARD_SKILL"),
    "go": ("Go", "HARD_SKILL"),
    "rust": ("Rust", "HARD_SKILL"),
    "ruby": ("Ruby", "HARD_SKILL"),
    "php": ("PHP", "HARD_SKILL"),
    "swift": ("Swift", "HARD_SKILL"),
    "kotlin": ("Kotlin", "HARD_SKILL"),
    "scala": ("Scala", "HARD_SKILL"),
    "sql": ("SQL", "DATABASE"),
    "nosql": ("NoSQL", "DATABASE"),
    # Frameworks
    "fastapi": ("FastAPI", "HARD_SKILL"),
    "flask": ("Flask", "HARD_SKILL"),
    "django": ("Django", "HARD_SKILL"),
    "react": ("React", "HARD_SKILL"),
    "reactjs": ("React", "HARD_SKILL"),
    "react.js": ("React", "HARD_SKILL"),
    "next.js": ("Next.js", "HARD_SKILL"),
    "nextjs": ("Next.js", "HARD_SKILL"),
    "vue": ("Vue.js", "HARD_SKILL"),
    "vuejs": ("Vue.js", "HARD_SKILL"),
    "angular": ("Angular", "HARD_SKILL"),
    "express": ("Express.js", "HARD_SKILL"),
    "expressjs": ("Express.js", "HARD_SKILL"),
    "node": ("Node.js", "HARD_SKILL"),
    "nodejs": ("Node.js", "HARD_SKILL"),
    "spring": ("Spring Boot", "HARD_SKILL"),
    "spring boot": ("Spring Boot", "HARD_SKILL"),
    "nestjs": ("NestJS", "HARD_SKILL"),
    # Databases & Caching
    "mongodb": ("MongoDB", "DATABASE"),
    "mongo": ("MongoDB", "DATABASE"),
    "postgresql": ("PostgreSQL", "DATABASE"),
    "postgres": ("PostgreSQL", "DATABASE"),
    "mysql": ("MySQL", "DATABASE"),
    "redis": ("Redis", "DATABASE"),
    "sqlite": ("SQLite", "DATABASE"),
    "cassandra": ("Cassandra", "DATABASE"),
    "elasticsearch": ("Elasticsearch", "DATABASE"),
    "dynamodb": ("DynamoDB", "DATABASE"),
    "neo4j": ("Neo4j", "DATABASE"),
    # DevOps, Cloud & Tools
    "docker": ("Docker", "TOOL"),
    "kubernetes": ("Kubernetes", "TOOL"),
    "k8s": ("Kubernetes", "TOOL"),
    "git": ("Git", "TOOL"),
    "github": ("GitHub", "TOOL"),
    "gitlab": ("GitLab", "TOOL"),
    "aws": ("AWS", "TOOL"),
    "amazon web services": ("AWS", "TOOL"),
    "gcp": ("Google Cloud Platform", "TOOL"),
    "google cloud": ("Google Cloud Platform", "TOOL"),
    "azure": ("Azure", "TOOL"),
    "linux": ("Linux", "TOOL"),
    "nginx": ("Nginx", "TOOL"),
    "ci/cd": ("CI/CD", "TOOL"),
    "cicd": ("CI/CD", "TOOL"),
    "github actions": ("GitHub Actions", "TOOL"),
    "terraform": ("Terraform", "TOOL"),
    "ansible": ("Ansible", "TOOL"),
    "kafka": ("Apache Kafka", "ARCHITECTURE"),
    "apache kafka": ("Apache Kafka", "ARCHITECTURE"),
    "rabbitmq": ("RabbitMQ", "ARCHITECTURE"),
    "graphql": ("GraphQL", "ARCHITECTURE"),
    "rest": ("REST", "ARCHITECTURE"),
    "restful": ("REST", "ARCHITECTURE"),
    "rest api": ("REST", "ARCHITECTURE"),
    "rest apis": ("REST", "ARCHITECTURE"),
    "microservices": ("Microservices", "ARCHITECTURE"),
    # Theoretical Competencies
    "dsa": ("Data Structures & Algorithms", "THEORETICAL"),
    "data structures": ("Data Structures & Algorithms", "THEORETICAL"),
    "algorithms": ("Data Structures & Algorithms", "THEORETICAL"),
    "system design": ("System Design", "THEORETICAL"),
    "oop": ("Object-Oriented Programming", "THEORETICAL"),
    "dbms": ("DBMS", "THEORETICAL"),
    "operating systems": ("Operating Systems", "THEORETICAL"),
    "computer networks": ("Computer Networks", "THEORETICAL"),
    "concurrency": ("Concurrency & Multithreading", "THEORETICAL"),
    "asyncio": ("Asyncio", "HARD_SKILL"),
    "asynchronous": ("Asynchronous Programming", "THEORETICAL"),
    # AI & Data
    "machine learning": ("Machine Learning", "HARD_SKILL"),
    "deep learning": ("Deep Learning", "HARD_SKILL"),
    "nlp": ("NLP", "HARD_SKILL"),
    "rag": ("RAG", "HARD_SKILL"),
    "langchain": ("LangChain", "HARD_SKILL"),
    "langgraph": ("LangGraph", "HARD_SKILL"),
    "pytorch": ("PyTorch", "HARD_SKILL"),
    "tensorflow": ("TensorFlow", "HARD_SKILL"),
    "pandas": ("Pandas", "HARD_SKILL"),
    "numpy": ("NumPy", "HARD_SKILL"),
    "scikit-learn": ("Scikit-Learn", "HARD_SKILL"),
}

SECTION_PATTERNS: Dict[str, List[re.Pattern]] = {
    "EDUCATION": [
        re.compile(r"^\s*(education|academic\s*background|academics|qualifications)\s*$", re.IGNORECASE),
        re.compile(r"^\s*education\b", re.IGNORECASE),
    ],
    "EXPERIENCE": [
        re.compile(r"^\s*(work\s*experience|experience|employment|work\s*history|internships?)\s*$", re.IGNORECASE),
        re.compile(r"^\s*(work\s*experience|professional\s*experience)\b", re.IGNORECASE),
    ],
    "PROJECTS": [
        re.compile(r"^\s*(projects|personal\s*projects|academic\s*projects|technical\s*projects)\s*$", re.IGNORECASE),
        re.compile(r"^\s*projects\b", re.IGNORECASE),
    ],
    "SKILLS": [
        re.compile(r"^\s*(skills|technical\s*skills|skills\s*&\s*tools|core\s*competencies|technologies)\s*$", re.IGNORECASE),
        re.compile(r"^\s*(technical\s*skills|skills)\b", re.IGNORECASE),
    ],
    "CERTIFICATIONS": [
        re.compile(r"^\s*(certifications?|licenses|courses|achievements)\s*$", re.IGNORECASE),
        re.compile(r"^\s*certifications?\b", re.IGNORECASE),
    ],
}

EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")
PHONE_REGEX = re.compile(r"(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b)")
GITHUB_REGEX = re.compile(r"https?://(?:www\.)?github\.com/[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*", re.IGNORECASE)
GITHUB_PROFILE_REGEX = re.compile(r"https?://(?:www\.)?github\.com/([A-Za-z0-9_.-]+)", re.IGNORECASE)
LINKEDIN_REGEX = re.compile(r"https?://(?:www\.)?linkedin\.com/in/([A-Za-z0-9_.-]+)", re.IGNORECASE)
GENERIC_URL_REGEX = re.compile(r"https?://[^\s,;()]+", re.IGNORECASE)
METRIC_REGEX = re.compile(r"\b(?:\d+(?:\.\d+)?%\b|\d+(?:\.\d+)?\s*(?:ms|seconds?|req/s|rps|tasks/sec|users?|k|m|gb|tb))\b", re.IGNORECASE)


def normalize_text(text: str) -> str:
    """
    Clean, decode, and normalize raw text:
    - Normalizes unicode characters (NFKD)
    - Replaces smart quotes, em-dashes, and special bullets
    - Collapses excessive blank lines and spaces
    """
    if not text:
        return ""

    # Normalize unicode representations
    normalized = unicodedata.normalize("NFKD", text)

    # Standardize quotation marks and dashes
    normalized = normalized.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    normalized = normalized.replace("—", "-").replace("–", "-")

    # Standardize bullet symbols to simple dash bullets
    normalized = re.sub(r"[\u2022\u2023\u25E6\u2043\u2219\u25CB\u25CF\u25AA\u25AB➢*]", "-", normalized)

    # Strip null bytes and non-printable control characters (except \n, \t)
    normalized = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", normalized)

    # Collapse multiple spaces on the same line
    lines = []
    for line in normalized.splitlines():
        cleaned_line = re.sub(r"[ \t]+", " ", line).strip()
        lines.append(cleaned_line)

    # Reconstruct text collapsing multiple empty lines into at most two newlines
    result = "\n".join(lines)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract email, phone, GitHub, and LinkedIn URLs from document text."""
    contacts: Dict[str, Optional[str]] = {
        "email": None,
        "phone": None,
        "github_url": None,
        "linkedin_url": None,
    }

    email_match = EMAIL_REGEX.search(text)
    if email_match:
        contacts["email"] = email_match.group(0).lower()

    phone_match = PHONE_REGEX.search(text)
    if phone_match:
        contacts["phone"] = phone_match.group(0).strip()

    github_match = GITHUB_PROFILE_REGEX.search(text)
    if github_match:
        username = github_match.group(1).rstrip("/")
        contacts["github_url"] = f"https://github.com/{username}"

    linkedin_match = LINKEDIN_REGEX.search(text)
    if linkedin_match:
        contacts["linkedin_url"] = linkedin_match.group(0).rstrip("/")

    return contacts


def detect_section_header(line: str) -> Optional[str]:
    """Check if a single line represents a recognized section header."""
    clean_line = line.strip().rstrip(":")
    if not clean_line or len(clean_line) > 40:
        return None

    for section, patterns in SECTION_PATTERNS.items():
        for pattern in patterns:
            if pattern.match(clean_line):
                return section
    return None


def extract_skills_from_text(text: str) -> Tuple[List[str], Dict[str, str]]:
    """
    Extract canonical skills and their categories using dictionary lookup.
    Returns:
        (canonical_skills_list, skill_to_category_dict)
    """
    found_canonical: Set[str] = set()
    categories: Dict[str, str] = {}

    lower_text = " " + re.sub(r"[^a-zA-Z0-9+#./-]", " ", text.lower()) + " "

    # Check multi-word skills first, then single-word
    sorted_aliases = sorted(SKILL_TAXONOMY.keys(), key=lambda x: len(x), reverse=True)

    for alias in sorted_aliases:
        # Match whole word boundaries robustly around punctuation
        pattern = rf"(?<![a-zA-Z0-9]){re.escape(alias)}(?![a-zA-Z0-9])"
        if re.search(pattern, text, re.IGNORECASE):
            canonical, category = SKILL_TAXONOMY[alias]
            found_canonical.add(canonical)
            categories[canonical] = category

    return sorted(list(found_canonical)), categories


def extract_metrics(text: str) -> List[str]:
    """Extract quantifiable accomplishment metrics from bullet points."""
    matches = METRIC_REGEX.findall(text)
    return list(set(matches))
