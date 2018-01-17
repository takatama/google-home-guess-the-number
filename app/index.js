// This software includes the work that is distributed in the Apache License 2.0

exports.getRandomDigits = getRandomDigits;
exports.getHint = getHint;

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getRandomDigits(numDigits) {
    if (numDigits < 1 || numDigits > 9) {
       throw Error('Invalid numDigits: ' + numDigits);
    }
    let shuffled = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    return shuffled.slice(0, numDigits);
}

function getHint(answer, input) {
    const countHomeruns = function(answer, input) {
       let count = 0;
        for (let i = 0; i < answer.length; i++) {
            if (answer[i] === input[i]) {
                count += 1;
            }
        }
        return count;
    };
    const countHits = function (answer, input) {
        let count = 0;
        for (let i = 0; i < answer.length; i++) {
            if (answer[i] !== input[i] && input.includes(answer[i])) {
                count += 1;
            }
        }
        return count;
    }
    return {
        homeruns: countHomeruns(answer, input),
        hits: countHits(answer, input)
    };
}

//process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const app = new DialogflowApp({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));
    const GUESS_CONTEXT = 'guess';
    const DEFAULT_NUM_DEIGITS = 3;
    const lang = app.getUserLocale().split('-')[0];

    const messages = {
        'start': {
            'en': 'Guess the $numDigits digit number. ',
            'ja': '私が考えた $numDigits 桁の数字を当ててください。'
        },
        'invalid': {
            'en': 'Please say $numDigits digit number. ',
            'ja':  '$numDigits 桁の数字でお願いします。'
        },
        'hint': {
            'en': '$homeruns homeruns, $hits hits. ',
            'ja': '$homeruns ホームラン、$hits ヒットです。'
        },
        'win': {
            'en': 'You wins at $count trials. ',
            'ja': '正解です！ $count 回目で正解しました。'
        },
        'answer': {
            'en': 'The answer is $answer. ',
            'ja': '正解は $answer です。'
        },
        'noKey': {
            'en': 'No message key $key. ',
            'ja': 'メッセージキー $key がありません。'
        },
        'invalidNumDigits': {
            'en': 'Invalid digit number. ' + DEFAULT_NUM_DEIGITS + ' digit number is used. ',
            'ja': '不正な桁数です。' + DEFAULT_NUM_DEIGITS + ' 桁ではじめます。'
        },
        'help': {
            'en': 'Each digit should be different. If you give me the number, I will give you a hint. If a digit and its position are correct, it will be a homerun. If a digit is correct but its position is wrong, it will be a hit. ',
            'ja': '数字は0から9で、同じ数字は含みません。あなたが数字を答えると、私はヒントを出します。数字と桁の位置の両方があっている場合はホームラン、数字は同じで桁の位置が違う場合はヒットです。'
        },
        'sorry': {
            'en': 'Sorry. I can not hear well.',
            'ja': 'すみません。よく聞き取れませんでした。'
        }
    };

    function i18n(lang, key, args) {
        const expand = function (message, args) {
            let m = message;
            if (args) {
                for (let arg in args) {
                    m = m.replace('$' + arg, args[arg]);
                }
            }
            return m;
        };
        if (lang !== 'ja') {
            lang = 'en';
        }
        if (!(key in messages)) {
            return expand(messages['noKey'][lang], {key: key});
        }
        return expand(messages[key][lang], args);
    }

    // Fulfill action business logic
    function welcomeHandler (app) {
        const answer = getRandomDigits(DEFAULT_NUM_DEIGITS);
        console.log('answer: ' + answer);
        app.setContext(GUESS_CONTEXT, 99, {answer: answer, count: 1, numDigits: DEFAULT_NUM_DEIGITS});
        let speech = i18n(lang, 'start', {numDigits: DEFAULT_NUM_DEIGITS});
        if (!app.getLastSeen()) {
            speech += i18n(lang, 'help');
        }
        app.ask(speech);
    }

    function isValidNumber (numDigits, number) {
        if (number.length !== numDigits) {
            return false;
        }
        for (let i = 0; i < number.length; i++) {
            if (typeof parseInt(number[i], 10) !== 'number') {
                return false;
            }
        }
        return true;
    }

    const escapeNumber = (number) => {
        if (lang === 'ja') {
            return number.replace(/\s/g, '')
                .replace(/一/g, '1')
                .replace(/に/g, '2')
                .replace(/二/g, '2')
                .replace(/さん/g, '3')
                .replace(/三/g, '3')
                .replace(/c/g, '4')
                .replace(/四/g, '4')
                .replace(/号/g, '5')
                .replace(/五/g, '5')　
                .replace(/六/g, '6')
                .replace(/七/g, '7')
                .replace(/八/g, '8')
                .replace(/九/g, '9');
        }
        return number.replace(/\s/g, '');
    };

    function numberHandler (app) {
        const number = escapeNumber(app.getArgument('number'));
        const context = app.getContext(GUESS_CONTEXT);
        if (!context) {
            console.error(app.getUserLocale() + ' number: ', number);
            app.ask(i18n(lang, 'sorry') + i18n(lang, 'start', {numDigits: DEFAULT_NUM_DEIGITS}));
            return;
        }
        const numDigits = context.parameters.numDigits;
        if (!isValidNumber(numDigits, number)) {
            console.error(app.getUserLocale() + ' numDigits: ' + numDigits + ', number: ' + number);
            app.ask(i18n(lang, 'invalid', {numDigits: numDigits}));
            return;
        }
        const answer = app.getContextArgument(GUESS_CONTEXT, 'answer').value;
        console.log(app.getUserLocale() + ' answer: ' + answer + ', number: ' + number);
        const count = app.getContextArgument(GUESS_CONTEXT, 'count').value;
        const hint = getHint(answer, number.split('').map(i => {return parseInt(i, 10)}));
        if (hint.homeruns === numDigits) {
            app.tell(i18n(lang, 'win', {count: count}));
            return;
        }
        app.setContext(GUESS_CONTEXT, 99, {answer: answer, count: count + 1, numDigits: numDigits});
        app.ask(i18n(lang, 'hint', {homeruns: hint.homeruns, hits: hint.hits}));
    }

    function stopHandler (app) {
        const answer = app.getContextArgument(GUESS_CONTEXT, 'answer').value;
        app.tell(i18n(lang, 'answer', {answer: answer.join('')}));
    }

    function numDigitsHandler (app) {
        let invalidNumDigits = '';
        let numDigits = parseInt(app.getArgument('numDigits'), 10);
        if (numDigits < 1 || 9 < numDigits) {
            numDigits = DEFAULT_NUM_DEIGITS;
            invalidNumDigits = i18n(lang, 'invalidNumDigits');
        }
        let answer = getRandomDigits(numDigits);
        console.log('numDigits: ' + numDigits + ', answer: ' + answer);
        app.setContext(GUESS_CONTEXT, 99, {answer: answer, count: 1, numDigits: numDigits});
        app.ask(invalidNumDigits + i18n(lang, 'start', {numDigits: numDigits}));
    }

    function helpHandler (app) {
        let speech = i18n(lang, 'start', {numDigits: DEFAULT_NUM_DEIGITS}) + i18n(lang, 'help');
        app.ask(speech);
    }

    const actionMap = new Map();
    actionMap.set('input.welcome', welcomeHandler);
    actionMap.set('input.number', numberHandler);
    actionMap.set('input.stop', stopHandler);
    actionMap.set('input.numDigits', numDigitsHandler);
    actionMap.set('input.help', helpHandler);
    
    app.handleRequest(actionMap);
});