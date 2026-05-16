document.addEventListener('DOMContentLoaded', function () {

  // ── Helpers ──
  function el(id) { return document.getElementById(id); }
  function qs(s) { return document.querySelector(s); }
  function qsa(s) { return document.querySelectorAll(s); }
  function ls(k, v) { if (v !== undefined) localStorage.setItem(k, v); return localStorage.getItem(k); }
  function lj(k, v) { if (v !== undefined) localStorage.setItem(k, JSON.stringify(v)); return JSON.parse(localStorage.getItem(k)); }

  // ── Dormant test account ──
  var TEST_EMAIL = 'maingi6002@gmail.com';
  var TEST_PASS = 'samuel1234*no';
  if (!ls('tl_user_' + TEST_EMAIL)) {
    ls('tl_user_' + TEST_EMAIL, JSON.stringify({
      name: 'Test User', email: TEST_EMAIL, phone: '+254700000001', country: 'Kenya', continent: 'Africa',
      password: TEST_PASS, joined: new Date().toISOString(), isTestUser: true
    }));
    ls('tl_access_' + TEST_EMAIL, 'true');
  }

  // ── Admin dormant login ──
  var ADMIN_EMAIL = 'admin@tasklink.com';
  var ADMIN_PASS = 'Admin@123';
  if (!ls('tl_user_' + ADMIN_EMAIL)) {
    ls('tl_user_' + ADMIN_EMAIL, JSON.stringify({
      name: 'Administrator', email: ADMIN_EMAIL, phone: '+254700000000', country: 'Kenya', continent: 'Africa',
      password: ADMIN_PASS, joined: new Date().toISOString(), isAdmin: true
    }));
  }

  // ── Navigation ──
  var mt = el('mobileToggle');
  var mn = el('mainNav');
  if (mt && mn) mt.addEventListener('click', function () { mn.classList.toggle('open'); });
  var cp = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.header-nav a').forEach(function (l) { if (l.getAttribute('href') === cp) l.classList.add('active'); });
  qsa('.current-year').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // ── Currency ──
  var cs = el('currencySelect');
  if (cs) {
    var rates = { USD: { s: '$', r: 1 }, KES: { s: 'KSh ', r: 130 }, NGN: { s: '\u20A6', r: 1550 }, EUR: { s: '\u20AC', r: 0.92 }, GBP: { s: '\u00A3', r: 0.79 }, INR: { s: '\u20B9', r: 83 } };
    function uc(c) { var i = rates[c] || rates.USD; qsa('[data-usd]').forEach(function (e) { var u = parseFloat(e.getAttribute('data-usd')); if (!isNaN(u)) e.textContent = i.s + (u * i.r).toFixed(c === 'KES' || c === 'NGN' || c === 'INR' ? 0 : 2); }); }
    cs.addEventListener('change', function () { uc(this.value); });
    uc(cs.value);
  }

  // ── Auth forms (standalone pages) ──

  // Register
  var rf = el('registerForm');
  if (rf) {
    rf.addEventListener('submit', function (e) {
      e.preventDefault();
      var nm = el('regName'), em = el('regEmail'), ph = el('regPhone'), co = el('regCountry'), ct2 = el('regContinent'), pw = el('regPass');
      var er = el('regError'), sc = el('regSuccess');
      er.style.display = 'none'; sc.style.display = 'none';
      if (!nm.value || !em.value || !ph.value || !co.value || !ct2.value || !pw.value) {
        er.textContent = 'All fields are required.'; er.style.display = 'block'; return;
      }
      var emVal = em.value.toLowerCase().trim();
      if (ls('tl_user_' + emVal)) {
        er.textContent = 'Email already registered.'; er.style.display = 'block'; return;
      }
      ls('tl_user_' + emVal, JSON.stringify({
        name: nm.value, email: emVal, phone: ph.value, country: co.value, continent: ct2.value, password: pw.value, joined: new Date().toISOString()
      }));
      sc.textContent = 'Account created successfully! Redirecting to sign in...'; sc.style.display = 'block';
      setTimeout(function () { window.location.href = 'login.html'; }, 1200);
    });
  }

  // Login
  var lf = el('loginForm');
  if (lf) {
    lf.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = el('loginEmail'), pw = el('loginPass');
      var er = el('loginError');
      er.style.display = 'none';
      var emVal = em.value.toLowerCase().trim();

      // Admin login
      if (emVal === ADMIN_EMAIL && pw.value === ADMIN_PASS) {
        ls('tl_logged_in', 'true'); ls('tl_user_email', ADMIN_EMAIL); ls('tl_user_name', 'Administrator');
        window.location.href = 'admin.html'; return;
      }
      // Test account login
      if (emVal === TEST_EMAIL && pw.value === TEST_PASS) {
        ls('tl_logged_in', 'true'); ls('tl_user_email', TEST_EMAIL); ls('tl_user_name', 'Test User');
        ls('tl_access_' + TEST_EMAIL, 'true');
        var pend = sessionStorage.getItem('tl_pending_plan');
        if (pend) { sessionStorage.removeItem('tl_pending_plan'); window.location.href = 'payment.html?plan=' + pend; }
        else { window.location.href = 'dashboard.html'; }
        return;
      }
      // Normal login
      var data = JSON.parse(ls('tl_user_' + emVal) || 'null');
      if (!data || data.password !== pw.value) {
        er.textContent = 'Invalid email or password.'; er.style.display = 'block'; return;
      }
      ls('tl_logged_in', 'true'); ls('tl_user_email', emVal); ls('tl_user_name', data.name);
      var pend = sessionStorage.getItem('tl_pending_plan');
      if (pend) { sessionStorage.removeItem('tl_pending_plan'); window.location.href = 'payment.html?plan=' + pend; }
      else if (!ls('tl_survey_' + emVal)) { window.location.href = 'survey.html'; }
      else if (ls('tl_access_' + emVal)) { window.location.href = 'dashboard.html'; }
      else { window.location.href = 'pricing.html'; }
    });
  }

  // ── Forgot Password ──
  var ff = el('forgotForm');
  if (ff) {
    ff.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = el('forgotEmail');
      var er = el('forgotError');
      var sc = el('forgotSuccess');
      er.style.display = 'none'; sc.style.display = 'none';
      var emVal = em.value.toLowerCase().trim();
      if (emVal === ADMIN_EMAIL) {
        sc.textContent = 'Admin password: ' + ADMIN_PASS; sc.style.display = 'block'; return;
      }
      if (emVal === TEST_EMAIL) {
        sc.textContent = 'Test account password: ' + TEST_PASS; sc.style.display = 'block'; return;
      }
      var data = JSON.parse(ls('tl_user_' + emVal) || 'null');
      if (!data) {
        er.textContent = 'No account found with that email.'; er.style.display = 'block'; return;
      }
      sc.textContent = 'Your password: ' + data.password; sc.style.display = 'block';
    });
  }

  // ── Survey form ──
  var sf = el('surveyForm');
  if (sf) {
    if (!ls('tl_logged_in') || !ls('tl_user_email')) { window.location.href = 'login.html'; return; }
    sf.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = ls('tl_user_email');
      if (!email) { window.location.href = 'login.html'; return; }
      var skills = el('surveySkills'), experience = el('surveyExperience');
      var jobType = el('surveyJobType'), availability = el('surveyAvailability'), goals = el('surveyGoals');
      var er = el('surveyError'), sc = el('surveySuccess');
      er.style.display = 'none'; sc.style.display = 'none';
      if (!skills.value || !experience.value) { er.textContent = 'Skills and experience are required.'; er.style.display = 'block'; return; }
      ls('tl_survey_' + email, JSON.stringify({
        skills: skills.value, experience: experience.value, jobType: jobType.value,
        availability: availability.value, goals: goals ? goals.value : '', completed: new Date().toISOString()
      }));
      sc.textContent = 'Thanks! Redirecting you to choose a plan...'; sc.style.display = 'block';
      el('surveySubmitBtn').disabled = true;
      el('surveySubmitBtn').textContent = 'Please wait...';
      setTimeout(function () { window.location.href = 'pricing.html'; }, 800);
    });
  }

  // ── Profile form ──
  var pf = el('profileForm');
  if (pf) {
    var profEmail = ls('tl_user_email');
    if (!profEmail) { window.location.href = 'login.html'; return; }
    var profileData = lj('tl_profile_' + profEmail) || {};
    if (el('profEmail')) el('profEmail').value = profEmail;
    var profFields = ['profName', 'profPhone', 'profBio', 'profSkills', 'profExperience', 'profEducation', 'profResume'];
    profFields.forEach(function (fid) {
      var f = el(fid);
      if (f && profileData[fid.replace('prof', '').toLowerCase()]) f.value = profileData[fid.replace('prof', '').toLowerCase()];
    });
    // Also try to auto-fill name
    if (el('profName') && !el('profName').value) el('profName').value = ls('tl_user_name') || '';
    pf.addEventListener('submit', function (e) {
      e.preventDefault();
      var er = el('profileError'), sc = el('profileSuccess');
      er.style.display = 'none'; sc.style.display = 'none';
      var data = {
        name: el('profName').value, phone: el('profPhone').value, bio: el('profBio').value,
        skills: el('profSkills').value, experience: el('profExperience').value,
        education: el('profEducation').value, resume: el('profResume').value,
        updated: new Date().toISOString()
      };
      lj('tl_profile_' + profEmail, data);
      sc.textContent = 'Profile saved successfully!'; sc.style.display = 'block';
    });
  }

  // ── Pricing subscribe handler ──
  qsa('[data-subscribe]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var plan = this.getAttribute('data-subscribe');
      var email = ls('tl_user_email');
      if (!email || ls('tl_logged_in') !== 'true') {
        sessionStorage.setItem('tl_pending_plan', plan);
        window.location.href = 'login.html';
      } else {
        window.location.href = 'payment.html?plan=' + plan;
      }
    });
  });

  // ── Job data ──
  var JOBS = [
    { id: 1, title: 'Senior Software Engineer, Remote', company: 'Stripe', salary: '$150K-200K', location: 'Remote (US)', type: 'Full-Time', posted: '2 days ago', category: 'Software Development', experience: 'Senior Level', fee: 5.00, feeLabel: 'Pro', description: 'Stripe is looking for a Senior Software Engineer to join our Remote Infrastructure team. You will help build and maintain the systems that power Stripe\'s global payments platform.', benefits: ['Competitive salary and equity package', 'Comprehensive health, dental, and vision insurance', 'Flexible PTO policy', 'Remote work stipend', 'Annual learning & development budget', 'Home office setup allowance'], qualifications: ['5+ years of professional software engineering experience', 'Strong proficiency in at least one of: Go, Ruby, Java, or Python', 'Experience building and operating distributed systems at scale', 'Excellent communication and collaboration skills', 'Experience with cloud infrastructure (AWS, GCP, or Azure)'], whatYoullDo: ['Design, build, and maintain scalable distributed systems', 'Collaborate with cross-functional teams to define and implement new features', 'Mentor junior engineers and contribute to engineering culture', 'Participate in on-call rotations to ensure platform reliability', 'Conduct code reviews and advocate for best practices'] },
    { id: 2, title: 'Customer Success Manager', company: 'Airbnb', salary: '$85K-110K', location: 'Remote (Global)', type: 'Full-Time', posted: '3 days ago', category: 'Customer Service', experience: 'Mid Level', fee: 5.00, feeLabel: 'Pro', description: 'Airbnb is seeking a Customer Success Manager to ensure hosts and guests have exceptional experiences on the platform.' },
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
    { id: 19, title: 'Data Entry Specialist', company: 'Apex Freelancers', salary: '$40-60/project', location: 'Remote (Global)', type: 'Freelance', posted: '1 day ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'We need a detail-oriented data entry specialist to input and organize business data into spreadsheets. Tasks include typing hand-written documents into digital format, updating customer records, and verifying data accuracy.' },
    { id: 20, title: 'Typesetting & Formatting Expert', company: 'Apex Freelancers', salary: '$5-15/project', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Writing', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Looking for someone to typeset and format documents in MS Word. Projects include formatting reports, proposals, theses, and books with proper headings, tables of contents, and page numbering.' },
    { id: 21, title: 'T-Shirt Design Assistant', company: 'Apex Freelancers', salary: '$50-100/project', location: 'Remote (Global)', type: 'Freelance', posted: '3 days ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Seeking a creative t-shirt designer to create custom apparel designs. Must have experience with print-ready artwork and understanding of different printing techniques.' },
    { id: 22, title: 'Yellow Pages Lead Researcher', company: 'Apex Freelancers', salary: '$5-10/project', location: 'Remote (Global)', type: 'Freelance', posted: '4 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Research and collect business leads from online directories. Compile contact information including phone numbers, emails, and addresses into organized spreadsheets.' },
    { id: 23, title: 'Promo Graphics Designer', company: 'Apex Freelancers', salary: '$15-30/project', location: 'Remote (Global)', type: 'Freelance', posted: '5 days ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Create eye-catching promotional graphics for social media and marketing campaigns. Must be proficient in Canva or Adobe Photoshop and understand branding guidelines.' },
    { id: 24, title: 'Logo Designer', company: 'Apex Freelancers', salary: '$10-25/logo', location: 'Remote (Global)', type: 'Freelance', posted: '1 week ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Design simple but professional logos for small businesses. Need clean, scalable vector files with brand color palette suggestions. Portfolio required.' },
    { id: 25, title: 'Translation & Transcription', company: 'Apex Freelancers', salary: '$2-5/project', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Writing', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Translate short documents and transcribe audio files from various languages into English. Ideal for bilingual freelancers looking for quick tasks.' },
    { id: 26, title: 'Arabic-Speaking Virtual Assistant', company: 'Apex Freelancers', salary: '$3-8/hr', location: 'Remote (Global)', type: 'Contract', posted: '3 days ago', category: 'Customer Service', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Hiring Arabic-speaking freelancers for translation, customer support, and data entry tasks. Must be fluent in both Arabic and English.' },
    { id: 27, title: 'Email Marketing Assistant', company: 'Apex Freelancers', salary: '$10-20/project', location: 'Remote (Global)', type: 'Freelance', posted: '4 days ago', category: 'Marketing', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Send personalized emails one at a time to a provided list of contacts. Must have excellent communication skills and attention to detail.' },
    { id: 28, title: 'Academic Research Editor', company: 'Apex Freelancers', salary: '$5-15/project', location: 'Remote (Global)', type: 'Freelance', posted: '5 days ago', category: 'Writing', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Edit and proofread academic research papers, ensuring proper citation format, grammar, and logical flow. Experience with APA/MLA/Chicago styles required.' },
    { id: 29, title: 'Banner & Flyer Designer', company: 'Apex Freelancers', salary: '$3-10/project', location: 'Remote (Global)', type: 'Freelance', posted: '1 week ago', category: 'Design', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Design event banners, promotional flyers, and social media graphics. Quick turnaround projects with clear briefs provided.' },
    { id: 30, title: 'MS Word Document Specialist', company: 'Apex Freelancers', salary: '$2-8/hr', location: 'Remote (Global)', type: 'Freelance', posted: '2 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 0, feeLabel: '', description: 'Type and format documents in Microsoft Word including letters, reports, and forms. Must know styles, tables, mail merge, and basic formatting.' },
    { id: 31, title: 'French Letter Writer', company: 'Apex Freelancers', salary: '$3-8/project', location: 'Remote (Global)', type: 'Freelance', posted: '3 days ago', category: 'Writing', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Write professional letters and documents in French. Must be fluent in French with excellent grammar and business writing skills.' },
    { id: 32, title: 'Video Editor', company: 'Apex Freelancers', salary: '$30-80/project', location: 'Remote (Global)', type: 'Freelance', posted: '4 days ago', category: 'Design', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Edit short video clips including trimming, adding transitions, captions, background music, and basic color grading. Experience with CapCut or Premiere Pro required.' },
    { id: 33, title: 'Landing Page Developer', company: 'Apex Freelancers', salary: '$30-60/project', location: 'Remote (Global)', type: 'Freelance', posted: '5 days ago', category: 'Software Development', experience: 'Mid Level', fee: 0, feeLabel: '', description: 'Create simple one-page websites and landing pages using WordPress or basic HTML/CSS. Must deliver responsive, mobile-friendly designs.' },
    { id: 34, title: 'Watch & Rate Short Ads', company: 'AdVibe', salary: '$1-3/day', location: 'Remote (Phone)', type: 'Freelance', posted: 'Today', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Watch 30-60 second advertisements and rate them based on clarity, engagement, and appeal. Perfect for doing while commuting — just tap and rate. No typing needed.' },
    { id: 35, title: 'Product Review Comments', company: 'ReviewBooth', salary: '$2-5/day', location: 'Remote (Phone)', type: 'Freelance', posted: 'Today', category: 'Marketing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Read short product descriptions and leave 1-2 sentence reviews. All done from your phone. Great for nights in or lunch breaks. No experience needed.' },
    { id: 36, title: 'Photo Tagging & Categorizing', company: 'DataWorks', salary: '$3-8/day', location: 'Remote (Phone)', type: 'Freelance', posted: '1 day ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Tap through images and tag objects, people, or scenes. Helps train AI models. Simple swiping and tapping — works great on any smartphone.' },
    { id: 37, title: 'Voice Recording for Apps', company: 'SpeechLab', salary: '$5-15/week', location: 'Remote (Phone)', type: 'Freelance', posted: '1 day ago', category: 'Writing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Read short sentences aloud into your phone\'s microphone. Help improve voice assistants. Do it while walking, cooking, or relaxing. Just tap record and speak.' },
    { id: 38, title: 'Short Survey Taker', company: 'PollVault', salary: '$1-4/hr', location: 'Remote (Phone)', type: 'Freelance', posted: '2 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Answer quick surveys on your phone about products, services, and daily habits. Most surveys take 2-5 minutes. Payout is instant. No computer needed.' },
    { id: 39, title: 'Social Media Engager', company: 'SocialPulse', salary: '$3-7/day', location: 'Remote (Phone)', type: 'Freelance', posted: '2 days ago', category: 'Marketing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Like, share, and comment on brand social media posts. Follow simple guidelines and earn. All done from your phone\'s browser or apps. Great side hustle.' },
    { id: 40, title: 'App Tester (Basic Features)', company: 'Testify', salary: '$2-6/test', location: 'Remote (Phone)', type: 'Freelance', posted: '3 days ago', category: 'Software Development', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Download new apps, tap through their basic features, and report if anything breaks. No coding skills needed. Just use the app like a normal user on your phone.' },
    { id: 41, title: 'SMS Verification Helper', company: 'VerifyFast', salary: '$1-3/task', location: 'Remote (Phone)', type: 'Freelance', posted: '3 days ago', category: 'Customer Service', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Receive SMS verification codes for account registrations and forward them securely. Straightforward phone-based tasks. Takes seconds per task.' },
    { id: 42, title: 'Receipt Digitizer', company: 'ExpenseEase', salary: '$2-6/day', location: 'Remote (Phone)', type: 'Freelance', posted: '4 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Snap photos of receipts using your phone camera and enter the amounts into a simple form. No computer required. Perfect for downtime.' },
    { id: 43, title: 'Caption Writer for Reels', company: 'ClipCaption', salary: '$3-8/day', location: 'Remote (Phone)', type: 'Freelance', posted: '4 days ago', category: 'Writing', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Watch short video clips and write 1-2 line captions. All done from your phone. Great for creative people who love scrolling through videos anyway.' },
    { id: 44, title: 'Map Pin Verifier', company: 'MapRight', salary: '$2-5/day', location: 'Remote (Phone)', type: 'Freelance', posted: '5 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Check if business locations on the map are correct by viewing street-level imagery. Tap to confirm or correct. Works entirely on your phone.' },
    { id: 45, title: 'Music Mood Tagger', company: 'TuneTag', salary: '$1-4/day', location: 'Remote (Phone)', type: 'Freelance', posted: '5 days ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Listen to 15-30 second music clips and tag the mood (happy, sad, energetic, calm). Do it while relaxing with earphones. Simple tap-to-tag interface.' },
    { id: 46, title: 'Mystery Shopper Feedback', company: 'ShopCheck', salary: '$3-10/report', location: 'Remote (Phone)', type: 'Freelance', posted: '1 week ago', category: 'Customer Service', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Visit a local shop (or browse an online store) and answer a few questions about your experience. Submit via a short form on your phone. No writing required.' },
    { id: 47, title: 'Emoji-Based Sentiment Rater', company: 'MoodMetrix', salary: '$1-3/day', location: 'Remote (Phone)', type: 'Freelance', posted: '1 week ago', category: 'Data & Analytics', experience: 'Entry Level', fee: 2.00, feeLabel: 'Premium', description: 'Rate customer service chats, product descriptions, or social posts using only emojis. No typing. No reading long texts. Just tap an emoji and move on.' }
  ];
  window.JOBS = JOBS;

  // ── Render jobs listing ──
  var jobsContainer = el('jobsContainer');
  if (jobsContainer) {
    var jh = '';
    var loggedIn = ls('tl_logged_in') === 'true';
    JOBS.forEach(function (j) {
      var link = loggedIn ? 'job.html?id=' + j.id : 'register.html';
      jh += '<a href="' + link + '" class="job-card">'
        + '<div class="job-card-header">'
        + '<div><h3>' + j.title + '</h3><p class="job-card-company">' + j.company + ' <span style="display:inline-block;font-size:1rem;color:#2E9E8F;font-weight:600;">&#10003; Verified</span></p></div>'
        + '<span class="job-card-salary">' + j.salary + '</span>'
        + '</div>'
        + '<div class="job-card-meta">'
        + '<span>&#128205; ' + j.location + '</span>'
        + '<span>&#128197; ' + j.type + '</span>'
        + '<span>&#128197; Posted ' + j.posted + '</span>'
        + '<span class="job-card-tag">' + j.category + '</span>';
      if (j.fee > 0) {
        jh += '<span class="job-card-tag" style="background:#E85D3A;color:#fff;">$' + j.fee.toFixed(2) + ' fee</span>';
      }
      jh += '</div></a>';
    });
    jobsContainer.innerHTML = jh;
  }

  // ── Render job detail ──
  var jobDetailContainer = el('jobDetailContainer');
  if (jobDetailContainer) {
    if (ls('tl_logged_in') !== 'true') { jobDetailContainer.innerHTML = '<div style="text-align:center;padding:4rem 0;"><h2>Sign in to view this job</h2><p style="color:#6B687A;"><a href="register.html" style="color:#E85D3A;font-weight:600;">Create an account</a> or <a href="login.html" style="color:#E85D3A;font-weight:600;">sign in</a> to see full job details.</p></div>'; }
    else {
    var p = new URLSearchParams(window.location.search);
    var jobId = parseInt(p.get('id'));
    var job = null;
    JOBS.forEach(function (j) { if (j.id === jobId) job = j; });
    if (!job) {
      jobDetailContainer.innerHTML = '<div style="text-align:center;padding:4rem 0;"><h2>Job Not Found</h2><p style="color:#6B687A;">This job listing does not exist. <a href="jobs.html">Browse all jobs &rarr;</a></p></div>';
    } else {
      var feeNote = '';
      if (job.fee > 0) {
        var planLabel = (job.feeLabel || 'pro').toLowerCase();
        feeNote = '<div class="bonus-note" style="margin-bottom:2rem;"><span class="icon">&#128274;</span><div><strong>Access Required:</strong> This job requires a <strong>$' + job.fee.toFixed(2) + '</strong> ' + job.feeLabel + ' fee. <a href="payment.html?plan=' + planLabel + '" style="color:#E85D3A;font-weight:600;">Pay to unlock &rarr;</a></div></div>';
      }
      var sidebarFee = '';
      if (job.fee > 0) {
        var planLabel = (job.feeLabel || 'pro').toLowerCase();
        sidebarFee = '<div class="job-sidebar-section" style="background:rgba(46,158,143,0.06);padding:1.2rem;border-radius:0.4rem;border:1px solid rgba(46,158,143,0.15);"><h4 style="font-size:1.3rem;margin-bottom:0.4rem;">' + job.feeLabel + ' Required</h4><p style="font-size:2rem;font-weight:700;color:#E85D3A;">$' + job.fee.toFixed(2) + '</p><p style="font-size:1.2rem;color:#6B687A;margin:0;"><a href="payment.html?plan=' + planLabel + '" style="color:#E85D3A;font-weight:600;">Pay to unlock &rarr;</a></p></div>';
      }
      var whatYoullDoHtml = '';
      if (job.whatYoullDo) {
        whatYoullDoHtml = '<h2>What You\'ll Do</h2><ul>';
        job.whatYoullDo.forEach(function (item) { whatYoullDoHtml += '<li>' + item + '</li>'; });
        whatYoullDoHtml += '</ul>';
      }
      var qualHtml = '';
      if (job.qualifications) {
        qualHtml = '<h2>Qualifications</h2><ul>';
        job.qualifications.forEach(function (item) { qualHtml += '<li>' + item + '</li>'; });
        qualHtml += '</ul>';
      }
      var benHtml = '';
      if (job.benefits) {
        benHtml = '<h2>Benefits</h2><ul>';
        job.benefits.forEach(function (item) { benHtml += '<li>' + item + '</li>'; });
        benHtml += '</ul>';
      }
      var respHtml = '';
      if (job.responsibilities) {
        respHtml = '<h2>Responsibilities</h2><p>' + job.responsibilities.replace(/\n/g, '<br>') + '</p>';
      }
      var qualHtml2 = '';
      if (job.qualifications && typeof job.qualifications === 'string') {
        qualHtml2 = '<h2>Qualifications</h2><p>' + job.qualifications.replace(/\n/g, '<br>') + '</p>';
      }
      var benHtml2 = '';
      if (job.benefits && typeof job.benefits === 'string') {
        benHtml2 = '<h2>Benefits & Perks</h2><p>' + job.benefits.replace(/\n/g, '<br>') + '</p>';
      }
      var reqListHtml = '';
      if (job.requirementsList) {
        var items = job.requirementsList.split('\n').filter(function (l) { return l.trim(); });
        if (items.length > 0) {
          reqListHtml = '<h2>Requirements</h2><ul>';
          items.forEach(function (item) { reqListHtml += '<li>' + item.trim() + '</li>'; });
          reqListHtml += '</ul>';
        }
      }
      jobDetailContainer.innerHTML = '<div class="breadcrumb"><a href="index.html">Home</a> / <a href="jobs.html">Remote Jobs</a> / ' + job.title + '</div>'
        + '<div class="job-detail-layout">'
        + '<div class="job-detail-main">'
        + feeNote
        + '<span class="company">' + job.company + '</span>'
        + '<div class="job-detail-meta">'
        + '<div class="job-detail-meta-item"><strong>Location</strong>' + job.location + '</div>'
        + '<div class="job-detail-meta-item"><strong>Job Type</strong>' + job.type + '</div>'
        + '<div class="job-detail-meta-item"><strong>Experience</strong>' + job.experience + '</div>'
        + '<div class="job-detail-meta-item"><strong>Salary</strong>' + job.salary + '</div>'
        + '<div class="job-detail-meta-item"><strong>Posted</strong>' + job.posted + '</div>'
        + '<div class="job-detail-meta-item"><strong>Category</strong>' + job.category + '</div>'
        + '</div>'
        + '<div class="job-detail-body">'
        + '<h2>About the Role</h2><p>' + job.description + '</p>'
        + whatYoullDoHtml
        + qualHtml
        + benHtml
        + respHtml + qualHtml2 + benHtml2 + reqListHtml
        + '</div></div>'
        + '<aside class="job-detail-sidebar">'
        + '<div class="apply-box">'
        + (job.isEmployerJob
          ? '<button class="apply-btn" onclick="openJobApply(\'' + job.id + '\', \'' + job.title.replace(/'/g, "\\'") + '\')">Apply Now</button>'
          : job.fee > 0
            ? '<a href="payment.html?plan=' + job.feeLabel.toLowerCase() + '" class="apply-btn">Unlock Full Details - $' + job.fee.toFixed(2) + '</a>'
            : '<span style="display:block;padding:1rem 0;color:#2E9E8F;font-weight:600;">&#10003; Free to View</span>')
        + '<a href="#" class="save-btn" id="favBtn_' + job.id + '" onclick="toggleFavorite(\'' + job.id + '\');return false;" style="color:#6B687A;">' + ((lj('tl_fav_' + ls('tl_user_email')) || []).indexOf(String(job.id)) > -1 ? '&#9733; Saved' : '&#9734; Save to Favorites') + '</a>'
        + '</div>'
        + sidebarFee
        + '<div class="job-sidebar-section"><h4>Job Overview</h4><ul>'
        + '<li><strong>Job ID:</strong> TL-2026-' + String(job.id).padStart(4, '0') + '</li>'
        + '<li><strong>Category:</strong> ' + job.category + '</li>'
        + '<li><strong>Experience:</strong> ' + job.experience + '</li>'
        + '<li><strong>Type:</strong> ' + job.type + '</li>'
        + '<li><strong>Location:</strong> ' + job.location + '</li>'
        + '</ul></div>'
        + '<div class="job-sidebar-section"><h4>Share This Job</h4>'
        + '<div style="display:flex;gap:0.8rem;">'
        + '<a href="#" onclick="copyJobLink();return false;" style="padding:0.4rem 0.8rem;border:1px solid #D4D2D8;border-radius:0.4rem;font-size:1.3rem;">Copy Link</a>'
        + '<a href="mailto:?subject=Job:%20' + encodeURIComponent(job.title) + '&body=Check%20out%20this%20job:%20' + encodeURIComponent(window.location.href) + '" style="padding:0.4rem 0.8rem;border:1px solid #D4D2D8;border-radius:0.4rem;font-size:1.3rem;">Email</a>'
        + '</div></div>'
        + '<div class="job-sidebar-section"><a href="#" class="report-link">Report this listing</a></div>'
        + '</aside></div>';
      document.title = job.title + ' - TaskLink';
    }
  }
  }
  // ── Render company directory ──
  var companiesContainer = el('companiesContainer');
  if (companiesContainer) {
    var companyMap = {};
    JOBS.forEach(function (j) {
      if (!companyMap[j.company]) {
        companyMap[j.company] = { name: j.company, count: 0, categories: {}, maxSalary: j.salary };
      }
      companyMap[j.company].count++;
      companyMap[j.company].categories[j.category] = true;
    });
    var ch = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(28rem,1fr));gap:2rem;">';
    Object.keys(companyMap).sort().forEach(function (cname) {
      var c = companyMap[cname];
      var cats = Object.keys(c.categories).join(', ');
      ch += '<div style="border:1px solid #E8E6E0;border-radius:0.8rem;padding:2rem;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.04);">'
        + '<h3 style="font-size:1.7rem;color:#1A1A4E;margin-bottom:0.4rem;">' + cname + '</h3>'
        + '<p style="font-size:1.3rem;color:#6B687A;margin-bottom:0.8rem;">' + cats + '</p>'
        + '<div style="display:flex;gap:1.2rem;font-size:1.3rem;"><span><strong>' + c.count + '</strong> job' + (c.count > 1 ? 's' : '') + ' active</span><span>Salary: ' + c.maxSalary + '</span></div>'
        + '<a href="jobs.html?company=' + encodeURIComponent(cname) + '" style="display:inline-block;margin-top:1rem;font-size:1.3rem;color:#E85D3A;font-weight:600;">View Jobs &rarr;</a>'
        + '</div>';
    });
    ch += '</div>';
    companiesContainer.innerHTML = ch;
  }

  // ── Filter jobs ──
  var filterForm = el('filterForm');
  if (filterForm) {
    function applyFilters() {
      var cat = el('filterCategory').value;
      var type = el('filterType').value;
      var exp = el('filterExperience').value;
      var checks = qsa('.filter-checkboxes input:checked');
      var remoteLevels = [];
      checks.forEach(function (c) { remoteLevels.push(c.value); });
      var loggedIn = ls('tl_logged_in') === 'true';
      var jh = '';
      var filtered = JOBS.filter(function (j) {
        if (cat && j.category !== cat) return false;
        if (type && j.type !== type) return false;
        if (exp && j.experience !== exp) return false;
        return true;
      });
      if (filtered.length === 0) {
        el('jobsContainer').innerHTML = '<div style="text-align:center;padding:4rem 0;color:#6B687A;"><p>No jobs match your filters.</p></div>';
        return;
      }
      filtered.forEach(function (j) {
        var link = loggedIn ? 'job.html?id=' + j.id : 'register.html';
        jh += '<a href="' + link + '" class="job-card">'
          + '<div class="job-card-header">'
          + '<div><h3>' + j.title + '</h3><p class="job-card-company">' + j.company + ' <span style="display:inline-block;font-size:1rem;color:#2E9E8F;font-weight:600;">&#10003; Verified</span></p></div>'
          + '<span class="job-card-salary">' + j.salary + '</span>'
          + '</div>'
          + '<div class="job-card-meta">'
          + '<span>&#128205; ' + j.location + '</span>'
          + '<span>&#128197; ' + j.type + '</span>'
          + '<span>&#128197; Posted ' + j.posted + '</span>'
          + '<span class="job-card-tag">' + j.category + '</span>';
        if (j.fee > 0) {
          jh += '<span class="job-card-tag" style="background:#E85D3A;color:#fff;">$' + j.fee.toFixed(2) + ' fee</span>';
        }
        jh += '</div></a>';
      });
      el('jobsContainer').innerHTML = jh;
    }
    filterForm.addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });
    // Also filter on select change
    qsa('#filterCategory, #filterType, #filterExperience').forEach(function (s) {
      s.addEventListener('change', applyFilters);
    });
  }

  var payCur = el('paymentCurrency');
  window.syncPayAmount = function () {
    var rates = { USD: 1, KES: 130, NGN: 1550, EUR: 0.92, GBP: 0.79, INR: 83 };
    var cur = payCur ? payCur.value : 'USD';
    var rate = rates[cur] || 1;
    var p = new URLSearchParams(window.location.search);
    var plan = p.get('plan') || 'beginner';
    var amts = { beginner: 1, premium: 2, pro: 5 };
    var usdAmt = amts[plan] || 1;
    var converted = usdAmt * rate;
    var formatted = cur === 'KES' || cur === 'NGN' || cur === 'INR' ? converted.toFixed(0) : converted.toFixed(2);
    qsa('#payAmount').forEach(function (el) { el.textContent = formatted + ' ' + cur; });
  };
  if (payCur) payCur.addEventListener('change', syncPayAmount);
  (function () {
    var p2 = new URLSearchParams(window.location.search);
    var plan = p2.get('plan');
    var amts = { beginner: 1, premium: 2, pro: 5 };
    var labels = { beginner: 'Beginner', premium: 'Premium', pro: 'Pro' };
    var descs = { beginner: 'Micro-tasks: ads, reviews, surveys & more', premium: 'Full access to jobs under $10/hr', pro: 'Access to jobs paying $10+/hr' };
    if (plan && amts[plan]) {
      if (el('planTitle')) el('planTitle').textContent = labels[plan] + ' Plan';
      if (el('planBadge')) el('planBadge').textContent = labels[plan];
      if (el('planAmount')) el('planAmount').textContent = '$' + amts[plan];
      if (el('planDesc')) el('planDesc').textContent = descs[plan];
    }
  })();

  // ── Payment method selection → show details ──
  var selMethod = null;
  qsa('.payment-method-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      qsa('.payment-method-btn').forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      selMethod = this.getAttribute('data-method');
      var dc = el('paymentDetailsContent');
      if (selMethod === 'mpesa') {
        dc.innerHTML = '<div class="pd-box"><h4>M-Pesa Paybill</h4><p><strong>Paybill Number:</strong> 400200</p><p><strong>Account:</strong> 1158263</p><p><strong>Amount:</strong> <span id="payAmount">$2.00</span></p><p style="font-size:1.2rem;color:#6B687A;margin-top:1rem;">Go to M-Pesa &rarr; Lipa na M-Pesa &rarr; Paybill &rarr; Enter <strong>400200</strong> &rarr; Account <strong>1158263</strong> &rarr; Enter amount &rarr; Enter PIN &rarr; Send. Then click "I\'ve Completed the Payment" below.</p></div>';
      } else if (selMethod === 'paypal') {
        dc.innerHTML = '<div class="pd-box"><h4>PayPal</h4><p><strong>Send payment to:</strong> maingi6002@gmail.com</p><p><strong>Amount:</strong> <span id="payAmount">$2.00</span></p><p style="font-size:1.2rem;color:#6B687A;margin-top:1rem;">Log in to your PayPal account, send the exact amount to <strong>maingi6002@gmail.com</strong> as Goods &amp; Services. Then click "I\'ve Completed the Payment" below.</p></div>';
      }
      el('paymentDetails').style.display = 'block';
      var st = el('paymentStatus');
      if (st) st.style.display = 'none';
      syncPayAmount();
    });
  });

  // ── User submits payment → pending (admin confirms later) ──
  var cfBtn = el('confirmPayment');
  var stMsg = el('paymentStatus');
  if (cfBtn) {
    cfBtn.addEventListener('click', function () {
      if (!selMethod) { stMsg.className = 'status-msg error'; stMsg.textContent = 'Select a payment method first.'; stMsg.style.display = 'block'; return; }
      var email = ls('tl_user_email');
      if (!email) { stMsg.className = 'status-msg error'; stMsg.textContent = 'Please log in first.'; stMsg.style.display = 'block'; return; }
      var p3 = new URLSearchParams(window.location.search);
      var plan = p3.get('plan') || 'beginner';
      var amt = { beginner: 1, premium: 2, pro: 5 }[plan] || 1;
      var payments = lj('tl_payments') || [];
      payments.push({ id: 'pay_' + Date.now(), email: email, plan: plan, amount: amt, method: selMethod, status: 'pending', date: new Date().toISOString() });
      lj('tl_payments', payments);
      stMsg.className = 'status-msg success';
      stMsg.innerHTML = '&#10003; Payment recorded! Admin will confirm your payment and send a <strong>unique OTP</strong> to <strong>' + email + '</strong>. Check your email and then <a href="verify.html" style="color:#E85D3A;font-weight:600;">verify here &rarr;</a>';
      stMsg.style.display = 'block';
      cfBtn.disabled = true; cfBtn.textContent = 'Waiting for admin confirmation...';
    });
  }

  // ── Verify OTP ──
  var ved = el('verifyEmailDisplay');
  if (ved) { ved.textContent = ls('tl_user_email') || 'your email'; }
  var otpIns = qsa('.otp-input');
  otpIns.forEach(function (inp, idx) {
    inp.addEventListener('input', function () { if (this.value.length === 1 && idx < otpIns.length - 1) otpIns[idx + 1].focus(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !this.value && idx > 0) otpIns[idx - 1].focus(); });
  });
  var vb = el('verifyOtpBtn');
  var ve = el('verifyError');
  if (vb) {
    vb.addEventListener('click', function () {
      var code = ''; otpIns.forEach(function (i) { code += i.value; });
      var email = ls('tl_user_email');
      if (!email) { ve.textContent = 'Session expired. Log in again.'; ve.style.display = 'block'; return; }
      if (code === ls('tl_otp_' + email)) {
        ls('tl_access_' + email, 'true'); ls('tl_otp_' + email, '');
        var pymts = lj('tl_payments') || [];
        pymts.forEach(function (p) { if (p.email === email && p.status === 'otp_sent') p.status = 'verified'; });
        lj('tl_payments', pymts);
        // Store the user's plan from the latest payment
        var latestPlan = 'free';
        pymts.slice().reverse().forEach(function (p) { if (p.email === email && p.status === 'verified') { latestPlan = p.plan; } });
        ls('tl_plan_' + email, latestPlan);
        window.location.href = 'dashboard.html?verified=true';
      } else {
        ve.textContent = 'Invalid OTP. Try again or wait for admin to confirm your payment.'; ve.style.display = 'block';
      }
    });
  }

  // ════════════════════════ DASHBOARD ════════════════════════
  var btList = el('beginnerTasksList');
  var mySubs = el('mySubmissionsList');
  var ctList = el('complexTasksList');
  var earnDisp = el('earningsDisplay');
  var dashWelcome = el('dashWelcome');
  var walletBalance = el('walletBalance');

  if (!lj('tl_tasks')) {
    lj('tl_tasks', [
      { id: 't1', title: 'Data Entry & Categorization', type: 'beginner', pay: 0.50, active: true, shortDesc: 'Enter 50 records into spreadsheet with correct categories (Upwork-style data task).', fullDesc: 'Full task: Access our Google Sheet link (similar to Upwork data entry projects), review 50 unorganized records, and sort them into the correct predefined categories (Finance, HR, Tech, Marketing, Operations). Each correctly categorized record earns the payout.' },
      { id: 't2', title: 'Social Media Engagement', type: 'beginner', pay: 0.75, active: true, shortDesc: 'Engage on Twitter, LinkedIn & Instagram — like and comment on 10 posts.', fullDesc: 'Full task: Follow our client accounts on Twitter, LinkedIn, and Instagram. Like, leave meaningful comments (2+ words), and share 10 specified posts — like the micro-tasks on Fiverr and Freelancer. Take screenshots as proof.' },
      { id: 't3', title: 'Product Image Tagging', type: 'beginner', pay: 1.00, active: true, shortDesc: 'Tag 100 e-commerce product images with correct labels.', fullDesc: 'Full task: Review 100 e-commerce product images and tag each with the appropriate labels (color, size, category, material) using our tagging tool. Accuracy above 95% required. Similar to product listing gigs on Fiverr and Amazon Mechanical Turk.' },
      { id: 't4', title: 'Transcribe Audio Clips', type: 'beginner', pay: 1.50, active: true, shortDesc: 'Transcribe 5 short audio clips (2-3 min each) — like Rev & GoTranscript.', fullDesc: 'Full task: Listen to 5 audio recordings (2-3 minutes each) and provide accurate transcriptions. Must capture speaker labels, timestamps, and [inaudible] tags where needed. Similar to transcription work on Rev, GoTranscript, and Upwork.' },
      { id: 't5', title: 'Website QA Testing', type: 'beginner', pay: 1.75, active: true, shortDesc: 'Test a website and report 5 bugs — like uTest & UserTesting gigs.', fullDesc: 'Full task: Visit the test URL provided. Go through the registration, login, and purchase flow. Document at least 5 bugs with screenshots, steps to reproduce, and expected vs actual behavior. Standard QA methodology used on uTest, TesterWork, and UserTesting.' },
      { id: 't6', title: 'Survey & Market Research', type: 'beginner', pay: 2.00, active: true, shortDesc: 'Complete a 20-question market research survey — like SurveyJunkie & Swagbucks.', fullDesc: 'Full task: Complete a detailed 20-question survey about consumer preferences in your region. Provide thoughtful written answers for open-ended sections. Estimated time: 15-20 minutes. Standard format used on SurveyJunkie, Swagbucks, and Toluna.' },
      { id: 't7', title: 'Content Moderation', type: 'beginner', pay: 0.80, active: true, shortDesc: 'Review and flag 50 user submissions — moderation work like Appen & Lionbridge.', fullDesc: 'Full task: Review 50 user-generated content submissions against our community guidelines. Flag inappropriate content, spam, or policy violations. Assign severity levels. Same format as content moderation tasks on Appen, Lionbridge, and Telus International.' },
      { id: 't8', title: 'Email Verification', type: 'beginner', pay: 0.60, active: true, shortDesc: 'Verify 200 business emails — data quality work like Clickworker.', fullDesc: 'Full task: Use our verification tool to check 200 business email addresses. Mark valid, invalid, or catch-all. Export results in CSV format. Standard data quality task found on Clickworker, Amazon MTurk, and Upwork.' },
      { id: 'c1', title: 'WordPress Website Development', desc: 'Build a 5-page WordPress site for a local business. Common project on Upwork, Freelancer, and CodeCanyon.', type: 'complex', active: true, pay: 150.00,
        fullDesc: 'We need a professional WordPress website built for a local brick-and-mortar business looking to establish their online presence. The site must include: a homepage with hero section and call-to-action, about page with team bios, services page with descriptions and pricing, blog page with category filtering, and a contact page with an integrated form and Google Maps embed. Must use a responsive theme, be optimized for Core Web Vitals, and include basic SEO metadata. The client will provide logo, brand colors, and content copy.',
        requirements: ['Proven WordPress development experience (portfolio required)', 'Proficiency with page builders (Elementor or WPBakery)', 'Understanding of responsive design and mobile-first approach', 'Knowledge of SEO fundamentals (meta tags, schema, alt text)', 'Ability to integrate contact forms (Contact Form 7 or WPForms)', 'Experience with WordPress theme customization (child themes)', 'Must complete within 7-10 business days'] },
      { id: 'c2', title: 'Logo & Brand Identity Design', desc: 'Create a complete brand identity with logo, colors, and fonts. High-demand gig on 99designs, Fiverr Pro, and Dribbble.', type: 'complex', active: true, pay: 250.00,
        fullDesc: 'We are looking for a talented brand designer to create a complete visual identity for a new tech startup in the fintech space. Deliverables include: 3 unique logo concepts with variations (horizontal, vertical, icon-only), a full color palette with primary and secondary colors (with hex codes), typography selection (heading and body fonts with usage guidelines), brand stationery templates (business card, letterhead, email signature), and a brand style guide PDF. The brand should convey trust, innovation, and professionalism.',
        requirements: ['Strong portfolio showcasing brand identity projects', 'Proficiency in Adobe Illustrator and InDesign', 'Understanding of color theory and typography principles', 'Experience creating brand style guides', 'Ability to deliver vector files (AI, EPS, PDF, PNG, SVG)', 'Must provide 2-3 rounds of revisions', 'Portfolio submission required with application'] },
      { id: 'c3', title: 'Python Data Scraping Script', desc: 'Write a Python script to scrape e-commerce product data. Frequently posted on Upwork, Toptal, and Freelancer.', type: 'complex', active: true, pay: 400.00,
        fullDesc: 'We need a robust Python script to scrape product data from a major e-commerce website (URL provided upon acceptance). The script must extract: product name, price (including discounts), description, specifications, images (URLs), ratings and reviews count, availability status, and SKU. The output should be in structured JSON and CSV format. The script must handle pagination, rate limiting, CAPTCHA avoidance (using proxies/rotating user agents), and include error logging. Must also include a requirements.txt file and clear documentation.',
        requirements: ['Advanced Python skills (BeautifulSoup, Scrapy, Selenium)', 'Experience with proxy rotation and anti-blocking techniques', 'Knowledge of XPath and CSS selectors for web scraping', 'Ability to handle JavaScript-rendered content', 'Experience exporting to JSON, CSV, and databases', 'Understanding of robots.txt and ethical scraping practices', 'Must deliver working code with documentation within 5 days'] },
      { id: 'c4', title: 'Mobile App UI Design (Figma)', desc: 'Design a 10-screen mobile app UI in Figma with prototype. Standard brief from Dribbble, Behance, and Toptal clients.', type: 'complex', active: true, pay: 500.00,
        fullDesc: 'We are designing a health & fitness tracking mobile app and need a complete UI design in Figma. The app must include the following 10 screens: onboarding (3 screens with illustrations), sign up / login, home dashboard with daily stats, workout log screen, nutrition tracker, progress charts (weekly/monthly), social feed (friends activity), profile settings, notifications screen, and a premium subscription modal. Deliver a clickable prototype with micro-interactions, a design system with components, light/dark mode variants, and developer handoff specs.',
        requirements: ['Expert-level Figma skills (components, auto-layout, variants)', 'Experience designing mobile apps (iOS and Android guidelines)', 'Strong UX portfolio with app designs', 'Ability to create interactive prototypes', 'Knowledge of Material Design and Human Interface Guidelines', 'Must include a design system with reusable components', 'Delivery within 10 business days including 2 revision rounds'] },
      { id: 'c5', title: 'Shopify Store Setup', desc: 'Set up a Shopify store with 20 products and payment gateway. Common project on Upwork, Fiverr Business, and ShopMy.', type: 'complex', active: true, pay: 350.00,
        fullDesc: 'We need a complete Shopify store set up for a fashion accessories brand. Scope includes: install and configure a premium Shopify theme (Ona or Sense), customize theme colors/fonts to match brand, create 5 main pages (Home, Shop, About, Contact, FAQ), add 20 products with variants (size, color), configure collections/tags for filtering, set up payment gateways (Shopify Payments, PayPal, MPesa), configure shipping zones and rates, install essential apps (reviews, email marketing, analytics), set up tax rules, and test the full purchase flow from browse to checkout.',
        requirements: ['Shopify store setup experience (portfolio required)', 'Knowledge of Shopify theme customization (Liquid, JSON templates)', 'Experience with Shopify Payments, PayPal, and alternative gateways', 'Understanding of SEO for Shopify (meta fields, sitemaps)', 'Ability to configure shipping, taxes, and fulfillment', 'Knowledge of Shopify apps ecosystem', 'Must complete setup and testing within 7 business days'] },
      { id: 'c6', title: 'SEO Audit & Optimization Report', desc: 'Perform a full SEO audit and deliver a 20-page optimization report. Standard deliverable on Upwork, SEO Clerks, and PeoplePerHour.', type: 'complex', active: true, pay: 300.00,
        fullDesc: 'We require a comprehensive SEO audit of our existing website followed by a detailed optimization report. The audit must cover: technical SEO (crawlability, indexation, robots.txt, sitemaps, page speed, Core Web Vitals, mobile-friendliness, structured data), on-page SEO (title tags, meta descriptions, headings, content quality, keyword usage, internal linking, image alt text), off-page SEO (backlink profile analysis, domain authority, competitor backlink analysis), and local SEO (Google Business Profile, local citations, review management). Deliver a prioritized action plan with estimated effort and impact.',
        requirements: ['SEO certification or proven track record (case studies required)', 'Experience with SEO tools (Ahrefs, SEMrush, Screaming Frog, Google Search Console)', 'Technical SEO knowledge (crawl budget, canonical tags, hreflang)', 'On-page and off-page SEO expertise', 'Local SEO understanding (GBP optimization, local citations)', 'Ability to write clear, actionable recommendations', 'Must deliver within 7 business days'] },
      { id: 'c7', title: 'Video Editing (5-min Explainer)', desc: 'Edit a 5-minute explainer video with animations and captions. Typical project on Fiverr Pro, Voice123, and ProductionHub.', type: 'complex', active: true, pay: 450.00,
        fullDesc: 'We need a professional 5-minute explainer video edited for our SaaS product. Raw footage (approx 20 minutes) will be provided including screen recordings, talking head shots, and B-roll. The final edit must include: a compelling intro hook (first 15 seconds), clean cuts and transitions between segments, lower-third titles for speaker name and topic, animated screen callouts and zoom effects, background music (royalty-free) with proper audio mixing, closed captions throughout, an outro with call-to-action and logo animation. Deliver in 1080p at 30fps in MP4 format.',
        requirements: ['Professional video editing experience (Premiere Pro or DaVinci Resolve)', 'Motion graphics and animation skills (After Effects preferred)', 'Experience with audio mixing and noise reduction', 'Ability to create custom lower-thirds and titles', 'Knowledge of color grading and correction', 'Must provide royalty-free music or source properly', 'Portfolio of explainer videos required with application'] },
      { id: 'c8', title: 'Full-Stack Web Application', desc: 'Build a full-stack web app with React + Node.js + database. Enterprise-grade project found on Toptal, Upwork Enterprise, and Hired.', type: 'complex', active: true, pay: 2000.00,
        fullDesc: 'We are building a project management SaaS tool and need a full-stack developer to build the MVP. The application must include: user authentication with roles (admin, manager, member), project CRUD with status tracking, task management with drag-and-drop Kanban board, real-time notifications via WebSockets, file upload and attachment system, team chat with message history, dashboard with analytics charts, search and filtering across projects/tasks, email notifications for task assignments, and responsive design for mobile and desktop. Tech stack: React (Next.js), Node.js (Express), PostgreSQL, Redis, and AWS deployment.',
        requirements: ['5+ years full-stack development experience', 'Expert in React/Next.js and Node.js/Express', 'Database design and optimization (PostgreSQL)', 'Experience with real-time features (Socket.io or WebSockets)', 'Knowledge of AWS services (EC2, S3, RDS, Lambda)', 'RESTful API design and documentation', 'Git version control and CI/CD experience', 'Must have built and deployed a similar SaaS application before'] },
      { id: 'c9', title: 'Machine Learning Model Training', desc: 'Train and deploy an ML model for image classification. AI/ML project posted on Kaggle, Toptal, and Upwork ML & AI.', type: 'complex', active: true, pay: 3500.00,
        fullDesc: 'We need a machine learning engineer to train and deploy a custom image classification model for a medical diagnostics application. The model must classify medical X-ray images into 5 categories (normal, pneumonia, tuberculosis, COVID-19, other abnormalities). Dataset of 25,000+ labeled images will be provided. Tasks include: data preprocessing and augmentation, model architecture selection (CNN, ResNet, or EfficientNet), training with hyperparameter tuning, model evaluation (precision, recall, F1-score, AUC-ROC), model export (TensorFlow SavedModel or ONNX), and deployment as a REST API using FastAPI or Flask on AWS SageMaker.',
        requirements: ['MS/PhD in Computer Science, ML, or related field preferred', 'Proven experience with deep learning frameworks (TensorFlow, PyTorch)', 'Strong understanding of CNN architectures and transfer learning', 'Experience with medical imaging or similar domains', 'Data preprocessing and augmentation expertise', 'Model deployment experience (Docker, AWS SageMaker, FastAPI)', 'Publication record on ML conferences/journals is a plus', 'Must provide evaluation metrics and model card documentation'] },
      { id: 'c10', title: 'Enterprise CRM Integration', desc: 'Integrate Salesforce with third-party APIs and automate workflows. Enterprise implementation found on Upwork Enterprise, Toptal, and Salesforce MVP network.', type: 'complex', active: true, pay: 5000.00,
        fullDesc: 'We need an experienced Salesforce developer to integrate our Salesforce org with multiple third-party systems. Scope includes: bi-directional sync between Salesforce and our ERP system (NetSuite) for accounts, contacts, and opportunities, integration with our email marketing platform (Mailchimp) for campaign tracking and lead scoring, custom REST API endpoints to expose Salesforce data to our internal dashboard, automated workflow rules and Process Builder flows for lead assignment and follow-up reminders, Apex triggers for real-time data validation on opportunity closure, and comprehensive error handling with Slack notifications for sync failures.',
        requirements: ['Salesforce certified (Admin, Developer, or Architect)', '5+ years of Salesforce development experience (Apex, Lightning, SOQL)', 'Experience with REST/SOAP API integrations', 'Knowledge of NetSuite or similar ERP integration', 'Experience with middleware platforms (MuleSoft, Boomi, Workato)', 'Understanding of data mapping and ETL processes', 'Salesforce security model expertise (sharing rules, profiles, permission sets)', 'Must provide references from similar enterprise integration projects'] },
      { id: 'c11', title: 'Multilingual Content Translation', desc: 'Translate 10,000 words of website content (English to French/Swahili). Common project on Gengo, OneHourTranslation, and TranslatorsCafe.', type: 'complex', active: true, pay: 800.00,
        fullDesc: 'We need a professional translator to translate 10,000 words of website and marketing content from English into French and/or Swahili. Content includes: homepage copy, product descriptions (50 products), blog posts (5 articles), about us page, FAQ section, email templates (welcome, order confirmation, password reset), and social media posts (30 posts). The translation must: maintain brand voice and tone, adapt idioms and cultural references appropriately, preserve SEO keywords in target language, follow specified terminology glossary, and be delivered in a bilingual Excel format (source + translation side by side) and as ready-to-import CSV files.',
        requirements: ['Native-level fluency in target language (French or Swahili)', 'Professional translation experience (portfolio or certification)', 'Experience with marketing and e-commerce content translation', 'Familiarity with CAT tools (Trados, MemoQ, or Smartling)', 'Understanding of SEO in multilingual contexts', 'Must pass a short translation test before starting', 'Able to deliver 2,500 words per week minimum', 'Translation degree or certification preferred'] },
      { id: 'c12', title: 'AWS Cloud Infrastructure Setup', desc: 'Design and deploy AWS infrastructure using Terraform. Cloud architecture contract found on AWS Marketplace, Toptal, and Upwork Cloud & DevOps.', type: 'complex', active: true, pay: 2500.00,
        fullDesc: 'We need a cloud infrastructure engineer to design and deploy our production AWS environment using Infrastructure as Code (Terraform). Scope includes: VPC design with public/private subnets across 3 availability zones, ECS Fargate cluster for containerized microservices, RDS PostgreSQL with Multi-AZ deployment and automated backups, ElastiCache Redis for session management and caching, CloudFront CDN with WAF for content delivery and security, S3 buckets with lifecycle policies for logs and assets, IAM roles and policies following least-privilege principle, CloudWatch monitoring with dashboards and alerts, and CI/CD pipeline using CodePipeline and GitHub Actions.',
        requirements: ['AWS Solutions Architect certification (Associate or Professional)', 'Expert-level Terraform and Infrastructure as Code experience', 'Deep knowledge of AWS networking (VPC, Transit Gateway, Direct Connect)', 'Experience with Docker and ECS/EKS container orchestration', 'Security best practices (encryption, Secrets Manager, security groups)', 'Monitoring and observability (CloudWatch, Prometheus, Grafana)', 'Experience with CI/CD pipelines and GitOps workflows', 'Must provide architecture diagram and cost estimate with proposal'] },
    ]);
  }

  function loadDashboard() {
    var email = ls('tl_user_email');
    var name = ls('tl_user_name');
    if (dashWelcome) dashWelcome.textContent = 'Welcome back, ' + (name || 'User') + '!';
    if (!ls('tl_access_' + email)) {
      if (btList) btList.innerHTML = '<p style="color:#E85D3A;font-size:1.3rem;">&#128274; <a href="pricing.html" style="color:#E85D3A;font-weight:600;">Subscribe to access tasks &rarr;</a></p>';
      if (ctList) ctList.innerHTML = '<p style="color:#E85D3A;font-size:1.3rem;">&#128274; Subscribe to access complex tasks.</p>';
      if (mySubs) mySubs.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">Subscribe to start submitting work.</p>';
      return;
    }

    var tasks = lj('tl_tasks') || [];
    var submissions = lj('tl_submissions') || [];

    // Beginner tasks
    if (btList) {
      var bTasks = tasks.filter(function (t) { return t.type === 'beginner' && t.active; });
      if (bTasks.length === 0) { btList.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">No beginner tasks available.</p>'; }
      else {
        var html = '';
        bTasks.forEach(function (t) {
          var subs = submissions.filter(function (s) { return s.taskId === t.id && s.userEmail === email; });
          var last = subs[subs.length - 1];
          var st = last ? last.status : 'available';
          var descHtml = '';
          if (st === 'in_progress') {
            descHtml = '<div class="task-desc-short">' + (t.shortDesc || t.desc || 'Follow the instructions to complete this task.') + '</div>';
          } else if (st === 'pending') {
            descHtml = '<div class="task-desc-short">' + (t.shortDesc || t.desc || '') + '</div>';
          } else if (st === 'approved') {
            descHtml = '<div class="task-desc-full">' + (t.fullDesc || t.desc || '') + '</div>';
          }
          var btn = '';
          if (st === 'available') btn = '<button class="btn-task start" onclick="startTask(\'' + t.id + '\')">Start Task</button>';
          else if (st === 'in_progress') btn = '<button class="btn-task submit-work" onclick="submitWork(\'' + t.id + '\')">Submit Work</button>';
          else if (st === 'pending') btn = '<button class="btn-task pending" disabled>Under Review</button>';
          else if (st === 'approved') btn = '<span class="status-badge approved">&#10003; Approved +$' + t.pay.toFixed(2) + '</span>';
          else if (st === 'rejected') btn = '<button class="btn-task start" onclick="startTask(\'' + t.id + '\')">Retry</button>';
          html += '<div class="task-item"><div class="task-info"><div class="task-title">' + t.title + '</div>'
            + descHtml + '</div>'
            + '<div style="display:flex;align-items:center;gap:0.8rem;flex-wrap:wrap;"><span class="task-pay">+$' + t.pay.toFixed(2) + '</span>'
            + (st === 'available' ? '<span class="status-badge available">Available</span>' : '')
            + (st === 'in_progress' ? '<span class="status-badge available">In Progress</span>' : '')
            + (st === 'pending' ? '<span class="status-badge pending">Pending</span>' : '')
            + (st === 'approved' ? '<span class="status-badge approved">Completed</span>' : '')
            + btn + '</div></div>';
        });
        btList.innerHTML = html;
      }
    }

    // My submissions
    if (mySubs) {
      var my = submissions.filter(function (s) { return s.userEmail === email && (s.status === 'pending' || s.status === 'approved' || s.status === 'rejected'); });
      if (my.length === 0) { mySubs.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">No submissions yet. Start a task and submit your work!</p>'; }
      else {
        var h = '';
        my.slice().reverse().forEach(function (s) {
          var t = tasks.filter(function (x) { return x.id === s.taskId; })[0];
          var subHtml = '<div class="task-info"><div class="task-title">' + (t ? t.title : 'Unknown') + '</div>';
          if (s.workNote) subHtml += '<div class="task-desc-short">' + s.workNote + '</div>';
          subHtml += '</div>';
          h += '<div class="task-item">' + subHtml + '<span style="font-size:1.2rem;color:#6B687A;margin-right:0.8rem;">' + new Date(s.date).toLocaleDateString() + '</span><span class="status-badge ' + s.status + '">' + s.status.charAt(0).toUpperCase() + s.status.slice(1) + '</span></div>';
        });
        mySubs.innerHTML = h;
      }
    }

    // Complex tasks
    if (ctList) {
      var userPlan = ls('tl_plan_' + email) || 'free';
      var cTasks = tasks.filter(function (t) { return t.type === 'complex' && t.active; });
      if (cTasks.length === 0) { ctList.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">No complex jobs available.</p>'; }
      else {
        var ch = '';
        cTasks.forEach(function (t) {
          var cSubs = submissions.filter(function (s) { return s.taskId === t.id && s.userEmail === email; });
          var cLast = cSubs[cSubs.length - 1];
          var cSt = cLast ? cLast.status : 'available';
          ch += '<div class="task-item"><div class="task-info"><div class="task-title">' + t.title + ' <span class="task-pay" style="font-size:1.3rem;">$' + t.pay.toFixed(2) + '</span></div>';
          if (cSt === 'available') {
            ch += '<div class="task-desc">' + (t.desc || '') + '</div></div><div style="display:flex;align-items:center;gap:0.8rem;flex-wrap:wrap;"><span class="status-badge available">Open</span>';
            if (userPlan === 'premium' || userPlan === 'pro') {
              ch += '<button class="btn-task start" onclick="applyComplexJob(\'' + t.id + '\')">Apply Now</button>';
            } else {
              ch += '<a href="pricing.html" class="btn-task start" style="background:#E85D3A;text-decoration:none;display:inline-flex;">&#128274; Upgrade to Apply</a>';
            }
            ch += '</div>';
          } else if (cSt === 'applied') {
          } else if (cSt === 'applied') {
            ch += '<div class="task-desc">' + (t.desc || '') + '</div></div><span class="status-badge pending">Application Submitted</span>';
          } else if (cSt === 'approved') {
            ch += '<div class="task-desc-full" style="margin-top:0.4rem;"><strong>Job Description:</strong><br>' + (t.fullDesc || t.desc || '') + '</div>';
            if (t.requirements && t.requirements.length > 0) {
              ch += '<div class="task-desc-full" style="margin-top:0.4rem;border-left-color:#E85D3A;"><strong>Requirements:</strong><ul style="margin:0.4rem 0 0 1.6rem;font-size:1.3rem;color:#2D2B3A;">';
              t.requirements.forEach(function (r) { ch += '<li style="margin-bottom:0.2rem;">' + r + '</li>'; });
              ch += '</ul></div>';
            }
            ch += '</div><span class="status-badge approved">&#10003; Approved</span>';
          } else if (cSt === 'rejected') {
            ch += '<div class="task-desc">' + (t.desc || '') + '</div></div><span class="status-badge rejected">Rejected</span>';
          }
          ch += '</div>';
        });
        ctList.innerHTML = ch;
      }
    }

    // My Applications
    var appList = el('myApplicationsList');
    if (appList) {
      var allApps = lj('tl_job_applications') || [];
      var myApps = allApps.filter(function (a) { return a.email === email; });
      if (myApps.length === 0) { appList.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">You haven\'t applied to any jobs yet.</p>'; }
      else {
        var ah = '';
        myApps.slice().reverse().forEach(function (a) {
          ah += '<div class="task-item"><div class="task-info"><div class="task-title">' + a.jobTitle + '</div><div style="font-size:1.2rem;color:#6B687A;">Applied: ' + new Date(a.date).toLocaleDateString() + ' &middot; ' + a.name + ' &middot; ' + a.email + '</div></div><span class="status-badge pending">&#10003; Submitted</span></div>';
        });
        appList.innerHTML = ah;
      }
    }

    // Favorites
    var favList = el('favoritesList');
    if (favList) {
      var favs = lj('tl_fav_' + email) || [];
      if (favs.length === 0) { favList.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">No saved jobs yet. Browse jobs and click &#9733; to save them.</p>'; }
      else {
        var fh = '';
        favs.forEach(function (fid) {
          var fj = null;
          JOBS.forEach(function (j) { if (String(j.id) === String(fid)) fj = j; });
          if (fj) {
            fh += '<div class="task-item"><div class="task-info"><div class="task-title">' + fj.title + '</div><div style="font-size:1.2rem;color:#6B687A;">' + fj.company + ' &middot; ' + fj.location + ' &middot; ' + fj.salary + '</div></div><div style="display:flex;align-items:center;gap:0.8rem;"><a href="job.html?id=' + fj.id + '" class="btn-task start" style="text-decoration:none;font-size:1.2rem;padding:0.3rem 0.8rem;">View</a></div></div>';
          }
        });
        if (!fh) fh = '<p style="color:#6B687A;font-size:1.3rem;">Saved jobs not found.</p>';
        favList.innerHTML = fh;
      }
    }

    // Earnings & wallet
    var approved = submissions.filter(function (s) { return s.userEmail === email && s.status === 'approved'; });
    var totalEarned = 0;
    approved.forEach(function (s) {
      var t = tasks.filter(function (x) { return x.id === s.taskId; })[0];
      if (t) totalEarned += t.pay || 0;
    });
    // Subtract withdrawn amount
    var withdrawals = lj('tl_withdrawals_' + email) || [];
    var totalWithdrawn = 0;
    withdrawals.forEach(function (w) { if (w.status === 'paid') totalWithdrawn += w.amount; });
    var balance = totalEarned - totalWithdrawn;
    if (earnDisp) earnDisp.textContent = 'Earnings: $' + totalEarned.toFixed(2);
    if (walletBalance) walletBalance.textContent = '$' + balance.toFixed(2);
    renderWithdrawHistory(email);
  }

  window.applyComplexJob = function (taskId) {
    var email = ls('tl_user_email');
    if (!email || !ls('tl_access_' + email)) { alert('Subscribe first!'); window.location.href = 'pricing.html'; return; }
    var plan = ls('tl_plan_' + email) || 'free';
    if (plan !== 'premium' && plan !== 'pro') { alert('Your plan does not include complex jobs. Please upgrade to Premium or Pro.'); window.location.href = 'pricing.html'; return; }
    var msg = 'To apply for this job, send your application letter and portfolio to tasklink69@gmail.com.\n\nInclude the job title in your subject line.\n\nOnce admin reviews and approves your application, the full job description and requirements will appear here.';
    alert(msg);
    var subs = lj('tl_submissions') || [];
    subs.push({ id: 's' + Date.now(), taskId: taskId, userEmail: email, status: 'applied', date: new Date().toISOString() });
    lj('tl_submissions', subs);
    loadDashboard();
  };

  window.startTask = function (taskId) {
    var email = ls('tl_user_email');
    if (!email || !ls('tl_access_' + email)) { alert('Subscribe first!'); window.location.href = 'pricing.html'; return; }
    var subs = lj('tl_submissions') || [];
    subs.push({ id: 's' + Date.now(), taskId: taskId, userEmail: email, status: 'in_progress', date: new Date().toISOString() });
    lj('tl_submissions', subs);
    loadDashboard();
  };

  window.submitWork = function (taskId) {
    var email = ls('tl_user_email');
    if (!email) return;
    var note = prompt('Describe what you completed for this task (required for admin review):');
    if (!note || note.trim() === '') { alert('Please describe your work before submitting.'); return; }
    var subs = lj('tl_submissions') || [];
    subs.push({ id: 's' + Date.now(), taskId: taskId, userEmail: email, status: 'pending', workNote: note, date: new Date().toISOString() });
    lj('tl_submissions', subs);
    alert('Work submitted! Admin will review and approve/reject your submission.');
    loadDashboard();
  };

  // ── Withdrawal System ──
  var wMethodBtns = qsa('.withdraw-method-btn');
  var wSelected = null;
  wMethodBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      wSelected = b.getAttribute('data-wmethod');
      wMethodBtns.forEach(function (x) { x.classList.remove('selected'); });
      b.classList.add('selected');
    });
  });

  var wBtn = el('withdrawBtn');
  if (wBtn) {
    wBtn.addEventListener('click', function () {
      var email = ls('tl_user_email');
      var account = el('withdrawAccount');
      var msg = el('withdrawMsg');
      msg.innerHTML = '';
      if (!email || !ls('tl_access_' + email)) { msg.innerHTML = '<span style="color:#E85D3A;">Subscribe first.</span>'; return; }
      if (!wSelected) { msg.innerHTML = '<span style="color:#E85D3A;">Select a payout method.</span>'; return; }
      if (!account.value) { msg.innerHTML = '<span style="color:#E85D3A;">Enter your account/phone/email.</span>'; return; }
      var tasks = lj('tl_tasks') || [];
      var subs = lj('tl_submissions') || [];
      var approved = subs.filter(function (s) { return s.userEmail === email && s.status === 'approved'; });
      var totalEarned = 0;
      approved.forEach(function (s) { var t = tasks.filter(function (x) { return x.id === s.taskId; })[0]; if (t) totalEarned += t.pay || 0; });
      var withdrawals = lj('tl_withdrawals_' + email) || [];
      var withdrawn = 0;
      withdrawals.forEach(function (w) { if (w.status === 'paid') withdrawn += w.amount; });
      var balance = totalEarned - withdrawn;
      if (balance < 10) { msg.innerHTML = '<span style="color:#E85D3A;">Minimum withdrawal is $10. Your balance: $' + balance.toFixed(2) + '</span>'; return; }
      // Submit withdrawal
      withdrawals.push({
        id: 'w' + Date.now(), email: email, amount: balance, method: wSelected, account: account.value,
        status: 'pending', date: new Date().toISOString()
      });
      lj('tl_withdrawals_' + email, withdrawals);
      // Also store globally for admin
      var allW = lj('tl_all_withdrawals') || [];
      allW.push({
        id: 'w' + Date.now(), email: email, amount: balance, method: wSelected, account: account.value,
        status: 'pending', date: new Date().toISOString()
      });
      lj('tl_all_withdrawals', allW);
      msg.innerHTML = '<span style="color:#2E9E8F;">&#10003; Withdrawal request sent! Admin will review it.</span>';
      account.value = '';
      loadDashboard();
    });
  }

  function renderWithdrawHistory(email) {
    var cont = el('withdrawHistory');
    if (!cont) return;
    var withdrawals = lj('tl_withdrawals_' + email) || [];
    if (withdrawals.length === 0) {
      cont.innerHTML = '<p style="font-size:1.3rem;color:#6B687A;font-weight:500;margin-bottom:0;">Withdrawal History</p><p style="font-size:1.2rem;color:#6B687A;">No withdrawals yet.</p>';
      return;
    }
    var h = '<p style="font-size:1.3rem;color:#6B687A;font-weight:500;margin-bottom:0.8rem;">Withdrawal History</p>';
    withdrawals.slice().reverse().forEach(function (w) {
      var stCls = w.status === 'paid' ? 'approved' : (w.status === 'rejected' ? 'rejected' : 'pending');
      h += '<div class="withdraw-history-item"><span>$' + w.amount.toFixed(2) + ' via ' + w.method + ' <span style="color:#6B687A;">(' + new Date(w.date).toLocaleDateString() + ')</span></span><span class="status-badge ' + stCls + '">' + w.status.charAt(0).toUpperCase() + w.status.slice(1) + '</span></div>';
    });
    cont.innerHTML = h;
  }

  loadDashboard();

  // ════════════════════════ ADMIN PANEL ════════════════════════
  function loadAdmin() {
    if (ls('tl_user_email') !== ADMIN_EMAIL) {
      var ap = qs('.admin-page');
      if (ap) ap.innerHTML = '<div class="container" style="text-align:center;padding:4rem 0;"><h2>Access Denied</h2><p style="color:#6B687A;"><a href="index.html">Go home</a></p></div>';
      return;
    }
    var users = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('tl_user_') === 0) { try { users.push(JSON.parse(localStorage.getItem(k))); } catch (e) {} }
    }
    var tasks = lj('tl_tasks') || [];
    var submissions = lj('tl_submissions') || [];
    var payments = lj('tl_payments') || [];
    var allW = lj('tl_all_withdrawals') || [];

    if (el('statUsers')) el('statUsers').textContent = users.length;
    if (el('statTasks')) el('statTasks').textContent = tasks.filter(function (t) { return t.active; }).length;
    if (el('statPending')) el('statPending').textContent = submissions.filter(function (s) { return s.status === 'pending'; }).length;
    if (el('statApproved')) el('statApproved').textContent = submissions.filter(function (s) { return s.status === 'approved'; }).length;
    if (el('statPayments')) el('statPayments').textContent = payments.filter(function (p) { return p.status === 'pending'; }).length;
    if (el('statWithdrawals')) el('statWithdrawals').textContent = allW.filter(function (w) { return w.status === 'pending'; }).length;

    // Employer jobs pending stat
    var empJobs = lj('tl_employer_jobs') || [];
    var statEmpJobs = el('statEmpJobs');
    if (statEmpJobs) statEmpJobs.textContent = empJobs.filter(function (j) { return j.status === 'pending'; }).length;

    // Employer accounts stat
    var employers = lj('tl_employers') || [];
    var statEmpAccounts = el('statEmpAccounts');
    if (statEmpAccounts) statEmpAccounts.textContent = employers.length;

    // Users
    var ub = el('adminUsersBody');
    if (ub) {
      if (users.length === 0) { ub.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6B687A;">No users.</td></tr>'; }
      else {
        var uh = '';
        users.forEach(function (u) {
          var acc = ls('tl_access_' + u.email) === 'true' ? '<span class="status-badge approved">Active</span>' : '<span class="status-badge pending">Inactive</span>';
          uh += '<tr><td>' + (u.name || 'N/A') + '</td><td>' + u.email + '</td><td>' + (u.phone || 'N/A') + '</td><td>' + (u.country || 'N/A') + '</td><td>' + (u.continent || 'N/A') + '</td><td>' + acc + '</td><td>' + (u.joined ? new Date(u.joined).toLocaleDateString() : 'N/A') + '</td></tr>';
        });
        ub.innerHTML = uh;
      }
    }

    // Submissions
    var sb = el('adminSubmissionsBody');
    if (sb) {
      if (submissions.length === 0) { sb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6B687A;">No submissions.</td></tr>'; }
      else {
        var sh = '';
        submissions.slice().reverse().forEach(function (s) {
          var t = tasks.filter(function (x) { return x.id === s.taskId; })[0];
          var u = users.filter(function (x) { return x.email === s.userEmail; })[0];
          var act = '';
          if (s.status === 'in_progress') {
            act = '<span style="font-size:1.1rem;color:#6B687A;">Working...</span>';
          } else if (s.status === 'pending' || s.status === 'applied') {
            act = '<div class="admin-actions"><button class="admin-btn approve" onclick="adminApprove(\'' + s.id + '\')">Approve</button><button class="admin-btn reject" onclick="adminReject(\'' + s.id + '\')">Reject</button></div>';
          } else if (s.status === 'approved') {
            act = '<span style="font-size:1.1rem;color:#2E9E8F;">&#10003; Approved</span>';
          } else {
            act = '<button class="admin-btn approve" onclick="adminApprove(\'' + s.id + '\')">Reverse</button>';
          }
          var workNote = s.workNote ? '<div style="font-size:1.2rem;color:#6B687A;max-width:18rem;overflow:hidden;text-overflow:ellipsis;" title="' + s.workNote.replace(/"/g, '&quot;') + '">' + s.workNote + '</div>' : '';
          sh += '<tr><td>' + (u ? u.name : s.userEmail) + '</td><td>' + (t ? t.title : 'Unknown') + '</td><td>' + (t ? '$' + t.pay.toFixed(2) : '-') + '</td><td>' + workNote + '</td><td><span class="status-badge ' + s.status + '">' + s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' ') + '</span></td><td>' + new Date(s.date).toLocaleDateString() + '</td><td>' + act + '</td></tr>';
        });
        sb.innerHTML = sh;
      }
    }

    // Tasks
    var tb = el('adminTasksBody');
    if (tb) {
      if (tasks.length === 0) { tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6B687A;">No tasks.</td></tr>'; }
      else {
        var th = '';
        tasks.forEach(function (t) {
          th += '<tr><td>' + t.title + '</td><td>$' + (t.pay || 0).toFixed(2) + '</td><td style="text-transform:capitalize;">' + t.type + '</td><td>' + (t.active ? '<span class="status-badge available">Active</span>' : '<span class="status-badge rejected">Inactive</span>') + '</td>'
            + '<td><div class="admin-actions"><button class="admin-btn edit" onclick="adminToggleTask(\'' + t.id + '\')">' + (t.active ? 'Deactivate' : 'Activate') + '</button><button class="admin-btn reject" onclick="adminDeleteTask(\'' + t.id + '\')">Delete</button></div></td></tr>';
        });
        tb.innerHTML = th;
      }
    }

    // Payments
    var pb = el('adminPaymentsBody');
    if (pb) {
      if (payments.length === 0) { pb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6B687A;">No payments.</td></tr>'; }
      else {
        var ph = '';
        payments.slice().reverse().forEach(function (p) {
          var stCls = p.status === 'verified' ? 'approved' : (p.status === 'pending' ? 'pending' : (p.status === 'otp_sent' ? 'available' : 'rejected'));
          var stLbl = p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('_', ' ');
          var act = '';
          if (p.status === 'pending') {
            act = '<button class="admin-btn approve" onclick="adminConfirmPayment(\'' + p.id + '\')">Confirm &amp; Send OTP</button>';
          } else if (p.status === 'otp_sent') {
            act = '<span style="font-size:1.1rem;color:#2E9E8F;">OTP sent</span>';
          } else if (p.status === 'verified') {
            act = '<span style="font-size:1.1rem;color:#2E9E8F;">&#10003; Verified</span>';
          }
          ph += '<tr><td>' + p.email + '</td><td style="text-transform:capitalize;">' + p.plan + '</td><td>$' + p.amount + '</td><td style="text-transform:capitalize;">' + p.method + '</td><td><span class="status-badge ' + stCls + '">' + stLbl + '</span></td><td>' + new Date(p.date).toLocaleDateString() + '</td><td>' + act + '</td></tr>';
        });
        pb.innerHTML = ph;
      }
    }

    // Withdrawals
    var wb = el('adminWithdrawalsBody');
    if (wb) {
      if (allW.length === 0) { wb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6B687A;">No withdrawals.</td></tr>'; }
      else {
        var wh = '';
        allW.slice().reverse().forEach(function (w) {
          var u = users.filter(function (x) { return x.email === w.email; })[0];
          var act = '';
          if (w.status === 'pending') {
            act = '<div class="admin-actions"><button class="admin-btn approve" onclick="adminPayWithdraw(\'' + w.id + '\')">Pay</button><button class="admin-btn reject" onclick="adminRejectWithdraw(\'' + w.id + '\')">Reject</button></div>';
          } else if (w.status === 'paid') {
            act = '<span style="font-size:1.1rem;color:#2E9E8F;">&#10003; Paid</span>';
          } else {
            act = '<span style="color:#C83232;font-size:1.1rem;">Rejected</span>';
          }
          wh += '<tr><td>' + (u ? u.name : w.email) + '</td><td>$' + w.amount.toFixed(2) + '</td><td style="text-transform:capitalize;">' + w.method + '</td><td>' + w.account + '</td><td><span class="status-badge ' + (w.status === 'paid' ? 'approved' : w.status === 'rejected' ? 'rejected' : 'pending') + '">' + w.status.charAt(0).toUpperCase() + w.status.slice(1) + '</span></td><td>' + new Date(w.date).toLocaleDateString() + '</td><td>' + act + '</td></tr>';
        });
        wb.innerHTML = wh;
      }
    }

    // Employer jobs
    if (typeof renderAdminEmpJobs === 'function') renderAdminEmpJobs();

    // Employer accounts
    var eab = el('adminEmpAccountsBody');
    if (eab) {
      var employers = lj('tl_employers') || [];
      if (employers.length === 0) { eab.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6B687A;">No employer accounts.</td></tr>'; }
      else {
        var eah = '';
        employers.forEach(function (e) {
          eah += '<tr><td>' + (e.name || 'N/A') + '</td><td>' + e.email + '</td><td>' + (e.company || 'N/A') + '</td><td>' + (e.phone || 'N/A') + '</td><td>' + new Date(e.joined).toLocaleDateString() + '</td></tr>';
        });
        eab.innerHTML = eah;
      }
    }
  }

  window.adminApprove = function (subId) {
    var subs = lj('tl_submissions') || [];
    var tasks = lj('tl_tasks') || [];
    var approvedTask = null;
    subs.forEach(function (s) {
      if (s.id === subId) {
        s.status = 'approved';
        tasks.forEach(function (t) { if (t.id === s.taskId && (t.fullDesc || t.requirements)) approvedTask = t; });
      }
    });
    lj('tl_submissions', subs);
    loadAdmin();
    if (approvedTask) {
      var msg = 'Task approved! The user can now view full details on their dashboard.\n\n';
      if (approvedTask.fullDesc) msg += 'Description:\n' + approvedTask.fullDesc + '\n\n';
      if (approvedTask.requirements) msg += 'Requirements:\n- ' + approvedTask.requirements.join('\n- ');
      alert(msg);
    } else {
      alert('Submission approved!');
    }
  };
  window.adminReject = function (subId) {
    var subs = lj('tl_submissions') || [];
    subs.forEach(function (s) { if (s.id === subId) s.status = 'rejected'; });
    lj('tl_submissions', subs);
    loadAdmin();
  };
  // ── Admin confirms payment → generates OTP sent to user's email ──
  window.adminConfirmPayment = function (payId) {
    if (!confirm('Confirm this payment? A unique OTP will be generated for the user\'s email.')) return;
    var payments = lj('tl_payments') || [];
    var found = null;
    var generatedOtp = '';
    payments.forEach(function (p) {
      if (p.id === payId && p.status === 'pending') {
        generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        ls('tl_otp_' + p.email, generatedOtp);
        p.status = 'otp_sent';
        p.otp = generatedOtp;
        found = p;
      }
    });
    lj('tl_payments', payments);
    if (found) {
      alert('Payment confirmed! OTP: ' + generatedOtp + ' sent to ' + found.email + '. User can now verify.');
    } else {
      alert('Payment not found or already processed.');
    }
    loadAdmin();
  };

  window.adminToggleTask = function (taskId) {
    var t2 = lj('tl_tasks') || [];
    t2.forEach(function (t) { if (t.id === taskId) t.active = !t.active; });
    lj('tl_tasks', t2);
    loadAdmin();
  };
  window.adminDeleteTask = function (taskId) {
    if (!confirm('Delete this task?')) return;
    var t2 = lj('tl_tasks') || [];
    lj('tl_tasks', t2.filter(function (t) { return t.id !== taskId; }));
    loadAdmin();
  };
  window.addTask = function () {
    var title = el('newTaskTitle'), desc = el('newTaskDesc'), fullDesc = el('newTaskFullDesc'), payInput = el('newTaskPay'), type = el('newTaskType');
    if (!title.value || !desc.value) { alert('Title and short description required.'); return; }
    var pay = parseFloat(payInput.value) || 0;
    if (pay <= 0) { alert('Enter a valid pay amount.'); return; }
    var t2 = lj('tl_tasks') || [];
    t2.push({ id: 't' + Date.now(), title: title.value, shortDesc: desc.value, fullDesc: fullDesc ? fullDesc.value : '', desc: desc.value, type: type.value, pay: pay, active: true });
    lj('tl_tasks', t2);
    title.value = ''; desc.value = ''; if (fullDesc) fullDesc.value = ''; if (payInput) payInput.value = '';
    loadAdmin();
  };

  // Withdrawal admin actions
  window.adminPayWithdraw = function (wid) {
    var allW = lj('tl_all_withdrawals') || [];
    allW.forEach(function (w) {
      if (w.id === wid) {
        w.status = 'paid';
        // Update user's local withdrawal record too
        var userW = lj('tl_withdrawals_' + w.email) || [];
        userW.forEach(function (uw) { if (uw.id === wid) uw.status = 'paid'; });
        lj('tl_withdrawals_' + w.email, userW);
      }
    });
    lj('tl_all_withdrawals', allW);
    loadAdmin();
  };
  window.adminRejectWithdraw = function (wid) {
    var allW = lj('tl_all_withdrawals') || [];
    allW.forEach(function (w) {
      if (w.id === wid) {
        w.status = 'rejected';
        var userW = lj('tl_withdrawals_' + w.email) || [];
        userW.forEach(function (uw) { if (uw.id === wid) uw.status = 'rejected'; });
        lj('tl_withdrawals_' + w.email, userW);
      }
    });
    lj('tl_all_withdrawals', allW);
    loadAdmin();
  };

  // Admin tabs
  qsa('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      qsa('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
      qsa('.admin-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var targetId = 'admin' + tab.getAttribute('data-admin-tab').charAt(0).toUpperCase() + tab.getAttribute('data-admin-tab').slice(1);
      var target = el(targetId);
      if (target) target.classList.add('active');
    });
  });

  if (document.querySelector('.admin-page')) loadAdmin();

  var alo = el('adminLogout');
  if (alo) alo.addEventListener('click', function (e) { e.preventDefault(); ls('tl_logged_in', ''); ls('tl_user_email', ''); ls('tl_user_name', ''); window.location.href = 'index.html'; });

  // Redirect checks
  if (window.location.pathname.indexOf('verify.html') > -1 && ls('tl_user_email') === ADMIN_EMAIL) { window.location.href = 'admin.html'; }
  if (window.location.pathname.indexOf('dashboard.html') > -1 && ls('tl_logged_in') !== 'true') { window.location.href = 'index.html'; }

  // ── Floating Support Tab ──
  var supportEl = document.createElement('a');
  supportEl.href = 'mailto:tasklink69@gmail.com';
  supportEl.className = 'support-tab';
  supportEl.innerHTML = '&#128172; Support';
  supportEl.setAttribute('aria-label', 'Contact support via email');
  document.body.appendChild(supportEl);

  // Inject support tab styles
  var supportStyles = document.createElement('style');
  supportStyles.textContent = '.support-tab{position:fixed;bottom:2.4rem;right:2.4rem;background:#1A1A4E;color:#fff;padding:1.2rem 2rem;border-radius:4rem;font-size:1.4rem;font-weight:600;z-index:999;display:flex;align-items:center;gap:0.6rem;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:all 0.2s;text-decoration:none!important;}.support-tab:hover{background:#E85D3A;color:#fff!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.25);}';
  document.head.appendChild(supportStyles);

  // ════════════════════════ EMPLOYER SYSTEM ════════════════════════

  // Employer login
  var empLoginForm = el('employerLoginForm');
  if (empLoginForm) {
    empLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = el('empLoginEmail'), pw = el('empLoginPass'), er = el('empLoginError');
      er.style.display = 'none';
      var emVal = em.value.toLowerCase().trim();
      if (emVal === ADMIN_EMAIL && pw.value === ADMIN_PASS) {
        ls('tl_emp_logged_in', ADMIN_EMAIL);
        er.style.color = '#2E9E8F'; er.textContent = 'Admin logged in as employer.'; er.style.display = 'block';
        renderEmployerDashboard(); return;
      }
      if (emVal === TEST_EMAIL && pw.value === TEST_PASS) {
        ls('tl_emp_logged_in', TEST_EMAIL);
        er.style.color = '#2E9E8F'; er.textContent = 'Test account logged in as employer.'; er.style.display = 'block';
        renderEmployerDashboard(); return;
      }
      var employers = lj('tl_employers') || [];
      var found = null;
      employers.forEach(function (e2) { if (e2.email === emVal && e2.password === pw.value) found = e2; });
      if (!found) { er.textContent = 'Invalid email or password.'; er.style.display = 'block'; return; }
      ls('tl_emp_logged_in', found.email);
      renderEmployerDashboard();
    });
  }

  // Employer register
  var empRegForm = el('employerRegForm');
  if (empRegForm) {
    empRegForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nm = el('empRegName'), em = el('empRegEmail'), co = el('empRegCompany'), ph = el('empRegPhone'), pw = el('empRegPass'), er = el('empRegError'), sc = el('empRegSuccess');
      er.style.display = 'none'; sc.style.display = 'none';
      if (!nm.value || !em.value || !co.value || !ph.value || !pw.value) { er.textContent = 'All fields required.'; er.style.display = 'block'; return; }
      var employers = lj('tl_employers') || [];
      var dup = false; employers.forEach(function (e2) { if (e2.email === em.value) dup = true; });
      if (dup) { er.textContent = 'Email already registered.'; er.style.display = 'block'; return; }
      employers.push({ name: nm.value, email: em.value, company: co.value, phone: ph.value, password: pw.value, joined: new Date().toISOString() });
      lj('tl_employers', employers);
      sc.textContent = 'Employer account created! You can now sign in.'; sc.style.display = 'block';
      el('empRegForm').reset();
      setTimeout(function () { qs('.emp-tab[data-emp-tab="login"]').click(); }, 1200);
    });
  }

  // Employer tab switching
  var empTabs = qsa('.emp-tab');
  empTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      empTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = el('emp' + tab.getAttribute('data-emp-tab').charAt(0).toUpperCase() + tab.getAttribute('data-emp-tab').slice(1));
      qsa('.emp-panel').forEach(function (p) { p.classList.remove('active'); });
      if (target) target.classList.add('active');
    });
  });

  // Employer logout
  var empLogout = el('employerLogout');
  if (empLogout) {
    empLogout.addEventListener('click', function (e) { e.preventDefault(); ls('tl_emp_logged_in', ''); renderEmployerDashboard(); });
  }

  // Post job form
  var postJobForm = el('employerPostJobForm');
  if (postJobForm) {
    postJobForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var empEmail = ls('tl_emp_logged_in');
      if (!empEmail) { alert('Sign in first.'); return; }
      var title = el('ejobTitle'), company = el('ejobCompany'), salary = el('ejobSalary'), location = el('ejobLocation');
      var type = el('ejobType'), category = el('ejobCategory'), experience = el('ejobExperience'), description = el('ejobDescription');
      var fee = parseFloat(el('ejobFee').value) || 0;
      var responsibilities = el('ejobResponsibilities'), qualifications = el('ejobQualifications'), benefits = el('ejobBenefits'), requirementsList = el('ejobRequirementsList');
      if (!title.value || !company.value || !description.value) { alert('Title, company, and description required.'); return; }
      var empJobs = lj('tl_employer_jobs') || [];
      empJobs.push({
        id: 'ej' + Date.now(), employerEmail: empEmail, title: title.value, company: company.value, salary: salary.value,
        location: location.value, type: type.value, category: category.value, experience: experience.value,
        description: description.value,
        responsibilities: responsibilities ? responsibilities.value : '',
        qualifications: qualifications ? qualifications.value : '',
        benefits: benefits ? benefits.value : '',
        requirementsList: requirementsList ? requirementsList.value : '',
        fee: fee, status: 'pending', date: new Date().toISOString()
      });
      lj('tl_employer_jobs', empJobs);
      alert('Job submitted for admin approval. It will appear on the job board once approved.');
      postJobForm.reset();
      renderEmployerDashboard();
    });
  }

  function renderEmployerDashboard() {
    var empEmail = ls('tl_emp_logged_in');
    var empDash = el('employerDashboard');
    var empLoginSection = el('employerLoginSection');
    var empName = el('employerName');
    if (!empDash) return;
    if (!empEmail) {
      empDash.style.display = 'none'; if (empLoginSection) empLoginSection.style.display = 'block';
      return;
    }
    if (empLoginSection) empLoginSection.style.display = 'none';
    empDash.style.display = 'block';
    // Show name
    var empData = null;
    if (empEmail === ADMIN_EMAIL || empEmail === TEST_EMAIL) {
      empName.textContent = empEmail === ADMIN_EMAIL ? 'Administrator (TaskLink)' : 'Test Account (TaskLink)';
      var empAdminLink = el('empAdminLink');
      if (empAdminLink) empAdminLink.style.display = 'inline-block';
    } else {
      var employers = lj('tl_employers') || [];
      employers.forEach(function (e2) { if (e2.email === empEmail) empData = e2; });
      empName.textContent = empData ? empData.name + ' (' + empData.company + ')' : empEmail;
    }
    // Render my posted jobs
    var myJobsList = el('employerMyJobs');
    if (myJobsList) {
      var empJobs = lj('tl_employer_jobs') || [];
      var my = empJobs.filter(function (j) { return j.employerEmail === empEmail; });
      if (my.length === 0) { myJobsList.innerHTML = '<p style="color:#6B687A;font-size:1.3rem;">No jobs posted yet.</p>'; }
      else {
        var h = '';
        my.slice().reverse().forEach(function (j) {
          var stCls = j.status === 'approved' ? 'approved' : (j.status === 'rejected' ? 'rejected' : 'pending');
          h += '<div class="task-item"><div class="task-info"><div class="task-title">' + j.title + ' at ' + j.company + '</div>'
            + '<div class="task-desc">' + (j.location || 'Remote') + ' &middot; ' + (j.salary || 'N/A') + ' &middot; ' + new Date(j.date).toLocaleDateString() + '</div></div>'
            + '<span class="status-badge ' + stCls + '">' + j.status.charAt(0).toUpperCase() + j.status.slice(1) + '</span></div>';
        });
        myJobsList.innerHTML = h;
      }
    }
  }

  // Render employer dashboard on company page
  var employerDash = el('employerDashboard');
  if (employerDash) renderEmployerDashboard();

  // ════════════════════════ ADMIN: EMPLOYER JOBS TAB ════════════════════════

  // Render employer jobs in admin panel
  var adminEmpJobsBody = el('adminEmpJobsBody');
  function renderAdminEmpJobs() {
    if (!adminEmpJobsBody) return;
    var empJobs = lj('tl_employer_jobs') || [];
    if (empJobs.length === 0) { adminEmpJobsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6B687A;">No employer job submissions.</td></tr>'; return; }
    var h = '';
    empJobs.slice().reverse().forEach(function (j) {
      var act = '';
      if (j.status === 'pending') act = '<div class="admin-actions"><button class="admin-btn approve" onclick="adminApproveEmpJob(\'' + j.id + '\')">Approve</button><button class="admin-btn reject" onclick="adminRejectEmpJob(\'' + j.id + '\')">Reject</button></div>';
      else if (j.status === 'approved') act = '<span style="font-size:1.1rem;color:#2E9E8F;">&#10003; Approved</span>';
      else act = '<span style="color:#C83232;font-size:1.1rem;">Rejected</span>';
      h += '<tr><td>' + j.employerEmail + '</td><td>' + j.title + '</td><td>' + j.company + '</td><td>' + (j.salary || 'N/A') + '</td><td><span class="status-badge ' + (j.status === 'approved' ? 'approved' : j.status === 'rejected' ? 'rejected' : 'pending') + '">' + j.status.charAt(0).toUpperCase() + j.status.slice(1) + '</span></td><td>' + act + '</td></tr>';
    });
    adminEmpJobsBody.innerHTML = h;
  }

  window.adminApproveEmpJob = function (jobId) {
    var empJobs = lj('tl_employer_jobs') || [];
    empJobs.forEach(function (j) { if (j.id === jobId) j.status = 'approved'; });
    lj('tl_employer_jobs', empJobs);
    renderAdminEmpJobs();
    loadAdmin();
    alert('Job approved and will appear on the public job board.');
  };
  window.adminRejectEmpJob = function (jobId) {
    var empJobs = lj('tl_employer_jobs') || [];
    empJobs.forEach(function (j) { if (j.id === jobId) j.status = 'rejected'; });
    lj('tl_employer_jobs', empJobs);
    renderAdminEmpJobs();
    loadAdmin();
    alert('Job rejected.');
  };

  // Include approved employer jobs in the JOBS array for rendering
  if (el('jobsContainer') || el('jobDetailContainer')) {
    var empJobs = lj('tl_employer_jobs') || [];
    var nextId = 100;
    empJobs.forEach(function (j) {
      if (j.status === 'approved') {
        nextId++;
        JOBS.push({
          id: nextId, title: j.title, company: j.company, salary: j.salary || 'N/A', location: j.location || 'Remote',
          type: j.type || 'Full-Time', posted: 'Recently', category: j.category || 'Other', experience: j.experience || 'Any Level',
          fee: j.fee || 0, feeLabel: j.fee > 0 ? 'Pro' : '',
          description: j.description || 'No description provided.',
          responsibilities: j.responsibilities || '', qualifications: j.qualifications || '',
          benefits: j.benefits || '', requirementsList: j.requirementsList || '',
          isEmployerJob: true
        });
      }
    });
    // Re-render jobs listing if on jobs page
    if (el('jobsContainer')) {
      var jh = '';
      var userEmail = ls('tl_user_email');
      var loggedIn = ls('tl_logged_in') === 'true';
      var allApps = lj('tl_job_applications') || [];
      var appliedJobIds = {};
      allApps.forEach(function (a) { if (a.email === userEmail) appliedJobIds[a.jobId] = true; });
      JOBS.forEach(function (jb) {
        var link = loggedIn ? 'job.html?id=' + jb.id : 'register.html';
        var appliedBadge = appliedJobIds[jb.id] ? ' <span style="display:inline-block;font-size:1rem;background:#2E9E8F;color:#fff;padding:0.1rem 0.6rem;border-radius:0.3rem;margin-left:0.4rem;">Applied</span>' : '';
        jh += '<a href="' + link + '" class="job-card">'
          + '<div class="job-card-header">'
          + '<div><h3>' + jb.title + appliedBadge + '</h3><p class="job-card-company">' + jb.company + ' <span style="display:inline-block;font-size:1rem;color:#2E9E8F;font-weight:600;">&#10003; Verified</span></p></div>'
          + '<span class="job-card-salary">' + jb.salary + '</span>'
          + '</div>'
          + '<div class="job-card-meta">'
          + '<span>&#128205; ' + jb.location + '</span>'
          + '<span>&#128197; ' + jb.type + '</span>'
          + '<span>&#128197; Posted ' + jb.posted + '</span>'
          + '<span class="job-card-tag">' + jb.category + '</span>';
        if (jb.fee > 0) {
          jh += '<span class="job-card-tag" style="background:#E85D3A;color:#fff;">$' + jb.fee.toFixed(2) + ' fee</span>';
        }
        jh += '</div></a>';
      });
      el('jobsContainer').innerHTML = jh;
    }
  }

  // Call admin render on loadAdmin
  // (renderAdminEmpJobs() called from within loadAdmin above)

  // ── Job Application Modal ──
  var applyModalHtml = '<div class="modal-overlay" id="jobApplyModal">'
    + '<div class="modal-box" style="max-width:48rem;">'
    + '<button class="modal-close" onclick="closeJobApply()">&times;</button>'
    + '<h2>Apply for this Job</h2>'
    + '<p class="subtitle">Send your application to the employer</p>'
    + '<div class="auth-error" id="applyError" style="display:none;"></div>'
    + '<div class="auth-success" id="applySuccess" style="display:none;"></div>'
    + '<form id="jobApplyForm">'
    + '<div class="form-group"><label>Your Name</label><input type="text" id="applyName" placeholder="John Doe" required></div>'
    + '<div class="form-group"><label>Your Email</label><input type="email" id="applyEmail" placeholder="you@example.com" required></div>'
    + '<div class="form-group"><label>Your Phone</label><input type="tel" id="applyPhone" placeholder="+1 555-0000"></div>'
    + '<div class="form-group"><label>Cover Letter / Message</label><textarea id="applyMessage" rows="5" placeholder="Tell the employer why you are a good fit for this role..." style="width:100%;padding:1rem 1.2rem;border:1px solid #D4D2D8;border-radius:0.4rem;font-size:1.5rem;font-family:inherit;resize:vertical;" required></textarea></div>'
    + '<input type="hidden" id="applyJobId"><input type="hidden" id="applyJobTitle">'
    + '<button type="submit" class="btn-submit" id="applySubmitBtn">Submit Application</button>'
    + '</form></div></div>';
  var applyModalEl = document.createElement('div');
  applyModalEl.innerHTML = applyModalHtml;
  document.body.appendChild(applyModalEl);

  window.openJobApply = function (jobId, jobTitle) {
    var modal = el('jobApplyModal');
    if (!modal) return;
    el('applyJobId').value = jobId;
    el('applyJobTitle').value = jobTitle;
    // Pre-fill user info if logged in
    var email = ls('tl_user_email');
    var name = ls('tl_user_name');
    if (email) el('applyEmail').value = email;
    if (name) el('applyName').value = name;
    el('applyError').style.display = 'none';
    el('applySuccess').style.display = 'none';
    el('applySubmitBtn').disabled = false;
    el('applySubmitBtn').textContent = 'Submit Application';
    modal.classList.add('open');
  };
  window.closeJobApply = function () {
    var modal = el('jobApplyModal');
    if (modal) modal.classList.remove('open');
  };
  window.toggleFavorite = function (jobId) {
    var email = ls('tl_user_email');
    if (!email) { window.location.href = 'login.html'; return; }
    var favs = lj('tl_fav_' + email) || [];
    var idx = favs.indexOf(String(jobId));
    if (idx > -1) { favs.splice(idx, 1); } else { favs.push(String(jobId)); }
    lj('tl_fav_' + email, favs);
    var btn = el('favBtn_' + jobId);
    if (btn) btn.innerHTML = idx > -1 ? '&#9734; Save to Favorites' : '&#9733; Saved';
    qsa('.fav-toggle').forEach(function (b) {
      if (b.getAttribute('data-fav-id') === String(jobId)) {
        b.innerHTML = idx > -1 ? '&#9734; Save to Favorites' : '&#9733; Saved';
        b.style.color = idx > -1 ? '#6B687A' : '#E85D3A';
      }
    });
  };
  // Close on overlay click
  document.addEventListener('click', function (e) {
    var modal = el('jobApplyModal');
    if (modal && e.target === modal) modal.classList.remove('open');
  });

  // Submit application
  var applyForm = el('jobApplyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var jobId = el('applyJobId').value;
      var jobTitle = el('applyJobTitle').value;
      var name = el('applyName').value;
      var email = el('applyEmail').value;
      var phone = el('applyPhone').value;
      var message = el('applyMessage').value;
      var err = el('applyError');
      var suc = el('applySuccess');
      err.style.display = 'none'; suc.style.display = 'none';
      if (!name || !email || !message) { err.textContent = 'Name, email, and message are required.'; err.style.display = 'block'; return; }
      // Find the employer for this job
      var empJobs = lj('tl_employer_jobs') || [];
      var job = null;
      empJobs.forEach(function (j) { if (j.id === jobId) job = j; });
      if (!job) { err.textContent = 'Job not found.'; err.style.display = 'block'; return; }
      var apps = lj('tl_job_applications') || [];
      apps.push({ jobId: jobId, jobTitle: jobTitle, employerEmail: job.employerEmail, name: name, email: email, phone: phone, message: message, date: new Date().toISOString() });
      lj('tl_job_applications', apps);
      el('applySubmitBtn').disabled = true;
      el('applySubmitBtn').textContent = 'Submitted!';
      suc.textContent = 'Application submitted! The employer will review and contact you at ' + email + '.';
      suc.style.display = 'block';
      applyForm.reset();
    });
  }

  // ── Employer Dashboard: Show Applicants ──
  function renderEmployerApplicants() {
    var empEmail = ls('tl_emp_logged_in');
    var container = el('employerApplicants');
    if (!container) return;
    if (!empEmail) { container.innerHTML = ''; return; }
    var empJobs = lj('tl_employer_jobs') || [];
    var myJobs = empJobs.filter(function (j) { return j.employerEmail === empEmail; });
    var allApps = lj('tl_job_applications') || [];
    var h = '';
    myJobs.forEach(function (j) {
      var jobApps = allApps.filter(function (a) { return a.jobId === j.id; });
      if (jobApps.length === 0) return;
      h += '<div style="margin-bottom:1.2rem;"><h3 style="font-size:1.5rem;margin-bottom:0.4rem;">' + j.title + ' <span style="font-weight:400;color:#6B687A;font-size:1.3rem;">(' + jobApps.length + ' applicant' + (jobApps.length > 1 ? 's' : '') + ')</span></h3>';
      jobApps.forEach(function (a) {
        h += '<div class="task-item" style="align-items:flex-start;"><div class="task-info"><div class="task-title">' + a.name + ' <span style="font-weight:400;font-size:1.2rem;color:#6B687A;">(' + a.email + ')</span></div>'
          + (a.phone ? '<div class="task-desc">Phone: ' + a.phone + '</div>' : '')
          + '<div class="task-desc" style="margin-top:0.4rem;background:#F7F5F0;padding:0.6rem 0.8rem;border-radius:0.4rem;border-left:3px solid #2E9E8F;">' + a.message + '</div>'
          + '<div style="font-size:1.1rem;color:#6B687A;margin-top:0.2rem;">Applied: ' + new Date(a.date).toLocaleDateString() + '</div>'
          + '</div></div>';
      });
      h += '</div>';
    });
    container.innerHTML = h || '<p style="color:#6B687A;font-size:1.3rem;">No applications received yet for your jobs.</p>';
  }

  // Hook into employer dashboard render
  var _origRenderEmpDash = renderEmployerDashboard;
  renderEmployerDashboard = function () {
    if (_origRenderEmpDash) _origRenderEmpDash();
    renderEmployerApplicants();
  };

  // Update the job posting form in company/index.html to be more structured
  // (the HTML is already updated with a full form; the data includes all fields)

});
