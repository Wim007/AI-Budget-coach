import { WeekBudget, CategorySummary, CoachAdvice } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  boodschappen: 'boodschappen',
  wonen: 'wonen & vaste lasten',
  vervoer: 'vervoer',
  gezondheid: 'gezondheid',
  restaurants: 'eten & drinken buitenshuis',
  entertainment: 'entertainment',
  kleding: 'kleding',
  sparen: 'sparen',
  overig: 'overige uitgaven',
};

export class CoachService {
  generateAdvice(
    budget: WeekBudget,
    categories: CategorySummary[],
    profileType: string
  ): CoachAdvice {
    const tips: string[] = [];
    const pct = budget.percentage_used;

    const alertLevel: 'green' | 'orange' | 'red' =
      pct >= 100 ? 'red' : pct >= 75 ? 'orange' : 'green';

    // Hoofdzin
    let summary: string;
    if (pct >= 100) {
      const over = Math.abs(budget.remaining).toFixed(2);
      summary = `Je weekbudget is overschreden met €${over}. Vermijd extra uitgaven tot volgende week.`;
    } else if (pct >= 75) {
      summary = `Je hebt nog €${budget.remaining.toFixed(2)} over deze week — wees voorzichtig met nieuwe uitgaven.`;
    } else if (pct < 20 && budget.weekly_budget > 0) {
      summary = `Goed bezig! Je hebt nog €${budget.remaining.toFixed(2)} over. Je bent zuinig deze week.`;
    } else {
      summary = `Je kunt deze week nog €${budget.remaining.toFixed(2)} uitgeven.`;
    }

    // Top categorie-tip
    if (categories.length > 0) {
      const top = categories[0];
      const label = CATEGORY_LABELS[top.category] ?? top.category;
      tips.push(
        `Grootste post: ${label} — €${top.total.toFixed(2)} deze week (${top.count}×). Klopt dit?`
      );
    }

    // Budget-voortgang tip
    if (pct >= 100) {
      tips.push(
        'Weekbudget op. Kijk welke categorie het meest uitloopt en pas volgende week je gedrag aan.'
      );
    } else if (pct >= 75) {
      tips.push(
        `Je zit op ${pct.toFixed(0)}% van je weekbudget. Controleer of geplande uitgaven nog passen.`
      );
    } else if (pct < 50 && budget.remaining > 50) {
      tips.push(
        `Je houdt €${budget.remaining.toFixed(2)} over. Overweeg €${Math.floor(budget.remaining * 0.3)} naar je spaarrekening te zetten.`
      );
    }

    // Categorie-specifieke tips
    const restaurants = categories.find((c) => c.category === 'restaurants');
    if (restaurants && restaurants.total > 40) {
      tips.push(
        `Je geeft €${restaurants.total.toFixed(2)} uit aan eten buitenshuis. Zelf koken bespaart gemiddeld 60% per maaltijd.`
      );
    }

    const entertainment = categories.find((c) => c.category === 'entertainment');
    if (entertainment && entertainment.count >= 3) {
      tips.push(
        `${entertainment.count} entertainment-abonnementen/aankopen — check welke je echt gebruikt.`
      );
    }

    // ZZP-tip
    if (profileType === 'zzp') {
      tips.push(
        'ZZP-tip: zet 30% van je bruto-inkomsten apart voor belasting en pensioen voordat je jezelf uitbetaalt.'
      );
    }

    return {
      summary,
      tips: tips.slice(0, 3),
      alert_level: alertLevel,
    };
  }
}
