export interface CountryOption {
  country: string;
  language: string;
  regions?: string[];
}

export const countries: CountryOption[] = [
  {
    country: "Brasil",
    language: "Português",
    regions: [
      "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
      "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
      "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
      "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
      "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
    ]
  },
  { country: "China", language: "Chinês (mandarim)", regions: ["Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Mongólia Interior", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"] },
  { country: "Estados Unidos", language: "Inglês", regions: ["Alabama", "Alaska", "Arizona", "Arkansas", "Califórnia", "Colorado", "Connecticut", "Delaware", "Flórida", "Geórgia", "Havaí", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "Novo México", "Nova York", "Carolina do Norte", "Dakota do Norte", "Ohio", "Oklahoma", "Oregon", "Pensilvânia", "Rhode Island", "Carolina do Sul", "Dakota do Sul", "Tennessee", "Texas", "Utah", "Vermont", "Virgínia", "Washington", "Virgínia Ocidental", "Wisconsin", "Wyoming"] },
  { country: "Portugal", language: "Português", regions: ["Açores", "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Madeira", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu"] },
  { country: "Canadá", language: "Inglês", regions: ["Alberta", "Colúmbia Britânica", "Manitoba", "Nova Brunswick", "Terra Nova e Labrador", "Territórios do Noroeste", "Nova Escócia", "Nunavut", "Ontário", "Ilha do Príncipe Eduardo", "Quebec", "Saskatchewan", "Yukon"] },
  { country: "México", language: "Espanhol", regions: ["Aguascalientes", "Baixa Califórnia", "Baixa Califórnia Sur", "Campeche", "Chiapas", "Chihuahua", "Cidade do México", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Estado do México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"] },
  { country: "Argentina", language: "Espanhol", regions: ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Cidade Autônoma de Buenos Aires", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Terra do Fogo", "Tucumán"] },
  { country: "Austrália", language: "Inglês", regions: ["Território da Capital Australiana", "Nova Gales do Sul", "Território do Norte", "Queensland", "Austrália do Sul", "Tasmânia", "Victoria", "Austrália Ocidental"] },
  { country: "Índia", language: "Hindi", regions: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajastão", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "Bengala Ocidental"] },
  { country: "Alemanha", language: "Alemão", regions: ["Baden-Württemberg", "Baviera", "Berlim", "Brandemburgo", "Bremen", "Hamburgo", "Hesse", "Mecklemburgo-Pomerânia Ocidental", "Baixa Saxônia", "Renânia do Norte-Vestfália", "Renânia-Palatinado", "Sarre", "Saxônia", "Saxônia-Anhalt", "Schleswig-Holstein", "Turíngia"] },
  { country: "França", language: "Francês", regions: ["Auvergne-Rhône-Alpes", "Borgonha-Franco-Condado", "Bretanha", "Centro-Vale do Loire", "Córsega", "Grande Leste", "Alta França", "Ilha de França", "Normandia", "Nova Aquitânia", "Occitânia", "País do Loire", "Provença-Alpes-Costa Azul"] },
  { country: "Espanha", language: "Espanhol", regions: ["Andaluzia", "Aragão", "Astúrias", "Ilhas Baleares", "País Basco", "Canárias", "Cantábria", "Castela-La Mancha", "Castela e Leão", "Catalunha", "Extremadura", "Galícia", "La Rioja", "Madri", "Múrcia", "Navarra", "Comunidade Valenciana"] },
  { country: "Itália", language: "Italiano", regions: ["Abruzzo", "Vale de Aosta", "Apúlia", "Basilicata", "Calábria", "Campânia", "Emília-Romanha", "Friuli-Veneza Júlia", "Lácio", "Ligúria", "Lombardia", "Marche", "Molise", "Piemonte", "Sardenha", "Sicília", "Trentino-Alto Ádige", "Toscana", "Úmbria", "Vêneto"] },
  { country: "Japão", language: "Japonês", regions: ["Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tóquio", "Kanagawa", "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Quioto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"] },
  { country: "Reino Unido", language: "Inglês", regions: ["Inglaterra", "Escócia", "País de Gales", "Irlanda do Norte"] },
  { country: "Coreia do Sul", language: "Coreano", regions: ["Seul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan", "Sejong", "Gyeonggi", "Gangwon", "Chungcheong Norte", "Chungcheong Sul", "Jeolla Norte", "Jeolla Sul", "Gyeongsang Norte", "Gyeongsang Sul", "Jeju"] },
  { country: "Rússia", language: "Russo", regions: ["Moscou", "São Petersburgo", "Tartaristão", "Sibéria", "Urais", "Extremo Oriente"] },
  { country: "Chile", language: "Espanhol", regions: ["Arica e Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Santiago Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magalhães"] },
  { country: "Colômbia", language: "Espanhol", regions: ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"] },
  { country: "Turquia", language: "Turco", regions: ["Adana", "Ankara", "Antália", "Bursa", "Istambul", "Izmir", "Konya", "Gaziantep", "Mersin", "Trabzon"] },
  { country: "África do Sul", language: "Inglês", regions: ["Cabo Oriental", "Estado Livre", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Cabo Setentrional", "Noroeste", "Cabo Ocidental"] },
  { country: "Suíça", language: "Alemão", regions: ["Aargau", "Basileia-Campo", "Basileia-Cidade", "Berna", "Friburgo", "Genebra", "Glarus", "Grisões", "Jura", "Lucerna", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Ticino", "Thurgau", "Uri", "Valais", "Vaud", "Zug", "Zurique"] },
  { country: "Irlanda", language: "Inglês", regions: ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"] },
  { country: "Angola", language: "Português", regions: ["Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cubango", "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"] },
  { country: "Moçambique", language: "Português", regions: ["Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo", "Nampula", "Niassa", "Sofala", "Tete", "Zambézia"] },
  { country: "Singapura", language: "Inglês" },
  { country: "Emirados Árabes Unidos", language: "Árabe", regions: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] },
  { country: "Países Baixos", language: "Neerlandês", regions: ["Drenthe", "Flevoland", "Frísia", "Gelderland", "Groningen", "Limburgo", "Brabante do Norte", "Holanda do Norte", "Overijssel", "Holanda do Sul", "Utrecht", "Zelândia"] },
  { country: "Tailândia", language: "Tailandês", regions: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Khon Kaen", "Nakhon Ratchasima"] },
  { country: "Nova Zelândia", language: "Inglês", regions: ["Auckland", "Baía de Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Whanganui", "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman", "Waikato", "Wellington", "West Coast"] },
  { country: "Peru", language: "Espanhol", regions: ["Amazonas", "Ancash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"] }
];

export function getCountry(country: string): CountryOption | undefined {
  return countries.find((option) => option.country === country);
}

export function getLanguage(country: string): string {
  return getCountry(country)?.language ?? "Inglês";
}
