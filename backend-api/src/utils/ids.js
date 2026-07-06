let counter = 0;

function generateId(prefix) {
  counter += 1;
  return `${prefix}_${counter}`;
}

function resetCounter() {
  counter = 0;
}

module.exports = { generateId, resetCounter };
