export const capchaSum = () => {
  const operators = ['+', '-', '*'];
  const randInt = (range) => Math.floor(Math.random() * range);

  const leftPart = randInt(10);
  const rightPart = randInt(10);
  const operator = operators[randInt(operators.length)];

  // Create an array-like object with extra methods
  return Object.assign([leftPart, operator, rightPart], {
    toString() {
      return `${this[0]} ${this[1]} ${this[2]}`;
    },
    evaluate() {
      switch (this[1]) {
        case '+':
          return this[0] + this[2];
        case '-':
          return this[0] - this[2];
        case '*':
          return this[0] * this[2];
        default:
          throw new Error(`Unknown operator: ${this[1]}`);
      }
    },
  });
};

export default { capchaSum };
