'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Users, 
  RefreshCw,
  X
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Payment {
  influencerId: string
  influencerName: string
  status: 'PENDING' | 'PAID'
  paymentDate?: string
  campaignStatus: string
}

interface PaymentSummary {
  totalInfluencers: number
  paidCount: number
  pendingCount: number
}

interface PaymentManagementPanelProps {
  isOpen: boolean
  campaignId: string
  campaignName: string
  onCloseAction: () => void
  onPaymentUpdatedAction: () => void
}

export default function PaymentManagementPanel({
  isOpen,
  campaignId,
  campaignName,
  onCloseAction,
  onPaymentUpdatedAction
}: PaymentManagementPanelProps) {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && campaignId) {
      loadPayments()
    }
  }, [isOpen, campaignId])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/payments`)
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data.payments)
        setSummary(data.data.summary)
      } else {
        toast({
          title: "Error",
          description: "Failed to load payment information",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading payments:', error)
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePayment = async (influencerId: string, status: 'PENDING' | 'PAID') => {
    try {
      setUpdatingPayment(influencerId)
      const response = await fetch(`/api/campaigns/${campaignId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          influencerId,
          status
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message,
        })
        
        // Reload payments
        await loadPayments()
        
        // Notify parent component
        onPaymentUpdatedAction()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update payment status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      })
    } finally {
      setUpdatingPayment(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getCampaignStatusBadge = (status: string) => {
    const statusConfig = {
      INVITED: { color: 'bg-blue-100 text-blue-800', label: 'Invited' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      CONTENT_SUBMITTED: { color: 'bg-purple-100 text-purple-800', label: 'Content Submitted' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-gray-600">{campaignName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseAction}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Influencers</p>
                          <p className="text-2xl font-bold">{summary.totalInfluencers}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Paid</p>
                          <p className="text-2xl font-bold text-green-600">{summary.paidCount}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Payments List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Status
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadPayments}
                      className="ml-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No influencers found for this campaign</p>
                    ) : (
                      payments.map((payment) => (
                        <div
                          key={payment.influencerId}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{payment.influencerName}</h3>
                              {getStatusBadge(payment.status)}
                              {getCampaignStatusBadge(payment.campaignStatus)}
                            </div>
                            {payment.paymentDate && (
                              <p className="text-sm text-gray-500">
                                Paid on {new Date(payment.paymentDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {payment.status === 'PENDING' && (
                              <Button
                                onClick={() => handleUpdatePayment(payment.influencerId, 'PAID')}
                                disabled={updatingPayment === payment.influencerId}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {updatingPayment === payment.influencerId ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Mark as Paid
                              </Button>
                            )}
                            
                            {payment.status === 'PAID' && (
                              <Button
                                onClick={() => handleUpdatePayment(payment.influencerId, 'PENDING')}
                                disabled={updatingPayment === payment.influencerId}
                                size="sm"
                                variant="outline"
                              >
                                {updatingPayment === payment.influencerId ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                ) : (
                                  <Clock className="w-4 h-4 mr-2" />
                                )}
                                Mark as Pending
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 