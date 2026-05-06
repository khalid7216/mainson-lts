module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  root.find(j.JSXExpressionContainer).forEach(path => {
    const expr = path.node.expression;
    if (expr.type === 'TemplateLiteral') {
      let concatExpr = null;
      const quasis = expr.quasis;
      const expressions = expr.expressions;
      
      for (let i = 0; i < quasis.length; i++) {
        const str = quasis[i].value.raw;
        if (str !== '') {
          const strNode = j.literal(str);
          // Ensure spaces aren't mangled, but Babel takes care of literals
          concatExpr = concatExpr ? j.binaryExpression('+', concatExpr, strNode) : strNode;
        }
        
        if (i < expressions.length) {
          const e = expressions[i];
          concatExpr = concatExpr ? j.binaryExpression('+', concatExpr, e) : e;
        }
      }
      
      if (!concatExpr && quasis.length > 0 && quasis[0].value.raw === '') {
          concatExpr = j.literal('');
      }

      if (concatExpr) {
        path.node.expression = concatExpr;
        changed = true;
      }
    }
  });

  return changed ? root.toSource() : null;
};
