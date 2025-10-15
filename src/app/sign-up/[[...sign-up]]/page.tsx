import { SignUp } from '@clerk/nextjs'

export default function Page({
  searchParams,
}: {
  searchParams: { role?: string }
}) {
  // Determine redirect URLs based on role
  const getAfterSignUpUrl = () => {
    const role = searchParams.role
    switch (role) {
      case 'brand':
        return '/brand/onboarding'
      case 'influencer':
        return '/influencer/onboarding'
      case 'staff':
        return '/staff/roster'
      default:
        return '/'
    }
  }

  const getAfterSignInUrl = () => {
    const role = searchParams.role
    switch (role) {
      case 'brand':
        return '/brand/influencers'
      case 'influencer':
        return '/influencer/campaigns'
      case 'staff':
        return '/staff/roster'
      default:
        return '/'
    }
  }

  // Get background style based on role
  const getBackgroundStyle = () => {
    const role = searchParams.role
    switch (role) {
      case 'brand':
        return {
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-blue-ciNl7Fdr0aqj6WybhUHWs8TcRx4F7D.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      case 'influencer':
        return {
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      case 'staff':
        return {
          backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }
    }
  }

  // Get text colors based on role
  const getTextColors = () => {
    const role = searchParams.role
    switch (role) {
      case 'brand':
        return {
          title: 'text-white',
          subtitle: 'text-blue-200',
          description: 'text-blue-100'
        }
      case 'influencer':
        return {
          title: 'text-white',
          subtitle: 'text-cyan-200',
          description: 'text-cyan-100'
        }
      case 'staff':
        return {
          title: 'text-white',
          subtitle: 'text-cyan-200',
          description: 'text-cyan-100'
        }
      default:
        return {
          title: 'text-gray-900',
          subtitle: 'text-gray-500',
          description: 'text-gray-600'
        }
    }
  }

  const backgroundStyle = getBackgroundStyle()
  const textColors = getTextColors()

  // Custom Clerk appearance for professional look
  const appearance = {
    variables: {
      colorPrimary: '#1F2937',  // Tailwind slate-800
      colorText: '#111827',
      fontSize: '16px',
      borderRadius: '10px',
    },
    elements: {
      card: 'shadow-xl px-6 py-8 border border-gray-200',
      headerTitle: 'text-xl font-semibold text-center',
      headerSubtitle: 'text-sm text-gray-500 text-center mb-4',
      formFieldLabel: 'text-sm font-medium text-gray-700',
      formFieldInput: 'h-10 px-4 border-gray-300 focus:ring-2 focus:ring-slate-500 rounded-md text-sm',
      footerAction: 'text-sm text-gray-400',
      button: 'bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm h-10 rounded-md',
      logoBox: 'mb-2',
    },
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative"
      style={backgroundStyle}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="w-full max-w-md flex flex-col items-center text-center relative z-10">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${textColors.title}`}>
            Stride Social
          </h1>
          <div className={`text-xs uppercase tracking-wider font-medium mb-3 ${textColors.subtitle}`}>
            Dashboard
          </div>
          <p className={`text-sm ${textColors.description}`}>
            Create your account
          </p>
        </div>
        <div className="w-full flex justify-center">
          <SignUp 
            appearance={appearance} 
            afterSignInUrl={getAfterSignInUrl()}
            afterSignUpUrl={getAfterSignUpUrl()}
          />
        </div>
      </div>
    </div>
  )
} 