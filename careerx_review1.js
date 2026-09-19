// ============================================================
// CAREERX — B.Tech Major Project Review-1 Presentation
// Evidence-Grounded Career Intelligence Platform
// pptxgenjs generator
// ============================================================

const pptx = require('pptxgenjs');

const pres = new pptx();
pres.layout = 'LAYOUT_WIDE'; // 13.3" x 7.5"

// ============================================================
// DESIGN SYSTEM
// ============================================================
const C = {
  navy:     '0D1B4B',
  blue:     '1A3A8F',
  skyBlue:  '2E72D2',
  accent:   '00C5A5',
  accentSoft:'B2EDE4',
  white:    'FFFFFF',
  offWhite: 'F4F6FB',
  midGray:  'B0BABF',
  textDark: '0D1B2A',
  textMid:  '3A4A5C',
  cardBg:   'EEF3FB',
  border:   'C8D8F0',
  red:      'D94F3D',
  gold:     'E8A020',
};

const F = {
  head:   'Cambria',
  body:   'Calibri',
};

function slide_dark_base(slide) {
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.navy } });
}

function slide_light_base(slide) {
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.offWhite } });
}

function accent_bar(slide, x, y, w, h) {
  slide.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: C.accent } });
}

function slide_number(slide, n) {
  slide.addText(`${n} / 10`, {
    x: 12.5, y: 7.2, w: 0.7, h: 0.2,
    fontFace: F.body, fontSize: 8,
    color: C.midGray, align: 'right', margin: 0,
  });
}

// ============================================================
// SLIDE 1 — TITLE
// ============================================================
{
  const s = pres.addSlide();
  slide_dark_base(s);

  s.addShape(pres.ShapeType.ellipse, { x: 10.8, y: -0.8, w: 3.5, h: 3.5, fill: { color: C.blue }, line: { color: C.blue } });
  s.addShape(pres.ShapeType.ellipse, { x: 11.5, y: 0.2, w: 1.8, h: 1.8, fill: { color: C.accent }, line: { color: C.accent } });
  s.addShape(pres.ShapeType.ellipse, { x: -1.2, y: 5.5, w: 3, h: 3, fill: { color: C.blue }, line: { color: C.blue } });
  s.addShape(pres.ShapeType.ellipse, { x: -0.2, y: 6.2, w: 1.4, h: 1.4, fill: { color: C.accent }, line: { color: C.accent } });

  s.addText('SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN (AUTONOMOUS)', {
    x: 1.0, y: 0.35, w: 11.3, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: false, color: C.midGray,
    align: 'center', margin: 0,
  });
  s.addText('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', {
    x: 1.0, y: 0.65, w: 11.3, h: 0.25,
    fontFace: F.body, fontSize: 9, bold: false, color: C.midGray,
    align: 'center', margin: 0,
  });

  accent_bar(s, 4.5, 1.0, 4.3, 0.05);

  s.addText('CAREERX', {
    x: 0.5, y: 1.2, w: 12.3, h: 1.1,
    fontFace: F.head, fontSize: 72, bold: true,
    color: C.white, align: 'center', margin: 0,
  });

  s.addText('Evidence-Grounded Career Intelligence Platform', {
    x: 1.0, y: 2.35, w: 11.3, h: 0.45,
    fontFace: F.body, fontSize: 22, bold: false,
    color: C.accentSoft, align: 'center', margin: 0,
  });

  s.addText('"An evidence-centered approach for job-specific career analysis and improvement"', {
    x: 2.0, y: 2.9, w: 9.3, h: 0.5,
    fontFace: F.body, fontSize: 13, bold: false, italic: true,
    color: C.midGray, align: 'center', margin: 0,
  });

  accent_bar(s, 4.5, 3.55, 4.3, 0.04);

  s.addText('MAJOR PROJECT  2026-2027', {
    x: 0.6, y: 3.75, w: 3.8, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true, color: C.accent,
    align: 'center', margin: 0,
  });
  s.addText('REVIEW - 1', {
    x: 0.6, y: 4.05, w: 3.8, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true, color: C.white,
    align: 'center', margin: 0,
  });
  s.addText('BATCH NO: 11', {
    x: 0.6, y: 4.35, w: 3.8, h: 0.22,
    fontFace: F.body, fontSize: 9, bold: false, color: C.midGray,
    align: 'center', margin: 0,
  });

  s.addText('GUIDED BY', {
    x: 4.8, y: 3.75, w: 3.7, h: 0.22,
    fontFace: F.body, fontSize: 8, bold: true, color: C.accent,
    align: 'center', margin: 0,
  });
  s.addText('Mr. Ch. Venkata Ramana', {
    x: 4.8, y: 3.98, w: 3.7, h: 0.28,
    fontFace: F.body, fontSize: 11, bold: true, color: C.white,
    align: 'center', margin: 0,
  });
  s.addText('Assistant Professor, Dept. of CSE', {
    x: 4.8, y: 4.28, w: 3.7, h: 0.22,
    fontFace: F.body, fontSize: 9, bold: false, color: C.midGray,
    align: 'center', margin: 0,
  });

  s.addText('PRESENTED BY', {
    x: 8.9, y: 3.75, w: 4.1, h: 0.22,
    fontFace: F.body, fontSize: 8, bold: true, color: C.accent,
    align: 'center', margin: 0,
  });
  const members = [
    'K.A. Priya Darshini  [23B01A05A2]',
    'P. Keerthana Shalini  [23B01A05D0]',
    'M. Madhuri  [23B01A05A7]',
    'K. Veda  [23B01A0576]',
    'M. Pravallika  [23B01A05B0]',
  ];
  members.forEach((m, i) => {
    s.addText(m, {
      x: 8.9, y: 4.0 + i * 0.28, w: 4.1, h: 0.26,
      fontFace: F.body, fontSize: 9, bold: false,
      color: i === 0 ? C.white : C.midGray,
      align: 'center', margin: 0,
    });
  });

  const evidenceItems = [
    { x: 0.5,  label: 'Resume' },
    { x: 2.2,  label: 'GitHub' },
    { x: 3.9,  label: 'Certificate' },
    { x: 5.6,  label: 'Projects' },
    { x: 7.3,  label: 'Job Description' },
    { x: 9.0,  label: 'Skills' },
    { x: 10.7, label: 'Education' },
  ];
  evidenceItems.forEach(item => {
    s.addShape(pres.ShapeType.roundRect, {
      x: item.x, y: 5.2, w: 1.55, h: 0.85,
      fill: { color: C.blue }, line: { color: C.skyBlue, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(item.label, {
      x: item.x, y: 5.2, w: 1.55, h: 0.85,
      fontFace: F.body, fontSize: 9, bold: false,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
  });

  s.addText('converges into', {
    x: 4.0, y: 6.25, w: 5.3, h: 0.22,
    fontFace: F.body, fontSize: 8, bold: false,
    color: C.midGray, align: 'center', italic: true, margin: 0,
  });

  s.addShape(pres.ShapeType.rect, {
    x: 4.6, y: 6.5, w: 4.1, h: 0.55,
    fill: { color: C.accent }, line: { color: C.accent },
  });
  s.addText('EVIDENCE-GROUNDED CAREER ANALYSIS', {
    x: 4.6, y: 6.5, w: 4.1, h: 0.55,
    fontFace: F.body, fontSize: 9, bold: true,
    color: C.navy, align: 'center', valign: 'middle', margin: 0,
  });

  s.addNotes(
    'Slide 1 - Title Slide\nProject: CAREERX - Evidence-Grounded Career Intelligence Platform.\nB.Tech Major Project Review-1, 2026-2027.\nInstitution: Shri Vishnu Engineering College for Women (Autonomous), Bhimavaram.\nDept. of CSE. Guide: Mr. Ch. Venkata Ramana. Batch 11.'
  );
}

// ============================================================
// SLIDE 2 — ABSTRACT
// ============================================================
{
  const s = pres.addSlide();
  slide_light_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: C.navy } });
  s.addText('ABSTRACT', {
    x: 0.4, y: 0.07, w: 12.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });
  s.addText('PROPOSED RESEARCH', {
    x: 0.4, y: 0.07, w: 12.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: false,
    color: C.accent, align: 'right', margin: 0,
  });

  const cols = [
    { x: 0.25, label: 'CANDIDATE PROFILE', sub: 'Career information + Evidence', icons: ['Resume', 'Projects', 'Certifications', 'Skills'] },
    { x: 4.65, label: 'EVIDENCE', sub: 'Artifacts  Repos  Credentials', icons: ['GitHub', 'Documents', 'Assessments', 'Credentials'] },
    { x: 9.05, label: 'TARGET JOB', sub: 'Job description + Requirements', icons: ['Role', 'Tech Stack', 'Experience', 'Soft Skills'] },
  ];

  cols.forEach((col, ci) => {
    const colW = 3.8;
    const bgColor = ci === 1 ? C.navy : C.blue;
    s.addShape(pres.ShapeType.roundRect, {
      x: col.x, y: 0.7, w: colW, h: 3.2,
      fill: { color: bgColor }, line: { color: bgColor },
      rectRadius: 0.1,
    });
    s.addText(col.label, {
      x: col.x + 0.1, y: 0.78, w: colW - 0.2, h: 0.38,
      fontFace: F.body, fontSize: 13, bold: true,
      color: ci === 1 ? C.accent : C.white, align: 'center', margin: 0,
    });
    s.addText(col.sub, {
      x: col.x + 0.1, y: 1.18, w: colW - 0.2, h: 0.25,
      fontFace: F.body, fontSize: 9, bold: false, italic: true,
      color: C.midGray, align: 'center', margin: 0,
    });
    col.icons.forEach((icon, ii) => {
      s.addShape(pres.ShapeType.rect, {
        x: col.x + 0.2, y: 1.55 + ii * 0.53, w: colW - 0.4, h: 0.38,
        fill: { color: ci === 1 ? C.blue : '1A3A8F' }, line: { color: C.border, width: 0.5 },
      });
      s.addText('  ' + icon, {
        x: col.x + 0.25, y: 1.55 + ii * 0.53, w: colW - 0.5, h: 0.38,
        fontFace: F.body, fontSize: 10, bold: false,
        color: C.white, align: 'left', valign: 'middle', margin: 0,
      });
    });
  });

  s.addShape(pres.ShapeType.ellipse, {
    x: 5.5, y: 2.2, w: 2.3, h: 2.3,
    fill: { color: C.accent }, line: { color: C.white, width: 2 },
  });
  s.addText('EVIDENCE\nGROUNDED\nCAREER\nANALYSIS', {
    x: 5.5, y: 2.55, w: 2.3, h: 1.6,
    fontFace: F.body, fontSize: 9, bold: true,
    color: C.navy, align: 'center', valign: 'middle', margin: 0,
  });

  const stmts = [
    '1.  Candidate information is distributed across resumes, projects, and supporting artifacts.',
    '2.  Job-specific analysis requires connecting requirements with relevant candidate evidence.',
    '3.  CAREERX investigates an explainable approach for identifying matches, gaps, and actionable improvement paths.',
  ];
  stmts.forEach((stmt, i) => {
    s.addText(stmt, {
      x: 0.25, y: 4.08 + i * 0.55, w: 12.8, h: 0.45,
      fontFace: F.body, fontSize: 11, bold: false,
      color: C.textDark, align: 'left', margin: 0,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: 0.25, y: 5.85, w: 12.8, h: 0.75,
    fill: { color: C.cardBg }, line: { color: C.border, width: 1 },
  });
  s.addText('Research Aim:', {
    x: 0.45, y: 5.92, w: 1.5, h: 0.3,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.blue, align: 'left', margin: 0,
  });
  s.addText('"To investigate how candidate career information and supporting evidence can be connected with job requirements for explainable and actionable career analysis."', {
    x: 1.95, y: 5.92, w: 10.9, h: 0.55,
    fontFace: F.body, fontSize: 10, bold: false, italic: true,
    color: C.textMid, align: 'left', margin: 0,
  });

  slide_number(s, 2);
  s.addNotes(
    'Slide 2 - Abstract\nThree core research objects: Candidate Profile, Evidence, Target Job - converging into evidence-grounded career analysis.\nResearch aim: investigate explainable, evidence-centered connection of candidate information with job requirements.'
  );
}

// ============================================================
// SLIDE 3 — LITERATURE SURVEY & RESEARCH GAP
// ============================================================
{
  const s = pres.addSlide();
  slide_light_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: C.navy } });
  s.addText('LITERATURE SURVEY', {
    x: 0.4, y: 0.07, w: 8, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });
  s.addText('RESEARCH GAP', {
    x: 8.4, y: 0.07, w: 4.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: false,
    color: C.accent, align: 'right', margin: 0,
  });

  const tableTop = 0.65;
  const cols = [1.5, 3.3, 3.3, 3.3];
  const startX = 0.1;
  const headers = ['Reference', 'Research Approach', 'Key Finding', 'Limitation / Gap'];

  let cx = startX;
  headers.forEach((hdr, i) => {
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: tableTop, w: cols[i], h: 0.32,
      fill: { color: C.navy }, line: { color: C.white, width: 0.5 },
    });
    s.addText(hdr, {
      x: cx + 0.04, y: tableTop, w: cols[i] - 0.08, h: 0.32,
      fontFace: F.body, fontSize: 9, bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
    cx += cols[i];
  });

  const rows = [
    ['[1] Qin et al.\nACM SIGIR 2018', 'Ability-aware neural person-job fit (APJFNN) RNN + attention', 'Semantic matching surpasses keyword-based fit scoring', 'No evidence grounding; ignores supporting artifacts'],
    ['[2] Nigam et al.\nICLR WS 2021', 'SkillBERT - BERT on job requisitions for skill classification', 'Skill embeddings improve competency matching over Word2Vec', 'Skill labels only; no candidate evidence or explainability'],
    ['[3] Li & Wang\nACL Findings 2023', 'SkillBert - contextual skill extraction pretraining for JDs', 'Pretraining improves skill span detection in JDs', 'Extraction only; no candidate-side matching or feedback'],
    ['[4] Lewis et al.\nNeurIPS 2020', 'RAG - Retrieval-Augmented Generation for NLP tasks', 'Dense retrieval + generation reduces hallucination', 'General-purpose; not applied to career evidence retrieval'],
    ['[5] Jobscan / Teal\n2023 (practice)', 'Keyword overlap scoring between resume and job description', 'Increases ATS keyword match rates for candidates', 'No semantic understanding; no evidence validation'],
  ];

  const rowH = 0.62;
  rows.forEach((row, ri) => {
    const rowBg = ri % 2 === 0 ? C.white : C.cardBg;
    cx = startX;
    row.forEach((cell, ci) => {
      s.addShape(pres.ShapeType.rect, {
        x: cx, y: tableTop + 0.32 + ri * rowH, w: cols[ci], h: rowH,
        fill: { color: ci === 3 ? (ri % 2 === 0 ? 'FFF8E8' : 'FFF1D0') : rowBg },
        line: { color: C.border, width: 0.5 },
      });
      s.addText(cell, {
        x: cx + 0.05, y: tableTop + 0.32 + ri * rowH, w: cols[ci] - 0.1, h: rowH,
        fontFace: F.body, fontSize: 8.5, bold: ci === 0,
        color: ci === 3 ? C.red : C.textDark,
        align: ci === 0 ? 'center' : 'left', valign: 'middle', margin: 0,
      });
      cx += cols[ci];
    });
  });

  const gapY = 4.82;
  s.addText('RESEARCH GAP CONVERGENCE', {
    x: 0.1, y: gapY, w: 12.5, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.navy, align: 'left', margin: 0,
  });

  const nodes = [
    { x: 0.1, label: 'Person-Job Matching' },
    { x: 2.7, label: 'Skill Extraction' },
    { x: 5.3, label: 'RAG / Retrieval' },
    { x: 7.9, label: 'Career Tools' },
  ];
  nodes.forEach(n => {
    s.addShape(pres.ShapeType.roundRect, {
      x: n.x, y: gapY + 0.33, w: 2.4, h: 0.45,
      fill: { color: C.blue }, line: { color: C.skyBlue, width: 1 },
      rectRadius: 0.07,
    });
    s.addText(n.label, {
      x: n.x, y: gapY + 0.33, w: 2.4, h: 0.45,
      fontFace: F.body, fontSize: 9, bold: false,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
    if (n.x < 7.9) {
      s.addText('>', {
        x: n.x + 2.42, y: gapY + 0.38, w: 0.3, h: 0.35,
        fontFace: F.body, fontSize: 12, color: C.accent, align: 'center', margin: 0,
      });
    }
  });

  s.addText('>', {
    x: 10.32, y: gapY + 0.38, w: 0.3, h: 0.35,
    fontFace: F.body, fontSize: 12, color: C.accent, align: 'center', margin: 0,
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: 10.65, y: gapY + 0.28, w: 2.55, h: 0.62,
    fill: { color: C.accent }, line: { color: C.accent },
    rectRadius: 0.08,
  });
  s.addText('RESEARCH\nOPPORTUNITY', {
    x: 10.65, y: gapY + 0.28, w: 2.55, h: 0.62,
    fontFace: F.body, fontSize: 9, bold: true,
    color: C.navy, align: 'center', valign: 'middle', margin: 0,
  });

  s.addShape(pres.ShapeType.rect, {
    x: 0.1, y: 6.95, w: 13.1, h: 0.45,
    fill: { color: C.cardBg }, line: { color: C.border, width: 1 },
  });
  s.addText(
    'Gap: An opportunity remains to investigate an integrated evidence-grounded approach connecting candidate claims with supporting evidence and job requirements while maintaining explainability.',
    {
      x: 0.2, y: 6.95, w: 13.0, h: 0.45,
      fontFace: F.body, fontSize: 9.5, bold: false, italic: true,
      color: C.textMid, align: 'left', valign: 'middle', margin: 0,
    }
  );

  slide_number(s, 3);
  s.addNotes(
    'Slide 3 - Literature Survey & Research Gap\n\nVERIFIED REFERENCES:\n[1] Qin, C., Zhu, H., et al. (2018). Enhancing Person-Job Fit for Talent Recruitment: An Ability-aware Neural Network Approach. ACM SIGIR 2018, pp. 645-654. DOI: 10.1145/3209978.3210025\n[2] Nigam, A., Tyagi, S., Tyagi, K., Saxena, A. (2021). SkillBERT: Skilling the BERT to classify skills. ICLR 2021 Workshop. OpenReview.\n[3] Li, J. & Wang, H. (2023). Skillbert: Pretraining contextual representations for skill extraction from job descriptions. Findings of ACL 2023. arXiv:2305.11696\n[4] Lewis, P. et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020. arXiv:2005.11401\n[5] Jobscan / Teal - commercially available resume-job keyword optimization tools (2023 public product information). Cited as existing practice baseline, not peer-reviewed literature.'
  );
}

// ============================================================
// SLIDE 4 — PROBLEM STATEMENT
// ============================================================
{
  const s = pres.addSlide();
  slide_light_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: C.navy } });
  s.addText('PROBLEM STATEMENT', {
    x: 0.4, y: 0.07, w: 12.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 4.9, y: 0.75, w: 3.5, h: 2.05,
    fill: { color: C.navy }, line: { color: C.skyBlue, width: 1.5 },
    rectRadius: 0.1,
  });
  s.addText('ONE CANDIDATE', {
    x: 4.9, y: 0.82, w: 3.5, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });
  s.addText('PROFILE', {
    x: 4.9, y: 1.1, w: 3.5, h: 0.55,
    fontFace: F.head, fontSize: 28, bold: true,
    color: C.white, align: 'center', margin: 0,
  });
  s.addText('Education  Projects  Skills\nCertifications  Experience', {
    x: 4.9, y: 1.65, w: 3.5, h: 0.55,
    fontFace: F.body, fontSize: 8.5, bold: false,
    color: C.midGray, align: 'center', margin: 0,
  });

  s.addText('is NOT equally relevant for every job', {
    x: 3.5, y: 2.88, w: 6.3, h: 0.38,
    fontFace: F.body, fontSize: 12, bold: true,
    color: C.red, align: 'center', margin: 0,
  });

  const jobs = [
    { x: 0.15, label: 'JOB A', role: 'Backend Developer', reqs: ['API design', 'DB schema', 'System architecture', 'Problem solving'] },
    { x: 4.9,  label: 'JOB B', role: 'Data Analyst', reqs: ['SQL + Python', 'Data visualization', 'Statistical analysis', 'Report writing'] },
    { x: 9.65, label: 'JOB C', role: 'AI/ML Engineer', reqs: ['ML models', 'Research depth', 'Experiment design', 'Framework usage'] },
  ];

  jobs.forEach(job => {
    s.addShape(pres.ShapeType.roundRect, {
      x: job.x, y: 3.38, w: 3.4, h: 2.55,
      fill: { color: C.blue }, line: { color: C.skyBlue, width: 1 },
      rectRadius: 0.1,
    });
    s.addText(job.label, {
      x: job.x + 0.1, y: 3.45, w: 3.2, h: 0.28,
      fontFace: F.body, fontSize: 9, bold: true,
      color: C.accent, align: 'center', margin: 0,
    });
    s.addText(job.role, {
      x: job.x + 0.1, y: 3.73, w: 3.2, h: 0.35,
      fontFace: F.body, fontSize: 13, bold: true,
      color: C.white, align: 'center', margin: 0,
    });
    job.reqs.forEach((req, ri) => {
      s.addShape(pres.ShapeType.rect, {
        x: job.x + 0.15, y: 4.15 + ri * 0.43, w: 3.1, h: 0.35,
        fill: { color: C.navy }, line: { color: C.border, width: 0.5 },
      });
      s.addText('  ' + req, {
        x: job.x + 0.2, y: 4.15 + ri * 0.43, w: 3.0, h: 0.35,
        fontFace: F.body, fontSize: 8.5, bold: false,
        color: C.accentSoft, align: 'left', valign: 'middle', margin: 0,
      });
    });
  });

  const blindSpots = ['Claim without evidence', 'Project not highlighted', 'Skill gap not surfaced', 'Missing job-specific context'];
  blindSpots.forEach((bs, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.15 + i * 3.25, y: 6.12, w: 3.1, h: 0.38,
      fill: { color: 'FFF0F0' }, line: { color: C.red, width: 0.8 },
      rectRadius: 0.05,
    });
    s.addText('! ' + bs, {
      x: 0.15 + i * 3.25, y: 6.12, w: 3.1, h: 0.38,
      fontFace: F.body, fontSize: 8.5, bold: false,
      color: C.red, align: 'center', valign: 'middle', margin: 0,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 6.6, w: 13.3, h: 0.9,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  s.addText(
    '"How can candidate career information and supporting evidence be systematically connected with job-specific requirements to produce explainable and actionable career analysis?"',
    {
      x: 0.2, y: 6.65, w: 12.9, h: 0.78,
      fontFace: F.body, fontSize: 10, bold: false, italic: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    }
  );

  slide_number(s, 4);
  s.addNotes(
    'Slide 4 - Problem Statement\nThe same candidate profile is not equally relevant for every job.\nKey blind spots: claims without evidence, relevant projects not highlighted, skill gaps not surfaced, missing job-specific context.'
  );
}

// ============================================================
// SLIDE 5 — RESEARCH OBJECTIVES
// ============================================================
{
  const s = pres.addSlide();
  slide_dark_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 5.5, h: 7.5, fill: { color: C.blue } });
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: '0A1535' } });

  s.addText('RESEARCH OBJECTIVES', {
    x: 0.4, y: 0.07, w: 12.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });

  const objectives = [
    { num: 'RO1', short: 'Career & Evidence Model', detail: 'Develop a structured representation\nof candidate information + evidence' },
    { num: 'RO2', short: 'Evidence Matching', detail: 'Investigate evidence-grounded\nsemantic candidate-job alignment' },
    { num: 'RO3', short: 'Explainability', detail: 'Develop an explainable mechanism\nfor match, evidence gap, skill gap' },
    { num: 'RO4', short: 'Actionable Guidance', detail: 'Generate improvement recommendations\nfrom identified gaps' },
    { num: 'RO5', short: 'Experimental Evaluation', detail: 'Evaluate using matching, retrieval,\nand explainability measures' },
  ];

  const baseY = 0.75;
  const stepH = 1.28;

  objectives.forEach((obj, i) => {
    const y = baseY + i * stepH;
    s.addShape(pres.ShapeType.ellipse, {
      x: 0.25, y: y, w: 0.75, h: 0.75,
      fill: { color: i === 4 ? C.accent : C.navy },
      line: { color: C.accent, width: 2 },
    });
    s.addText(obj.num, {
      x: 0.25, y: y, w: 0.75, h: 0.75,
      fontFace: F.body, fontSize: 7, bold: true,
      color: i === 4 ? C.navy : C.accent, align: 'center', valign: 'middle', margin: 0,
    });
    if (i < objectives.length - 1) {
      s.addShape(pres.ShapeType.rect, {
        x: 0.59, y: y + 0.77, w: 0.07, h: stepH - 0.77,
        fill: { color: C.accent }, line: { color: C.accent },
      });
    }
    s.addText(obj.short, {
      x: 1.15, y: y + 0.1, w: 4.1, h: 0.35,
      fontFace: F.body, fontSize: 13, bold: true,
      color: i === 4 ? C.accent : C.white, align: 'left', margin: 0,
    });
    s.addText(obj.detail, {
      x: 1.15, y: y + 0.43, w: 4.1, h: 0.5,
      fontFace: F.body, fontSize: 9.5, bold: false,
      color: C.midGray, align: 'left', margin: 0,
    });
  });

  s.addText('Derived From', {
    x: 5.9, y: 0.72, w: 7.1, h: 0.28,
    fontFace: F.body, fontSize: 9, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });

  const chain = [
    { label: 'LITERATURE', sub: 'Semantic matching, skill extraction, RAG' },
    { label: 'RESEARCH GAP', sub: 'Lack of integrated evidence-grounded approach' },
    { label: 'PROBLEM', sub: 'Same profile is not equally relevant for every job' },
    { label: 'OBJECTIVES', sub: 'RO1 to RO2 to RO3 to RO4 to RO5', highlight: true },
  ];

  chain.forEach((item, i) => {
    const bx = 5.9;
    const by = 1.1 + i * 1.55;
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: by, w: 7.1, h: 1.05,
      fill: { color: item.highlight ? C.accent : C.navy },
      line: { color: item.highlight ? C.accent : C.skyBlue, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(item.label, {
      x: bx + 0.15, y: by + 0.1, w: 6.8, h: 0.38,
      fontFace: F.body, fontSize: 14, bold: true,
      color: item.highlight ? C.navy : C.white, align: 'left', margin: 0,
    });
    s.addText(item.sub, {
      x: bx + 0.15, y: by + 0.5, w: 6.8, h: 0.4,
      fontFace: F.body, fontSize: 9, bold: false,
      color: item.highlight ? C.navy : C.midGray, align: 'left', margin: 0,
    });
    if (i < chain.length - 1) {
      s.addText('v', {
        x: 9.0, y: by + 1.05, w: 1.2, h: 0.5,
        fontFace: F.body, fontSize: 16,
        color: C.accent, align: 'center', margin: 0,
      });
    }
  });

  slide_number(s, 5);
  s.addNotes(
    'Slide 5 - Research Objectives\nFive research objectives derived from literature gap and problem:\nRO1: Structured career + evidence model\nRO2: Evidence-grounded semantic matching\nRO3: Explainable gap identification\nRO4: Actionable improvement guidance\nRO5: Experimental evaluation'
  );
}

// ============================================================
// SLIDE 6 — TENTATIVE PROPOSED SOLUTION / METHODOLOGY
// ============================================================
{
  const s = pres.addSlide();
  slide_light_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: C.navy } });
  s.addText('TENTATIVE PROPOSED SOLUTION', {
    x: 0.4, y: 0.07, w: 9, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });
  s.addText('METHODOLOGY', {
    x: 9.4, y: 0.07, w: 3.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: false,
    color: C.accent, align: 'right', margin: 0,
  });

  // Center oval
  const cx = 6.65, cy = 3.9;
  s.addShape(pres.ShapeType.ellipse, {
    x: cx - 1.5, y: cy - 0.85, w: 3.0, h: 1.7,
    fill: { color: C.navy }, line: { color: C.accent, width: 2.5 },
  });
  s.addText('CAREERX', {
    x: cx - 1.5, y: cy - 0.55, w: 3.0, h: 0.4,
    fontFace: F.head, fontSize: 15, bold: true,
    color: C.white, align: 'center', margin: 0,
  });
  s.addText('Evidence-Grounded\nCareer Analysis', {
    x: cx - 1.5, y: cy - 0.12, w: 3.0, h: 0.5,
    fontFace: F.body, fontSize: 8.5, bold: false,
    color: C.accent, align: 'center', margin: 0,
  });

  // Six orbital stages
  const toRad = deg => deg * Math.PI / 180;
  const stages = [
    { angle: 270, label: 'PROFILE',    sub: 'Career information',           color: C.blue },
    { angle: 330, label: 'EVIDENCE',   sub: 'Artifacts + Repos + Credentials', color: C.skyBlue },
    { angle: 30,  label: 'JOB REQ.',   sub: 'Target role requirements',      color: C.blue },
    { angle: 90,  label: 'GROUNDING',  sub: 'Semantic retrieval + association', color: '007A68' },
    { angle: 150, label: 'ANALYSIS',   sub: 'Match + Gaps + Explainability', color: C.skyBlue },
    { angle: 210, label: 'IMPROVE',    sub: 'Learning + Resume + Practice',  color: C.blue },
  ];

  stages.forEach(st => {
    const rad = toRad(st.angle);
    const nx = cx + 2.6 * 1.3 * Math.cos(rad);
    const ny = cy + 1.85 * 1.3 * Math.sin(rad);
    const nw = 2.2, nh = 0.75;
    s.addShape(pres.ShapeType.roundRect, {
      x: nx - nw / 2, y: ny - nh / 2, w: nw, h: nh,
      fill: { color: st.color }, line: { color: C.skyBlue, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(st.label, {
      x: nx - nw / 2, y: ny - nh / 2 + 0.06, w: nw, h: 0.28,
      fontFace: F.body, fontSize: 11, bold: true,
      color: st.color === '007A68' ? C.accent : C.white, align: 'center', margin: 0,
    });
    s.addText(st.sub, {
      x: nx - nw / 2, y: ny - nh / 2 + 0.36, w: nw, h: 0.32,
      fontFace: F.body, fontSize: 7.5, bold: false,
      color: C.accentSoft, align: 'center', margin: 0,
    });
  });

  // Reassessment badge
  s.addShape(pres.ShapeType.roundRect, {
    x: cx - 1.05, y: 0.65, w: 2.1, h: 0.42,
    fill: { color: C.gold }, line: { color: C.gold },
    rectRadius: 0.06,
  });
  s.addText('REASSESSMENT', {
    x: cx - 1.05, y: 0.65, w: 2.1, h: 0.42,
    fontFace: F.body, fontSize: 8, bold: true,
    color: C.navy, align: 'center', valign: 'middle', margin: 0,
  });

  // Cycle label
  s.addText('CLAIM > EVIDENCE > MATCH > GAP > IMPROVE > PROVE > PRACTICE > REASSESS', {
    x: 0.1, y: 6.55, w: 10.0, h: 0.25,
    fontFace: F.body, fontSize: 7.5, bold: false, italic: true,
    color: C.textMid, align: 'center', margin: 0,
  });

  // AI roles panel
  s.addShape(pres.ShapeType.rect, {
    x: 10.2, y: 0.65, w: 2.95, h: 6.55,
    fill: { color: C.cardBg }, line: { color: C.border, width: 1 },
  });
  s.addText('AI ROLES', {
    x: 10.2, y: 0.7, w: 2.95, h: 0.3,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.navy, align: 'center', margin: 0,
  });
  const aiRoles = [
    { label: 'DETERMINISTIC', desc: 'Parsing + Validation\nScoring + Rules', color: C.navy },
    { label: 'LLM', desc: 'Extraction + Explanation\nControlled suggestions', color: C.blue },
    { label: 'RAG', desc: 'Evidence retrieval\nResource retrieval', color: C.skyBlue },
    { label: 'AGENTIC', desc: 'Adaptive mock interview\n(state-dependent flow)', color: '007A68' },
  ];
  aiRoles.forEach((role, i) => {
    s.addShape(pres.ShapeType.rect, {
      x: 10.3, y: 1.12 + i * 1.32, w: 2.75, h: 1.15,
      fill: { color: role.color }, line: { color: role.color },
    });
    s.addText(role.label, {
      x: 10.3, y: 1.18 + i * 1.32, w: 2.75, h: 0.32,
      fontFace: F.body, fontSize: 10, bold: true,
      color: role.color === '007A68' ? C.accent : C.white, align: 'center', margin: 0,
    });
    s.addText(role.desc, {
      x: 10.3, y: 1.52 + i * 1.32, w: 2.75, h: 0.62,
      fontFace: F.body, fontSize: 8, bold: false,
      color: role.color === '007A68' ? C.accentSoft : C.midGray, align: 'center', margin: 0,
    });
  });

  s.addText('"Agentic workflow is reserved for adaptive interview practice — each question depends on the previous response and evolving interview state."', {
    x: 0.1, y: 6.82, w: 10.0, h: 0.58,
    fontFace: F.body, fontSize: 8.5, bold: false, italic: true,
    color: C.textMid, align: 'left', margin: 0,
  });

  slide_number(s, 6);
  s.addNotes(
    'Slide 6 - Tentative Proposed Solution / Methodology\nCircular evidence-grounding ecosystem: Profile > Evidence > Job Requirements > Grounding > Analysis > Improvement > Reassessment.\nAI roles distinguished: Deterministic (parsing/validation/scoring), LLM (extraction/explanations), RAG (retrieval), Agentic (only for adaptive mock interview).'
  );
}

// ============================================================
// SLIDE 7 — SYSTEM ARCHITECTURE & TECHNOLOGIES
// ============================================================
{
  const s = pres.addSlide();
  slide_dark_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: '0A1535' } });
  s.addText('SYSTEM ARCHITECTURE', {
    x: 0.4, y: 0.07, w: 8, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });
  s.addText('& TECHNOLOGIES', {
    x: 8.4, y: 0.07, w: 4.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: false,
    color: C.accent, align: 'right', margin: 0,
  });

  const layers = [
    { num: 'L1', label: 'USER INTERACTION', items: ['Resume', 'Career Profile', 'Evidence Upload', 'Job Description'], color: C.blue },
    { num: 'L2', label: 'APPLICATION', items: ['React (Frontend)', 'FastAPI (Backend)', 'Pydantic (Validation)'], color: C.skyBlue },
    { num: 'L3', label: 'INTELLIGENCE', items: ['LLM + Embeddings', 'RAG (Dense + Hybrid Retrieval)', 'Deterministic Analysis', 'LangGraph (Adaptive Interview)'], color: '007A68' },
    { num: 'L4', label: 'PERSISTENCE', items: ['Profile  Evidence  Jobs  Analyses  Interviews  (MongoDB)'], color: C.navy },
  ];

  const lx = 0.15, lw = 9.2, lh = 1.35;
  layers.forEach((layer, i) => {
    const ly = 0.72 + i * (lh + 0.12);
    s.addShape(pres.ShapeType.rect, {
      x: lx, y: ly, w: lw, h: lh,
      fill: { color: layer.color === '007A68' ? '004D40' : (layer.color === C.navy ? '0D1B4B' : layer.color) },
      line: { color: layer.color, width: 1.5 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: lx + 0.1, y: ly + 0.33, w: 0.65, h: 0.65,
      fill: { color: C.accent }, line: { color: C.accent },
    });
    s.addText(layer.num, {
      x: lx + 0.1, y: ly + 0.33, w: 0.65, h: 0.65,
      fontFace: F.body, fontSize: 9, bold: true,
      color: C.navy, align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(layer.label, {
      x: lx + 0.88, y: ly + 0.12, w: 2.4, h: 0.35,
      fontFace: F.body, fontSize: 10, bold: true,
      color: layer.color === '007A68' ? C.accent : C.white,
      align: 'left', margin: 0,
    });
    layer.items.forEach((item, ii) => {
      const itemY = ly + 0.52 + ii * 0.27;
      if (itemY < ly + lh - 0.05) {
        s.addText('  ' + item, {
          x: lx + 0.88, y: itemY, w: 8.0, h: 0.26,
          fontFace: F.body, fontSize: 9.5, bold: false,
          color: C.midGray, align: 'left', margin: 0,
        });
      }
    });
    if (i < layers.length - 1) {
      s.addText('v', {
        x: lx + 4.2, y: ly + lh + 0.01, w: 0.8, h: 0.12,
        fontFace: F.body, fontSize: 11,
        color: C.accent, align: 'center', margin: 0,
      });
    }
  });

  // Evidence Repository panel
  s.addShape(pres.ShapeType.rect, {
    x: 9.65, y: 0.72, w: 3.5, h: 5.85,
    fill: { color: C.blue }, line: { color: C.skyBlue, width: 1 },
  });
  s.addText('EVIDENCE\nREPOSITORY', {
    x: 9.65, y: 0.85, w: 3.5, h: 0.7,
    fontFace: F.body, fontSize: 12, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });
  const evidenceSrc = ['GitHub Repositories', 'Document Uploads', 'Credential URLs', 'Assessment Results', 'Project Artifacts'];
  evidenceSrc.forEach((src, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 9.8, y: 1.65 + i * 0.87, w: 3.2, h: 0.68,
      fill: { color: C.navy }, line: { color: C.border, width: 0.5 },
      rectRadius: 0.06,
    });
    s.addText(src, {
      x: 9.8, y: 1.65 + i * 0.87, w: 3.2, h: 0.68,
      fontFace: F.body, fontSize: 9, bold: false,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
  });

  s.addText('<>', {
    x: 9.35, y: 2.6, w: 0.3, h: 0.35,
    fontFace: F.body, fontSize: 14, color: C.accent, align: 'center', margin: 0,
  });

  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 6.95, w: 13.3, h: 0.55,
    fill: { color: '0A1535' }, line: { color: '0A1535' },
  });
  s.addText('Architecture supports modular intelligence components + MongoDB for all profile, evidence, job, analysis, and interview data', {
    x: 0.2, y: 6.98, w: 12.9, h: 0.45,
    fontFace: F.body, fontSize: 8.5, bold: false, italic: true,
    color: C.midGray, align: 'center', valign: 'middle', margin: 0,
  });

  slide_number(s, 7);
  s.addNotes(
    'Slide 7 - System Architecture & Technologies\nL1: User Interaction - resume, career profile, evidence, job description\nL2: Application - React frontend, FastAPI backend, Pydantic validation\nL3: Intelligence - LLM, embeddings, RAG (dense + hybrid), deterministic analysis, LangGraph for adaptive interview\nL4: Persistence - MongoDB for profile, evidence, jobs, analyses, interviews\nEvidence Repository: GitHub repos, document uploads, credential URLs, assessment results, project artifacts.'
  );
}

// ============================================================
// SLIDE 8 — EXPECTED OUTCOMES & RESEARCH CONTRIBUTION
// ============================================================
{
  const s = pres.addSlide();
  slide_light_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: C.navy } });
  s.addText('EXPECTED OUTCOMES', {
    x: 0.4, y: 0.07, w: 7.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });
  s.addText('RESEARCH CONTRIBUTION', {
    x: 7.9, y: 0.07, w: 5.0, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: false,
    color: C.accent, align: 'right', margin: 0,
  });

  s.addShape(pres.ShapeType.ellipse, {
    x: 4.9, y: 0.72, w: 3.5, h: 1.35,
    fill: { color: C.navy }, line: { color: C.accent, width: 2 },
  });
  s.addText('EVIDENCE-GROUNDED\nCAREER ANALYSIS', {
    x: 4.9, y: 1.0, w: 3.5, h: 0.75,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.accent, align: 'center', valign: 'middle', margin: 0,
  });

  const outputs = [
    { label: 'Requirement Match', desc: 'Claim-to-requirement alignment score' },
    { label: 'Evidence Coverage', desc: 'Supporting evidence identified per claim' },
    { label: 'Skill / Evidence Gaps', desc: 'Missing skills and unsupported claims' },
    { label: 'Resume Improvement', desc: 'Evidence-backed rewrite suggestions' },
    { label: 'Learning Path', desc: 'Resources to fill skill and evidence gaps' },
    { label: 'Adaptive Interview', desc: 'State-aware mock interview practice' },
  ];

  const cardW = 3.9, cardH = 1.15;
  [0, 1, 2].forEach(i => {
    const bx = 0.15 + i * (cardW + 0.2);
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 2.25, w: cardW, h: cardH,
      fill: { color: C.cardBg }, line: { color: C.border, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(outputs[i].label, {
      x: bx + 0.1, y: 2.32, w: cardW - 0.2, h: 0.38,
      fontFace: F.body, fontSize: 12, bold: true,
      color: C.blue, align: 'left', margin: 0,
    });
    s.addText(outputs[i].desc, {
      x: bx + 0.1, y: 2.72, w: cardW - 0.2, h: 0.55,
      fontFace: F.body, fontSize: 9.5, bold: false,
      color: C.textMid, align: 'left', margin: 0,
    });
  });

  [3, 4, 5].forEach(i => {
    const bx = 0.15 + (i - 3) * (cardW + 0.2);
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 3.58, w: cardW, h: cardH,
      fill: { color: C.cardBg }, line: { color: C.border, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(outputs[i].label, {
      x: bx + 0.1, y: 3.65, w: cardW - 0.2, h: 0.38,
      fontFace: F.body, fontSize: 12, bold: true,
      color: C.blue, align: 'left', margin: 0,
    });
    s.addText(outputs[i].desc, {
      x: bx + 0.1, y: 4.05, w: cardW - 0.2, h: 0.55,
      fontFace: F.body, fontSize: 9.5, bold: false,
      color: C.textMid, align: 'left', margin: 0,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: 0.15, y: 4.9, w: 12.95, h: 0.82,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  s.addText('EXPECTED RESEARCH CONTRIBUTION', {
    x: 0.25, y: 4.95, w: 12.75, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.accent, align: 'left', margin: 0,
  });
  s.addText(
    '"An evidence-centered framework for connecting candidate claims and supporting evidence with job-specific requirements and generating explainable career improvement guidance."',
    {
      x: 0.25, y: 5.22, w: 12.75, h: 0.42,
      fontFace: F.body, fontSize: 10, bold: false, italic: true,
      color: C.white, align: 'left', margin: 0,
    }
  );

  s.addShape(pres.ShapeType.rect, {
    x: 0.15, y: 5.88, w: 12.95, h: 0.95,
    fill: { color: C.cardBg }, line: { color: C.border, width: 1 },
  });
  s.addText('PROPOSED EVALUATION DIMENSIONS', {
    x: 0.25, y: 5.93, w: 12.75, h: 0.25,
    fontFace: F.body, fontSize: 9, bold: true,
    color: C.navy, align: 'left', margin: 0,
  });
  const dims = ['Match Quality', 'Evidence Coverage', 'Retrieval Effectiveness', 'Explainability', 'Recommendation Usefulness'];
  dims.forEach((dim, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.25 + i * 2.55, y: 6.22, w: 2.4, h: 0.48,
      fill: { color: C.blue }, line: { color: C.blue },
      rectRadius: 0.06,
    });
    s.addText(dim, {
      x: 0.25 + i * 2.55, y: 6.22, w: 2.4, h: 0.48,
      fontFace: F.body, fontSize: 8.5, bold: false,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
  });

  s.addText('To be experimentally validated.', {
    x: 0.25, y: 6.77, w: 12.75, h: 0.22,
    fontFace: F.body, fontSize: 8, bold: false, italic: true,
    color: C.midGray, align: 'right', margin: 0,
  });

  slide_number(s, 8);
  s.addNotes(
    'Slide 8 - Expected Outcomes & Research Contribution\nSix expected outputs: Requirement Match, Evidence Coverage, Skill/Evidence Gaps, Resume Improvement, Learning Path, Adaptive Interview.\nResearch contribution: an evidence-centered framework.\nFive proposed evaluation dimensions - to be validated experimentally. No numerical results claimed.'
  );
}

// ============================================================
// SLIDE 9 — INITIAL PLAN FOR TWO RESEARCH ARTICLES
// ============================================================
{
  const s = pres.addSlide();
  slide_dark_base(s);

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: '0A1535' } });
  s.addText('INITIAL PLAN FOR TWO RESEARCH ARTICLES', {
    x: 0.4, y: 0.07, w: 12.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 4.2, y: 0.68, w: 4.9, h: 0.82,
    fill: { color: C.blue }, line: { color: C.skyBlue, width: 1 },
    rectRadius: 0.08,
  });
  s.addText('FOUNDATION', {
    x: 4.2, y: 0.72, w: 4.9, h: 0.28,
    fontFace: F.body, fontSize: 11, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });
  s.addText('Literature Review  +  Dataset Design  +  Research Prototype', {
    x: 4.2, y: 1.0, w: 4.9, h: 0.28,
    fontFace: F.body, fontSize: 8.5, bold: false,
    color: C.midGray, align: 'center', margin: 0,
  });

  // Branch visual
  s.addShape(pres.ShapeType.rect, { x: 6.62, y: 1.5, w: 0.06, h: 0.55, fill: { color: C.accent }, line: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 3.06, y: 2.02, w: 7.18, h: 0.06, fill: { color: C.accent }, line: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 3.06, y: 2.02, w: 0.06, h: 0.35, fill: { color: C.accent }, line: { color: C.accent } });
  s.addShape(pres.ShapeType.rect, { x: 10.18, y: 2.02, w: 0.06, h: 0.35, fill: { color: C.accent }, line: { color: C.accent } });

  // Article 1
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.15, y: 2.38, w: 5.9, h: 3.65,
    fill: { color: C.blue }, line: { color: C.skyBlue, width: 1.5 },
    rectRadius: 0.1,
  });
  s.addText('ARTICLE 1', {
    x: 0.25, y: 2.45, w: 5.7, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });
  s.addText('Evidence-Grounded\nCareer-Job Alignment', {
    x: 0.25, y: 2.73, w: 5.7, h: 0.65,
    fontFace: F.head, fontSize: 16, bold: true,
    color: C.white, align: 'center', margin: 0,
  });
  const a1rows = [
    { label: 'Focus', val: 'Candidate evidence vs Job requirements' },
    { label: 'Study', val: 'Evidence matching + Coverage + Explainability' },
    { label: 'Evaluation', val: 'Matching quality + Evidence coverage + Explanation quality' },
  ];
  a1rows.forEach((row, i) => {
    s.addText(row.label + ':', {
      x: 0.35, y: 3.48 + i * 0.82, w: 1.2, h: 0.28,
      fontFace: F.body, fontSize: 9.5, bold: true,
      color: C.accent, align: 'left', margin: 0,
    });
    s.addText(row.val, {
      x: 1.65, y: 3.48 + i * 0.82, w: 4.25, h: 0.28,
      fontFace: F.body, fontSize: 9.5, bold: false,
      color: C.white, align: 'left', margin: 0,
    });
    if (i < a1rows.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: 0.35, y: 3.78 + i * 0.82, w: 5.55, h: 0.02, fill: { color: '1A3A8F' }, line: { color: '1A3A8F' } });
    }
  });
  s.addText('Evidence  <->  Requirements  ->  Explainable Match', {
    x: 0.25, y: 5.6, w: 5.7, h: 0.35,
    fontFace: F.body, fontSize: 9, bold: false,
    color: C.midGray, align: 'center', margin: 0,
  });

  // Article 2
  s.addShape(pres.ShapeType.roundRect, {
    x: 7.25, y: 2.38, w: 5.9, h: 3.65,
    fill: { color: C.navy }, line: { color: C.skyBlue, width: 1.5 },
    rectRadius: 0.1,
  });
  s.addText('ARTICLE 2', {
    x: 7.35, y: 2.45, w: 5.7, h: 0.28,
    fontFace: F.body, fontSize: 10, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });
  s.addText('Retrieval & Agentic\nCareer Intelligence', {
    x: 7.35, y: 2.73, w: 5.7, h: 0.65,
    fontFace: F.head, fontSize: 16, bold: true,
    color: C.white, align: 'center', margin: 0,
  });
  const a2rows = [
    { label: 'Focus', val: 'Retrieval + Adaptive AI workflows' },
    { label: 'Study', val: 'Dense vs hybrid retrieval + Interview workflow' },
    { label: 'Evaluation', val: 'Precision@K + MRR + Latency + Workflow effectiveness' },
  ];
  a2rows.forEach((row, i) => {
    s.addText(row.label + ':', {
      x: 7.45, y: 3.48 + i * 0.82, w: 1.2, h: 0.28,
      fontFace: F.body, fontSize: 9.5, bold: true,
      color: C.accent, align: 'left', margin: 0,
    });
    s.addText(row.val, {
      x: 8.75, y: 3.48 + i * 0.82, w: 4.25, h: 0.28,
      fontFace: F.body, fontSize: 9.5, bold: false,
      color: C.white, align: 'left', margin: 0,
    });
    if (i < a2rows.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: 7.45, y: 3.78 + i * 0.82, w: 5.55, h: 0.02, fill: { color: C.blue }, line: { color: C.blue } });
    }
  });
  const metrics = ['Precision@K', 'MRR', 'Latency', 'Workflow Eff.'];
  metrics.forEach((m, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 7.4 + i * 1.38, y: 5.6, w: 1.25, h: 0.38,
      fill: { color: C.blue }, line: { color: C.skyBlue, width: 0.8 },
      rectRadius: 0.06,
    });
    s.addText(m, {
      x: 7.4 + i * 1.38, y: 5.6, w: 1.25, h: 0.38,
      fontFace: F.body, fontSize: 7.5, bold: false,
      color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
  });

  // Timeline
  const timeline = ['Literature', 'Dataset Design', 'Prototype', 'Experiments', 'Article 1', 'Adv. Exps.', 'Article 2'];
  const tlY = 6.35;
  timeline.forEach((step, i) => {
    const bx = 0.15 + i * 1.85;
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: tlY, w: 1.72, h: 0.5,
      fill: { color: i >= 4 ? C.accent : C.blue },
      line: { color: i >= 4 ? C.accent : C.skyBlue, width: 0.8 },
      rectRadius: 0.06,
    });
    s.addText(step, {
      x: bx, y: tlY, w: 1.72, h: 0.5,
      fontFace: F.body, fontSize: 8, bold: false,
      color: i >= 4 ? C.navy : C.white,
      align: 'center', valign: 'middle', margin: 0,
    });
    if (i < timeline.length - 1) {
      s.addText('>', {
        x: bx + 1.74, y: tlY + 0.1, w: 0.11, h: 0.28,
        fontFace: F.body, fontSize: 9, color: C.accent, align: 'center', margin: 0,
      });
    }
  });

  s.addText('"Final research topics, target venues and publication schedule will be finalized in consultation with the research supervisor."', {
    x: 0.15, y: 7.1, w: 12.95, h: 0.35,
    fontFace: F.body, fontSize: 8.5, bold: false, italic: true,
    color: C.midGray, align: 'center', margin: 0,
  });

  slide_number(s, 9);
  s.addNotes(
    'Slide 9 - Initial Plan for Two Research Articles\nArticle 1: Evidence-Grounded Career-Job Alignment\nArticle 2: Retrieval & Agentic Career Intelligence\nTimeline: Literature > Dataset/Evaluation Design > Prototype > Experiments > Article 1 > Advanced Experiments > Article 2\nIMPORTANT: Topics, target venues, and schedule to be finalized with supervisor.'
  );
}

// ============================================================
// SLIDE 10 — CONCLUSION & THANK YOU
// ============================================================
{
  const s = pres.addSlide();
  slide_dark_base(s);

  s.addShape(pres.ShapeType.ellipse, { x: -1.5, y: -1.5, w: 5, h: 5, fill: { color: C.blue }, line: { color: C.blue } });
  s.addShape(pres.ShapeType.ellipse, { x: 10.3, y: 4.5, w: 4.5, h: 4.5, fill: { color: C.blue }, line: { color: C.blue } });
  s.addShape(pres.ShapeType.ellipse, { x: 11.2, y: 5.2, w: 2.5, h: 2.5, fill: { color: C.accent }, line: { color: C.accent } });

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.55, fill: { color: '0A1535' } });
  s.addText('CONCLUSION', {
    x: 0.4, y: 0.07, w: 12.5, h: 0.38,
    fontFace: F.head, fontSize: 22, bold: true,
    color: C.white, align: 'left', margin: 0,
  });

  s.addText('THE RESEARCH JOURNEY', {
    x: 4.15, y: 0.62, w: 5.0, h: 0.28,
    fontFace: F.body, fontSize: 9, bold: true,
    color: C.accent, align: 'center', margin: 0,
  });

  // 6-step journey loop (2 rows of 3)
  const steps = [
    { label: 'LITERATURE', sub: 'Existing approaches + analysis' },
    { label: 'RESEARCH GAP', sub: 'Integrated evidence-grounding' },
    { label: 'PROPOSED APPROACH', sub: 'Evidence-grounded methodology' },
    { label: 'EXPERIMENTAL\nEVALUATION', sub: 'Match + Retrieval + Explainability' },
    { label: 'RESEARCH\nCONTRIBUTION', sub: 'Evidence-centered career framework', highlight: true },
    { label: 'FUTURE\nRESEARCH', sub: 'Extended evaluation + publications' },
  ];

  const row1 = [{ x: 0.5 }, { x: 4.9 }, { x: 9.3 }];
  const row2 = [{ x: 9.3 }, { x: 4.9 }, { x: 0.5 }];

  steps.slice(0, 3).forEach((step, i) => {
    const bx = row1[i].x;
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 1.0, w: 3.4, h: 1.5,
      fill: { color: C.blue }, line: { color: C.skyBlue, width: 1.5 },
      rectRadius: 0.1,
    });
    s.addText(step.label, {
      x: bx, y: 1.15, w: 3.4, h: 0.55,
      fontFace: F.body, fontSize: 13, bold: true,
      color: C.white, align: 'center', margin: 0,
    });
    s.addText(step.sub, {
      x: bx, y: 1.72, w: 3.4, h: 0.55,
      fontFace: F.body, fontSize: 8.5, bold: false,
      color: C.midGray, align: 'center', margin: 0,
    });
    if (i < 2) {
      s.addText('>', { x: row1[i].x + 3.42, y: 1.6, w: 0.45, h: 0.35, fontFace: F.body, fontSize: 18, color: C.accent, align: 'center', margin: 0 });
    }
  });

  // Down arrow at right
  s.addText('v', { x: 10.9, y: 2.52, w: 0.5, h: 0.45, fontFace: F.body, fontSize: 20, color: C.accent, align: 'center', margin: 0 });

  steps.slice(3).forEach((step, i) => {
    const bx = row2[i].x;
    const isHighlight = i === 1;
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 3.0, w: 3.4, h: 1.5,
      fill: { color: isHighlight ? C.accent : C.blue }, line: { color: isHighlight ? C.accent : C.skyBlue, width: 1.5 },
      rectRadius: 0.1,
    });
    s.addText(step.label, {
      x: bx, y: 3.12, w: 3.4, h: 0.62,
      fontFace: F.body, fontSize: 13, bold: true,
      color: isHighlight ? C.navy : C.white, align: 'center', margin: 0,
    });
    s.addText(step.sub, {
      x: bx, y: 3.76, w: 3.4, h: 0.55,
      fontFace: F.body, fontSize: 8.5, bold: false,
      color: isHighlight ? C.navy : C.midGray, align: 'center', margin: 0,
    });
    if (i < 2) {
      s.addText('<', { x: row2[i].x - 0.45, y: 3.6, w: 0.45, h: 0.35, fontFace: F.body, fontSize: 18, color: C.accent, align: 'center', margin: 0 });
    }
  });

  // Up arrow at left (loop close)
  s.addText('^', { x: 1.6, y: 2.55, w: 0.5, h: 0.42, fontFace: F.body, fontSize: 18, color: C.accent, align: 'center', margin: 0 });

  // 3 key statements
  const stmts = [
    'Connect candidate career information with supporting evidence.',
    'Analyze alignment with job-specific requirements.',
    'Provide explainable and actionable career improvement guidance.',
  ];
  stmts.forEach((stmt, i) => {
    s.addShape(pres.ShapeType.rect, {
      x: 0.3, y: 4.75 + i * 0.5, w: 12.7, h: 0.42,
      fill: { color: i % 2 === 0 ? C.blue : C.navy }, line: { color: C.blue },
    });
    s.addText((i === 0 ? 'CHECK  ' : (i === 1 ? 'CHECK  ' : 'CHECK  ')) + stmt, {
      x: 0.5, y: 4.75 + i * 0.5, w: 12.5, h: 0.42,
      fontFace: F.body, fontSize: 11.5, bold: i === 0,
      color: i === 0 ? C.accent : C.white, align: 'left', valign: 'middle', margin: 0,
    });
  });

  s.addText('THANK YOU', {
    x: 0.3, y: 6.35, w: 8.0, h: 0.72,
    fontFace: F.head, fontSize: 40, bold: true,
    color: C.white, align: 'left', margin: 0,
  });
  s.addText('Questions & Discussion', {
    x: 0.3, y: 7.05, w: 8.0, h: 0.3,
    fontFace: F.body, fontSize: 14, bold: false, italic: true,
    color: C.accent, align: 'left', margin: 0,
  });

  s.addText('Shri Vishnu Engineering College for Women (Autonomous) | Bhimavaram', {
    x: 8.5, y: 6.95, w: 4.6, h: 0.28,
    fontFace: F.body, fontSize: 8, bold: false,
    color: C.midGray, align: 'right', margin: 0,
  });
  s.addText('B.Tech Major Project | Review 1 | 2026-2027', {
    x: 8.5, y: 7.22, w: 4.6, h: 0.22,
    fontFace: F.body, fontSize: 7.5, bold: false,
    color: C.midGray, align: 'right', margin: 0,
  });

  slide_number(s, 10);
  s.addNotes(
    'Slide 10 - Conclusion & Thank You\nThe research journey closes the loop from Literature through to Future Research.\nThree core takeaways:\n1. Connect candidate information with supporting evidence.\n2. Analyze alignment with job-specific requirements.\n3. Provide explainable and actionable career improvement guidance.'
  );
}

// ============================================================
// OUTPUT
// ============================================================
const outputPath = 'careerx_review1.pptx';
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log('Created: ' + outputPath);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
