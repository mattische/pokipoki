/**
 * Card deck definitions for planning poker
 */

export const DECKS = {
    fibonacci: {
        id: 'fibonacci',
        nameKey: 'deck.fibonacci.name',
        descKey: 'deck.fibonacci.desc',
        cards: [
            { value: '0',  descKey: 'card.fib.0' },
            { value: '1',  descKey: 'card.fib.1' },
            { value: '2',  descKey: 'card.fib.2' },
            { value: '3',  descKey: 'card.fib.3' },
            { value: '5',  descKey: 'card.fib.5' },
            { value: '8',  descKey: 'card.fib.8' },
            { value: '13', descKey: 'card.fib.13' },
            { value: '21', descKey: 'card.fib.21' },
            { value: '34', descKey: 'card.fib.34' },
            { value: '55', descKey: 'card.fib.55' },
            { value: '89', descKey: 'card.fib.89' },
            { value: '?',  descKey: 'card.special.unknown' },
            { value: '☕', descKey: 'card.special.coffee' },
            { value: '∞',  descKey: 'card.special.inf' },
        ]
    },
    modifiedFibonacci: {
        id: 'modifiedFibonacci',
        nameKey: 'deck.modified.name',
        descKey: 'deck.modified.desc',
        cards: [
            { value: '0',   descKey: 'card.mod.0' },
            { value: '½',   descKey: 'card.mod.half' },
            { value: '2',   descKey: 'card.mod.2' },
            { value: '3',   descKey: 'card.mod.3' },
            { value: '5',   descKey: 'card.mod.5' },
            { value: '8',   descKey: 'card.mod.8' },
            { value: '13',  descKey: 'card.mod.13' },
            { value: '20',  descKey: 'card.mod.20' },
            { value: '40',  descKey: 'card.mod.40' },
            { value: '100', descKey: 'card.mod.100' },
            { value: '?',   descKey: 'card.special.unknown' },
            { value: '☕',  descKey: 'card.special.coffee' },
        ]
    },
    tshirt: {
        id: 'tshirt',
        nameKey: 'deck.tshirt.name',
        descKey: 'deck.tshirt.desc',
        cards: [
            { value: 'XS', descKey: 'card.tshirt.xs' },
            { value: 'S',  descKey: 'card.tshirt.s' },
            { value: 'M',  descKey: 'card.tshirt.m' },
            { value: 'L',  descKey: 'card.tshirt.l' },
            { value: 'XL', descKey: 'card.tshirt.xl' },
            { value: '?',  descKey: 'card.special.unknown' },
            { value: '☕', descKey: 'card.special.coffee' },
        ]
    },
    powers2: {
        id: 'powers2',
        nameKey: 'deck.powers2.name',
        descKey: 'deck.powers2.desc',
        cards: [
            { value: '0',  descKey: 'card.pow2.0' },
            { value: '1',  descKey: 'card.pow2.1' },
            { value: '2',  descKey: 'card.pow2.2' },
            { value: '4',  descKey: 'card.pow2.4' },
            { value: '8',  descKey: 'card.pow2.8' },
            { value: '16', descKey: 'card.pow2.16' },
            { value: '32', descKey: 'card.pow2.32' },
            { value: '64', descKey: 'card.pow2.64' },
            { value: '?',  descKey: 'card.special.unknown' },
            { value: '☕', descKey: 'card.special.coffee' },
        ]
    },
    hours: {
        id: 'hours',
        nameKey: 'deck.hours.name',
        descKey: 'deck.hours.desc',
        unit: 'h',
        cards: [
            { value: '0h',  descKey: 'card.hours.0' },
            { value: '1h',  descKey: 'card.hours.1' },
            { value: '2h',  descKey: 'card.hours.2' },
            { value: '4h',  descKey: 'card.hours.4' },
            { value: '6h',  descKey: 'card.hours.6' },
            { value: '8h',  descKey: 'card.hours.8' },
            { value: '12h', descKey: 'card.hours.12' },
            { value: '16h', descKey: 'card.hours.16' },
            { value: '24h', descKey: 'card.hours.24' },
            { value: '40h', descKey: 'card.hours.40' },
            { value: '?',   descKey: 'card.special.unknown' },
            { value: '☕',  descKey: 'card.special.coffee' },
        ]
    }
};

export const DEFAULT_DECK = 'fibonacci';
