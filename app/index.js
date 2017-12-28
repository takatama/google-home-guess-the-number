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
    const countStrikes = function(answer, input) {
       let count = 0;
        for (let i = 0; i < answer.length; i++) {
            if (answer[i] === input[i]) {
            	count += 1;
            }
        }
        return count;
    };
    const countBalls = function (answer, input) {
        let count = 0;
        for (let i = 0; i < answer.length; i++) {
            if (answer[i] !== input[i] && input.includes(answer[i])) {
                count += 1;
            }
        }
        return count;
    }
    return {
        strikes: countStrikes(answer, input),
        balls: countBalls(answer, input)
    };
}

process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const app = new DialogflowApp({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    // Fulfill action business logic
    function responseHandler (app) {
        // Complete your fulfillment logic and send a response
        app.tell('Hello, World!');
    }

    const actionMap = new Map();
    actionMap.set('input.welcome', responseHandler);

    app.handleRequest(actionMap);
});

