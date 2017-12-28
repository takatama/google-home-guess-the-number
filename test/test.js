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
        it('should return 3 homeruns if all numbers are same position', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [1, 2, 3]), {homeruns: 3, hits: 0});
        });

        it('should return 0 homeruns and 0 hits if all numbers are different', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [4, 5, 6]), {homeruns: 0, hits: 0});
        });

        it('should return 0 homeruns and 3 hits if all numbers are not same positions', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [3, 1, 2]), {homeruns: 0, hits: 3});
        });

        it('should return 1 homeruns and 2 hits if one number is correct, and two numbers are not same positions', () => {
            assert.deepEqual(number_match.getHint([1, 2, 3], [1, 3, 2]), {homeruns: 1, hits: 2});
        });
    });
});
