import { SignUp } from '@clerk/nextjs'

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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stride Social
          </h1>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
            Dashboard
          </div>
          <p className="text-sm text-gray-600">
            Create your account
          </p>
        </div>
        <div className="w-full flex justify-center">
          <SignUp appearance={appearance} afterSignInUrl="/" afterSignUpUrl="/" />
        </div>
      </div>
    </div>
  )
} 