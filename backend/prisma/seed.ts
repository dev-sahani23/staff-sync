import prisma from '../src/prisma/index.ts';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

async function seed() {
  console.log('🌱 Starting database seed for PeoplePay360 with 100+ Users...');

  // 1. Clear existing records in proper relational order
  await prisma.payslipLine.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.salaryRule.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveAllocation.deleteMany();
  await prisma.timeOffType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.scheduleLine.deleteMany();
  await prisma.workingSchedule.deleteMany();
  await prisma.employee.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Working Schedule
  const schedule = await prisma.workingSchedule.create({
    data: {
      name: 'Standard 40h Work Week',
      type: 'FULL_TIME',
      lines: {
        create: [1, 2, 3, 4, 5].map((day) => ({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          breakMinutes: 60,
        })),
      },
    },
  });

  // 3. Create Salary Structure & Rules
  const salaryStructure = await prisma.salaryStructure.create({
    data: {
      name: 'Standard Indian Corporate Structure',
      status: 'ACTIVE',
      rules: {
        create: [
          {
            code: 'BASIC',
            name: 'Basic Salary',
            category: 'BASIC',
            sequence: 1,
            computeMethod: 'PERCENTAGE',
            amount: 50,
            baseCode: 'WAGE',
          },
          {
            code: 'HRA',
            name: 'House Rent Allowance',
            category: 'ALLOWANCE',
            sequence: 2,
            computeMethod: 'PERCENTAGE',
            amount: 40,
            baseCode: 'BASIC',
          },
          {
            code: 'CONVEYANCE',
            name: 'Conveyance Allowance',
            category: 'ALLOWANCE',
            sequence: 3,
            computeMethod: 'FIXED',
            amount: 3000,
          },
          {
            code: 'SPECIAL',
            name: 'Special Allowance',
            category: 'ALLOWANCE',
            sequence: 4,
            computeMethod: 'FORMULA',
            formula: 'WAGE - BASIC - HRA - CONVEYANCE',
          },
          {
            code: 'PF',
            name: 'Provident Fund',
            category: 'DEDUCTION',
            sequence: 5,
            computeMethod: 'PERCENTAGE',
            amount: 12,
            baseCode: 'BASIC',
          },
          {
            code: 'PROF_TAX',
            name: 'Professional Tax',
            category: 'DEDUCTION',
            sequence: 6,
            computeMethod: 'FIXED',
            amount: 200,
          },
          {
            code: 'NET',
            name: 'Net Salary',
            category: 'NET',
            sequence: 7,
            computeMethod: 'FORMULA',
            formula: 'BASIC + HRA + CONVEYANCE + SPECIAL - PF - PROF_TAX',
          },
        ],
      },
    },
  });

  // 4. Create Standard Time Off Types
  await prisma.timeOffType.createMany({
    data: [
      { name: 'Paid Time Off (PTO)', unit: 'DAYS', requiresAllocation: true, isPayrollIntegrated: true },
      { name: 'Sick Leave', unit: 'DAYS', requiresAllocation: true, isPayrollIntegrated: true },
      { name: 'Casual Leave', unit: 'DAYS', requiresAllocation: false, isPayrollIntegrated: true },
      { name: 'Maternity/Paternity Leave', unit: 'DAYS', requiresAllocation: true, isPayrollIntegrated: true },
    ],
  });

  // 5. Create System Admin (Global Credential)
  await prisma.user.create({
    data: {
      email: 'admin@peoplepay.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 6. Create 10 HR Staff & Users (Preserving original payroll.manager & amit.patel)
  const hrStaffData = [
    {
      firstName: 'Vikram',
      lastName: 'Singhania',
      email: 'payroll.manager@peoplepay.com', // PRESERVED ORIGINAL
      phone: '+91 9820011001',
      jobPosition: 'Payroll Operations Director',
      role: Role.HR_PAYROLL_MANAGER,
      wage: 150000,
      bankName: 'HDFC Bank',
      accountNumber: '50100411223344',
    },
    {
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@peoplepay.com', // PRESERVED ORIGINAL
      phone: '+91 9876543212',
      jobPosition: 'HR Specialist',
      role: Role.HR_MANAGER,
      wage: 65000,
      bankName: null, // Intentionally null for payroll warning testing
      accountNumber: null,
    },
    {
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      email: 'ananya.deshmukh@peoplepay.com',
      phone: '+91 9820011003',
      jobPosition: 'Chief People Officer',
      role: Role.HR_MANAGER,
      wage: 180000,
      bankName: 'ICICI Bank',
      accountNumber: '001101889901',
    },
    {
      firstName: 'Kavita',
      lastName: 'Nair',
      email: 'kavita.nair@peoplepay.com',
      phone: '+91 9820011004',
      jobPosition: 'Head of Talent Acquisition',
      role: Role.HR_MANAGER,
      wage: 120000,
      bankName: 'State Bank of India',
      accountNumber: '302001992233',
    },
    {
      firstName: 'Rohit',
      lastName: 'Singh',
      email: 'rohit.singh@peoplepay.com',
      phone: '+91 9820011005',
      jobPosition: 'Compensation & Benefits Lead',
      role: Role.HR_PAYROLL_MANAGER,
      wage: 110000,
      bankName: 'Axis Bank',
      accountNumber: '912010034455',
    },
    {
      firstName: 'Sneha',
      lastName: 'Kulkarni',
      email: 'sneha.kulkarni@peoplepay.com',
      phone: '+91 9820011006',
      jobPosition: 'Senior HR Business Partner',
      role: Role.HR_MANAGER,
      wage: 95000,
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '601192837465',
    },
    {
      firstName: 'Manish',
      lastName: 'Joshi',
      email: 'manish.joshi@peoplepay.com',
      phone: '+91 9820011007',
      jobPosition: 'People Operations Lead',
      role: Role.HR_MANAGER,
      wage: 90000,
      bankName: 'HDFC Bank',
      accountNumber: '501005667788',
    },
    {
      firstName: 'Pooja',
      lastName: 'Iyer',
      email: 'pooja.iyer@peoplepay.com',
      phone: '+91 9820011008',
      jobPosition: 'Senior Payroll Specialist',
      role: Role.HR_PAYROLL_USER,
      wage: 75000,
      bankName: 'ICICI Bank',
      accountNumber: '001102778899',
    },
    {
      firstName: 'Deepak',
      lastName: 'Malhotra',
      email: 'deepak.malhotra@peoplepay.com',
      phone: '+91 9820011009',
      jobPosition: 'HR Compliance Officer',
      role: Role.HR_MANAGER,
      wage: 85000,
      bankName: 'State Bank of India',
      accountNumber: '304001887766',
    },
    {
      firstName: 'Shweta',
      lastName: 'Bansal',
      email: 'shweta.bansal@peoplepay.com',
      phone: '+91 9820011010',
      jobPosition: 'HR & Payroll Analyst',
      role: Role.HR_PAYROLL_USER,
      wage: 60000,
      bankName: 'Axis Bank',
      accountNumber: '913010056677',
    },
  ];

  console.log(`Creating 10 HR Staff Members and Users...`);
  for (const hr of hrStaffData) {
    const emp = await prisma.employee.create({
      data: {
        firstName: hr.firstName,
        lastName: hr.lastName,
        email: hr.email,
        phone: hr.phone,
        jobPosition: hr.jobPosition,
        department: 'Human Resources',
        status: 'ACTIVE',
        scheduleId: schedule.id,
        bankName: hr.bankName,
        accountNumber: hr.accountNumber,
      },
    });

    await prisma.user.create({
      data: {
        email: hr.email,
        passwordHash,
        role: hr.role,
        employeeId: emp.id,
      },
    });

    await prisma.contract.create({
      data: {
        employeeId: emp.id,
        salaryStructureId: salaryStructure.id,
        wage: hr.wage,
        startDate: new Date('2025-06-01'),
        status: 'ACTIVE',
        department: 'Human Resources',
        jobPosition: hr.jobPosition,
      },
    });
  }

  // 7. Define 100 Employees across diverse departments
  // Preserving original rahul.sharma and priya.verma as employee #1 and #2
  const employeesDataRaw: Array<{
    firstName: string;
    lastName: string;
    email: string;
    jobPosition: string;
    department: string;
    wage: number;
    bankName: string;
  }> = [
    // 1. Preserved Rahul Sharma
    {
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.sharma@peoplepay.com',
      jobPosition: 'Senior Software Engineer',
      department: 'Engineering',
      wage: 80000,
      bankName: 'HDFC Bank',
    },
    // 2. Preserved Priya Verma
    {
      firstName: 'Priya',
      lastName: 'Verma',
      email: 'priya.verma@peoplepay.com',
      jobPosition: 'Product Designer',
      department: 'Design',
      wage: 65000,
      bankName: 'ICICI Bank',
    },
    // Engineering (25 more)
    { firstName: 'Aarav', lastName: 'Gupta', email: 'aarav.gupta@peoplepay.com', jobPosition: 'Principal Architect', department: 'Engineering', wage: 165000, bankName: 'HDFC Bank' },
    { firstName: 'Siddharth', lastName: 'Rao', email: 'siddharth.rao@peoplepay.com', jobPosition: 'Engineering Manager', department: 'Engineering', wage: 140000, bankName: 'ICICI Bank' },
    { firstName: 'Aditya', lastName: 'Chopra', email: 'aditya.chopra@peoplepay.com', jobPosition: 'DevOps Lead', department: 'Engineering', wage: 115000, bankName: 'State Bank of India' },
    { firstName: 'Rohan', lastName: 'Mehta', email: 'rohan.mehta@peoplepay.com', jobPosition: 'Senior Backend Engineer', department: 'Engineering', wage: 105000, bankName: 'Axis Bank' },
    { firstName: 'Varun', lastName: 'Reddy', email: 'varun.reddy@peoplepay.com', jobPosition: 'Staff Data Engineer', department: 'Engineering', wage: 125000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Karthik', lastName: 'Subramanian', email: 'karthik.subramanian@peoplepay.com', jobPosition: 'Cloud Infrastructure Specialist', department: 'Engineering', wage: 110000, bankName: 'HDFC Bank' },
    { firstName: 'Gaurav', lastName: 'Bhat', email: 'gaurav.bhat@peoplepay.com', jobPosition: 'Frontend Architect', department: 'Engineering', wage: 115000, bankName: 'ICICI Bank' },
    { firstName: 'Nikhil', lastName: 'Kapoor', email: 'nikhil.kapoor@peoplepay.com', jobPosition: 'Full Stack Engineer', department: 'Engineering', wage: 85000, bankName: 'State Bank of India' },
    { firstName: 'Arjun', lastName: 'Pandey', email: 'arjun.pandey@peoplepay.com', jobPosition: 'Backend Developer', department: 'Engineering', wage: 75000, bankName: 'Axis Bank' },
    { firstName: 'Abhishek', lastName: 'Mishra', email: 'abhishek.mishra@peoplepay.com', jobPosition: 'Mobile App Lead (iOS/Android)', department: 'Engineering', wage: 95000, bankName: 'HDFC Bank' },
    { firstName: 'Sachin', lastName: 'Saxena', email: 'sachin.saxena@peoplepay.com', jobPosition: 'Site Reliability Engineer', department: 'Engineering', wage: 90000, bankName: 'ICICI Bank' },
    { firstName: 'Prateek', lastName: 'Menon', email: 'prateek.menon@peoplepay.com', jobPosition: 'QA Automation Lead', department: 'Engineering', wage: 82000, bankName: 'State Bank of India' },
    { firstName: 'Harish', lastName: 'Bose', email: 'harish.bose@peoplepay.com', jobPosition: 'Security Engineer', department: 'Engineering', wage: 98000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Vikas', lastName: 'Chatterjee', email: 'vikas.chatterjee@peoplepay.com', jobPosition: 'Frontend Engineer', department: 'Engineering', wage: 72000, bankName: 'HDFC Bank' },
    { firstName: 'Akash', lastName: 'Dutta', email: 'akash.dutta@peoplepay.com', jobPosition: 'Junior Backend Developer', department: 'Engineering', wage: 55000, bankName: 'ICICI Bank' },
    { firstName: 'Tarun', lastName: 'Ghosh', email: 'tarun.ghosh@peoplepay.com', jobPosition: 'Database Administrator', department: 'Engineering', wage: 88000, bankName: 'Axis Bank' },
    { firstName: 'Mohit', lastName: 'Sen', email: 'mohit.sen@peoplepay.com', jobPosition: 'SDET II', department: 'Engineering', wage: 68000, bankName: 'State Bank of India' },
    { firstName: 'Vishal', lastName: 'Pillai', email: 'vishal.pillai@peoplepay.com', jobPosition: 'Systems Engineer', department: 'Engineering', wage: 64000, bankName: 'HDFC Bank' },
    { firstName: 'Ashish', lastName: 'Acharya', email: 'ashish.acharya@peoplepay.com', jobPosition: 'Frontend Engineer', department: 'Engineering', wage: 70000, bankName: 'ICICI Bank' },
    { firstName: 'Hemant', lastName: 'Hegde', email: 'hemant.hegde@peoplepay.com', jobPosition: 'Data Analyst', department: 'Engineering', wage: 74000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Vivek', lastName: 'Shetty', email: 'vivek.shetty@peoplepay.com', jobPosition: 'API Integration Developer', department: 'Engineering', wage: 76000, bankName: 'Axis Bank' },
    { firstName: 'Mayank', lastName: 'Pawar', email: 'mayank.pawar@peoplepay.com', jobPosition: 'Software Engineer II', department: 'Engineering', wage: 78000, bankName: 'HDFC Bank' },
    { firstName: 'Sumit', lastName: 'Deshpande', email: 'sumit.deshpande@peoplepay.com', jobPosition: 'Full Stack Engineer', department: 'Engineering', wage: 72000, bankName: 'State Bank of India' },
    { firstName: 'Pankaj', lastName: 'Gokhale', email: 'pankaj.gokhale@peoplepay.com', jobPosition: 'QA Engineer', department: 'Engineering', wage: 58000, bankName: 'ICICI Bank' },
    { firstName: 'Kunal', lastName: 'Kadam', email: 'kunal.kadam@peoplepay.com', jobPosition: 'Junior Frontend Developer', department: 'Engineering', wage: 52000, bankName: 'HDFC Bank' },

    // Design (11 more)
    { firstName: 'Meera', lastName: 'Soni', email: 'meera.soni@peoplepay.com', jobPosition: 'Head of Design', department: 'Design', wage: 135000, bankName: 'ICICI Bank' },
    { firstName: 'Tanvi', lastName: 'Shinde', email: 'tanvi.shinde@peoplepay.com', jobPosition: 'Senior UI/UX Designer', department: 'Design', wage: 88000, bankName: 'HDFC Bank' },
    { firstName: 'Isha', lastName: 'Chavan', email: 'isha.chavan@peoplepay.com', jobPosition: 'Design Systems Lead', department: 'Design', wage: 92000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Nandini', lastName: 'More', email: 'nandini.more@peoplepay.com', jobPosition: 'Product Designer II', department: 'Design', wage: 68000, bankName: 'State Bank of India' },
    { firstName: 'Aarti', lastName: 'Salunkhe', email: 'aarti.salunkhe@peoplepay.com', jobPosition: 'UX Researcher', department: 'Design', wage: 72000, bankName: 'Axis Bank' },
    { firstName: 'Pallavi', lastName: 'Yadav', email: 'pallavi.yadav@peoplepay.com', jobPosition: 'Visual & Brand Designer', department: 'Design', wage: 62000, bankName: 'HDFC Bank' },
    { firstName: 'Rashmi', lastName: 'Maurya', email: 'rashmi.maurya@peoplepay.com', jobPosition: 'Motion Graphics Designer', department: 'Design', wage: 64000, bankName: 'ICICI Bank' },
    { firstName: 'Jyoti', lastName: 'Thakur', email: 'jyoti.thakur@peoplepay.com', jobPosition: 'UI/UX Designer', department: 'Design', wage: 60000, bankName: 'State Bank of India' },
    { firstName: 'Payal', lastName: 'Chauhan', email: 'payal.chauhan@peoplepay.com', jobPosition: 'Illustrator & Graphic Artist', department: 'Design', wage: 54000, bankName: 'Axis Bank' },
    { firstName: 'Simran', lastName: 'Rawat', email: 'simran.rawat@peoplepay.com', jobPosition: 'Junior UI Designer', department: 'Design', wage: 48000, bankName: 'HDFC Bank' },
    { firstName: 'Komal', lastName: 'Negi', email: 'komal.negi@peoplepay.com', jobPosition: 'Interaction Designer', department: 'Design', wage: 58000, bankName: 'Kotak Mahindra Bank' },

    // Product Management (12 employees)
    { firstName: 'Sanjay', lastName: 'Bisht', email: 'sanjay.bisht@peoplepay.com', jobPosition: 'VP of Product', department: 'Product', wage: 160000, bankName: 'HDFC Bank' },
    { firstName: 'Divya', lastName: 'Bhatt', email: 'divya.bhatt@peoplepay.com', jobPosition: 'Principal Product Manager', department: 'Product', wage: 130000, bankName: 'ICICI Bank' },
    { firstName: 'Alok', lastName: 'Pant', email: 'alok.pant@peoplepay.com', jobPosition: 'Senior Product Manager - Payroll', department: 'Product', wage: 110000, bankName: 'State Bank of India' },
    { firstName: 'Smita', lastName: 'Trivedi', email: 'smita.trivedi@peoplepay.com', jobPosition: 'Senior Product Manager - Time & Attendance', department: 'Product', wage: 108000, bankName: 'Axis Bank' },
    { firstName: 'Monika', lastName: 'Dave', email: 'monika.dave@peoplepay.com', jobPosition: 'Product Manager - Onboarding', department: 'Product', wage: 92000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Bhavna', lastName: 'Vyas', email: 'bhavna.vyas@peoplepay.com', jobPosition: 'Technical Product Owner', department: 'Product', wage: 88000, bankName: 'HDFC Bank' },
    { firstName: 'Geeta', lastName: 'Dixit', email: 'geeta.dixit@peoplepay.com', jobPosition: 'Product Operations Manager', department: 'Product', wage: 78000, bankName: 'ICICI Bank' },
    { firstName: 'Sunita', lastName: 'Shukla', email: 'sunita.shukla@peoplepay.com', jobPosition: 'Associate Product Manager', department: 'Product', wage: 62000, bankName: 'State Bank of India' },
    { firstName: 'Anita', lastName: 'Dubey', email: 'anita.dubey@peoplepay.com', jobPosition: 'Product Growth Analyst', department: 'Product', wage: 65000, bankName: 'Axis Bank' },
    { firstName: 'Rekha', lastName: 'Tripathi', email: 'rekha.tripathi@peoplepay.com', jobPosition: 'Product Researcher', department: 'Product', wage: 60000, bankName: 'HDFC Bank' },
    { firstName: 'Seema', lastName: 'Awasthi', email: 'seema.awasthi@peoplepay.com', jobPosition: 'Scrum Master', department: 'Product', wage: 75000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Sapna', lastName: 'Tiwari', email: 'sapna.tiwari@peoplepay.com', jobPosition: 'Business Systems Analyst', department: 'Product', wage: 70000, bankName: 'ICICI Bank' },

    // Marketing (13 employees)
    { firstName: 'Rajesh', lastName: 'Nambiar', email: 'rajesh.nambiar@peoplepay.com', jobPosition: 'Chief Marketing Officer', department: 'Marketing', wage: 155000, bankName: 'HDFC Bank' },
    { firstName: 'Preeti', lastName: 'Sengupta', email: 'preeti.sengupta@peoplepay.com', jobPosition: 'Director of Growth Marketing', department: 'Marketing', wage: 120000, bankName: 'ICICI Bank' },
    { firstName: 'Deepika', lastName: 'Venkatesh', email: 'deepika.venkatesh@peoplepay.com', jobPosition: 'Head of Content & Editorial', department: 'Marketing', wage: 85000, bankName: 'State Bank of India' },
    { firstName: 'Swati', lastName: 'Ranganathan', email: 'swati.ranganathan@peoplepay.com', jobPosition: 'Performance Marketing Lead', department: 'Marketing', wage: 82000, bankName: 'Axis Bank' },
    { firstName: 'Shilpa', lastName: 'Gundappa', email: 'shilpa.gundappa@peoplepay.com', jobPosition: 'Product Marketing Manager', department: 'Marketing', wage: 88000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Manoj', lastName: 'Kumble', email: 'manoj.kumble@peoplepay.com', jobPosition: 'SEO & Organic Growth Lead', department: 'Marketing', wage: 72000, bankName: 'HDFC Bank' },
    { firstName: 'Sunil', lastName: 'Srinivasan', email: 'sunil.srinivasan@peoplepay.com', jobPosition: 'Email & CRM Automation Lead', department: 'Marketing', wage: 68000, bankName: 'ICICI Bank' },
    { firstName: 'Kiran', lastName: 'Balakrishnan', email: 'kiran.balakrishnan@peoplepay.com', jobPosition: 'Social Media & Brand Specialist', department: 'Marketing', wage: 52000, bankName: 'State Bank of India' },
    { firstName: 'Chirag', lastName: 'Kashyap', email: 'chirag.kashyap@peoplepay.com', jobPosition: 'Event & PR Manager', department: 'Marketing', wage: 66000, bankName: 'Axis Bank' },
    { firstName: 'Aparna', lastName: 'Vaidya', email: 'aparna.vaidya@peoplepay.com', jobPosition: 'Content Strategist', department: 'Marketing', wage: 58000, bankName: 'HDFC Bank' },
    { firstName: 'Lalit', lastName: 'Somayaji', email: 'lalit.somayaji@peoplepay.com', jobPosition: 'Paid Media Specialist', department: 'Marketing', wage: 55000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Ankita', lastName: 'Bhatia', email: 'ankita.bhatia@peoplepay.com', jobPosition: 'Copywriter & Communications', department: 'Marketing', wage: 50000, bankName: 'ICICI Bank' },
    { firstName: 'Girish', lastName: 'Oberoi', email: 'girish.oberoi@peoplepay.com', jobPosition: 'Marketing Data Analyst', department: 'Marketing', wage: 62000, bankName: 'HDFC Bank' },

    // Sales & Business Development (14 employees)
    { firstName: 'Suresh', lastName: 'Singhal', email: 'suresh.singhal@peoplepay.com', jobPosition: 'Senior VP of Enterprise Sales', department: 'Sales', wage: 165000, bankName: 'HDFC Bank' },
    { firstName: 'Ritu', lastName: 'Agarwal', email: 'ritu.agarwal@peoplepay.com', jobPosition: 'Enterprise Sales Director', department: 'Sales', wage: 125000, bankName: 'ICICI Bank' },
    { firstName: 'Bhavesh', lastName: 'Mittal', email: 'bhavesh.mittal@peoplepay.com', jobPosition: 'Regional Sales Head - West', department: 'Sales', wage: 110000, bankName: 'State Bank of India' },
    { firstName: 'Chetan', lastName: 'Goel', email: 'chetan.goel@peoplepay.com', jobPosition: 'Regional Sales Head - North', department: 'Sales', wage: 110000, bankName: 'Axis Bank' },
    { firstName: 'Rakesh', lastName: 'Jain', email: 'rakesh.jain@peoplepay.com', jobPosition: 'Strategic Account Executive', department: 'Sales', wage: 95000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Dinesh', lastName: 'Garg', email: 'dinesh.garg@peoplepay.com', jobPosition: 'Commercial Account Executive', department: 'Sales', wage: 82000, bankName: 'HDFC Bank' },
    { firstName: 'Mahesh', lastName: 'Kansal', email: 'mahesh.kansal@peoplepay.com', jobPosition: 'Mid-Market Account Executive', department: 'Sales', wage: 78000, bankName: 'ICICI Bank' },
    { firstName: 'Umesh', lastName: 'Bansal', email: 'umesh.bansal@peoplepay.com', jobPosition: 'SMB Account Executive', department: 'Sales', wage: 65000, bankName: 'State Bank of India' },
    { firstName: 'Mukesh', lastName: 'Bindal', email: 'mukesh.bindal@peoplepay.com', jobPosition: 'Senior SDR Lead', department: 'Sales', wage: 55000, bankName: 'Axis Bank' },
    { firstName: 'Jay', lastName: 'Tayal', email: 'jay.tayal@peoplepay.com', jobPosition: 'Sales Development Representative', department: 'Sales', wage: 45000, bankName: 'HDFC Bank' },
    { firstName: 'Hitesh', lastName: 'Chhabra', email: 'hitesh.chhabra@peoplepay.com', jobPosition: 'Sales Development Representative', department: 'Sales', wage: 45000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Santosh', lastName: 'Puri', email: 'santosh.puri@peoplepay.com', jobPosition: 'Pre-Sales Solutions Consultant', department: 'Sales', wage: 85000, bankName: 'ICICI Bank' },
    { firstName: 'Bharat', lastName: 'Suri', email: 'bharat.suri@peoplepay.com', jobPosition: 'Sales Operations Manager', department: 'Sales', wage: 75000, bankName: 'HDFC Bank' },
    { firstName: 'Richa', lastName: 'Sethi', email: 'richa.sethi@peoplepay.com', jobPosition: 'Partnership Manager', department: 'Sales', wage: 80000, bankName: 'State Bank of India' },

    // Finance & Accounting (12 employees)
    { firstName: 'Naveen', lastName: 'Modi', email: 'naveen.modi@peoplepay.com', jobPosition: 'VP of Finance & CFO', department: 'Finance', wage: 170000, bankName: 'HDFC Bank' },
    { firstName: 'Praveen', lastName: 'Lodha', email: 'praveen.lodha@peoplepay.com', jobPosition: 'Corporate Finance Controller', department: 'Finance', wage: 130000, bankName: 'ICICI Bank' },
    { firstName: 'Juhi', lastName: 'Bajaj', email: 'juhi.bajaj@peoplepay.com', jobPosition: 'FP&A Senior Manager', department: 'Finance', wage: 105000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Namrata', lastName: 'Kothari', email: 'namrata.kothari@peoplepay.com', jobPosition: 'Senior Tax & Regulatory Specialist', department: 'Finance', wage: 92000, bankName: 'Axis Bank' },
    { firstName: 'Sangeeta', lastName: 'Maheshwari', email: 'sangeeta.maheshwari@peoplepay.com', jobPosition: 'Treasury & Cash Flow Manager', department: 'Finance', wage: 88000, bankName: 'State Bank of India' },
    { firstName: 'Urvashi', lastName: 'Somani', email: 'urvashi.somani@peoplepay.com', jobPosition: 'Financial Analyst II', department: 'Finance', wage: 72000, bankName: 'HDFC Bank' },
    { firstName: 'Vidya', lastName: 'Nahar', email: 'vidya.nahar@peoplepay.com', jobPosition: 'Senior Accountant', department: 'Finance', wage: 65000, bankName: 'ICICI Bank' },
    { firstName: 'Sonam', lastName: 'Chordia', email: 'sonam.chordia@peoplepay.com', jobPosition: 'Accounts Payable Specialist', department: 'Finance', wage: 52000, bankName: 'Axis Bank' },
    { firstName: 'Rupal', lastName: 'Bhandari', email: 'rupal.bhandari@peoplepay.com', jobPosition: 'Accounts Receivable Specialist', department: 'Finance', wage: 52000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Archana', lastName: 'Daga', email: 'archana.daga@peoplepay.com', jobPosition: 'Billing & Invoicing Executive', department: 'Finance', wage: 48000, bankName: 'HDFC Bank' },
    { firstName: 'Sheetal', lastName: 'Baid', email: 'sheetal.baid@peoplepay.com', jobPosition: 'Internal Auditor', department: 'Finance', wage: 78000, bankName: 'State Bank of India' },
    { firstName: 'Prerna', lastName: 'Lunia', email: 'prerna.lunia@peoplepay.com', jobPosition: 'Finance Operations Associate', department: 'Finance', wage: 50000, bankName: 'ICICI Bank' },

    // Operations & Customer Support (13 employees)
    { firstName: 'Meenakshi', lastName: 'Sood', email: 'meenakshi.sood@peoplepay.com', jobPosition: 'Chief Operating Officer', department: 'Operations', wage: 160000, bankName: 'HDFC Bank' },
    { firstName: 'Vandana', lastName: 'Kukreja', email: 'vandana.kukreja@peoplepay.com', jobPosition: 'Head of Customer Success', department: 'Operations', wage: 115000, bankName: 'ICICI Bank' },
    { firstName: 'Kusum', lastName: 'Batra', email: 'kusum.batra@peoplepay.com', jobPosition: 'Customer Support Director', department: 'Operations', wage: 95000, bankName: 'State Bank of India' },
    { firstName: 'Ajay', lastName: 'Talwar', email: 'ajay.talwar@peoplepay.com', jobPosition: 'Senior Enterprise CSM', department: 'Operations', wage: 82000, bankName: 'Axis Bank' },
    { firstName: 'Vijay', lastName: 'Sabharwal', email: 'vijay.sabharwal@peoplepay.com', jobPosition: 'Client Implementation Lead', department: 'Operations', wage: 75000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Ravi', lastName: 'Makhija', email: 'ravi.makhija@peoplepay.com', jobPosition: 'Technical Support Specialist', department: 'Operations', wage: 58000, bankName: 'HDFC Bank' },
    { firstName: 'Pooja', lastName: 'Gidwani', email: 'pooja.gidwani@peoplepay.com', jobPosition: 'Customer Onboarding Manager', department: 'Operations', wage: 68000, bankName: 'ICICI Bank' },
    { firstName: 'Anil', lastName: 'Lalwani', email: 'anil.lalwani@peoplepay.com', jobPosition: 'Operations & Facilities Lead', department: 'Operations', wage: 62000, bankName: 'State Bank of India' },
    { firstName: 'Kamal', lastName: 'Thadani', email: 'kamal.thadani@peoplepay.com', jobPosition: 'Procurement Specialist', department: 'Operations', wage: 58000, bankName: 'Axis Bank' },
    { firstName: 'Neelam', lastName: 'Advani', email: 'neelam.advani@peoplepay.com', jobPosition: 'IT Support Administrator', department: 'Operations', wage: 55000, bankName: 'HDFC Bank' },
    { firstName: 'Shashi', lastName: 'Vaswani', email: 'shashi.vaswani@peoplepay.com', jobPosition: 'Customer Support Lead', department: 'Operations', wage: 50000, bankName: 'Kotak Mahindra Bank' },
    { firstName: 'Geetika', lastName: 'Rohatgi', email: 'geetika.rohatgi@peoplepay.com', jobPosition: 'Workplace Experience Coordinator', department: 'Operations', wage: 45000, bankName: 'ICICI Bank' },
    { firstName: 'Surbhi', lastName: 'Chawla', email: 'surbhi.chawla@peoplepay.com', jobPosition: 'Operations Associate', department: 'Operations', wage: 46000, bankName: 'HDFC Bank' },
  ];

  console.log(`Creating ${employeesDataRaw.length} Employees and Users with role EMPLOYEE...`);

  let rahulSharmaEmpId = '';

  for (let i = 0; i < employeesDataRaw.length; i++) {
    const data = employeesDataRaw[i];
    const phone = `+91 ${9800000000 + i + 100}`;
    const accountNumber = `50100${String(1000000 + i).slice(-7)}`;

    const emp = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone,
        jobPosition: data.jobPosition,
        department: data.department,
        status: 'ACTIVE',
        scheduleId: schedule.id,
        bankName: data.bankName,
        accountNumber,
      },
    });

    if (data.email === 'rahul.sharma@peoplepay.com') {
      rahulSharmaEmpId = emp.id;
    }

    // Create User record for every employee
    await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.EMPLOYEE,
        employeeId: emp.id,
      },
    });

    // Create Active Contract for every employee
    await prisma.contract.create({
      data: {
        employeeId: emp.id,
        salaryStructureId: salaryStructure.id,
        wage: data.wage,
        startDate: new Date('2026-01-01'),
        status: 'ACTIVE',
        department: data.department,
        jobPosition: data.jobPosition,
      },
    });
  }

  // 8. Create Attendance records for Rahul Sharma (emp1) for this month
  if (rahulSharmaEmpId) {
    const today = new Date();
    for (let d = 1; d <= 20; d++) {
      const attendanceDate = new Date(today.getFullYear(), today.getMonth(), d);
      await prisma.attendance.create({
        data: {
          employeeId: rahulSharmaEmpId,
          date: attendanceDate,
          checkIn: new Date(attendanceDate.setHours(9, 0, 0)),
          checkOut: new Date(attendanceDate.setHours(18, 0, 0)),
          workedHours: 8,
          status: 'PRESENT',
        },
      });
    }
  }

  const totalUsers = await prisma.user.count();
  const totalEmployees = await prisma.employee.count();
  const totalContracts = await prisma.contract.count();

  console.log('✅ 100+ Users seed completed successfully!');
  console.log('----------------------------------------------------------------------');
  console.log(`📊 Total Users Created:     ${totalUsers}`);
  console.log(`👥 Total Employees Created: ${totalEmployees}`);
  console.log(`📄 Total Active Contracts:  ${totalContracts}`);
  console.log('----------------------------------------------------------------------');
  console.log('🔑 Preserved Credentials (all passwords: password123):');
  console.log('   Admin:            admin@peoplepay.com / password123');
  console.log('   Payroll Manager:  payroll.manager@peoplepay.com / password123');
  console.log('   HR Manager:       amit.patel@peoplepay.com / password123');
  console.log('   Employee 1:       rahul.sharma@peoplepay.com / password123');
  console.log('   Employee 2:       priya.verma@peoplepay.com / password123');
  console.log('');
  console.log('🛡️  10 HR Accounts Created (all passwords: password123):');
  hrStaffData.forEach((hr, idx) => {
    console.log(`   ${idx + 1}. ${hr.email.padEnd(35)} | Role: ${hr.role.padEnd(20)} | ${hr.jobPosition}`);
  });
  console.log('----------------------------------------------------------------------');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
