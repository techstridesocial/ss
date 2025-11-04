// Simple mock for Next.js server without using undici
export const NextRequest = class NextRequest {
  constructor(public url: string, public init?: any) {}
} as any

export const NextResponse = {
  json: (data: any) => ({
    json: async () => data,
    status: 200,
    headers: new Map([['Content-Type', 'application/json']]),
  }),
  redirect: (url: string) => ({
    status: 302,
    headers: new Map([['Location', url]]),
  }),
} as any
