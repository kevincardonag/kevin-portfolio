// =============================================================================
// Resume Data — Single source of truth for all resume/portfolio content
// =============================================================================

window.RESUME_DATA = {
  personal: {
    name: 'Kevin Cardona',
    fullName: 'Kevin Elias Cardona Giraldo',
    title: 'Senior Full Stack Python Developer',
    email: 'kevincardonag@gmail.com',
    linkedin: 'https://www.linkedin.com/in/kevincardonag',
    github: 'https://github.com/kevincardonag',
    githubUsername: 'kevincardonag',
    location: 'Cali, Colombia',
    website: '', // future
    englishLevel: 'B2+',
    yearsExperience: new Date().getFullYear() - 2014, // dynamic calculation
  },

  summary:
    'Senior Full Stack Developer with 9+ years of experience building robust web applications with Python, Django, React, and modern AI technologies. Currently working at Monadical, a remote-first software consultancy, building high-impact products including AI agents with LangGraph for organizations.',

  // ── Work Experience ────────────────────────────────────────────────────────
  experience: [
    {
      company: 'Monadical',
      url: 'https://monadical.com',
      role: 'Senior Full Stack Python Developer',
      location: 'Remote — Montréal / Medellín / NYC',
      startDate: '2021',
      endDate: 'Present',
      highlights: [
        'Architected and developed full-stack web applications for international clients using Python, FastAPI, React, and PostgreSQL',
        'Built an AI-powered agent using LangGraph and LangSmith for Recidiviz, a non-profit transforming criminal justice through data-driven technology',
        'Designed and implemented workflow automation systems using n8n',
        'Deployed and managed containerized applications on Google Cloud Platform using Docker',
        'Collaborated with distributed teams across multiple time zones in a fully remote, async-first environment',
        'Leveraged AI development tools (Claude Code, LLMs) to enhance productivity and code quality',
      ],
      technologies: [
        'Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker',
        'GCP', 'LangGraph', 'LangSmith', 'n8n',
      ],
    },
    {
      company: 'Swapps',
      url: '',
      role: 'Backend Developer',
      location: 'Colombia',
      startDate: '2020',
      endDate: '2021',
      highlights: [
        'Developed enterprise-grade web applications using Django 3.2, Vue.js, and Django REST Framework',
        'Built Sidoc — an enterprise system with SIESA ERP integration using Celery for async task processing',
        'Implemented Fillweight — a logistics management platform with real-time data processing',
        'Designed RESTful APIs following best practices for scalability and maintainability',
      ],
      technologies: ['Python', 'Django', 'Vue.js', 'DRF', 'Celery', 'PostgreSQL'],
    },
    {
      company: 'Millenium Solutions SAS',
      url: '',
      role: 'Web Developer',
      location: 'Colombia',
      startDate: '2018',
      endDate: '2020',
      highlights: [
        'Built Buuson — a full-stack platform with microservices architecture using Python, Django, and Tornado',
        'Integrated AWS services, OwnCloud file management, and PayU payment gateway',
        'Developed RESTful APIs and Google Maps integrations for location-based features',
        'Worked in agile (SCRUM) methodology delivering iterative releases',
      ],
      technologies: ['Python', 'Django', 'Tornado', 'DRF', 'AWS', 'Microservices'],
    },
    {
      company: 'Rady Consultores',
      url: '',
      role: 'Python Web Developer',
      location: 'Cali, Colombia',
      startDate: '2017',
      endDate: '2018',
      highlights: [
        'Developed TuNotaria — a multi-tenant notary platform with SOAP integrations and payment gateway',
        'Built MyRightHand with Google Maps API integration for geolocation services',
        'Created Vitocsa with SIESA ERP system integration for business process automation',
        'Delivered 4+ projects using Python, Django, and REST Framework',
      ],
      technologies: ['Python', 'Django', 'DRF', 'SOAP', 'Google Maps API'],
    },
  ],

  // ── Skills ─────────────────────────────────────────────────────────────────
  skills: {
    'Backend': { icon: '⚙️', items: ['Python', 'Django', 'FastAPI', 'Flask', 'DRF', 'Celery'] },
    'Frontend': { icon: '🎨', items: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3'] },
    'Databases': { icon: '🗄️', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
    'DevOps & Cloud': { icon: '☁️', items: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'GitHub Actions', 'CI/CD'] },
    'AI & Automation': { icon: '🤖', items: ['LangGraph', 'LangSmith', 'LLMs', 'Claude Code', 'AI Agents', 'n8n'] },
    'Architecture': { icon: '🏗️', items: ['REST APIs', 'Microservices', 'Multi-tenant', 'SOAP', 'SCRUM'] },
  },

  // ── Notable Projects ───────────────────────────────────────────────────────
  projects: [
    {
      name: 'Recidiviz AI Agent',
      company: 'Monadical (for Recidiviz)',
      description:
        'Built an AI-powered agent using LangGraph and LangSmith to help transform criminal justice data analysis. The agent automates complex data processing workflows for a non-profit working to reduce incarceration through technology.',
      technologies: ['LangGraph', 'LangSmith', 'FastAPI', 'React', 'GCP', 'Docker'],
      url: 'https://recidiviz.org',
      featured: true,
    },
    {
      name: 'Reflector',
      company: 'Monadical',
      description:
        'Led development of a 100% local ML meeting transcription and analysis platform, implementing audio diarization pipelines and speaker merge tooling.',
      technologies: ['Python', 'TypeScript', 'Machine Learning', 'Docker'],
      url: 'https://github.com/GreyhavenHQ/reflector',
      featured: false,
    },
    {
      name: 'Virtue Poker',
      company: 'Monadical',
      description:
        'Core contributor to decentralized crypto poker platform backend, developing game logic, wallet integrations, and processing 161+ merged pull requests.',
      technologies: ['Python', 'JavaScript', 'SCSS', 'Web3'],
      url: 'https://github.com/Monadical-SAS/virtue-poker',
      featured: false,
    },
    {
      name: 'Sidoc',
      company: 'Swapps',
      description:
        'Enterprise resource management system with SIESA ERP integration and real-time async task processing via Celery.',
      technologies: ['Django', 'Vue.js', 'DRF', 'Celery', 'PostgreSQL'],
      url: '',
      featured: false,
    },
    {
      name: 'TuNotaria',
      company: 'Rady Consultores',
      description:
        'Multi-tenant notary platform serving multiple organizations with SOAP integrations and secure payment processing.',
      technologies: ['Django', 'DRF', 'SOAP', 'Payment Gateway'],
      url: 'https://www.tunotaria.com/',
      featured: false,
    },
    {
      name: 'Buuson',
      company: 'Millenium Solutions',
      description:
        'Full-stack platform with microservices architecture using Tornado, AWS cloud infrastructure, and PayU payment integration.',
      technologies: ['Django', 'Tornado', 'AWS', 'DRF', 'PayU'],
      url: '',
      featured: false,
    },
    {
      name: 'Red Aprende',
      company: 'Ministry of Education',
      description:
        "Educational platform for Colombia's Ministry of Education and Universidad del Valle, enabling digital learning resources.",
      technologies: ['Django', 'DRF', 'Bootstrap', 'JavaScript'],
      url: 'https://redaprende.colombiaaprende.edu.co/inicio',
      featured: false,
    },
    {
      name: 'Fillweight',
      company: 'Swapps',
      description:
        'Logistics management platform with real-time data processing and Vue.js frontend for operational efficiency.',
      technologies: ['Django', 'Vue.js', 'DRF', 'Celery'],
      url: '',
      featured: false,
    },
  ],

  // ── Education ──────────────────────────────────────────────────────────────
  education: [
    {
      degree: 'Systems Engineer',
      school: 'Universidad del Valle',
      location: 'Cali, Colombia',
      startDate: '2018',
      endDate: '2020',
    },
    {
      degree: 'Systems Technology',
      school: 'Universidad del Valle',
      location: 'Cali, Colombia',
      startDate: '2014',
      endDate: '2017',
    },
  ],
};
