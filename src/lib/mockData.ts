export const mockEmails = [
  {
    id: "1",
    senderName: "Jane Holmes",
    senderEmail: "heyjane1997@gmail.com",
    subject: "Action Required: Unpaid Invoice",
    preview: "This is a friendly reminder that your invoice #12345 is now due for payment. Please settle it...",
    date: "15 Feb 2025, 10:43 Pm",
    isRead: false,
    label: "Important",
    body: `Dear Tomas Adams,

I hope this message finds you well.

This is a friendly reminder that your invoice #12345 is now due for payment. We kindly request that you settle the amount of $500.00 by March 10, 2025, to avoid any late fees or disruptions to services.

Please find the invoice attached for your reference. If you have already processed this payment, please disregard this notice. Otherwise, we would appreciate it if you could take the necessary steps to settle the balance at your earliest convenience.

If you have any questions or require further details, feel free to reach out, and we will be happy to assist you.

Thank you for your prompt attention to this matter.

Best regards,
Jane Holmes
Accounts Manager
Cosmos

Phone: (123) 456-7890
Email: jane.holmes@cosmos.com`,
    attachments: [
      { name: "Invoice.pdf", size: "12MB", type: "pdf" },
      { name: "Screenshot.jpg", size: "23KB", type: "jpg" },
      { name: "Screenrecord.mp4", size: "164MB", type: "mp4" }
    ],
    aiSummary: "This message is highly important. You have an unpaid invoice of $500.00 due by March 10, 2025."
  },
  {
    id: "2",
    senderName: "Tech Support",
    senderEmail: "support@system.io",
    subject: "System Maintenance Scheduled",
    preview: "Our system will undergo scheduled maintenance from 2 AM to 4 AM on Sunday...",
    date: "1 hour ago",
    isRead: true,
    label: "Update",
    body: "System maintenance body.",
    attachments: [{ name: "Document.pdf", size: "1MB", type: "pdf" }],
  },
  {
    id: "3",
    senderName: "Mark Davis",
    senderEmail: "mdavis@company.com",
    subject: "Meeting Reminder: 3 PM Today",
    preview: "Just a reminder about your meeting today at 3 PM. Please have the report ready.",
    date: "2 hours ago",
    isRead: false,
    label: "Work",
    body: "Meeting reminder body.",
    attachments: [],
  }
];
