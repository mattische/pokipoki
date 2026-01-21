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

        // Chat
        'chat.heading': 'Chat',
        'chat.placeholder': 'Skriv ett meddelande...',

        // Waiting
        'voting.waiting.title': 'Väntar på att rundan ska börja',
        'voting.waiting.description': 'Host startar rundan när alla är redo.',

        // Session
        'session.id.label': 'ID:',
        'session.copy.success': 'Session-ID kopierat!',
        'session.copy.button': 'Kopiera ID',
        'session.end.button': 'Avslutan',
        'session.ended.title': 'Sessionen har avslutats',
        'session.ended.message': 'Host har avslutat sessionen.',
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
        'session.end.button': 'End',
        'session.ended.title': 'Session has ended',
        'session.ended.message': 'The session host has ended the session.',
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
