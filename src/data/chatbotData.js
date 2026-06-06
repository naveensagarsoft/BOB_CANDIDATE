export const initialMessages = [
  {
    id: 1,
    text: "Hi, we're here to help you.",
    sender: 'bot'
  },
  {
    id: 2,
    text: "Select one of the options below or type your query",
    sender: 'bot',
    type: 'options',
    options: [
      {
        text: 'What is the status of job application',
        type: 'applicationStatus',
        isHighlighted: true
      },
      {
        text: 'Current job opportunities',
        type: 'jobOpportunities',
        isHighlighted: false
      },
      {
        text: 'FAQ',
        type: 'faq',
        isHighlighted: false
      },
      {
        text: 'Other',
        type: 'other',
        isHighlighted: false
      }
    ]
  }
];

export const options = {
  main: {
    text: 'What would you like to know?',
    options: [
      { text: 'What is the status of job application', type: 'applicationStatus' },
      { text: 'Current job opportunities', type: 'jobOpportunities' },
      { text: 'FAQ', type: 'faq' },
      { text: 'Other', type: 'other' }
    ]
  },
  
  applicationStatus: {
    text: 'Let me help you check your application status. How would you like to proceed?',
    options: [
    ]
  },
  jobOpportunities: {
    text: 'Here are options for job opportunities:',
    options: [
      
    ]
  }
};

export const responses = {
  'Application process': 'Our application process involves submitting your resume, completing an online application, and going through our screening process. You can track your application status in your candidate portal.',
  'Interview process': 'Our interview process typically includes a phone screening, followed by one or more interviews with the hiring team. Some positions may require technical assessments or case studies.',
  'Required documents': 'You will need to submit your updated resume, a cover letter, and any relevant certifications. Some positions may require additional documents like a portfolio or writing samples.',
  'Job benefits': 'We offer competitive salaries, health insurance, retirement plans, paid time off, professional development opportunities, and a flexible work environment.',
  'Contact HR': 'You can reach our HR team at hr@company.com or call us at (555) 123-4567 during business hours (9:30 AM - 6:30 PM, Monday to Friday).',
};
