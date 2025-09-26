# 📋 Invoice System User Flows

## 🎯 Complete End-to-End Invoice Flow: Creator to Brand

---

## 👤 **CREATOR SIDE - Invoice Submission Flow**

### **Step 1: Access Invoice System**
```
Creator Login → Dashboard → Payments Section → "Create Invoice" Button
```

### **Step 2: Invoice Form Completion**
```
📝 Invoice Form Fields:
├── Campaign Selection
│   ├── Select from completed campaigns
│   ├── Auto-populate brand name
│   └── Auto-populate campaign reference
├── Creator Details
│   ├── Name (pre-filled from profile)
│   ├── Address
│   ├── Email (pre-filled from account)
│   └── Phone number
├── Content Details
│   ├── Description (e.g., "Instagram Reel for Brand X")
│   └── Content link (URL to posted content)
└── Financial Details
    ├── Agreed price
    ├── Currency selection
    ├── VAT toggle (20% auto-calculation)
    └── Payment terms
```

### **Step 3: Invoice Submission**
```
Creator clicks "Submit Invoice" → System validates → Invoice created → Confirmation shown
```

### **Step 4: Invoice Management**
```
Creator can view submitted invoices with status:
├── SENT (submitted, awaiting review)
├── VERIFIED (approved by staff)
├── PAID (payment completed)
├── DELAYED (payment delayed)
└── VOIDED (cancelled)
```

---

## 🏢 **STAFF SIDE - Invoice Management Flow**

### **Step 1: Access Finance Dashboard**
```
Staff Login → Dashboard → "Finances" → Invoice Management Dashboard
```

### **Step 2: Invoice Overview**
```
📊 Dashboard shows:
├── Summary Cards
│   ├── Total Invoices
│   ├── Pending Amount
│   └── Paid Amount
├── Search & Filter
│   ├── Search by creator name
│   ├── Filter by status
│   └── Date range filters
└── Invoice Table
    ├── Invoice number
    ├── Creator name
    ├── Brand name
    ├── Amount
    ├── Status
    ├── Due date
    └── Actions
```

### **Step 3: Invoice Review Process**
```
Staff clicks "View Invoice" → Invoice Detail Modal opens:
├── Invoice Information
│   ├── Invoice number & dates
│   ├── Creator details
│   ├── Campaign information
│   └── Content details
├── Financial Breakdown
│   ├── Agreed price
│   ├── VAT calculation
│   └── Total amount
└── Status Management
    ├── Current status
    ├── Status update dropdown
    ├── Staff notes field
    └── Action buttons
```

### **Step 4: Status Updates**
```
Staff can update invoice status:
├── VERIFIED (approve invoice)
├── DELAYED (mark as delayed with reason)
├── PAID (mark as paid)
└── VOIDED (cancel invoice)
```

### **Step 5: PDF Generation**
```
Staff can generate PDF invoices:
├── Click "Download PDF" → PDF generated
├── PDF contains professional invoice layout
├── Includes all invoice details
└── Can be shared with creators/brands
```

---

## 🔄 **COMPLETE END-TO-END FLOW**

### **Phase 1: Campaign Completion**
```
1. Creator completes campaign
2. Content is posted and submitted
3. Campaign marked as completed
4. Creator receives notification to submit invoice
```

### **Phase 2: Invoice Creation**
```
1. Creator navigates to payments section
2. Clicks "Create Invoice" button
3. Fills out invoice form with campaign details
4. Submits invoice (status: SENT)
5. Receives confirmation
```

### **Phase 3: Staff Review**
```
1. Staff receives notification of new invoice
2. Staff reviews invoice details
3. Staff verifies content and amounts
4. Staff updates status to VERIFIED
5. Staff can generate PDF if needed
```

### **Phase 4: Payment Processing**
```
1. Staff processes payment
2. Staff updates status to PAID
3. Creator receives payment notification
4. Invoice marked as completed
```

### **Phase 5: Record Keeping**
```
1. All invoices stored in database
2. Status history maintained
3. PDF invoices archived
4. Financial reports generated
```

---

## 📊 **STATUS WORKFLOW DIAGRAM**

```
DRAFT → SENT → VERIFIED → PAID
  ↓       ↓        ↓        ↓
VOIDED  DELAYED  DELAYED  COMPLETED
```

### **Status Descriptions:**
- **DRAFT**: Invoice being created
- **SENT**: Submitted by creator, awaiting review
- **VERIFIED**: Approved by staff, ready for payment
- **PAID**: Payment completed
- **DELAYED**: Payment delayed (with reason)
- **VOIDED**: Invoice cancelled

---

## 🎨 **UI COMPONENTS FLOW**

### **Creator Interface:**
```
/influencer/payments
├── Payment Summary Cards
├── Invoice Management Section
│   ├── "Create Invoice" Button
│   └── Invoices Table
└── Invoice Submission Modal
    ├── Campaign Selection
    ├── Creator Details Form
    ├── Content Details Form
    └── Financial Details Form
```

### **Staff Interface:**
```
/staff/finances
├── Finance Summary Cards
├── Search & Filter Controls
├── Invoices Table
└── Invoice Detail Modal
    ├── Invoice Information
    ├── Financial Breakdown
    ├── Status Management
    └── PDF Generation
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Database Tables:**
- `influencer_invoices` - Main invoice data
- `invoice_line_items` - Invoice line items
- `invoice_status_history` - Status change tracking

### **API Endpoints:**
- `POST /api/influencer/invoices` - Create invoice
- `GET /api/influencer/invoices` - Get creator invoices
- `GET /api/staff/invoices` - Get all invoices (staff)
- `PUT /api/staff/invoices/[id]` - Update invoice status
- `GET /api/invoices/[id]/pdf` - Generate PDF

### **Key Features:**
- ✅ Automatic VAT calculation (20%)
- ✅ Invoice number generation
- ✅ Status workflow management
- ✅ PDF generation
- ✅ Search and filtering
- ✅ Audit trail
- ✅ Financial reporting

---

## 🚀 **SUCCESS METRICS**

### **Creator Experience:**
- ✅ Easy invoice submission process
- ✅ Clear status tracking
- ✅ Professional invoice generation
- ✅ Mobile-responsive interface

### **Staff Experience:**
- ✅ Efficient invoice review process
- ✅ Bulk status updates
- ✅ Advanced search and filtering
- ✅ Financial reporting capabilities

### **System Performance:**
- ✅ Fast invoice creation (< 2 seconds)
- ✅ Reliable PDF generation
- ✅ Secure data handling
- ✅ Audit trail compliance

---

## 📝 **NOTES**

This invoice system provides a complete end-to-end solution for creator payments, from initial submission through final payment processing. The system is designed to be user-friendly for creators while providing powerful management tools for staff.

**Key Benefits:**
- Streamlined payment process
- Professional invoice generation
- Complete audit trail
- Financial reporting
- Status tracking
- PDF archiving
