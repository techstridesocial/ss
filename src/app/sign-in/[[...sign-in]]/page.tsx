import { SignIn } from '@clerk/nextjs'

export default function Page() {
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
      style={{
        backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-cyan-DCLBrf9zXPufk7mvNq7d9hASFRCTQt.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="w-full max-w-md flex flex-col items-center text-center relative z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Stride Social
          </h1>
          <div className="text-xs uppercase tracking-wider text-white/80 font-medium mb-3">
            Dashboard
          </div>
          <p className="text-sm text-white">
            Sign in to your account
          </p>
        </div>
        <div className="w-full flex justify-center">
          <SignIn 
            appearance={appearance}
            afterSignInUrl="/"
            afterSignUpUrl="/"
            routing="hash"
            signUpUrl="/sign-up?role=influencer"
            redirectUrl="/"
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-white mb-2">Don't have an account?</p>
          <a 
            href="/sign-up?role=influencer" 
            className="text-sm font-medium text-white hover:text-white/80 hover:underline transition-colors"
          >
            Sign up as Influencer →
          </a>
        </div>
      </div>
    </div>
  )
} 