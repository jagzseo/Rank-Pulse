import { Location } from '../types';

export const locations: Location[] = [
  {
    country: 'United States',
    countryCode: 'us',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Nashville', 'Oklahoma City', 'El Paso', 'Boston', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Mesa', 'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Omaha', 'Raleigh', 'Miami', 'Virginia Beach', 'Long Beach', 'Oakland', 'Minneapolis', 'Tampa', 'Tulsa', 'Arlington', 'New Orleans', 'Wichita', 'Cleveland'],
  },
  {
    country: 'United Kingdom',
    countryCode: 'gb',
    cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Leeds', 'Liverpool', 'Bristol', 'Edinburgh', 'Sheffield', 'Cardiff', 'Belfast', 'Leicester', 'Nottingham', 'Newcastle', 'Brighton', 'Southampton', 'Portsmouth', 'Plymouth', 'Reading', 'Wolverhampton', 'Derby', 'Coventry', 'Oxford', 'Cambridge', 'Bath', 'York', 'Canterbury', 'Norwich', 'Exeter', 'Bournemouth'],
  },
  {
    country: 'Canada',
    countryCode: 'ca',
    cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'St. Johns', 'Barrie', 'Kelowna'],
  },
  {
    country: 'Australia',
    countryCode: 'au',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Hobart', 'Darwin', 'Geelong', 'Townsville', 'Cairns', 'Toowoomba', 'Ballarat', 'Bendigo', 'Launceston', 'Mackay', 'Rockhampton', 'Bundaberg'],
  },
  {
    country: 'Germany',
    countryCode: 'de',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster'],
  },
  {
    country: 'France',
    countryCode: 'fr',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'],
  },
  {
    country: 'India',
    countryCode: 'in',
    cities: [
      // North India
      'Delhi', 'Chandigarh', 'Jaipur', 'Lucknow', 'Agra', 'Varanasi', 'Amritsar', 'Ludhiana', 'Dehradun', 'Haridwar', 'Jammu', 'Srinagar', 'Noida', 'Gurugram',
      // West India
      'Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Nashik', 'Nagpur', 'Indore', 'Bhopal', 'Udaipur', 'Jodhpur', 'Kota', 'Aurangabad',
      // South India
      'Bengaluru', 'Chennai', 'Hyderabad', 'Kochi', 'Thiruvananthapuram', 'Coimbatore', 'Madurai', 'Mysuru', 'Mangaluru', 'Visakhapatnam', 'Vijayawada', 'Tiruchirappalli',
      // East India
      'Kolkata', 'Bhubaneswar', 'Cuttack', 'Patna', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Guwahati', 'Siliguri', 'Asansol',
      // Central India
      'Gwalior', 'Jabalpur', 'Raipur', 'Bilaspur',
      // Northeast India
      'Shillong', 'Imphal', 'Agartala', 'Aizawl', 'Kohima', 'Itanagar',
    ],
  },
  {
    country: 'Japan',
    countryCode: 'jp',
    cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kawasaki', 'Kobe', 'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka', 'Okayama'],
  },
  {
    country: 'Brazil',
    countryCode: 'br',
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'Natal', 'Vitória', 'Santos', 'Florianópolis', 'Campo Grande', 'Feira de Santana'],
  },
  {
    country: 'Netherlands',
    countryCode: 'nl',
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Apeldoorn', 'Haarlem', 'Arnhem', 'Enschede', 'Amersfoort', 'Zaanstad', 's-Hertogenbosch', 'Zoetermeer', 'Zwolle', 'Maastricht'],
  },
];

export const searchEngines = [
  { id: 'google', name: 'Google', icon: '🔍' },
  { id: 'bing', name: 'Bing', icon: '🅱️' },
  { id: 'yahoo', name: 'Yahoo', icon: '📧' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆' },
];
