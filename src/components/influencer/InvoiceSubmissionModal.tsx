'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, DollarSign, Calendar, User, Building, Link, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

interface InvoiceSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onInvoiceCreated: () => void
  campaignId?: string
  campaignName?: string
  brandName?: string
}

interface Campaign {
  id: string
  name: string
  brand_name: string
  status: string
}

export default function InvoiceSubmissionModal({
  isOpen,
  onClose,
  onInvoiceCreated,
  campaignId,
  campaignName,
  brandName
}: InvoiceSubmissionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    creator_name: '',
    creator_address: '',
    creator_email: '',
    creator_phone: '',
    campaign_reference: '',
    brand_name: '',
    content_description: '',
    content_link: '',
    agreed_price: '',
    currency: 'GBP',
    vat_required: false,
    vat_rate: 20.00,
    payment_terms: 'Net 30'
  })

  // Load campaigns on mount
  useEffect(() => {
    if (isOpen) {
      loadCampaigns()
    }
  }, [isOpen])

  // Pre-fill form if campaign is provided
  useEffect(() => {
    if (campaignId && campaignName && brandName) {
      setFormData(prev => ({
        ...prev,
        campaign_reference: campaignId,
        brand_name: brandName
      }))
      setSelectedCampaign(campaignId)
    }
  }, [campaignId, campaignName, brandName])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/influencer/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId)
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setFormData(prev => ({
        ...prev,
        campaign_reference: campaignId,
        brand_name: campaign.brand_name
      }))
    }
  }

  const calculateTotals = () => {
    const price = parseFloat(formData.agreed_price) || 0
    const vatAmount = formData.vat_required ? price * (formData.vat_rate / 100) : 0
    const total = price + vatAmount
    
    return {
      subtotal: price,
      vatAmount,
      total
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCampaign) {
      toast({
        title: "Error",
        description: "Please select a campaign",
        variant: "destructive"
      })
      return
    }

    if (!formData.creator_name || !formData.campaign_reference || !formData.brand_name || 
        !formData.content_description || !formData.content_link || !formData.agreed_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/influencer/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_id: selectedCampaign,
          ...formData,
          agreed_price: parseFloat(formData.agreed_price)
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invoice created successfully!",
        })
        onInvoiceCreated()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invoice",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totals = calculateTotals()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Create Invoice</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Campaign Selection */}
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign *</Label>
                <Select value={selectedCampaign} onValueChange={handleCampaignSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name} - {campaign.brand_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Creator Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creator_name">Creator Name *</Label>
                  <Input
                    id="creator_name"
                    value={formData.creator_name}
                    onChange={(e) => handleInputChange('creator_name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creator_email">Email *</Label>
                  <Input
                    id="creator_email"
                    type="email"
                    value={formData.creator_email}
                    onChange={(e) => handleInputChange('creator_email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creator_address">Address</Label>
                <Textarea
                  id="creator_address"
                  value={formData.creator_address}
                  onChange={(e) => handleInputChange('creator_address', e.target.value)}
                  placeholder="Your business address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creator_phone">Phone Number</Label>
                  <Input
                    id="creator_phone"
                    value={formData.creator_phone}
                    onChange={(e) => handleInputChange('creator_phone', e.target.value)}
                    placeholder="+44 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign_reference">Campaign Reference *</Label>
                  <Input
                    id="campaign_reference"
                    value={formData.campaign_reference}
                    onChange={(e) => handleInputChange('campaign_reference', e.target.value)}
                    placeholder="Campaign reference number"
                  />
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_name">Brand Name *</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    placeholder="Brand being promoted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content_description">Content Description *</Label>
                  <Input
                    id="content_description"
                    value={formData.content_description}
                    onChange={(e) => handleInputChange('content_description', e.target.value)}
                    placeholder="e.g., Instagram Reel, TikTok Video"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_link">Content Link *</Label>
                <Input
                  id="content_link"
                  type="url"
                  value={formData.content_link}
                  onChange={(e) => handleInputChange('content_link', e.target.value)}
                  placeholder="https://instagram.com/p/..."
                />
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agreed_price">Agreed Price *</Label>
                  <Input
                    id="agreed_price"
                    type="number"
                    step="0.01"
                    value={formData.agreed_price}
                    onChange={(e) => handleInputChange('agreed_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* VAT Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vat_required"
                    checked={formData.vat_required}
                    onCheckedChange={(checked) => handleInputChange('vat_required', checked)}
                  />
                  <Label htmlFor="vat_required">VAT Required</Label>
                </div>
                
                {formData.vat_required && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                      <Input
                        id="vat_rate"
                        type="number"
                        step="0.01"
                        value={formData.vat_rate}
                        onChange={(e) => handleInputChange('vat_rate', parseFloat(e.target.value))}
                        placeholder="20.00"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Invoice Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formData.currency} {totals.subtotal.toFixed(2)}</span>
                  </div>
                  {formData.vat_required && (
                    <div className="flex justify-between">
                      <span>VAT ({formData.vat_rate}%):</span>
                      <span>{formData.currency} {totals.vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total:</span>
                    <span>{formData.currency} {totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
