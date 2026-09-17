const { Job, User, Organisation } = require('./models');
const bcrypt = require('bcryptjs');

const SAMPLE_JOBS = [
  {
    title: 'Senior Full Stack Engineer (React / Node.js)',
    rawText: `We are seeking an experienced Full Stack Engineer to lead the design and implementation of modern, scalable web applications. You will collaborate with cross-functional teams to build intuitive frontends in React and resilient backend services using Node.js and PostgreSQL. We value clean architectural design, unit testing, and continuous deployment.`,
    biasScore: 2.1,
    status: 'published',
    skillProfileJson: {
      primary_field: 'Full Stack Development',
      tech_stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Docker'],
      min_years_experience: 3,
      domain: 'fullstack',
      salary_range: '$110,000 - $145,000 USD',
      location: 'Remote (Global)',
      type: 'Full-time',
    },
  },
  {
    title: 'Frontend Engineer (React / TypeScript / Tailwind)',
    rawText: `Looking for a passionate Frontend Developer to craft accessible, performant, and delightful user interfaces. You will build reusable component systems, optimize web performance, and collaborate with UX designers to deliver responsive web applications.`,
    biasScore: 1.5,
    status: 'published',
    skillProfileJson: {
      primary_field: 'Frontend Engineering',
      tech_stack: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'State Management', 'Web Accessibility (a11y)'],
      min_years_experience: 2,
      domain: 'frontend',
      salary_range: '$95,000 - $125,000 USD',
      location: 'Remote / Hybrid',
      type: 'Full-time',
    },
  },
  {
    title: 'AI / Machine Learning Systems Engineer (Python / PyTorch)',
    rawText: `Join our applied machine learning team to build and deploy scalable NLP models, recommendation pipelines, and algorithmic fairness evaluators. Candidates will work with modern deep learning frameworks and high-throughput microservices.`,
    biasScore: 2.8,
    status: 'published',
    skillProfileJson: {
      primary_field: 'Artificial Intelligence & ML',
      tech_stack: ['Python', 'PyTorch', 'FastAPI', 'HuggingFace', 'Docker', 'MLOps', 'Vector Databases'],
      min_years_experience: 3,
      domain: 'aiml',
      salary_range: '$130,000 - $165,000 USD',
      location: 'Remote',
      type: 'Full-time',
    },
  },
  {
    title: 'Cloud & DevOps Infrastructure Specialist (AWS / K8s)',
    rawText: `Seeking a DevOps Specialist to manage cloud infrastructure, build automated CI/CD pipelines, ensure zero-downtime deployments, and maintain robust infrastructure monitoring and security compliance.`,
    biasScore: 1.9,
    status: 'published',
    skillProfileJson: {
      primary_field: 'Cloud & Infrastructure',
      tech_stack: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD Pipelines', 'Prometheus', 'Linux'],
      min_years_experience: 3,
      domain: 'devops',
      salary_range: '$115,000 - $150,000 USD',
      location: 'Remote',
      type: 'Full-time',
    },
  },
];

async function seedJobsIfEmpty() {
  try {
    const jobCount = await Job.count({ where: { status: 'published' } });
    if (jobCount > 0) {
      return;
    }

    console.log('[Seed] 0 published jobs found. Seeding verified bias-scanned positions...');

    // Find or create default hiring organization
    let [org] = await Organisation.findOrCreate({
      where: { name: 'FairHire Partner Network' },
      defaults: { workDomain: 'Engineering & Technology', status: 'active' },
    });

    // Find or create default recruiter
    let recruiter = await User.findOne({ where: { email: 'recruiter@fairhire.io' } });
    if (!recruiter) {
      const passwordHash = await bcrypt.hash('password123', 12);
      recruiter = await User.create({
        email: 'recruiter@fairhire.io',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Jenkins',
        role: 'recruiter',
        orgId: org.id,
        emailVerified: true,
        isActive: true,
      });
    }

    for (const jobData of SAMPLE_JOBS) {
      await Job.create({
        ...jobData,
        orgId: org.id,
        createdBy: recruiter.id,
      });
    }

    console.log(`[Seed] ✅ Successfully seeded ${SAMPLE_JOBS.length} published positions.`);
  } catch (err) {
    console.error('[Seed] ⚠️ Job seeding error:', err.message);
  }
}

module.exports = { seedJobsIfEmpty, SAMPLE_JOBS };
