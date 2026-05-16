const express = require('express');
const { getAll } = require('../database');

const router = express.Router();

const DEFAULT_JOBS = [
  { id: 1, title: 'Senior Software Engineer, Remote', company: 'Stripe', salary: '$150K-200K', location: 'Remote (US)', type: 'Full-Time', posted: '2 days ago', category: 'Software Development', experience: 'Senior Level', fee: 5.00, feeLabel: 'Pro', description: 'Build and maintain Stripe\'s global payments platform.' },
  { id: 2, title: 'Customer Success Manager', company: 'Airbnb', salary: '$85K-110K', location: 'Remote (Global)', type: 'Full-Time', posted: '3 days ago', category: 'Customer Service', experience: 'Mid Level', fee: 5.00, feeLabel: 'Pro' },
  { id: 3, title: 'Data Analyst, Marketing Analytics', company: 'Dropbox', salary: '$95K-130K', location: 'Remote (US)', type: 'Full-Time', posted: '5 days ago', category: 'Data & Analytics', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 4, title: 'Content Marketing Specialist', company: 'HubSpot', salary: '$70K-90K', location: 'Remote (US)', type: 'Full-Time', posted: '1 week ago', category: 'Marketing', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 5, title: 'Technical Writer', company: 'GitLab', salary: '$80K-105K', location: 'Remote (Global)', type: 'Full-Time', posted: '1 week ago', category: 'Writing', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 6, title: 'Product Designer', company: 'Figma', salary: '$120K-160K', location: 'Remote (US)', type: 'Full-Time', posted: '2 weeks ago', category: 'Design', experience: 'Senior Level', fee: 5.00, feeLabel: 'Pro' },
  { id: 7, title: 'Project Manager, Engineering', company: 'Atlassian', salary: '$110K-145K', location: 'Remote (US)', type: 'Full-Time', posted: '2 weeks ago', category: 'Project Management', experience: 'Senior Level', fee: 5.00, feeLabel: 'Pro' },
  { id: 8, title: 'Senior Accountant', company: 'Shopify', salary: '$85K-115K', location: 'Remote (Canada)', type: 'Full-Time', posted: '2 weeks ago', category: 'Finance', experience: 'Senior Level', fee: 0, feeLabel: '' },
  { id: 9, title: 'HR Business Partner', company: 'Microsoft', salary: '$100K-135K', location: 'Remote (US)', type: 'Full-Time', posted: '3 weeks ago', category: 'Human Resources', experience: 'Senior Level', fee: 0, feeLabel: '' },
  { id: 10, title: 'Junior Frontend Developer', company: 'Turing', salary: '$60K-80K', location: 'Remote (Global)', type: 'Full-Time', posted: '1 day ago', category: 'Software Development', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 11, title: 'Virtual Assistant', company: 'Time Etc', salary: '$15-25/hr', location: 'Remote (Global)', type: 'Contract', posted: '3 days ago', category: 'Customer Service', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 12, title: 'Social Media Manager', company: 'Buffer', salary: '$55K-75K', location: 'Remote (Global)', type: 'Full-Time', posted: '5 days ago', category: 'Marketing', experience: 'Mid Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 13, title: 'UX Researcher', company: 'Figma', salary: '$110K-150K', location: 'Remote (US)', type: 'Full-Time', posted: '1 week ago', category: 'Design', experience: 'Senior Level', fee: 5.00, feeLabel: 'Pro' },
  { id: 14, title: 'Data Entry Clerk', company: 'ClickWorker', salary: '$12-18/hr', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 15, title: 'Customer Support Specialist', company: 'Zendesk', salary: '$45K-60K', location: 'Remote (US)', type: 'Full-Time', posted: '4 days ago', category: 'Customer Service', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 16, title: 'Senior DevOps Engineer', company: 'DigitalOcean', salary: '$140K-190K', location: 'Remote (US)', type: 'Full-Time', posted: '1 week ago', category: 'Software Development', experience: 'Senior Level', fee: 5.00, feeLabel: 'Pro' },
  { id: 17, title: 'Copywriter', company: 'Copy.ai', salary: '$65K-85K', location: 'Remote (Global)', type: 'Full-Time', posted: '3 days ago', category: 'Writing', experience: 'Mid Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 18, title: 'Financial Analyst', company: 'Stripe', salary: '$90K-120K', location: 'Remote (US)', type: 'Full-Time', posted: '2 weeks ago', category: 'Finance', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 19, title: 'Data Entry Specialist', company: 'Apex Freelancers', salary: '$40-60/project', location: 'Remote (Global)', type: 'Freelance', posted: '1 day ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 20, title: 'Typesetting & Formatting Expert', company: 'Apex Freelancers', salary: '$5-15/project', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Writing', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 21, title: 'T-Shirt Design Assistant', company: 'Apex Freelancers', salary: '$50-100/project', location: 'Remote (Global)', type: 'Freelance', posted: '3 days ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 22, title: 'Yellow Pages Lead Researcher', company: 'Apex Freelancers', salary: '$5-10/project', location: 'Remote (Global)', type: 'Freelance', posted: '4 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 23, title: 'Promo Graphics Designer', company: 'Apex Freelancers', salary: '$15-30/project', location: 'Remote (Global)', type: 'Freelance', posted: '5 days ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 24, title: 'Logo Designer', company: 'Apex Freelancers', salary: '$10-25/logo', location: 'Remote (Global)', type: 'Freelance', posted: '1 week ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 25, title: 'Translation & Transcription', company: 'Apex Freelancers', salary: '$2-5/project', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Writing', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 26, title: 'Arabic-Speaking Virtual Assistant', company: 'Apex Freelancers', salary: '$3-8/hr', location: 'Remote (Global)', type: 'Contract', posted: '3 days ago', category: 'Customer Service', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 27, title: 'Email Marketing Assistant', company: 'Apex Freelancers', salary: '$10-20/project', location: 'Remote (Global)', type: 'Freelance', posted: '4 days ago', category: 'Marketing', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 28, title: 'Academic Research Editor', company: 'Apex Freelancers', salary: '$5-15/project', location: 'Remote (Global)', type: 'Freelance', posted: '5 days ago', category: 'Writing', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 29, title: 'Banner & Flyer Designer', company: 'Apex Freelancers', salary: '$3-10/project', location: 'Remote (Global)', type: 'Freelance', posted: '1 week ago', category: 'Design', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 30, title: 'MS Word Document Specialist', company: 'Apex Freelancers', salary: '$2-8/hr', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '' },
  { id: 31, title: 'French Letter Writer', company: 'Apex Freelancers', salary: '$3-8/project', location: 'Remote (Global)', type: 'Freelance', posted: '3 days ago', category: 'Writing', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 32, title: 'Video Editor', company: 'Apex Freelancers', salary: '$30-80/project', location: 'Remote (Global)', type: 'Freelance', posted: '4 days ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 33, title: 'Landing Page Developer', company: 'Apex Freelancers', salary: '$30-60/project', location: 'Remote (Global)', type: 'Freelance', posted: '5 days ago', category: 'Software Development', experience: 'Mid Level', fee: 0, feeLabel: '' },
  { id: 34, title: 'Watch & Rate Short Ads', company: 'AdVibe', salary: '$1-3/day', location: 'Remote (Phone)', type: 'Freelance', posted: 'Today', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 35, title: 'Product Review Comments', company: 'ReviewBooth', salary: '$2-5/day', location: 'Remote (Phone)', type: 'Freelance', posted: 'Today', category: 'Marketing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 36, title: 'Photo Tagging & Categorizing', company: 'DataWorks', salary: '$3-8/day', location: 'Remote (Phone)', type: 'Freelance', posted: '1 day ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 37, title: 'Voice Recording for Apps', company: 'SpeechLab', salary: '$5-15/week', location: 'Remote (Phone)', type: 'Freelance', posted: '1 day ago', category: 'Writing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 38, title: 'Short Survey Taker', company: 'PollVault', salary: '$1-4/hr', location: 'Remote (Phone)', type: 'Freelance', posted: '2 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 39, title: 'Social Media Engager', company: 'SocialPulse', salary: '$3-7/day', location: 'Remote (Phone)', type: 'Freelance', posted: '2 days ago', category: 'Marketing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 40, title: 'App Tester (Basic Features)', company: 'Testify', salary: '$2-6/test', location: 'Remote (Phone)', type: 'Freelance', posted: '3 days ago', category: 'Software Development', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 41, title: 'SMS Verification Helper', company: 'VerifyFast', salary: '$1-3/task', location: 'Remote (Phone)', type: 'Freelance', posted: '3 days ago', category: 'Customer Service', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 42, title: 'Receipt Digitizer', company: 'ExpenseEase', salary: '$2-6/day', location: 'Remote (Phone)', type: 'Freelance', posted: '4 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 43, title: 'Caption Writer for Reels', company: 'ClipCaption', salary: '$3-8/day', location: 'Remote (Phone)', type: 'Freelance', posted: '4 days ago', category: 'Writing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 44, title: 'Map Pin Verifier', company: 'MapRight', salary: '$2-5/day', location: 'Remote (Phone)', type: 'Freelance', posted: '5 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 45, title: 'Music Mood Tagger', company: 'TuneTag', salary: '$1-4/day', location: 'Remote (Phone)', type: 'Freelance', posted: '5 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 46, title: 'Mystery Shopper Feedback', company: 'ShopCheck', salary: '$3-10/report', location: 'Remote (Phone)', type: 'Freelance', posted: '1 week ago', category: 'Customer Service', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' },
  { id: 47, title: 'Emoji-Based Sentiment Rater', company: 'MoodMetrix', salary: '$1-3/day', location: 'Remote (Phone)', type: 'Freelance', posted: '1 week ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium' }
];

router.get('/', (req, res) => {
  const empJobs = getAll("SELECT *, id as uid FROM employer_jobs WHERE status = 'approved'");
  let nextId = 100;
  const mapped = empJobs.map(j => ({
    id: nextId++, title: j.title, company: j.company, salary: j.salary || 'N/A',
    location: j.location || 'Remote', type: j.type || 'Full-Time', posted: 'Recently',
    category: j.category || 'Other', experience: j.experience || 'Any Level',
    fee: j.fee || 0, description: j.description || '', isEmployerJob: true,
    responsibilities: j.responsibilities || '', qualifications: j.qualifications || '',
    benefits: j.benefits || '', requirementsList: j.requirements_list || ''
  }));
  res.json(DEFAULT_JOBS.concat(mapped));
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let job = DEFAULT_JOBS.find(j => j.id === id);
  if (!job) {
    const empJobs = getAll("SELECT *, id as uid FROM employer_jobs WHERE status = 'approved'");
    let nextId = 100;
    empJobs.forEach(j => {
      const mid = nextId++;
      if (mid === id) {
        job = { id: mid, title: j.title, company: j.company, salary: j.salary || 'N/A', location: j.location || 'Remote', type: j.type || 'Full-Time', posted: 'Recently', category: j.category || 'Other', experience: j.experience || 'Any Level', fee: j.fee || 0, description: j.description || '', isEmployerJob: true, responsibilities: j.responsibilities || '', qualifications: j.qualifications || '', benefits: j.benefits || '', requirementsList: j.requirements_list || '' };
      }
    });
  }
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

router.get('/companies/directory', (req, res) => {
  const companies = {};
  DEFAULT_JOBS.forEach(j => {
    if (!companies[j.company]) companies[j.company] = { name: j.company, count: 0, categories: {}, salary: j.salary };
    companies[j.company].count++;
    companies[j.company].categories[j.category] = true;
  });
  res.json(Object.keys(companies).sort().map(c => ({ name: c, count: companies[c].count, categories: Object.keys(companies[c].categories), salary: companies[c].salary })));
});

module.exports = router;
