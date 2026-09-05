import nodemailer from 'nodemailer';
import prisma from '../../prisma/index.ts';
import { payslipsService } from '../payslips/payslips.service.ts';

export class MailService {
  private transporter: any;

  constructor() {
    // Configure transporter (reads from env or uses simulated test transport)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Local development test / stream transporter
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
      });
    }
  }

  /**
   * Sends an individual payslip with PDF attachment to an employee.
   */
  async sendPayslipEmail(
    toEmail: string,
    employeeName: string,
    payrunName: string,
    pdfBuffer: Buffer
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"PeoplePay360 Payroll" <payroll@peoplepay360.com>',
        to: toEmail,
        subject: `Your Payslip for ${payrunName}`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px;">
            <h2>Dear ${employeeName},</h2>
            <p>Your salary payslip for <strong>${payrunName}</strong> is now ready and attached to this email as a PDF document.</p>
            <p>Please review your salary breakdown and let the HR Payroll department know if you have any questions.</p>
            <br/>
            <p style="color: #64748b; font-size: 12px;">This is an automated notification from PeoplePay360 Platform.</p>
          </div>
        `,
        attachments: [
          {
            filename: `Payslip_${payrunName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      return true;
    } catch (error: any) {
      console.error(`Failed to send payslip email to ${toEmail}:`, error.message);
      return false;
    }
  }

  /**
   * Background batch dispatcher: generates PDF for each employee payslip and sends email asynchronously.
   */
  async dispatchPayrunEmails(payrunId: string): Promise<{ total: number; dispatched: number }> {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        payslips: {
          include: { employee: true },
        },
      },
    });

    if (!payrun) {
      throw new Error(`Payrun with ID '${payrunId}' not found`);
    }

    let dispatched = 0;

    for (const slip of payrun.payslips) {
      if (slip.employee?.email) {
        try {
          const { buffer } = await payslipsService.generatePdf(slip.id);
          const success = await this.sendPayslipEmail(
            slip.employee.email,
            `${slip.employee.firstName} ${slip.employee.lastName}`,
            payrun.name,
            buffer
          );
          if (success) dispatched++;
        } catch (err: any) {
          console.error(`Error generating/sending PDF for payslip ${slip.id}:`, err.message);
        }
      }
    }

    return {
      total: payrun.payslips.length,
      dispatched,
    };
  }
}

export const mailService = new MailService();
