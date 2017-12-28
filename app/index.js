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

function getSpeech(hint) {
//    return hint.homeruns + ' homeruns, ' + hint.hits + ' hits';
    return hint.homeruns + ' ホームラン、' + hint.hits + ' ヒットです。';
}

//process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const app = new DialogflowApp({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));
    const GUESS_CONTEXT = 'guess';
    const NUM_DIGITS = 3;

    // Fulfill action business logic
    function welcomeHandler (app) {
        const answer = getRandomDigits(NUM_DIGITS);
        console.log(answer);
        app.setContext(GUESS_CONTEXT, 99, {answer: answer});
        //app.ask('Please Guess my 3 digits.');
        app.ask('私が考えた3桁の数字を当ててください。');
    }

    function numberHandler (app) {
        const number = app.getArgument('number');
        const input = ('0000000000' + number).slice(-1 * NUM_DIGITS);
        const answer = app.getContextArgument(GUESS_CONTEXT, 'answer').value;
        console.log(answer, input);
        const hint = getHint(answer, input.split('').map(i => {return parseInt(i, 10)}));
        if (hint.homeruns === 3) {
            // app.tell('You wins!');
            app.tell('正解です！');
            return;
        }
        app.ask(getSpeech(hint));
    }

    function stopHander (app) {
        const answer = app.getContextArgument(GUESS_CONTEXT, 'answer').value;
        //app.tell('The answer is ' + answer);
        app.tell('正解は' + answer.join('') + 'です。');
    }

    const actionMap = new Map();
    actionMap.set('input.welcome', welcomeHandler);
    actionMap.set('input.number', numberHandler);
    actionMap.set('input.stop', stopHander);
    
    app.handleRequest(actionMap);
});