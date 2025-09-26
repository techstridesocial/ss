import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  logo: {
    width: 120,
    height: 40,
  },
  companyInfo: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  invoiceInfo: {
    flex: 1,
  },
  clientInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 80,
  },
  infoValue: {
    fontSize: 10,
    color: '#1F2937',
    flex: 1,
  },
  contentSection: {
    marginBottom: 30,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  contentDescription: {
    fontSize: 11,
    color: '#1F2937',
    marginBottom: 5,
  },
  contentLink: {
    fontSize: 10,
    color: '#3B82F6',
    textDecoration: 'underline',
  },
  financialSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  financialValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paymentTerms: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 10,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  termsText: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.4,
  },
})

interface InvoicePDFProps {
  invoice: {
    invoice_number: string
    invoice_date: string
    due_date: string
    creator_name: string
    creator_address?: string
    creator_email?: string
    creator_phone?: string
    campaign_reference: string
    brand_name: string
    content_description: string
    content_link: string
    agreed_price: number
    currency: string
    vat_required: boolean
    vat_rate: number
    vat_amount: number
    total_amount: number
    payment_terms: string
  }
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Stride Social Ltd</Text>
            <Text style={styles.companyAddress}>
              Amelia house, crescent road{'\n'}
              Worthing, BN11 1QR{'\n'}
              United Kingdom{'\n'}
              ap@stride-social.com
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>INVOICE</Text>
            <Text style={styles.companyAddress}>
              Invoice #: {invoice.invoice_number}{'\n'}
              Date: {new Date(invoice.invoice_date).toLocaleDateString()}{'\n'}
              Due: {new Date(invoice.due_date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>Invoice</Text>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Invoice #:</Text>
              <Text style={styles.infoValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{new Date(invoice.invoice_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Due Date:</Text>
              <Text style={styles.infoValue}>{new Date(invoice.due_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reference:</Text>
              <Text style={styles.infoValue}>{invoice.campaign_reference}</Text>
            </View>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>Bill From</Text>
            <Text style={styles.infoValue}>{invoice.creator_name}</Text>
            {invoice.creator_address && (
              <Text style={styles.infoValue}>{invoice.creator_address}</Text>
            )}
            {invoice.creator_email && (
              <Text style={styles.infoValue}>{invoice.creator_email}</Text>
            )}
            {invoice.creator_phone && (
              <Text style={styles.infoValue}>{invoice.creator_phone}</Text>
            )}
          </View>
        </View>

        {/* Campaign Details */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Campaign Details</Text>
          <Text style={styles.contentDescription}>
            <Text style={{ fontWeight: 'bold' }}>Brand: </Text>
            {invoice.brand_name}
          </Text>
          <Text style={styles.contentDescription}>
            <Text style={{ fontWeight: 'bold' }}>Content: </Text>
            {invoice.content_description}
          </Text>
          <Text style={styles.contentLink}>{invoice.content_link}</Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.financialSection}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Subtotal:</Text>
            <Text style={styles.financialValue}>
              {invoice.currency} {Number(invoice.agreed_price).toFixed(2)}
            </Text>
          </View>
          
          {invoice.vat_required && (
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>VAT ({invoice.vat_rate}%):</Text>
              <Text style={styles.financialValue}>
                {invoice.currency} {Number(invoice.vat_amount).toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              {invoice.currency} {Number(invoice.total_amount).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.paymentTerms}>
            <Text style={styles.termsTitle}>Payment Terms: </Text>
            {invoice.payment_terms}
          </Text>
          
          <Text style={styles.termsTitle}>Payment Instructions:</Text>
          <Text style={styles.termsText}>
            Please make sure all payment details have been filled out on the payments section on Stride Suits. 
            For any questions regarding this invoice please contact ap@stride-social.com with your campaign reference number and invoice number included in the email.
          </Text>
          
        </View>
      </Page>
    </Document>
  )
}
