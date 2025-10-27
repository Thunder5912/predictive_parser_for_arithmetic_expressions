// api/parse.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST method" });
  }

  const { expression } = req.body;
  if (!expression) {
    return res.status(400).json({ error: "Missing 'expression' in body" });
  }

  try {
    const result = evaluateExpression(expression);
    res.status(200).json({
      expression,
      result,
      message: "✅ Parsed and evaluated successfully"
    });
  } catch (err) {
    res.status(400).json({
      expression,
      error: err.message
    });
  }
}

// Simple tokenizer + recursive-descent parser + evaluator
function evaluateExpression(expr) {
  let tokens = tokenize(expr);
  let pos = 0;

  function peek() {
    return tokens[pos];
  }
  function consume() {
    return tokens[pos++];
  }

  // Grammar:
  // E → T E'
  // E' → + T E' | - T E' | ε
  // T → F T'
  // T' → * F T' | / F T' | ε
  // F → (E) | num

  function parseE() {
    let value = parseT();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const right = parseT();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseT() {
    let value = parseF();
    while (peek() === "*" || peek() === "/") {
      const op = consume();
      const right = parseF();
      value = op === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseF() {
    const token = consume();
    if (token === "(") {
      const value = parseE();
      if (consume() !== ")") throw new Error("Expected closing parenthesis");
      return value;
    }
    if (!isNaN(token)) return parseFloat(token);
    throw new Error("Unexpected token: " + token);
  }

  const result = parseE();
  if (pos < tokens.length) throw new Error("Unexpected input remaining");
  return result;
}

// Split input into tokens
function tokenize(expr) {
  const regex = /\d+(\.\d+)?|[+\-*/()]/g;
  const tokens = expr.match(regex);
  if (!tokens) throw new Error("Invalid expression");
  return tokens;
}
