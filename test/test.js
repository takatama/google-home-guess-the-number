const assert = require('assert');
const number_match = require('../app/index.js');

describe('number_match', () => {
    describe('#getRandomDigits(3)', () => {
        it('should return 3 random digits', () => {
            let answer = number_match.getRandomDigits(3);
            assert.equal(answer.length === 3, true);
        });
    });

    describe('#getHint()', () => {
        it('should return 3 strikes if all numbers are same position', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [1, 2, 3]), {strikes: 3, balls: 0});
        });

        it('should return 0 strikes and 0 balls if all numbers are different', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [4, 5, 6]), {strikes: 0, balls: 0});
        });

        it('should return 0 strikes and 3 balls if all numbers are not same positions', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [3, 1, 2]), {strikes: 0, balls: 3});
        });

        it('should return 1 strikes and 2 balls if one number is correct, and two numbers are not same positions', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [1, 3, 2]), {strikes: 1, balls: 2});
        });
    });
});
