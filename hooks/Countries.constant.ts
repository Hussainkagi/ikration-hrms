export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  flag: string; // Emoji flag
  timezone: string; // Primary IANA timezone
  alternateTimezones?: string[]; // Additional timezones for countries with multiple zones
}

export const COUNTRIES: Country[] = [
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    timezone: "Asia/Dubai",
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    timezone: "America/New_York",
    alternateTimezones: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Anchorage",
      "Pacific/Honolulu",
    ],
  },
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    timezone: "Europe/London",
  },
  {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    alternateTimezones: [
      "America/Toronto",
      "America/Vancouver",
      "America/Edmonton",
      "America/Winnipeg",
      "America/Halifax",
    ],
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    timezone: "Australia/Sydney",
    alternateTimezones: [
      "Australia/Sydney",
      "Australia/Melbourne",
      "Australia/Brisbane",
      "Australia/Perth",
      "Australia/Adelaide",
    ],
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    timezone: "Asia/Singapore",
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    timezone: "Europe/Berlin",
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    timezone: "Europe/Paris",
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    timezone: "Asia/Tokyo",
  },
  {
    name: "China",
    code: "CN",
    flag: "🇨🇳",
    timezone: "Asia/Shanghai",
  },
  {
    name: "Brazil",
    code: "BR",
    flag: "🇧🇷",
    timezone: "America/Sao_Paulo",
  },
  {
    name: "Mexico",
    code: "MX",
    flag: "🇲🇽",
    timezone: "America/Mexico_City",
  },
  {
    name: "South Africa",
    code: "ZA",
    flag: "🇿🇦",
    timezone: "Africa/Johannesburg",
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    flag: "🇸🇦",
    timezone: "Asia/Riyadh",
  },
  {
    name: "Egypt",
    code: "EG",
    flag: "🇪🇬",
    timezone: "Africa/Cairo",
  },
  {
    name: "Nigeria",
    code: "NG",
    flag: "🇳🇬",
    timezone: "Africa/Lagos",
  },
  {
    name: "Kenya",
    code: "KE",
    flag: "🇰🇪",
    timezone: "Africa/Nairobi",
  },
  {
    name: "Pakistan",
    code: "PK",
    flag: "🇵🇰",
    timezone: "Asia/Karachi",
  },
  {
    name: "Bangladesh",
    code: "BD",
    flag: "🇧🇩",
    timezone: "Asia/Dhaka",
  },
  {
    name: "Indonesia",
    code: "ID",
    flag: "🇮🇩",
    timezone: "Asia/Jakarta",
  },
  {
    name: "Malaysia",
    code: "MY",
    flag: "🇲🇾",
    timezone: "Asia/Kuala_Lumpur",
  },
  {
    name: "Philippines",
    code: "PH",
    flag: "🇵🇭",
    timezone: "Asia/Manila",
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    timezone: "Asia/Bangkok",
  },
  {
    name: "Vietnam",
    code: "VN",
    flag: "🇻🇳",
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Turkey",
    code: "TR",
    flag: "🇹🇷",
    timezone: "Europe/Istanbul",
  },
  {
    name: "Russia",
    code: "RU",
    flag: "🇷🇺",
    timezone: "Europe/Moscow",
  },
  {
    name: "Spain",
    code: "ES",
    flag: "🇪🇸",
    timezone: "Europe/Madrid",
  },
  {
    name: "Italy",
    code: "IT",
    flag: "🇮🇹",
    timezone: "Europe/Rome",
  },
  {
    name: "Netherlands",
    code: "NL",
    flag: "🇳🇱",
    timezone: "Europe/Amsterdam",
  },
  {
    name: "Switzerland",
    code: "CH",
    flag: "🇨🇭",
    timezone: "Europe/Zurich",
  },
  {
    name: "Sweden",
    code: "SE",
    flag: "🇸🇪",
    timezone: "Europe/Stockholm",
  },
  {
    name: "Norway",
    code: "NO",
    flag: "🇳🇴",
    timezone: "Europe/Oslo",
  },
  {
    name: "Denmark",
    code: "DK",
    flag: "🇩🇰",
    timezone: "Europe/Copenhagen",
  },
  {
    name: "Poland",
    code: "PL",
    flag: "🇵🇱",
    timezone: "Europe/Warsaw",
  },
  {
    name: "Argentina",
    code: "AR",
    flag: "🇦🇷",
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    name: "Chile",
    code: "CL",
    flag: "🇨🇱",
    timezone: "America/Santiago",
  },
  {
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    timezone: "America/Bogota",
  },
  {
    name: "Peru",
    code: "PE",
    flag: "🇵🇪",
    timezone: "America/Lima",
  },
  {
    name: "New Zealand",
    code: "NZ",
    flag: "🇳🇿",
    timezone: "Pacific/Auckland",
  },
  {
    name: "South Korea",
    code: "KR",
    flag: "🇰🇷",
    timezone: "Asia/Seoul",
  },
  {
    name: "Taiwan",
    code: "TW",
    flag: "🇹🇼",
    timezone: "Asia/Taipei",
  },
  {
    name: "Hong Kong",
    code: "HK",
    flag: "🇭🇰",
    timezone: "Asia/Hong_Kong",
  },
  {
    name: "Israel",
    code: "IL",
    flag: "🇮🇱",
    timezone: "Asia/Jerusalem",
  },
  {
    name: "Qatar",
    code: "QA",
    flag: "🇶🇦",
    timezone: "Asia/Qatar",
  },
  {
    name: "Kuwait",
    code: "KW",
    flag: "🇰🇼",
    timezone: "Asia/Kuwait",
  },
  {
    name: "Bahrain",
    code: "BH",
    flag: "🇧🇭",
    timezone: "Asia/Bahrain",
  },
  {
    name: "Oman",
    code: "OM",
    flag: "🇴🇲",
    timezone: "Asia/Muscat",
  },
  {
    name: "Jordan",
    code: "JO",
    flag: "🇯🇴",
    timezone: "Asia/Amman",
  },
  {
    name: "Lebanon",
    code: "LB",
    flag: "🇱🇧",
    timezone: "Asia/Beirut",
  },
  {
    name: "Ireland",
    code: "IE",
    flag: "🇮🇪",
    timezone: "Europe/Dublin",
  },
  {
    name: "Belgium",
    code: "BE",
    flag: "🇧🇪",
    timezone: "Europe/Brussels",
  },
  {
    name: "Austria",
    code: "AT",
    flag: "🇦🇹",
    timezone: "Europe/Vienna",
  },
  {
    name: "Portugal",
    code: "PT",
    flag: "🇵🇹",
    timezone: "Europe/Lisbon",
  },
  {
    name: "Greece",
    code: "GR",
    flag: "🇬🇷",
    timezone: "Europe/Athens",
  },
  {
    name: "Czech Republic",
    code: "CZ",
    flag: "🇨🇿",
    timezone: "Europe/Prague",
  },
  {
    name: "Romania",
    code: "RO",
    flag: "🇷🇴",
    timezone: "Europe/Bucharest",
  },
  {
    name: "Hungary",
    code: "HU",
    flag: "🇭🇺",
    timezone: "Europe/Budapest",
  },
  {
    name: "Finland",
    code: "FI",
    flag: "🇫🇮",
    timezone: "Europe/Helsinki",
  },
  {
    name: "Ukraine",
    code: "UA",
    flag: "🇺🇦",
    timezone: "Europe/Kiev",
  },
  {
    name: "Morocco",
    code: "MA",
    flag: "🇲🇦",
    timezone: "Africa/Casablanca",
  },
  {
    name: "Ghana",
    code: "GH",
    flag: "🇬🇭",
    timezone: "Africa/Accra",
  },
  {
    name: "Ethiopia",
    code: "ET",
    flag: "🇪🇹",
    timezone: "Africa/Addis_Ababa",
  },
  {
    name: "Tanzania",
    code: "TZ",
    flag: "🇹🇿",
    timezone: "Africa/Dar_es_Salaam",
  },
  {
    name: "Uganda",
    code: "UG",
    flag: "🇺🇬",
    timezone: "Africa/Kampala",
  },
  {
    name: "Sri Lanka",
    code: "LK",
    flag: "🇱🇰",
    timezone: "Asia/Colombo",
  },
  {
    name: "Nepal",
    code: "NP",
    flag: "🇳🇵",
    timezone: "Asia/Kathmandu",
  },
  {
    name: "Myanmar",
    code: "MM",
    flag: "🇲🇲",
    timezone: "Asia/Yangon",
  },
  {
    name: "Cambodia",
    code: "KH",
    flag: "🇰🇭",
    timezone: "Asia/Phnom_Penh",
  },
];

/**
 * Get country by name or code
 */
export function getCountryByIdentifier(
  identifier: string,
): Country | undefined {
  const normalized = identifier.toLowerCase().trim();
  return COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.code.toLowerCase() === normalized,
  );
}

/**
 * Search countries by query
 */
export function searchCountries(query: string): Country[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return COUNTRIES;

  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(normalized) ||
      c.code.toLowerCase().includes(normalized),
  );
}
