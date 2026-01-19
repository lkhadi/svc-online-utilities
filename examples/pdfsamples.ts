import { convertHTMLToPDF, useHTMLToPDF, generatePDFFromElement } from '../composables/useHTMLToPDF'
import {
  generateInvoiceTemplate,
  generateReportTemplate,
  generateLetterTemplate,
  generateResumeTemplate,
  generateCertificateTemplate,
  generateAgendaTemplate
} from '../composables/pdftemplates'
import type { InvoiceData, ReportData, LetterData, ResumeData, CertificateData, AgendaData } from '../composables/pdftemplates'

export async function convertSimpleHTML() {
  const html = `
    <div style="padding: 40px; font-family: Arial, sans-serif;">
      <h1>Sample Document</h1>
      <p>This is a simple HTML document that will be converted to PDF.</p>
      <p>You can use any HTML content including tables, lists, and images.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Email</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">John Doe</td>
          <td style="padding: 10px; border: 1px solid #ddd;">john@example.com</td>
        </tr>
      </table>
    </div>
  `

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: [20, 20, 20, 20],
    filename: 'sample-document.pdf',
    quality: 0.95
  })

  if (result.success) {
    console.log('PDF generated successfully')
    return result.data
  } else {
    console.error('PDF generation failed:', result.error)
    throw new Error(result.error)
  }
}

export async function generateInvoice() {
  const invoiceData: InvoiceData = {
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-19',
    dueDate: '2024-02-18',
    from: {
      name: 'Company ABC',
      address: '123 Business Street\nNew York, NY 10001',
      email: 'billing@companyabc.com',
      phone: '+1 (555) 123-4567'
    },
    to: {
      name: 'Client XYZ',
      address: '456 Client Avenue\nLos Angeles, CA 90001',
      email: 'client@xyz.com',
      phone: '+1 (555) 987-6543'
    },
    items: [
      {
        description: 'Web Development Services',
        quantity: 40,
        unitPrice: 75,
        total: 3000
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 100,
        total: 2000
      },
      {
        description: 'Hosting Setup',
        quantity: 1,
        unitPrice: 500,
        total: 500
      }
    ],
    subtotal: 5500,
    tax: 550,
    taxRate: 0.10,
    total: 6050,
    notes: 'Payment due within 30 days. Thank you for your business!',
    currency: '$'
  }

  const html = generateInvoiceTemplate(invoiceData)

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: [15, 15, 15, 15],
    filename: `invoice-${invoiceData.invoiceNumber}.pdf`
  })

  return result
}

export async function generateReport() {
  const reportData: ReportData = {
    title: 'Q4 2023 Performance Report',
    subtitle: 'Quarterly Business Review',
    date: '2024-01-19',
    author: 'Jane Smith',
    content: `
      <p>This report provides an overview of our performance during Q4 2023. Key metrics show significant growth across all departments.</p>
      <p>Revenue increased by 25% compared to Q3 2023, with customer satisfaction reaching an all-time high of 94%.</p>
    `,
    sections: [
      {
        title: 'Revenue Overview',
        content: '<p>Total revenue for Q4 reached $2.5 million, exceeding our target by 15%. The increase was driven by strong sales in the enterprise segment.</p>'
      },
      {
        title: 'Customer Growth',
        content: '<p>We acquired 500 new customers during Q4, bringing our total customer base to 5,000 active users.</p>'
      }
    ],
    tables: [
      {
        headers: ['Metric', 'Q3 2023', 'Q4 2023', 'Change'],
        rows: [
          ['Revenue', '$2.0M', '$2.5M', '+25%'],
          ['Customers', '4,500', '5,000', '+11%'],
          ['Satisfaction', '90%', '94%', '+4%']
        ]
      }
    ]
  }

  const html = generateReportTemplate(reportData)

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'portrait',
    filename: `report-${reportData.date}.pdf`
  })

  return result
}

export async function generateLetter() {
  const letterData: LetterData = {
    sender: {
      name: 'John Doe',
      address: '123 Business Street\nNew York, NY 10001',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567'
    },
    recipient: {
      name: 'Ms. Jane Smith',
      address: '456 Client Avenue\nLos Angeles, CA 90001'
    },
    date: 'January 19, 2024',
    subject: 'Partnership Proposal',
    salutation: 'Dear Ms. Smith',
    body: `
      <p>I hope this letter finds you well. I am writing to propose a strategic partnership between our organizations that could benefit both parties significantly.</p>
      <p>Based on our market research, there are clear synergies between our companies that we should explore. Our preliminary analysis suggests a potential 30% increase in market reach through collaboration.</p>
      <p>I would appreciate the opportunity to discuss this proposal further at your convenience. Please let me know if you would be available for a meeting next week.</p>
    `,
    closing: 'Sincerely',
    signature: 'John Doe\nCEO, Company ABC'
  }

  const html = generateLetterTemplate(letterData)

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'portrait',
    filename: 'partnership-proposal.pdf'
  })

  return result
}

export async function generateResume() {
  const resumeData: ResumeData = {
    personalInfo: {
      name: 'Alex Johnson',
      title: 'Full Stack Developer',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 234-5678',
      address: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      website: 'alexjohnson.dev'
    },
    summary: 'Experienced Full Stack Developer with 5+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code and innovative solutions.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Innovations Inc.',
        location: 'San Francisco, CA',
        startDate: '2021-06',
        endDate: 'Present',
        current: true,
        responsibilities: [
          'Led development of microservices architecture serving 1M+ users',
          'Implemented CI/CD pipelines reducing deployment time by 60%',
          'Mentored team of 4 junior developers'
        ]
      },
      {
        title: 'Full Stack Developer',
        company: 'Digital Solutions LLC',
        location: 'Austin, TX',
        startDate: '2018-09',
        endDate: '2021-05',
        responsibilities: [
          'Developed and maintained 15+ client-facing applications',
          'Optimized database queries improving performance by 40%',
          'Collaborated with UX team to improve user experience'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Technology',
        location: 'Boston, MA',
        graduationDate: 'May 2018',
        gpa: '3.8/4.0'
      }
    ],
    skills: [
      'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js',
      'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS',
      'Git', 'Agile', 'REST APIs', 'GraphQL'
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Professional' }
    ]
  }

  const html = generateResumeTemplate(resumeData)

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'portrait',
    filename: 'alex-johnson-resume.pdf'
  })

  return result
}

export async function generateCertificate() {
  const certificateData: CertificateData = {
    title: 'Achievement',
    recipientName: 'Sarah Williams',
    description: 'For outstanding performance and dedication to excellence in completing the Advanced Web Development Program. This achievement demonstrates exceptional skill and commitment to continuous learning.',
    date: 'January 19, 2024',
    issuer: 'Tech Academy',
    signature: 'Dr. Michael Brown\nDirector of Education'
  }

  const html = generateCertificateTemplate(certificateData)

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'landscape',
    margin: [20, 20, 20, 20],
    filename: `certificate-${certificateData.recipientName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  })

  return result
}

export async function generateAgenda() {
  const agendaData: AgendaData = {
    title: 'Annual Planning Meeting',
    date: 'January 25, 2024',
    time: '9:00 AM - 5:00 PM',
    location: 'Conference Room A, Headquarters',
    attendees: [
      'John Doe - CEO',
      'Jane Smith - CFO',
      'Alex Johnson - CTO',
      'Sarah Williams - VP Marketing',
      'Michael Brown - Director of Operations'
    ],
    items: [
      {
        time: '9:00 AM - 9:15 AM',
        topic: 'Welcome and Introductions',
        presenter: 'John Doe',
        duration: '15 min'
      },
      {
        time: '9:15 AM - 10:30 AM',
        topic: '2023 Performance Review',
        presenter: 'Jane Smith',
        duration: '1h 15min'
      },
      {
        time: '10:30 AM - 10:45 AM',
        topic: 'Break',
        duration: '15 min'
      },
      {
        time: '10:45 AM - 12:00 PM',
        topic: '2024 Strategic Goals',
        presenter: 'John Doe',
        duration: '1h 15min'
      },
      {
        time: '12:00 PM - 1:00 PM',
        topic: 'Lunch',
        duration: '1 hour'
      },
      {
        time: '1:00 PM - 2:30 PM',
        topic: 'Department Breakout Sessions',
        duration: '1h 30min'
      },
      {
        time: '2:30 PM - 3:30 PM',
        topic: 'Q&A and Discussion',
        presenter: 'All',
        duration: '1 hour'
      },
      {
        time: '3:30 PM - 4:00 PM',
        topic: 'Action Items and Next Steps',
        presenter: 'Michael Brown',
        duration: '30 min'
      },
      {
        time: '4:00 PM - 5:00 PM',
        topic: 'Closing Remarks',
        presenter: 'John Doe',
        duration: '1 hour'
      }
    ],
    notes: 'Please review the 2023 performance report prior to the meeting. Bring any questions or topics you would like to discuss.'
  }

  const html = generateAgendaTemplate(agendaData)

  const result = await convertHTMLToPDF(html, {
    pageSize: 'a4',
    orientation: 'portrait',
    filename: `agenda-${agendaData.date}.pdf`
  })

  return result
}

export function usePDFGenerator() {
  const { isProcessing, error, progress, generatePDF, validateHTML, sanitize } = useHTMLToPDF()

  return {
    isProcessing,
    error,
    progress,
    generatePDF,
    validateHTML,
    sanitize,
    convertSimpleHTML,
    generateInvoice,
    generateReport,
    generateLetter,
    generateResume,
    generateCertificate,
    generateAgenda
  }
}
