
export interface Document {
  id: string;
  title: string;
  category: 'HR' | 'IT' | 'General';
  content: string;
}

export const documents: Document[] = [
  {
    id: 'hr-001',
    title: 'Parental Leave Policy',
    category: 'HR',
    content: 'InnovateCorp offers eligible employees up to 16 weeks of paid parental leave for the birth or adoption of a child. This policy applies to all full-time employees who have been with the company for at least one year. Leave can be taken consecutively or intermittently within the first year of the child\'s arrival. To apply, please submit a leave request to the HR department at least 30 days in advance.',
  },
  {
    id: 'it-001',
    title: 'Work From Home (WFH) IT Security Policy',
    category: 'IT',
    content: 'Employees working from home must ensure their home network is secured with a strong password (WPA2 or higher). All company-related work must be conducted on company-issued devices, which come with pre-installed security software. Connecting to public Wi-Fi for work is strictly prohibited. All devices must be protected by a password and auto-lock after 15 minutes of inactivity. For IT support, please create a ticket in the IT portal.',
  },
  {
    id: 'gen-001',
    title: 'Expense Reimbursement Guidelines',
    category: 'General',
    content: 'Employees can be reimbursed for pre-approved, business-related expenses. To claim reimbursement, submit an expense report with original receipts through the finance portal within 30 days of the expenditure. Eligible expenses include travel, meals with clients (up to $75 per person), and necessary office supplies. Alcohol expenses are not reimbursable. The finance team processes reimbursements within 10 business days.',
  },
  {
    id: 'hr-002',
    title: 'Code of Conduct',
    category: 'HR',
    content: 'All employees are expected to maintain a professional and respectful work environment. Harassment, discrimination, and bullying in any form are not tolerated. Employees should report any violations of this policy to their manager or the HR department without fear of retaliation. We are committed to an inclusive workplace for everyone.',
  },
];
