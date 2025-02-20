import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Mersenne } from '../src/mersenne';

type SeededRun = {
  seed: number | number[];
  expectations: SeededRunExpectations;
};
type SeededRunExpectations = {
  rand: {
    noArgs: number;
    minMax: { max?: number; min?: number; expected?: number; skip?: boolean }[];
  };
};

const seededRuns: SeededRun[] = [
  {
    seed: 42,
    expectations: {
      rand: {
        noArgs: 12272,
        minMax: [
          { max: 100, min: 0, expected: 37 },
          { max: undefined, min: 0, expected: 12272 },
          { max: 100, min: undefined, expected: 37, skip: true },
        ],
      },
    },
  },
  {
    seed: 1337,
    expectations: {
      rand: {
        noArgs: 8586,
        minMax: [
          { max: 100, min: 0, expected: 26 },
          { max: undefined, min: 0, expected: 8586 },
          { max: 100, min: undefined, expected: 26, skip: true },
        ],
      },
    },
  },
  {
    seed: 1211,
    expectations: {
      rand: {
        noArgs: 30425,
        minMax: [
          { max: 100, min: 0, expected: 92 },
          { max: undefined, min: 0, expected: 30425 },
          { max: 100, min: undefined, expected: 92, skip: true },
        ],
      },
    },
  },
  {
    seed: [42, 1, 2],
    expectations: {
      rand: {
        noArgs: 28056,
        minMax: [
          { max: 100, min: 0, expected: 85 },
          { max: undefined, min: 0, expected: 28056 },
          { max: 100, min: undefined, expected: 85, skip: true },
        ],
      },
    },
  },
  {
    seed: [1337, 1, 2],
    expectations: {
      rand: {
        noArgs: 5895,
        minMax: [
          { max: 100, min: 0, expected: 17 },
          { max: undefined, min: 0, expected: 5895 },
          { max: 100, min: undefined, expected: 17, skip: true },
        ],
      },
    },
  },
  {
    seed: [1211, 1, 2],
    expectations: {
      rand: {
        noArgs: 29217,
        minMax: [
          { max: 100, min: 0, expected: 89 },
          { max: undefined, min: 0, expected: 29217 },
          { max: 100, min: undefined, expected: 89, skip: true },
        ],
      },
    },
  },
];

const functionNames = ['rand'];

const NON_SEEDED_BASED_RUN = 25;

describe('mersenne twister', () => {
  let mersenne: Mersenne;

  beforeEach(() => {
    mersenne = new Mersenne();
  });

  for (const { seed, expectations } of seededRuns) {
    describe(`seed: ${JSON.stringify(seed)}`, () => {
      beforeEach(() => {
        if (Array.isArray(seed)) {
          mersenne.seed_array(seed);
        } else {
          mersenne.seed(seed);
        }
      });

      for (const functionName of functionNames) {
        it(`${functionName}()`, () => {
          const actual = mersenne[functionName]();

          expect(actual).toEqual(expectations[functionName].noArgs);
        });
      }

      for (const { min, max, expected } of expectations.rand.minMax.filter(
        (x) => !x.skip
      )) {
        it(`should return ${expected} for rand(${max}, ${min})`, () => {
          const actual = mersenne.rand(max, min);

          expect(actual).toEqual(expected);
        });
      }

      // TODO @piotrekn 2022-02-13: There is a bug: https://github.com/faker-js/faker/issues/479
      // remove minMax.skip when fixed
      for (const { min, max, expected } of expectations.rand.minMax.filter(
        (x) => x.skip
      )) {
        it.todo(`should return ${expected} for rand(${max}, ${min})`, () => {
          const actual = mersenne.rand(max, min);

          expect(actual).toEqual(expected);
        });
      }

      it.todo(`should return 0 for rand(1)`, () => {
        const actual = mersenne.rand(1);

        expect(actual).toEqual(0);
      });
    });
  }

  // Create and log-back the seed for debug purposes
  const seeds = [
    Math.ceil(Math.random() * 1_000_000_000),
    [
      Math.ceil(Math.random() * 1_000_000_000),
      Math.ceil(Math.random() * 1_000_000_000),
    ],
  ];

  for (const seed of seeds) {
    describe(`random seeded tests ${JSON.stringify(seed)}`, () => {
      beforeAll(() => {
        if (Array.isArray(seed)) {
          mersenne.seed_array(seed);
        } else {
          mersenne.seed(seed);
        }
      });

      for (let i = 1; i <= NON_SEEDED_BASED_RUN; i++) {
        describe('rand', () => {
          it('should return a random number without given min / max arguments', () => {
            const randomNumber = mersenne.rand();
            expect(randomNumber).toBeTypeOf('number');
          });

          it('should return random number from interval [min, max)', () => {
            const actual = mersenne.rand(0, 2);

            expect(actual).toBeGreaterThanOrEqual(0);
            expect(actual).toBeLessThan(2);
          });
        });
      }
    });
  }

  it('should throw an error when attempting to seed() a non-integer', () => {
    expect(() =>
      mersenne.seed(
        // @ts-expect-error: non-integer error
        'abc'
      )
    ).toThrowError(Error('seed(S) must take numeric argument; is string'));
  });

  it('should throw an error when attempting to seed() a non-integer', () => {
    expect(() =>
      mersenne.seed_array(
        // @ts-expect-error: non-integer error
        'abc'
      )
    ).toThrowError(
      Error('seed_array(A) must take array of numbers; is string')
    );
  });
});
