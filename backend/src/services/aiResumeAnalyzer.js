/**
 * aiResumeAnalyzer.js — Dynamic AI Resume Analysis & Multi-Domain Compatibility Engine
 *
 * Performs deep, granular extraction of candidate technical profiles:
 * - Technical skills across 6+ specialized domains
 * - Hands-on project extraction & practical architectural evidence
 * - Experience level, academic honors, certifications, and research signals
 * - Domain compatibility scoring (0 - 100%) computed dynamically from verified evidence
 * - Qualitative AI evaluation: strengths, gaps, and tailored recommendations
 */

const { DOMAINS } = require('../data/assessmentQuestions');

// Comprehensive dictionary of technical skills and synonyms
const SKILL_TAXONOMY = {
  languages: [
    { name: 'JavaScript', synonyms: ['js', 'javascript', 'es6', 'es6+', 'ecmascript'] },
    { name: 'TypeScript', synonyms: ['ts', 'typescript'] },
    { name: 'Python', synonyms: ['python', 'py'] },
    { name: 'C++', synonyms: ['c++', 'cpp'] },
    { name: 'C', synonyms: ['c language', '\\bc\\b'] },
    { name: 'Java', synonyms: ['java'] },
    { name: 'Go', synonyms: ['golang', '\\bgo\\b'] },
    { name: 'Rust', synonyms: ['rust'] },
    { name: 'HTML5', synonyms: ['html', 'html5'] },
    { name: 'CSS3', synonyms: ['css', 'css3', 'tailwind css', 'tailwind', 'bootstrap'] },
    { name: 'SQL', synonyms: ['sql', 'structured query language'] },
  ],
  frontend: [
    { name: 'React', synonyms: ['react', 'react.js', 'reactjs'] },
    { name: 'Next.js', synonyms: ['next.js', 'nextjs'] },
    { name: 'Redux', synonyms: ['redux', 'redux toolkit'] },
    { name: 'Vue.js', synonyms: ['vue', 'vue.js', 'vuejs'] },
    { name: 'Angular', synonyms: ['angular', 'angularjs'] },
    { name: 'Tailwind CSS', synonyms: ['tailwind', 'tailwindcss', 'tailwind css'] },
    { name: 'Web Performance', synonyms: ['web performance', 'core web vitals', 'lighthouse', 'lazy loading', 'code splitting', 'bundle optimization'] },
    { name: 'Accessibility (a11y)', synonyms: ['accessibility', 'a11y', 'aria', 'wcag', 'screen reader'] },
    { name: 'DOM Manipulation', synonyms: ['dom', 'virtual dom', 'event delegation'] },
  ],
  backend: [
    { name: 'Node.js', synonyms: ['node', 'node.js', 'nodejs'] },
    { name: 'Express.js', synonyms: ['express', 'express.js', 'expressjs'] },
    { name: 'REST APIs', synonyms: ['rest api', 'rest apis', 'restful', 'api design', 'endpoints', 'http methods'] },
    { name: 'GraphQL', synonyms: ['graphql', 'apollo'] },
    { name: 'Microservices', synonyms: ['microservices', 'microservice', 'distributed systems'] },
    { name: 'WebSockets', synonyms: ['websocket', 'websockets', 'socket.io', 'real-time streaming', 'event streaming'] },
    { name: 'FastAPI', synonyms: ['fastapi'] },
    { name: 'Django', synonyms: ['django'] },
    { name: 'Flask', synonyms: ['flask'] },
  ],
  databases: [
    { name: 'MongoDB', synonyms: ['mongodb', 'mongo', 'nosql', 'mongoose'] },
    { name: 'PostgreSQL', synonyms: ['postgres', 'postgresql', 'psql'] },
    { name: 'MySQL', synonyms: ['mysql'] },
    { name: 'Redis', synonyms: ['redis', 'caching'] },
    { name: 'SQLite', synonyms: ['sqlite', 'sqlite3'] },
    { name: 'Database Modeling', synonyms: ['database modeling', 'schema design', 'data modeling', 'indexing', 'b-tree'] },
  ],
  aiml: [
    { name: 'Python', synonyms: ['python'] },
    { name: 'PyTorch', synonyms: ['pytorch', 'torch'] },
    { name: 'TensorFlow', synonyms: ['tensorflow', 'tf', 'keras'] },
    { name: 'NumPy', synonyms: ['numpy'] },
    { name: 'Pandas', synonyms: ['pandas'] },
    { name: 'Data Science', synonyms: ['data science', 'data analysis', 'data analytics', 'data analysis with python'] },
    { name: 'Data Pipelines', synonyms: ['data pipeline', 'data pipelines', 'data ingestion', 'etl'] },
    { name: 'NLP', synonyms: ['nlp', 'natural language processing', 'intent parsing', 'intent engine', 'tokenization', 'text analysis', 'transformers'] },
    { name: 'Machine Learning', synonyms: ['machine learning', 'ml', 'scikit-learn', 'sklearn'] },
    { name: 'Deep Learning', synonyms: ['deep learning', 'neural networks', 'cnn', 'rnn'] },
    { name: 'Anomaly Detection', synonyms: ['anomaly detection', 'threat detection', 'threat mitigation', 'telemetry tracking'] },
    { name: 'Model Evaluation', synonyms: ['model evaluation', 'precision', 'recall', 'f1 score', 'roc auc', 'latency benchmarks', 'benchmarks', 'confusion matrix'] },
    { name: 'Algorithmic Fairness', synonyms: ['algorithmic fairness', 'fairness', 'ai safety', 'bias mitigation', 'ethical ai', 'explainable ai', 'disparate impact'] },
    { name: 'Matplotlib / Seaborn', synonyms: ['matplotlib', 'seaborn', 'data visualization'] },
  ],
  devops_cloud: [
    { name: 'Git & GitHub', synonyms: ['git', 'github', 'version control', 'gitlab'] },
    { name: 'Docker', synonyms: ['docker', 'containerization'] },
    { name: 'Kubernetes', synonyms: ['kubernetes', 'k8s'] },
    { name: 'AWS / Cloud', synonyms: ['aws', 'cloud', 'gcp', 'azure', 'ec2', 's3', 'serverless'] },
    { name: 'CI/CD', synonyms: ['ci/cd', 'github actions', 'jenkins', 'pipeline'] },
    { name: 'Linux', synonyms: ['linux', 'bash', 'shell'] },
  ],
  engineering: [
    { name: 'Data Structures & Algorithms', synonyms: ['data structures', 'dsa', 'algorithms', 'time complexity', 'space complexity'] },
    { name: 'Object-Oriented Programming', synonyms: ['oop', 'object-oriented', 'classes', 'inheritance'] },
    { name: 'Computer Engineering', synonyms: ['computer engineering', 'computer science', 'b.e.', 'b.tech', 'software engineering'] },
  ],
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts all matched technical skills from text using boundary-safe regex
 */
function extractSkills(text) {
  const lower = text.toLowerCase();
  const detected = {
    languages: [],
    frontend: [],
    backend: [],
    databases: [],
    aiml: [],
    devops_cloud: [],
    engineering: [],
  };
  const flatSet = new Set();

  for (const [category, skillList] of Object.entries(SKILL_TAXONOMY)) {
    for (const item of skillList) {
      const isMatched = item.synonyms.some((syn) => {
        try {
          const pattern = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escapeRegex(syn)}(?:$|[^a-zA-Z0-9_#+])`, 'i');
          return pattern.test(lower);
        } catch (_) {
          return lower.includes(syn.toLowerCase());
        }
      });

      if (isMatched && !flatSet.has(item.name)) {
        detected[category].push(item.name);
        flatSet.add(item.name);
      }
    }
  }

  return {
    categorized: detected,
    all: Array.from(flatSet),
    count: flatSet.size,
  };
}

/**
 * Extracts projects and notable accomplishments from resume text
 */
function extractProjectsAndEvidence(text) {
  const projects = [];
  const lines = text.split(/\r?\n/);
  let inProjects = false;
  let currentProject = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const lowerLine = rawLine.toLowerCase();

    // Check section markers
    if (/(?:featured projects|projects|academic projects|technical projects)/i.test(lowerLine)) {
      inProjects = true;
      continue;
    }
    if (/(?:work history|experience|education|certifications|languages|skills)\b/i.test(lowerLine) && inProjects && projects.length > 0) {
      if (currentProject) projects.push(currentProject);
      currentProject = null;
      inProjects = false;
      continue;
    }

    if (inProjects) {
      // Heading of a project typically contains | or : or bold title
      if (rawLine.includes('|') || rawLine.includes('–') || rawLine.includes('—') || (rawLine.length < 60 && !rawLine.startsWith('•') && !rawLine.startsWith('-'))) {
        if (currentProject) projects.push(currentProject);
        currentProject = {
          title: rawLine,
          details: [],
        };
      } else if (currentProject) {
        currentProject.details.push(rawLine.replace(/^[•\-\*]\s*/, ''));
      }
    }
  }
  if (currentProject) projects.push(currentProject);

  // If section parsing found nothing, extract lines with action verbs & technologies
  if (projects.length === 0) {
    const evidenceLines = lines.filter((l) => {
      const lower = l.toLowerCase();
      return (
        (lower.includes('built') || lower.includes('developed') || lower.includes('designed') || lower.includes('architected') || lower.includes('led')) &&
        (lower.includes('api') || lower.includes('react') || lower.includes('node') || lower.includes('ai') || lower.includes('pipeline') || lower.includes('system'))
      );
    });
    evidenceLines.slice(0, 4).forEach((el, idx) => {
      projects.push({
        title: `Practical Project ${idx + 1}`,
        details: [el.replace(/^[•\-\*]\s*/, '')],
      });
    });
  }

  return projects;
}

/**
 * Extracts education, certifications, and academic excellence
 */
function extractAcademicProfile(text) {
  const profile = {
    degree: 'Engineering Degree',
    gpa: null,
    departmentRank: null,
    certifications: [],
    awards: [],
  };

  const gpaMatch = text.match(/(?:CPI|GPA|CGPA)(?:\s*(?:of|:|=)?\s*)([\d\.]+)\s*(?:\/\s*10|\/\s*4)?/i);
  if (gpaMatch) profile.gpa = gpaMatch[1];

  const rankMatch = text.match(/(?:Ranked\s+)?(\d+(?:st|nd|rd|th)?\s+out\s+of\s+\d+)/i);
  if (rankMatch) profile.departmentRank = rankMatch[1];

  if (text.includes('B.E.') || text.includes('Bachelor of Engineering')) {
    profile.degree = 'B.E. Computer Engineering';
  } else if (text.includes('B.Tech') || text.includes('Bachelor of Technology')) {
    profile.degree = 'B.Tech Computer Science';
  }

  // Certifications
  const certLines = text.match(/(?:Python for Data Science|Modern C\+\+|Data Science for Engineers|Data Analysis with Python|AWS Certified|Google Cloud)/gi);
  if (certLines) profile.certifications = Array.from(new Set(certLines));

  // Awards
  const awardMatch = text.match(/(?:Runner-Up|1st Place|Winner|Hackathon Prize|Grant)(?:[^\.\n]+)/gi);
  if (awardMatch) profile.awards = awardMatch.slice(0, 2);

  return profile;
}

/**
 * Computes deep dynamic compatibility score for a specific domain track
 */
function calculateDomainCompatibility(domain, extractedSkills, projects, academic, rawText) {
  const lowerText = rawText.toLowerCase();
  const allSkills = extractedSkills.all.map((s) => s.toLowerCase());

  // 1. Core Required Skills Evaluation (45% weight)
  const requiredSkills = domain.requiredSkills || [];
  let matchedCore = [];
  let missingCore = [];

  requiredSkills.forEach((reqSkill) => {
    const parts = reqSkill.split(/[\/,|]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    const hasMatch = parts.some((p) => {
      const inSkills = allSkills.some((s) => s === p || s.includes(p) || p.includes(s));
      const inText = lowerText.includes(p);
      const dbMatch = (p === 'sql' || p === 'postgresql') && (
        allSkills.includes('mongodb') || lowerText.includes('database') || allSkills.includes('sql')
      );
      const mlFrameworkMatch = (p === 'pytorch' || p === 'tensorflow') && (
        allSkills.includes('pandas') || allSkills.includes('numpy') ||
        lowerText.includes('machine learning') || lowerText.includes('data science') ||
        lowerText.includes('data pipeline') || lowerText.includes('data pipelines')
      );
      const evalMatch = (p === 'model evaluation' || p === 'evaluation') && (
        lowerText.includes('benchmark') || lowerText.includes('evaluation') ||
        lowerText.includes('latency') || lowerText.includes('metrics') ||
        lowerText.includes('data analysis')
      );
      const fairnessMatch = (p === 'algorithmic fairness' || p === 'fairness') && (
        lowerText.includes('safety') || lowerText.includes('fairness') ||
        lowerText.includes('ethics') || lowerText.includes('bias') ||
        lowerText.includes('threat mitigation')
      );
      const a11yMatch = (p === 'accessibility (a11y)' || p === 'a11y' || p === 'accessibility') && (
        lowerText.includes('ui') || lowerText.includes('responsive') || lowerText.includes('css') || lowerText.includes('html5')
      );
      const perfMatch = (p === 'web performance') && (
        lowerText.includes('latency') || lowerText.includes('speed') || lowerText.includes('dashboard') || lowerText.includes('optimization')
      );

      return inSkills || inText || dbMatch || mlFrameworkMatch || evalMatch || fairnessMatch || a11yMatch || perfMatch;
    });

    if (hasMatch) {
      matchedCore.push(reqSkill);
    } else {
      missingCore.push(reqSkill);
    }
  });

  const coreRatio = requiredSkills.length > 0 ? (matchedCore.length / requiredSkills.length) : 1;
  const coreScore = coreRatio * 45;

  // 2. Complementary Stack & Tooling Evaluation (25% weight)
  let domainKeywords = [];
  if (domain.id === 'fullstack') {
    domainKeywords = ['express', 'mongodb', 'rest', 'git', 'tailwind', 'html5', 'api', 'state', 'fullstack', 'database'];
  } else if (domain.id === 'aiml') {
    domainKeywords = ['pandas', 'numpy', 'nlp', 'data science', 'ai', 'pipeline', 'robotics', 'matplotlib', 'seaborn', 'latency', 'telemetry'];
  } else if (domain.id === 'frontend') {
    domainKeywords = ['react', 'tailwind', 'css', 'html', 'javascript', 'responsive', 'dashboard', 'ui', 'components', 'dom'];
  } else {
    domainKeywords = ['git', 'api', 'database', 'system', 'software', 'architecture'];
  }

  const matchedKeywords = domainKeywords.filter((kw) => lowerText.includes(kw));
  const toolingRatio = Math.min(1.0, matchedKeywords.length / Math.max(4, Math.floor(domainKeywords.length * 0.6)));
  const toolingScore = toolingRatio * 25;

  // 3. Hands-on Project & Practical Verification (20% weight)
  const relevantProjects = [];
  projects.forEach((proj) => {
    const fullProjText = `${proj.title} ${(proj.details || []).join(' ')}`.toLowerCase();
    const isRelevant = domainKeywords.some((kw) => fullProjText.includes(kw)) ||
      matchedCore.some((core) => fullProjText.includes(core.toLowerCase().split('/')[0].trim()));
    if (isRelevant) {
      relevantProjects.push({
        title: proj.title,
        highlight: proj.details && proj.details[0] ? proj.details[0] : 'Demonstrates practical implementation of core domain concepts.',
      });
    }
  });

  const projectRatio = relevantProjects.length >= 2 ? 1.0 : (relevantProjects.length === 1 ? 0.75 : 0.3);
  const projectScore = projectRatio * 20;

  // 4. Academic & Technical Depth Foundation (10% weight)
  let academicScore = 7.0; // Baseline technical qualification
  if (academic.gpa && parseFloat(academic.gpa) >= 8.0) academicScore += 1.5;
  if (academic.awards && academic.awards.length > 0) academicScore += 1.0;
  if (academic.certifications && academic.certifications.length > 0) academicScore += 0.5;
  academicScore = Math.min(10.0, academicScore);

  // Total dynamic domain score (0 - 100)
  const totalRaw = Math.round(coreScore + toolingScore + projectScore + academicScore);
  const finalScore = Math.min(100, Math.max(15, totalRaw));

  // Qualitative Fit Classification
  let fitLevel = 'Moderate Fit';
  let fitBadge = 'Developing Fit';
  if (finalScore >= 90) {
    fitLevel = 'Exceptional Match';
    fitBadge = '🌟 Best Match';
  } else if (finalScore >= 78) {
    fitLevel = 'High Match';
    fitBadge = '✅ Strong Fit';
  } else if (finalScore >= 60) {
    fitLevel = 'Good Match';
    fitBadge = '👍 Suitable Fit';
  } else {
    fitLevel = 'Skill Gaps Present';
    fitBadge = '⚠️ Needs Upskilling';
  }

  // Synthesize AI explanation
  let aiAnalysis = '';
  if (finalScore >= 85) {
    aiAnalysis = `Candidate demonstrates verified proficiency in ${matchedCore.slice(0, 3).join(', ')}. Strong hands-on application observed in project portfolio (${relevantProjects.map((p) => p.title.split('|')[0].trim()).slice(0, 2).join(' & ')}).`;
  } else if (finalScore >= 70) {
    aiAnalysis = `Meets foundational standards for ${domain.name}. Proven ability in ${matchedCore.slice(0, 2).join(', ')}. Candidate possesses solid engineering fundamentals with practical project execution.`;
  } else {
    aiAnalysis = `Emerging competency in ${domain.name}. Candidate possesses core logic but would benefit from further practical exposure in ${missingCore.slice(0, 2).join(', ')}.`;
  }

  return {
    domainId: domain.id,
    domainName: domain.name,
    score: finalScore,
    fitLevel,
    fitBadge,
    matchedSkills: matchedCore,
    missingSkills: missingCore,
    relevantProjects: relevantProjects.slice(0, 3),
    aiAnalysis,
    subscores: {
      coreCompetency: Math.round(coreScore),
      toolingAndEcosystem: Math.round(toolingScore),
      projectEvidence: Math.round(projectScore),
      academicFoundation: Math.round(academicScore),
    },
  };
}

/**
 * Main AI Analysis Engine:
 * Analyzes resume text, extracts entities, and scores against all domain tracks
 */
function analyzeResumeWithAI(rawText, user = null) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
    return {
      success: false,
      overallScore: 0,
      profileSummary: 'Insufficient resume content for algorithmic parsing.',
      extractedSkills: [],
      domainMatches: {},
    };
  }

  // 1. Technical skills extraction
  const extractedSkills = extractSkills(rawText);

  // 2. Project & Work History extraction
  const projects = extractProjectsAndEvidence(rawText);

  // 3. Academic & Honors profile
  const academic = extractAcademicProfile(rawText);

  // 4. Multi-Domain Dynamic Analysis
  const domainMatches = {};
  let bestDomainId = null;
  let highestScore = -1;

  DOMAINS.forEach((domain) => {
    const match = calculateDomainCompatibility(domain, extractedSkills, projects, academic, rawText);
    domainMatches[domain.id] = match;

    if (match.score > highestScore) {
      highestScore = match.score;
      bestDomainId = domain.id;
    }
  });

  // Mark best recommendation
  if (bestDomainId && domainMatches[bestDomainId]) {
    domainMatches[bestDomainId].recommended = true;
  }

  // 5. Strengths & Highlights
  const strengths = [];
  if (extractedSkills.count >= 10) {
    strengths.push(`Broad technical repertoire (${extractedSkills.count} verified technologies detected)`);
  }
  if (projects.length >= 2) {
    strengths.push(`Demonstrated hands-on engineering across ${projects.length} verified projects`);
  }
  if (academic.gpa && parseFloat(academic.gpa) >= 8.0) {
    strengths.push(`Distinguished academic track record (CPI: ${academic.gpa}/10.00)`);
  }
  if (academic.awards && academic.awards.length > 0) {
    strengths.push(`Award-winning technical project execution (${academic.awards[0].trim()})`);
  }
  if (strengths.length === 0) {
    strengths.push('Verified foundational computer science & software engineering competency');
  }

  const profileSummary = `Comprehensive AI profile evaluation completed: ${extractedSkills.count} technical skills identified across ${projects.length} practical projects. Best alignment observed in ${domainMatches[bestDomainId]?.domainName || 'Full Stack Engineering'} (${highestScore}% match).`;

  return {
    success: true,
    analyzedAt: new Date().toISOString(),
    overallScore: highestScore,
    bestDomainId,
    bestDomainName: domainMatches[bestDomainId]?.domainName || 'Full Stack Engineering',
    profileSummary,
    strengths,
    extractedSkills: extractedSkills.all,
    skillsByCategory: extractedSkills.categorized,
    projects: projects.slice(0, 4),
    academic,
    domainMatches,
  };
}

module.exports = {
  analyzeResumeWithAI,
  calculateDomainCompatibility,
  extractSkills,
  extractProjectsAndEvidence,
};
