# AI Budgetcoach – MVP

AI Budgetcoach is een minimal viable product voor een slimme, Nederlandstalige budgetcoach die mensen helpt **wekelijkse rust in hun geld** te krijgen. De focus ligt op inzicht, een eerlijk weekbudget en praktische, directe tips in plaats van ingewikkelde tabellen.

## Wat doet het?

- Geeft gebruikers één simpele kernvraag beantwoord:  
  **"Hoeveel kan ik deze week nog uitgeven zonder gezeik aan het einde van de maand?"**  
- Combineert inkomensgegevens, vaste lasten en transacties tot een persoonlijk weekbudget.  
- Werkt zowel voor mensen met vast salaris als voor zzp'ers met wisselend inkomen (variabel inkomen-modus).  
- Biedt een eerste versie van een AI-coach die in gewone mensentaal uitlegt wat er opvalt in je uitgaven en welke één of twee acties nu slim zijn.

## Kernfeatures in de MVP

- Registratie, login en profiel (particulier of zzp'er).  
- Transacties ophalen via mock-bankkoppeling én handmatig uploaden (CSV/MT940).  
- Automatische categorisering op basis van simpele regels (boodschappen, wonen, vervoer, etc.) met handmatige correctie.  
- Automatische weekbudget-berekening op basis van inkomen, vaste lasten en historisch gedrag.  
- Dashboard met:  
  - huidig weekbudget (totaal, uitgegeven, resterend),  
  - basisgrafiek uitgaven per categorie,  
  - "belangrijk deze week"-signalen als je bijna over je budget gaat.  
- AI-coach-endpoint dat concrete tekstuele adviezen geeft op basis van je huidige situatie (LLM kan later worden gekoppeld).

## Voor wie is dit?

- Particulieren die genoeg hebben van Excel en vage overzichten en gewoon willen weten: "mag dit nog?".  
- ZZP'ers/freelancers met wisselend inkomen die behoefte hebben aan een **veilig** weekbedrag dat rekening houdt met pieken en dalen.  

## Techniek in het kort

- Backend: Node.js + Express, TypeScript, JWT-authenticatie, relationele database (bijv. PostgreSQL).  
- Frontend: React/Next.js met een rustig, functioneel dashboard.  
- Architectuur voorbereid op PSD2-bankkoppeling via een aparte BankConnectionService en uitbreidbare categorisatie-/coachmodules.  

Deze MVP is bewust smal: geen alles-in-één bank-app, maar een gefocuste coach die één probleem extreem goed oplost – **wekelijks geldstress verlagen met duidelijke, haalbare acties.**
