/**
 * Internationalization (i18n) Module
 * Provides multi-language support for the poker planning app
 */

const translations = {
    sv: {
        // Welcome Screen
        'app.title': 'pokipoki',
        'app.tagline': 'Poker Planning sessioner för teams',
        'welcome.heading': 'Kom igång',
        'welcome.name.label': 'Ditt namn',
        'welcome.name.placeholder': 'Ange ditt namn',
        'welcome.theme.label': 'Tema',
        'theme.modern': 'Modern (Glassmorphism)',
        'theme.flat': 'Flat Design',
        'theme.retro': 'Retro 90-tal',
        'welcome.create.button': 'Skapa ny session',
        'welcome.divider': 'ELLER',
        'welcome.sessionid.label': 'ID',
        'welcome.sessionid.placeholder': 'Ange session-ID (t.ex. A1B2C3D4)',
        'welcome.join.button': 'Gå med i session',

        // Header
        'header.session': 'Session:',

        // Participants
        'participants.heading': 'Deltagare',

        // Voting Controls
        'voting.title.label': 'Rundans titel (frivillig):',
        'voting.title.placeholder': 'T.ex. User Story 123',
        'voting.description.label': 'Beskrivning (frivillig):',
        'voting.description.placeholder': 'Beskriv vad vi röstar om...',
        'voting.timer.label': 'Timer (minuter):',
        'voting.start.button': 'Starta runda',

        // Round Info
        'round.badge': 'Runda',

        // Voting Area
        'voting.choose.heading': 'Välj ditt kort',
        'voting.reveal.button': 'Avslöja nu',
        'voting.reveal.hint.waiting': 'Väntar på att alla ska rösta...',
        'voting.reveal.hint.ready': 'Alla har röstat! Redo att avslöja.',
        'voting.status.selected': 'Du har valt:',
        'voting.status.updated': 'Röst uppdaterad till:',

        // Results
        'results.heading': 'Resultat',
        'results.discussion.button': 'Starta diskussion',
        'results.newround.button': 'Ny runda',

        // Errors
        'error.name.required': 'Ange ditt namn',
        'error.sessionid.required': 'Ange session-ID',
        'error.session.create': 'Kunde inte skapa session:',
        'error.session.join': 'Kunde inte gå med i session:',

        // Admin
        'admin.kick.button': 'Kicka',
        'admin.kicked.message': 'Du har blivit utkastad från sessionen',
        'participant.voted': 'Röstat',

        // Chat
        'chat.heading': 'Chat',
        'chat.placeholder': 'Skriv ett meddelande...',

        // Waiting
        'voting.waiting.title': 'Väntar på att rundan ska börja',
        'voting.waiting.description': 'Host startar rundan när alla är redo.',

        // Session
        'session.id.label': 'ID:',
        'session.copy.success': 'Session-ID kopierat!',
        'session.copy.button': 'Kopiera session-ID',
        'session.end.button': 'Avsluta session',
        'session.end.confirm': 'Är du säker? Alla deltagare kommer att kopplas från.',
        'session.end.confirm.participants': 'Det finns fortfarande {n} deltagare i sessionen. Är du säker på att du vill avsluta?',
        'session.ended.title': 'Sessionen har avslutats',
        'session.ended.message': 'Host har avslutat sessionen.',

        // Topic input
        'voting.topic.label': 'Beskrivning (frivillig)',
        'voting.topic.placeholder': 'Beskriv vad ni ska rösta på... (stödjer markdown)',
        'voting.topic.preview.label': 'Förhandsvisning',

        // Read phase
        'voting.read.confirm': 'Jag har läst ✓',
        'voting.read.forcestart': 'Starta ändå',
        'voting.countdown.label': 'Röstning börjar...',

        // Deck unit badge
        'deck.unit.voting': 'Röstar på: {unit}',

        // Deck selector
        'voting.deck.label': 'Kortlek',
        'deck.fibonacci.name': 'Fibonacci',
        'deck.fibonacci.desc': 'Klassisk Fibonacci-sekvens (0–89) plus specialkort. Bäst för team som vill ha fin detaljnivå på stora estimat.',
        'deck.modified.name': 'Modified Fibonacci',
        'deck.modified.desc': 'Modifierad Fibonacci med runda tal (20, 40, 100) för stora estimat. Vanligast i industrin.',
        'deck.tshirt.name': 'T-shirt Sizes',
        'deck.tshirt.desc': 'Storleksbaserade estimat (XS–XL). Bra när teamet undviker siffror och tänker relativt.',
        'deck.powers2.name': 'Powers of 2',
        'deck.powers2.desc': 'Tvåpotenser (0–64). Betonar att varje steg är dubbelt så stort – bra för tekniska team.',

        // Fibonacci card descriptions
        'card.fib.0': '0 — Ingen insats. Uppgiften är redan klar eller behöver bara verifieras.',
        'card.fib.1': '1 — Trivial. Helt välförstådd, inga frågetecken alls.',
        'card.fib.2': '2 — Liten uppgift med minimal risk och osäkerhet.',
        'card.fib.3': '3 — Lite komplexare än en 2:a, med viss osäkerhet.',
        'card.fib.5': '5 — Medelstor. Kräver planering och har några okända delar.',
        'card.fib.8': '8 — Komplex uppgift med flera okända faktorer eller beroenden.',
        'card.fib.13': '13 — Stor och komplex. Överväg att dela upp den i mindre delar.',
        'card.fib.21': '21 — Mycket stor uppgift med hög osäkerhet. Bör brytas ned.',
        'card.fib.34': '34 — Episk storlek. Minst en hel sprint – måste troligen delas upp.',
        'card.fib.55': '55 — Extremt stor. Svårt att estimera exakt på sprint-nivå.',
        'card.fib.89': '89 — För stor för att estimeras meningsfullt. Dela upp innan nästa runda.',

        // Modified Fibonacci card descriptions
        'card.mod.0': '0 — Ingen insats. Uppgiften är redan klar.',
        'card.mod.half': '½ — Nästan ingenting. En liten buggrättning eller textändring.',
        'card.mod.2': '2 — Liten uppgift, välförstådd och låg risk.',
        'card.mod.3': '3 — Liten med lite osäkerhet.',
        'card.mod.5': '5 — Medelstor. Kräver planering, lite okänt.',
        'card.mod.8': '8 — Komplex, flera okända faktorer.',
        'card.mod.13': '13 — Stor och komplex – överväg att dela upp.',
        'card.mod.20': '20 — Mycket stor. Troligen mer än en sprint.',
        'card.mod.40': '40 — Episk storlek. Kräver nedbrytning innan den kan genomföras.',
        'card.mod.100': '100 — Mega-episk. Omöjlig att estimera eller genomföra som helhet.',

        // T-shirt card descriptions
        'card.tshirt.xs': 'XS — Extra small. Några timmar, max en halv dag.',
        'card.tshirt.s': 'S — Small. Ungefär en dag.',
        'card.tshirt.m': 'M — Medium. Ungefär halva sprinten.',
        'card.tshirt.l': 'L — Large. Ungefär en hel sprint.',
        'card.tshirt.xl': 'XL — Extra large. Mer än en sprint – bör delas upp.',

        // Powers of 2 card descriptions
        'card.pow2.0': '0 — Ingen insats. Uppgiften är redan klar.',
        'card.pow2.1': '1 — Minimal insats. Trivialt liten uppgift.',
        'card.pow2.2': '2 — Liten uppgift.',
        'card.pow2.4': '4 — Liten-medel med lite osäkerhet.',
        'card.pow2.8': '8 — Medelstor, kräver planering.',
        'card.pow2.16': '16 — Stor. Nästan en hel sprint.',
        'card.pow2.32': '32 — Mycket stor. Kräver nedbrytning.',
        'card.pow2.64': '64 — Episk. Omöjlig att genomföra utan att delas upp.',

        // Special cards (shared across decks)
        'card.special.unknown': '? — Kan inte estimera. Behöver mer information eller diskussion innan rundan fortsätter.',
        'card.special.coffee': '☕ — Paus! Gruppen behöver en stunds återhämtning innan vi fortsätter.',
        'card.special.inf': '∞ — Oändlig. Uppgiften är för stor eller oklar – den måste delas upp.',

        // Hours deck
        'deck.hours.name': 'Timmar',
        'deck.hours.desc': 'Rösta på faktiska timmar (0–40h). Tydligt för team som estimerar i tid snarare än story points.',
        'card.hours.0':  '0h — Redan klart. Ingen åtgärd behövs.',
        'card.hours.1':  '1h — En timmes arbete. Snabb fix eller liten ändring.',
        'card.hours.2':  '2h — Några timmars arbete. Väl förstått och avgränsat.',
        'card.hours.4':  '4h — Ungefär en halv arbetsdag.',
        'card.hours.6':  '6h — Strax under en hel dag.',
        'card.hours.8':  '8h — En full arbetsdag.',
        'card.hours.12': '12h — En och en halv dag. Lite komplexare uppgift.',
        'card.hours.16': '16h — Två arbetsdagar.',
        'card.hours.24': '24h — Tre dagar. Överveg att dela upp uppgiften.',
        'card.hours.40': '40h — En hel arbetsvecka. Bör troligen brytas ned.',
    },
    en: {
        // Welcome Screen
        'app.title': 'pokipoki',
        'app.tagline': 'Poker planning sessions for teams',
        'welcome.heading': 'Get Started',
        'welcome.name.label': 'Your name',
        'welcome.name.placeholder': 'Enter your name',
        'welcome.theme.label': 'Theme',
        'theme.modern': 'Modern (Glassmorphism)',
        'theme.flat': 'Flat Design',
        'theme.retro': 'Retro 90s',
        'welcome.create.button': 'Create new session',
        'welcome.divider': 'OR',
        'welcome.sessionid.label': 'Session ID',
        'welcome.sessionid.placeholder': 'Enter session ID (e.g. A1B2C3D4)',
        'welcome.join.button': 'Join session',

        // Header
        'header.session': 'Session:',

        // Participants
        'participants.heading': 'Participants',

        // Voting Controls
        'voting.title.label': 'Round title (optional):',
        'voting.title.placeholder': 'E.g. User Story 123',
        'voting.description.label': 'Description (optional):',
        'voting.description.placeholder': 'Describe what we are voting on...',
        'voting.timer.label': 'Timer (minutes):',
        'voting.start.button': 'Start round',

        // Round Info
        'round.badge': 'Round',

        // Voting Area
        'voting.choose.heading': 'Choose your card',
        'voting.reveal.button': 'Reveal now',
        'voting.reveal.hint.waiting': 'Waiting for everyone to vote...',
        'voting.reveal.hint.ready': 'Everyone has voted! Ready to reveal.',
        'voting.status.selected': 'You selected:',
        'voting.status.updated': 'Vote updated to:',

        // Results
        'results.heading': 'Results',
        'results.discussion.button': 'Start discussion',
        'results.newround.button': 'New round',

        // Errors
        'error.name.required': 'Please enter your name',
        'error.sessionid.required': 'Please enter session ID',
        'error.session.create': 'Could not create session:',
        'error.session.join': 'Could not join session:',

        // Admin
        'admin.kick.button': 'Kick',
        'admin.kicked.message': 'You have been kicked from the session',
        'participant.voted': 'Voted',

        // Chat
        'chat.heading': 'Chat',
        'chat.placeholder': 'Type a message...',

        // Waiting
        'voting.waiting.title': 'Waiting for round to begin',
        'voting.waiting.description': 'The session host will start the round when ready.',

        // Session
        'session.id.label': 'ID:',
        'session.copy.success': 'Session ID copied!',
        'session.copy.button': 'Copy Session ID',
        'session.end.button': 'End session',
        'session.end.confirm': 'Are you sure? All participants will be disconnected.',
        'session.end.confirm.participants': 'There are still {n} participants in the session. Are you sure you want to end it?',
        'session.ended.title': 'Session has ended',
        'session.ended.message': 'The session host has ended the session.',

        // Topic input
        'voting.topic.label': 'Description (optional)',
        'voting.topic.placeholder': 'Describe what you are voting on... (supports markdown)',
        'voting.topic.preview.label': 'Preview',

        // Read phase
        'voting.read.confirm': 'I have read it ✓',
        'voting.read.forcestart': 'Start anyway',
        'voting.countdown.label': 'Voting starts...',

        // Deck unit badge
        'deck.unit.voting': 'Voting on: {unit}',

        // Deck selector
        'voting.deck.label': 'Card deck',
        'deck.fibonacci.name': 'Fibonacci',
        'deck.fibonacci.desc': 'Classic Fibonacci sequence (0–89) plus special cards. Best for teams wanting fine-grained detail on large estimates.',
        'deck.modified.name': 'Modified Fibonacci',
        'deck.modified.desc': 'Modified Fibonacci with round numbers (20, 40, 100) for large estimates. Most common in the industry.',
        'deck.tshirt.name': 'T-shirt Sizes',
        'deck.tshirt.desc': 'Size-based estimates (XS–XL). Great when teams want to think relatively instead of in numbers.',
        'deck.powers2.name': 'Powers of 2',
        'deck.powers2.desc': 'Powers of two (0–64). Emphasizes that each step is twice as large — good for technical teams.',

        // Fibonacci card descriptions
        'card.fib.0': '0 — No effort. The task is already done or just needs verification.',
        'card.fib.1': '1 — Trivial. Completely understood, no unknowns.',
        'card.fib.2': '2 — Small task with minimal risk and uncertainty.',
        'card.fib.3': '3 — Slightly more complex than a 2, with some uncertainty.',
        'card.fib.5': '5 — Medium. Requires planning, has a few unknowns.',
        'card.fib.8': '8 — Complex task with several unknowns or dependencies.',
        'card.fib.13': '13 — Large and complex. Consider splitting into smaller parts.',
        'card.fib.21': '21 — Very large with high uncertainty. Should be broken down.',
        'card.fib.34': '34 — Epic size. At least a full sprint — likely needs splitting.',
        'card.fib.55': '55 — Extremely large. Hard to estimate accurately at sprint level.',
        'card.fib.89': '89 — Too large to estimate meaningfully. Split before the next round.',

        // Modified Fibonacci card descriptions
        'card.mod.0': '0 — No effort. The task is already done.',
        'card.mod.half': '½ — Almost nothing. A tiny bug fix or text change.',
        'card.mod.2': '2 — Small task, well understood and low risk.',
        'card.mod.3': '3 — Small with some uncertainty.',
        'card.mod.5': '5 — Medium. Requires planning, some unknowns.',
        'card.mod.8': '8 — Complex, several unknowns.',
        'card.mod.13': '13 — Large and complex — consider splitting.',
        'card.mod.20': '20 — Very large. Likely more than one sprint.',
        'card.mod.40': '40 — Epic size. Needs breaking down before it can be done.',
        'card.mod.100': '100 — Mega-epic. Impossible to estimate or execute as a whole.',

        // T-shirt card descriptions
        'card.tshirt.xs': 'XS — Extra small. A few hours, at most half a day.',
        'card.tshirt.s': 'S — Small. About one day.',
        'card.tshirt.m': 'M — Medium. About half a sprint.',
        'card.tshirt.l': 'L — Large. About a full sprint.',
        'card.tshirt.xl': 'XL — Extra large. More than one sprint — should be split.',

        // Powers of 2 card descriptions
        'card.pow2.0': '0 — No effort. The task is already done.',
        'card.pow2.1': '1 — Minimal effort. Trivially small task.',
        'card.pow2.2': '2 — Small task.',
        'card.pow2.4': '4 — Small-medium with some uncertainty.',
        'card.pow2.8': '8 — Medium, requires planning.',
        'card.pow2.16': '16 — Large. Almost a full sprint.',
        'card.pow2.32': '32 — Very large. Needs breaking down.',
        'card.pow2.64': '64 — Epic. Cannot be done without being split up.',

        // Special cards (shared across decks)
        'card.special.unknown': '? — Cannot estimate. Needs more information or discussion before the round continues.',
        'card.special.coffee': '☕ — Break time! The group needs a short rest before continuing.',
        'card.special.inf': '∞ — Infinite. The task is too large or unclear — it must be split up.',

        // Hours deck
        'deck.hours.name': 'Hours',
        'deck.hours.desc': 'Vote on actual hours (0–40h). Clear for teams that estimate in time rather than story points.',
        'card.hours.0':  '0h — Already done. No action needed.',
        'card.hours.1':  '1h — One hour of work. Quick fix or minor change.',
        'card.hours.2':  '2h — A couple of hours. Well understood and scoped.',
        'card.hours.4':  '4h — About half a working day.',
        'card.hours.6':  '6h — Just under a full day.',
        'card.hours.8':  '8h — One full working day.',
        'card.hours.12': '12h — A day and a half. Slightly more complex task.',
        'card.hours.16': '16h — Two working days.',
        'card.hours.24': '24h — Three days. Consider splitting the task.',
        'card.hours.40': '40h — A full working week. Likely should be broken down.',
    }
};

class I18n {
    constructor() {
        // Get saved language or default to English
        this.currentLanguage = localStorage.getItem('poker-planning-lang') || 'en';
    }

    /**
     * Get translation for a key
     */
    translate(key) {
        return translations[this.currentLanguage]?.[key] || key;
    }

    /**
     * Shorthand for translate
     */
    t(key) {
        return this.translate(key);
    }

    /**
     * Set current language
     */
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('poker-planning-lang', lang);
            this.updatePageTranslations();
        }
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Update all elements with data-i18n attribute
     */
    updatePageTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.translate(key);
        });
    }
}

// Export singleton instance
export const i18n = new I18n();
