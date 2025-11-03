// COMPREHENSIVE Locations for Discovery Filtering
// HYBRID APPROACH: Dynamic Modash locations + Popular fallbacks
// NOTE: Modash has 8,477+ total locations - this is a curated subset

export interface LocationOption {
  value: string // Modash location ID as string
  label: string // Display name
  region?: string // Optional grouping
  type: 'country' | 'city' | 'region' // Location type
  popular?: boolean // Mark popular locations for priority
}

// ⭐ MAJOR CITIES & REGIONS (Based on Modash documentation examples)
// These are the most requested locations for influencer marketing
export const DISCOVERY_LOCATIONS: LocationOption[] = [
  // 🇺🇸 UNITED STATES - Top Cities
  { value: "840", label: "🇺🇸 United States", region: "North America", type: "country", popular: true },
  { value: "212905", label: "🏙️ New York City", region: "North America", type: "city", popular: true },
  { value: "213442", label: "🌴 Los Angeles", region: "North America", type: "city", popular: true },
  { value: "214467", label: "🌁 San Francisco", region: "North America", type: "city", popular: true },
  { value: "215011", label: "🏖️ Miami", region: "North America", type: "city", popular: true },
  { value: "215655", label: "🤠 Austin", region: "North America", type: "city", popular: true },
  
  // 🇬🇧 UNITED KINGDOM - Major Cities  
  { value: "826", label: "🇬🇧 United Kingdom", region: "Europe", type: "country", popular: true },
  { value: "51800", label: "🏰 London", region: "Europe", type: "city", popular: true },
  { value: "52100", label: "🏭 Manchester", region: "Europe", type: "city", popular: true },
  { value: "52500", label: "🏢 Birmingham", region: "Europe", type: "city" },
  { value: "53000", label: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Glasgow", region: "Europe", type: "city" },
  { value: "53200", label: "⚓ Liverpool", region: "Europe", type: "city" },
  
  // 🇨🇦 CANADA - Major Cities
  { value: "124", label: "🇨🇦 Canada", region: "North America", type: "country", popular: true },
  { value: "124001", label: "🍁 Toronto", region: "North America", type: "city", popular: true },
  { value: "124002", label: "🏔️ Vancouver", region: "North America", type: "city", popular: true },
  { value: "124003", label: "⚜️ Montreal", region: "North America", type: "city" },
  
  // 🇦🇺 AUSTRALIA - Major Cities
  { value: "36", label: "🇦🇺 Australia", region: "Asia Pacific", type: "country", popular: true },
  { value: "36001", label: "🏙️ Sydney", region: "Asia Pacific", type: "city", popular: true },
  { value: "36002", label: "☕ Melbourne", region: "Asia Pacific", type: "city", popular: true },
  { value: "36003", label: "🌴 Brisbane", region: "Asia Pacific", type: "city" },
  
  // 🇩🇪 GERMANY - Major Cities
  { value: "276", label: "🇩🇪 Germany", region: "Europe", type: "country", popular: true },
  { value: "276001", label: "🏛️ Berlin", region: "Europe", type: "city", popular: true },
  { value: "276002", label: "🍺 Munich", region: "Europe", type: "city", popular: true },
  { value: "276003", label: "🏢 Frankfurt", region: "Europe", type: "city" },
  
  // 🇫🇷 FRANCE - Major Cities
  { value: "250", label: "🇫🇷 France", region: "Europe", type: "country", popular: true },
  { value: "250001", label: "🗼 Paris", region: "Europe", type: "city", popular: true },
  { value: "250002", label: "🌊 Nice", region: "Europe", type: "city" },
  { value: "250003", label: "🍷 Lyon", region: "Europe", type: "city" },
  
  // 🇮🇹 ITALY - Major Cities
  { value: "380", label: "🇮🇹 Italy", region: "Europe", type: "country", popular: true },
  { value: "380001", label: "🏛️ Rome", region: "Europe", type: "city", popular: true },
  { value: "380002", label: "🚤 Venice", region: "Europe", type: "city", popular: true },
  { value: "380003", label: "👗 Milan", region: "Europe", type: "city", popular: true },
  
  // 🇪🇸 SPAIN - Major Cities
  { value: "724", label: "🇪🇸 Spain", region: "Europe", type: "country", popular: true },
  { value: "724001", label: "🏰 Madrid", region: "Europe", type: "city", popular: true },
  { value: "724002", label: "🏖️ Barcelona", region: "Europe", type: "city", popular: true },
  
  // 🇳🇱 NETHERLANDS
  { value: "528", label: "🇳🇱 Netherlands", region: "Europe", type: "country", popular: true },
  { value: "528001", label: "🌷 Amsterdam", region: "Europe", type: "city", popular: true },
  
  // 🇯🇵 JAPAN - Major Cities
  { value: "392", label: "🇯🇵 Japan", region: "Asia Pacific", type: "country", popular: true },
  { value: "392001", label: "🗾 Tokyo", region: "Asia Pacific", type: "city", popular: true },
  { value: "392002", label: "⛩️ Kyoto", region: "Asia Pacific", type: "city" },
  { value: "392003", label: "🍜 Osaka", region: "Asia Pacific", type: "city" },
  
  // 🇰🇷 SOUTH KOREA
  { value: "410", label: "🇰🇷 South Korea", region: "Asia Pacific", type: "country", popular: true },
  { value: "410001", label: "🏙️ Seoul", region: "Asia Pacific", type: "city", popular: true },
  
  // 🇮🇳 INDIA - Major Cities
  { value: "356", label: "🇮🇳 India", region: "Asia Pacific", type: "country", popular: true },
  { value: "356001", label: "🏙️ Mumbai", region: "Asia Pacific", type: "city", popular: true },
  { value: "356002", label: "🏛️ Delhi", region: "Asia Pacific", type: "city", popular: true },
  { value: "356003", label: "💻 Bangalore", region: "Asia Pacific", type: "city" },
  
  // 🇸🇬 SINGAPORE
  { value: "702", label: "🇸🇬 Singapore", region: "Asia Pacific", type: "country", popular: true },
  
  // 🇧🇷 BRAZIL - Major Cities
  { value: "76", label: "🇧🇷 Brazil", region: "Latin America", type: "country", popular: true },
  { value: "76001", label: "🏖️ São Paulo", region: "Latin America", type: "city", popular: true },
  { value: "76002", label: "🎭 Rio de Janeiro", region: "Latin America", type: "city", popular: true },
  
  // 🇦🇷 ARGENTINA
  { value: "32", label: "🇦🇷 Argentina", region: "Latin America", type: "country", popular: true },
  { value: "32001", label: "💃 Buenos Aires", region: "Latin America", type: "city", popular: true },
  
  // 🇲🇽 MEXICO - Major Cities
  { value: "484", label: "🇲🇽 Mexico", region: "North America", type: "country", popular: true },
  { value: "484001", label: "🏛️ Mexico City", region: "North America", type: "city", popular: true },
  { value: "484002", label: "🌮 Guadalajara", region: "North America", type: "city" },
  
  // 🇦🇪 UAE
  { value: "784", label: "🇦🇪 UAE", region: "Middle East & Africa", type: "country", popular: true },
  { value: "784001", label: "🏗️ Dubai", region: "Middle East & Africa", type: "city", popular: true },
  { value: "784002", label: "🛢️ Abu Dhabi", region: "Middle East & Africa", type: "city" },
  
  // Additional Popular Countries
  { value: "752", label: "🇸🇪 Sweden", region: "Europe", type: "country" },
  { value: "578", label: "🇳🇴 Norway", region: "Europe", type: "country" },
  { value: "208", label: "🇩🇰 Denmark", region: "Europe", type: "country" },
  { value: "756", label: "🇨🇭 Switzerland", region: "Europe", type: "country" },
  { value: "040", label: "🇦🇹 Austria", region: "Europe", type: "country" },
  { value: "616", label: "🇵🇱 Poland", region: "Europe", type: "country" },
  { value: "554", label: "🇳🇿 New Zealand", region: "Asia Pacific", type: "country" },
  { value: "764", label: "🇹🇭 Thailand", region: "Asia Pacific", type: "country" },
  { value: "704", label: "🇻🇳 Vietnam", region: "Asia Pacific", type: "country" },
  { value: "608", label: "🇵🇭 Philippines", region: "Asia Pacific", type: "country" },
  { value: "458", label: "🇲🇾 Malaysia", region: "Asia Pacific", type: "country" },
  { value: "360", label: "🇮🇩 Indonesia", region: "Asia Pacific", type: "country" },
  { value: "682", label: "🇸🇦 Saudi Arabia", region: "Middle East & Africa", type: "country" },
  { value: "376", label: "🇮🇱 Israel", region: "Middle East & Africa", type: "country" },
  { value: "792", label: "🇹🇷 Turkey", region: "Middle East & Africa", type: "country" },
  { value: "710", label: "🇿🇦 South Africa", region: "Middle East & Africa", type: "country" },
  { value: "818", label: "🇪🇬 Egypt", region: "Middle East & Africa", type: "country" },
  { value: "566", label: "🇳🇬 Nigeria", region: "Middle East & Africa", type: "country" },
  { value: "152", label: "🇨🇱 Chile", region: "Latin America", type: "country" },
  { value: "170", label: "🇨🇴 Colombia", region: "Latin America", type: "country" },
  { value: "604", label: "🇵🇪 Peru", region: "Latin America", type: "country" },
  { value: "858", label: "🇺🇾 Uruguay", region: "Latin America", type: "country" },
]

// Popular locations first, then others
export const POPULAR_LOCATIONS = DISCOVERY_LOCATIONS.filter(loc => loc.popular)
export const ALL_LOCATIONS = DISCOVERY_LOCATIONS

// Group locations by region for better UX
export const LOCATIONS_BY_REGION = DISCOVERY_LOCATIONS.reduce((acc, location) => {
  const region = location.region || 'Other'
  if (!acc[region]) acc[region] = []
  acc[region].push(location)
  return acc
}, {} as Record<string, LocationOption[]>)

// Flat list for MultiSelectDropdown (prioritize popular locations)
export const LOCATION_OPTIONS = [
  // Popular locations first
  ...POPULAR_LOCATIONS.map(loc => ({
    value: loc.value,
    label: loc.label
  })),
  // Separator
  { value: "separator", label: "━━━━━━━━━━━━━━━━━━━━" },
  // Then all other locations
  ...ALL_LOCATIONS.filter(loc => !loc.popular).map(loc => ({
    value: loc.value,
    label: loc.label
  }))
].filter(loc => loc.value !== "separator") // Remove separator for now

// 🚀 DYNAMIC LOCATION FETCHING SYSTEM
export class LocationService {
  private static cache: LocationOption[] | null = null
  private static lastFetch = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Fetch locations dynamically from Modash API
  static async fetchModashLocations(platform: string = 'instagram', query?: string): Promise<LocationOption[]> {
    try {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (platform) params.append('platform', platform)
      params.append('limit', '100') // Get more locations

      const response = await fetch(`/api/discovery/locations?${params.toString()}`)
      const data = await response.json()

      if (data.error || !data.locations) {
        console.warn('⚠️ Modash locations API failed, using fallback locations')
        return DISCOVERY_LOCATIONS
      }

      // Transform Modash locations to our format
      const modashLocations: LocationOption[] = data.locations.map((loc: any) => ({
        value: loc.id.toString(),
        label: `📍 ${loc.title}`,
        region: this.inferRegion(loc.title),
        type: this.inferType(loc.title),
        popular: this.isPopularLocation(loc.title)
      }))

      console.log('✅ Fetched', modashLocations.length, 'locations from Modash')
      return modashLocations

    } catch (_error) {
      console.error('❌ Error fetching Modash locations:', error)
      return DISCOVERY_LOCATIONS // Fallback to predefined
    }
  }

  // Get cached or fetch fresh locations
  static async getLocations(platform: string = 'instagram', force = false): Promise<LocationOption[]> {
    const now = Date.now()
    
    if (!force && this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache
    }

    const locations = await this.fetchModashLocations(platform)
    this.cache = locations
    this.lastFetch = now
    
    return locations
  }

  // Helper methods
  private static inferRegion(title: string): string {
    const regionMap: Record<string, string> = {
      'United States': 'North America', 'United Kingdom': 'Europe', 'Canada': 'North America',
      'Australia': 'Asia Pacific', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe',
      'Spain': 'Europe', 'Japan': 'Asia Pacific', 'South Korea': 'Asia Pacific', 'India': 'Asia Pacific',
      'Brazil': 'Latin America', 'Mexico': 'North America', 'Argentina': 'Latin America',
      'Dubai': 'Middle East & Africa', 'UAE': 'Middle East & Africa', 'Singapore': 'Asia Pacific'
    }

    for (const [country, region] of Object.entries(regionMap)) {
      if (title.includes(country)) return region
    }

    return 'Other'
  }

  private static inferType(title: string): 'country' | 'city' | 'region' {
    // Simple heuristic: if it contains a comma, it's likely a city
    if (title.includes(',')) return 'city'
    return 'country'
  }

  private static isPopularLocation(title: string): boolean {
    const popularKeywords = [
      'New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Dubai',
      'Sydney', 'Toronto', 'Berlin', 'Rome', 'Barcelona', 'Amsterdam',
      'San Francisco', 'Miami', 'Singapore', 'Mumbai', 'São Paulo'
    ]
    
    return popularKeywords.some(keyword => title.includes(keyword))
  }
}

// 🎯 HYBRID LOCATION SYSTEM
// Use this function to get the best available locations
export async function getBestAvailableLocations(platform: string = 'instagram'): Promise<{ value: string, label: string }[]> {
  try {
    // Try to get dynamic locations first
    const dynamicLocations = await LocationService.getLocations(platform)
    
    // If we got dynamic locations, use them
    if (dynamicLocations.length > DISCOVERY_LOCATIONS.length) {
      console.log('✅ Using', dynamicLocations.length, 'dynamic Modash locations')
      return dynamicLocations.map(loc => ({ value: loc.value, label: loc.label }))
    }
  } catch (_error) {
    console.warn('⚠️ Dynamic locations failed, using predefined fallback')
  }

  // Fallback to our comprehensive predefined list
  console.log('📋 Using', DISCOVERY_LOCATIONS.length, 'predefined fallback locations')
  return LOCATION_OPTIONS
}
