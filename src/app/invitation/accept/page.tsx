'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  invitedBy: string
  status: string
  expiresAt: string
}

interface AcceptInvitationResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    role: string
  }
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        // Check for Clerk invitation parameters
        const clerkStatus = searchParams.get('__clerk_status')
        const clerkTicket = searchParams.get('__clerk_ticket')
        
        // Check for direct invitation parameters
        const invitationId = searchParams.get('invitation_id')
        const email = searchParams.get('email')
        const role = searchParams.get('role')
        
        if (clerkStatus && clerkTicket) {
          // Handle Clerk invitation flow
          console.log('Processing Clerk invitation with ticket:', clerkTicket.substring(0, 50) + '...')
          
          // For Clerk invitations, redirect immediately to sign-up
          // The invitation will be processed via webhook after user signs up
          setLoading(false)
          
          // Show a message and redirect
          setInvitation({
            id: 'clerk-invitation',
            email: 'Loading...',
            role: 'Loading...',
            status: 'PENDING',
            invitedBy: 'StrideSocial Team',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          
          // Redirect to Clerk sign-up with the ticket
          setTimeout(() => {
            window.location.href = `/sign-up?__clerk_status=${clerkStatus}&__clerk_ticket=${clerkTicket}`
          }, 1500)
          
        } else if (invitationId && email && role) {
          // Handle direct invitation parameters
          setInvitation({
            id: invitationId,
            email: email,
            role: role,
            status: 'PENDING',
            invitedBy: 'StrideSocial Team',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          })
          setLoading(false)
        } else {
          // Try to extract invitation info from Clerk ticket if possible
          if (clerkTicket) {
            try {
              // Decode the JWT token to get invitation info (basic decode, not verification)
              const payload = JSON.parse(atob(clerkTicket.split('.')[1]))
              console.log('Clerk ticket payload:', payload)
              
              // Check if we can find the invitation in our database
              if (payload.sid) {
                const response = await fetch(`/api/invitations/clerk/${payload.sid}`)
                if (response.ok) {
                  const invitationData = await response.json()
                  setInvitation(invitationData.invitation)
                  setLoading(false)
                  return
                }
              }
            } catch (decodeError) {
              console.error('Error decoding Clerk ticket:', decodeError)
            }
          }
          
          setError('Invalid invitation link. Please check the link or contact support.')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error processing invitation:', error)
        setError('Error processing invitation. Please try again.')
        setLoading(false)
      }
    }

    handleInvitation()
  }, [searchParams])

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccepting(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setAccepting(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setAccepting(false)
      return
    }

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId: invitation?.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        })
      })

      const data: AcceptInvitationResponse = await response.json()
      
      if (data.success) {
        setSuccess(true)
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setError(data.message || 'Failed to accept invitation')
      }
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading invitation...</span>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Special handling for Clerk invitations
  if (invitation?.id === 'clerk-invitation') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-blue-600">Processing Invitation</CardTitle>
            <CardDescription>
              Redirecting you to complete your account setup...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              You will be redirected to complete the sign-up process in a moment.
            </p>
            <Button 
              onClick={() => {
                const clerkStatus = new URLSearchParams(window.location.search).get('__clerk_status')
                const clerkTicket = new URLSearchParams(window.location.search).get('__clerk_ticket')
                if (clerkStatus && clerkTicket) {
                  window.location.href = `/sign-up?__clerk_status=${clerkStatus}&__clerk_ticket=${clerkTicket}`
                }
              }}
              className="w-full"
            >
              Continue to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Welcome to StrideSocial!</CardTitle>
            <CardDescription>
              Your account has been created successfully. You'll be redirected to your dashboard shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join StrideSocial as a <strong>{invitation?.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Invited by: {invitation?.invitedBy}</p>
            <p>Expires: {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'Never'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
