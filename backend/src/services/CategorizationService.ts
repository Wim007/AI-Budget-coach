const CATEGORY_RULES: Record<string, string[]> = {
  boodschappen: [
    'albert heijn', ' ah ', 'jumbo', 'lidl', 'aldi', 'plus supermarkt', 'dirk',
    'coop', 'spar', 'hoogvliet', 'deka markt', 'vomar', 'supermarkt', 'boodschappen',
  ],
  wonen: [
    'huur', 'hypotheek', 'energie', 'eneco', 'vattenfall', 'nuon', 'vitens',
    'waterbedrijf', 'woningcorporatie', 'vve', 'servicekosten', 'internet', 'kpn',
    'ziggo', 't-mobile thuis', 'vodafone thuis', 'gemeente', 'ozb', 'waterschap',
  ],
  vervoer: [
    'ns ', 'ns.nl', 'gvb', 'ret', 'htm', 'ov-chipkaart', 'connexxion', 'arriva',
    'keolis', 'shell', 'bp ', 'total ', 'texaco', 'esso', 'q8', 'tango', 'tinq',
    'benzine', 'parkeer', 'anwb',
  ],
  gezondheid: [
    'apotheek', 'huisarts', 'tandarts', 'ziekenhuis', 'fysiotherap', 'opticien',
    'etos', 'kruidvat', 'da drogist', 'zorgverzekeraar', 'zilveren kruis',
    'cz ', 'vgz', 'menzis', 'achmea',
  ],
  restaurants: [
    'restaurant', 'cafe ', 'café', 'mcdonalds', 'burger king', 'subway', 'kfc',
    'pizza', 'sushi', 'thuisbezorgd', 'uber eats', 'deliveroo', 'dominos',
    'new york pizza', 'snackbar', 'eetcafe', 'lunchroom', 'broodje',
  ],
  entertainment: [
    'netflix', 'spotify', 'disney', 'hbo', 'videoland', 'bioscoop', 'pathé',
    'vue cinema', 'steam', 'playstation', 'xbox', 'nintendo', 'ticketmaster',
    'eventbrite', 'concertgebouw', 'museum', 'dierentuin',
  ],
  kleding: [
    'h&m', 'zara', 'primark', 'bijenkorf', 'mango', 'c&a', 'we fashion',
    'esprit', 'jack & jones', 'only ', 'vero moda', 'uniqlo', 'cos ',
    'monki', 'weekday', 'zalando', 'about you',
  ],
  sparen: ['spaarrekening', 'spaarpot', 'belegging', 'degiro', 'meesman', 'bux'],
};

export class CategorizationService {
  categorize(description: string): string {
    const lower = description.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        return category;
      }
    }
    return 'overig';
  }
}
