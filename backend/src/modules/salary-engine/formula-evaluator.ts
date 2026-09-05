import { evaluate } from 'mathjs';

/**
 * Safely evaluates a mathematical expression against a scoped variable context.
 * Never uses eval(). Mathjs parses and evaluates expressions in a sandboxed AST.
 */
export function evaluateFormula(
  formula: string,
  context: Record<string, number>
): number {
  if (!formula || formula.trim() === '') {
    return 0;
  }

  try {
    // Clone context to ensure pure execution
    const scope = { ...context };

    const result = evaluate(formula, scope);

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error(
        `Formula '${formula}' did not evaluate to a valid finite number. Result was: ${result}`
      );
    }

    // Round to 2 decimal places
    return Math.round(result * 100) / 100;
  } catch (error: any) {
    throw new Error(
      `Formula evaluation error in expression '${formula}': ${error.message}`
    );
  }
}
