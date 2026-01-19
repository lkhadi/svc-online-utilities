export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  from: {
    name: string
    address: string
    email: string
    phone: string
  }
  to: {
    name: string
    address: string
    email: string
    phone: string
  }
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax: number
  taxRate: number
  total: number
  notes?: string
  currency?: string
}

export interface ReportData {
  title: string
  subtitle?: string
  date: string
  author: string
  content: string
  sections?: {
    title: string
    content: string
  }[]
  tables?: {
    headers: string[]
    rows: string[][]
  }[]
  charts?: {
    title: string
    description?: string
  }[]
}

export interface LetterData {
  sender: {
    name: string
    address: string
    email?: string
    phone?: string
  }
  recipient: {
    name: string
    address: string
  }
  date: string
  subject?: string
  salutation: string
  body: string
  closing: string
  signature: string
}

export interface ResumeData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    address: string
    linkedin?: string
    website?: string
  }
  summary: string
  experience: {
    title: string
    company: string
    location: string
    startDate: string
    endDate?: string
    current?: boolean
    responsibilities: string[]
  }[]
  education: {
    degree: string
    school: string
    location: string
    graduationDate: string
    gpa?: string
  }[]
  skills: string[]
  languages?: {
    language: string
    proficiency: string
  }[]
}

export interface CertificateData {
  title: string
  recipientName: string
  description: string
  date: string
  issuer: string
  signature: string
  logoUrl?: string
}

export interface AgendaData {
  title: string
  date: string
  time: string
  location: string
  attendees: string[]
  items: {
    time: string
    topic: string
    presenter?: string
    duration: string
  }[]
  notes?: string
}

export function generateInvoiceTemplate(data: InvoiceData): string {
  const currency = data.currency || '$'

  return `
    <div class="invoice-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; page-break-inside: avoid;">
        <div class="from" style="flex: 1;">
          <h1 style="margin: 0 0 10px 0; color: #2c3e50;">INVOICE</h1>
          <div style="margin-bottom: 5px;"><strong>${data.from.name}</strong></div>
          <div style="white-space: pre-line; font-size: 14px;">${data.from.address}</div>
          <div style="font-size: 14px;">${data.from.email}</div>
          <div style="font-size: 14px;">${data.from.phone}</div>
        </div>
        <div class="invoice-info" style="text-align: right; flex: 1;">
          <div style="font-size: 14px; margin-bottom: 5px;"><strong>Invoice #:</strong> ${data.invoiceNumber}</div>
          <div style="font-size: 14px; margin-bottom: 5px;"><strong>Date:</strong> ${data.date}</div>
          <div style="font-size: 14px;"><strong>Due Date:</strong> ${data.dueDate}</div>
        </div>
      </div>

      <div class="to" style="margin-bottom: 40px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Bill To:</h3>
        <div style="font-weight: bold; margin-bottom: 5px;">${data.to.name}</div>
        <div style="white-space: pre-line; font-size: 14px;">${data.to.address}</div>
        <div style="font-size: 14px;">${data.to.email}</div>
        <div style="font-size: 14px;">${data.to.phone}</div>
      </div>

      <div class="items" style="margin-bottom: 40px; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #2c3e50; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.description}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">${currency}${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">${currency}${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="totals" style="display: flex; justify-content: flex-end; margin-bottom: 40px; page-break-inside: avoid;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
            <span>Subtotal:</span>
            <span>${currency}${data.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
            <span>Tax (${(data.taxRate * 100).toFixed(0)}%):</span>
            <span>${currency}${data.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; background-color: #2c3e50; color: white; font-weight: bold;">
            <span>Total:</span>
            <span>${currency}${data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${data.notes ? `
        <div class="notes" style="margin-top: 40px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Notes:</h3>
          <p style="margin: 0; white-space: pre-line; font-size: 14px;">${data.notes}</p>
        </div>
      ` : ''}
    </div>
  `
}

export function generateReportTemplate(data: ReportData): string {
  return `
    <div class="report-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <div class="header" style="text-align: center; margin-bottom: 40px; page-break-after: always;">
        <h1 style="margin: 0 0 10px 0; color: #2c3e50;">${data.title}</h1>
        ${data.subtitle ? `<h2 style="margin: 0 0 20px 0; color: #7f8c8d; font-weight: normal;">${data.subtitle}</h2>` : ''}
        <div style="margin-top: 20px; color: #7f8c8d;">
          <div><strong>Date:</strong> ${data.date}</div>
          <div><strong>Author:</strong> ${data.author}</div>
        </div>
      </div>

      <div class="content" style="line-height: 1.6;">
        ${data.content}
      </div>

      ${data.sections && data.sections.length > 0 ? `
        <div class="sections" style="margin-top: 40px;">
          ${data.sections.map(section => `
            <div class="section" style="margin-bottom: 30px; page-break-inside: avoid;">
              <h3 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">${section.title}</h3>
              <div style="line-height: 1.6;">${section.content}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${data.tables && data.tables.length > 0 ? `
        <div class="tables" style="margin-top: 40px;">
          ${data.tables.map((table, index) => `
            <div class="table-container" style="margin-bottom: 30px; page-break-inside: avoid;">
              <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Table ${index + 1}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #2c3e50; color: white;">
                    ${table.headers.map(header => `
                      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">${header}</th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${table.rows.map(row => `
                    <tr>
                      ${row.map(cell => `
                        <td style="padding: 12px; border: 1px solid #ddd;">${cell}</td>
                      `).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `
}

export function generateLetterTemplate(data: LetterData): string {
  return `
    <div class="letter-container" style="font-family: 'Times New Roman', Times, serif; max-width: 700px; margin: 0 auto; padding: 50px; color: #333; line-height: 1.6;">
      <div class="sender" style="margin-bottom: 40px; text-align: right; font-size: 14px;">
        <div style="font-weight: bold; font-size: 16px;">${data.sender.name}</div>
        <div style="white-space: pre-line;">${data.sender.address}</div>
        ${data.sender.email ? `<div>${data.sender.email}</div>` : ''}
        ${data.sender.phone ? `<div>${data.sender.phone}</div>` : ''}
      </div>

      <div class="date" style="margin-bottom: 40px;">
        ${data.date}
      </div>

      <div class="recipient" style="margin-bottom: 40px;">
        <div style="font-weight: bold;">${data.recipient.name}</div>
        <div style="white-space: pre-line;">${data.recipient.address}</div>
      </div>

      ${data.subject ? `
        <div class="subject" style="margin-bottom: 20px;">
          <strong>Subject: ${data.subject}</strong>
        </div>
      ` : ''}

      <div class="salutation" style="margin-bottom: 20px;">
        ${data.salutation},
      </div>

      <div class="body" style="margin-bottom: 30px; text-align: justify;">
        ${data.body}
      </div>

      <div class="closing" style="margin-bottom: 40px;">
        ${data.closing},
      </div>

      <div class="signature" style="margin-top: 60px;">
        <div>${data.signature}</div>
      </div>
    </div>
  `
}

export function generateResumeTemplate(data: ResumeData): string {
  return `
    <div class="resume-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <div class="header" style="text-align: center; margin-bottom: 40px; page-break-inside: avoid;">
        <h1 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 32px;">${data.personalInfo.name}</h1>
        <div style="font-size: 18px; color: #7f8c8d; margin-bottom: 15px;">${data.personalInfo.title}</div>
        <div style="font-size: 14px; color: #7f8c8d;">
          ${data.personalInfo.email} • ${data.personalInfo.phone} • ${data.personalInfo.address}
          ${data.personalInfo.linkedin ? ` • ${data.personalInfo.linkedin}` : ''}
          ${data.personalInfo.website ? ` • ${data.personalInfo.website}` : ''}
        </div>
      </div>

      <div class="summary" style="margin-bottom: 30px; page-break-inside: avoid;">
        <h2 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Professional Summary</h2>
        <p style="margin: 0; line-height: 1.6;">${data.summary}</p>
      </div>

      <div class="experience" style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Work Experience</h2>
        ${data.experience.map(exp => `
          <div style="margin-bottom: 25px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 style="margin: 0; color: #2c3e50;">${exp.title}</h3>
              <div style="font-size: 14px; color: #7f8c8d;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
            </div>
            <div style="font-weight: bold; margin: 5px 0;">${exp.company} | ${exp.location}</div>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              ${exp.responsibilities.map(res => `<li>${res}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div class="education" style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Education</h2>
        ${data.education.map(edu => `
          <div style="margin-bottom: 15px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 style="margin: 0; color: #2c3e50;">${edu.degree}</h3>
              <div style="font-size: 14px; color: #7f8c8d;">${edu.graduationDate}</div>
            </div>
            <div style="font-weight: bold;">${edu.school} | ${edu.location}</div>
            ${edu.gpa ? `<div style="font-size: 14px; color: #7f8c8d;">GPA: ${edu.gpa}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="skills" style="margin-bottom: 30px; page-break-inside: avoid;">
        <h2 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Skills</h2>
        <p style="margin: 0; line-height: 1.6;">${data.skills.join(' • ')}</p>
      </div>

      ${data.languages && data.languages.length > 0 ? `
        <div class="languages" style="margin-bottom: 30px; page-break-inside: avoid;">
          <h2 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Languages</h2>
          <p style="margin: 0; line-height: 1.6;">
            ${data.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(' • ')}
          </p>
        </div>
      ` : ''}
    </div>
  `
}

export function generateCertificateTemplate(data: CertificateData): string {
  return `
    <div class="certificate-container" style="font-family: 'Times New Roman', Times, serif; max-width: 900px; margin: 0 auto; padding: 60px; text-align: center; color: #333; border: 10px solid #2c3e50;">
      <div class="header" style="margin-bottom: 40px; page-break-inside: avoid;">
        ${data.logoUrl ? `
          <img src="${data.logoUrl}" alt="Logo" style="max-width: 150px; margin-bottom: 20px;" />
        ` : ''}
        <h1 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 48px;">Certificate of ${data.title}</h1>
        <div style="border-bottom: 3px solid #2c3e50; width: 200px; margin: 20px auto;"></div>
      </div>

      <div class="recipient" style="margin-bottom: 30px; page-break-inside: avoid;">
        <p style="font-size: 18px; margin: 0 0 10px 0; color: #7f8c8d;">This is to certify that</p>
        <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 36px;">${data.recipientName}</h2>
        <p style="font-size: 18px; margin: 0 0 20px 0; color: #7f8c8d;">has successfully completed</p>
      </div>

      <div class="description" style="margin-bottom: 40px; page-break-inside: avoid;">
        <p style="font-size: 20px; line-height: 1.6; margin: 0; color: #2c3e50;">${data.description}</p>
      </div>

      <div class="footer" style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid;">
        <div class="date" style="text-align: center; flex: 1;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 10px; padding: 10px;">${data.date}</div>
          <div style="font-size: 14px; color: #7f8c8d;">Date</div>
        </div>
        <div class="signature" style="text-align: center; flex: 1; margin: 0 50px;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 10px; padding: 10px; font-family: cursive; font-size: 20px;">${data.signature}</div>
          <div style="font-size: 14px; color: #7f8c8d;">Signature</div>
        </div>
        <div class="issuer" style="text-align: center; flex: 1;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 10px; padding: 10px;">${data.issuer}</div>
          <div style="font-size: 14px; color: #7f8c8d;">Issued By</div>
        </div>
      </div>
    </div>
  `
}

export function generateAgendaTemplate(data: AgendaData): string {
  return `
    <div class="agenda-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <div class="header" style="text-align: center; margin-bottom: 40px; page-break-after: always;">
        <h1 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 32px;">${data.title}</h1>
        <div style="margin-top: 20px; color: #7f8c8d; font-size: 16px;">
          <div><strong>Date:</strong> ${data.date}</div>
          <div><strong>Time:</strong> ${data.time}</div>
          <div><strong>Location:</strong> ${data.location}</div>
        </div>
      </div>

      <div class="attendees" style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Attendees</h2>
        <ul style="margin: 0; padding-left: 20px;">
          ${data.attendees.map(attendee => `<li>${attendee}</li>`).join('')}
        </ul>
      </div>

      <div class="agenda-items" style="margin-bottom: 40px;">
        <h2 style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Agenda</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #2c3e50; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 15%;">Time</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 50%;">Topic</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 20%;">Presenter</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 15%;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.time}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.topic}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.presenter || '-'}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${data.notes ? `
        <div class="notes" style="margin-top: 40px; page-break-inside: avoid;">
          <h2 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 5px;">Notes</h2>
          <p style="margin: 0; white-space: pre-line; line-height: 1.6;">${data.notes}</p>
        </div>
      ` : ''}
    </div>
  `
}

export function generateBlankTemplate(): string {
  return `
    <div class="blank-template" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <div style="min-height: 800px; border: 1px dashed #ccc; padding: 40px;">
        <p style="color: #7f8c8d; text-align: center; margin-top: 350px;">Start typing your content here...</p>
      </div>
    </div>
  `
}

export function generateSimpleTemplate(content: string): string {
  return `
    <div class="simple-template" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; line-height: 1.6;">
      ${content}
    </div>
  `
}
