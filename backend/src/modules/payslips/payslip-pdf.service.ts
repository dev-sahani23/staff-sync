import puppeteer from 'puppeteer';
import { generatePayslipHtml, PayslipTemplateData } from './payslip-template.ts';

export class PayslipPdfService {
  /**
   * Generates a binary PDF buffer from the payslip data using headless Puppeteer.
   */
  async generatePdfBuffer(data: PayslipTemplateData): Promise<Buffer> {
    const htmlContent = generatePayslipHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
      });

      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
      });

      return Buffer.from(pdfUint8Array);
    } finally {
      await browser.close();
    }
  }
}

export const payslipPdfService = new PayslipPdfService();
