const display = document.getElementById('display');
let expr = '';

function updateDisplay(text){
  display.textContent = text || '0';
}

document.querySelectorAll('.btn').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const v = btn.dataset.value;
    const action = btn.dataset.action;
    if(action==='clear'){ expr=''; updateDisplay('0'); return; }
    if(action==='back'){
      expr = expr.slice(0,-1);
      updateDisplay(expr || '0');
      return;
    }
    if(action==='equals'){ computeAndShow(); return; }
    expr += v;
    updateDisplay(expr);
  });
});

window.addEventListener('keydown', (e)=>{
  const key = e.key;
  if(/^[0-9]$/.test(key) || key==='.'){ expr += key; updateDisplay(expr); return; }
  if(key === 'Backspace'){ expr = expr.slice(0,-1); updateDisplay(expr || '0'); return; }
  if(key === 'Enter' || key === '='){ computeAndShow(); return; }
  if(key === 'Escape'){ expr=''; updateDisplay('0'); return; }
  if(['+','-','*','/','(',')'].includes(key)){ expr += key; updateDisplay(expr); return; }
});

function computeAndShow(){
  try{
    if(!expr.trim()) { updateDisplay('0'); return; }
    const rpn = toRPN(expr);
    const result = evalRPN(rpn);
    if(!isFinite(result)) throw new Error('Math Error');
    expr = String(result);
    updateDisplay(expr);
  }catch(err){
    updateDisplay('Error');
    expr = '';
  }
}

function toRPN(input){
  const tokens = [];
  const re = /\d+(\.\d+)?|[+\-*/()]|\s+/g;
  let m;
  while((m = re.exec(input)) !== null){
    if(/\s+/.test(m[0])) continue;
    tokens.push(m[0]);
  }
  const out = [];
  const ops = [];
  const prec = {'+':1,'-':1,'*':2,'/':2};
  tokens.forEach(t=>{
    if(/^\d/.test(t)){ out.push(t); }
    else if(['+','-','*','/'].includes(t)){
      while(ops.length && ['+','-','*','/'].includes(ops[ops.length-1]) &&
            prec[ops[ops.length-1]] >= prec[t]){
        out.push(ops.pop());
      }
      ops.push(t);
    } else if(t === '('){ ops.push(t); }
    else if(t === ')'){
      while(ops.length && ops[ops.length-1] !== '(') out.push(ops.pop());
      if(!ops.length) throw new Error('Mismatched parentheses');
      ops.pop();
    } else throw new Error('Unknown token: ' + t);
  });
  while(ops.length){
    const op = ops.pop();
    if(op === '(' || op === ')') throw new Error('Mismatched parentheses');
    out.push(op);
  }
  return out;
}

function evalRPN(rpn){
  const stack = [];
  rpn.forEach(tok=>{
    if(/^\d+(\.\d+)?$/.test(tok)) stack.push(parseFloat(tok));
    else {
      const b = stack.pop();
      const a = stack.pop();
      if(a === undefined || b === undefined) throw new Error('Invalid expression');
      let res;
      switch(tok){
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '/':
          if(b === 0) throw new Error('Division by zero');
          res = a / b; break;
      }
      stack.push(res);
    }
  });
  if(stack.length !== 1) throw new Error('Invalid expression');
  const out = Number.isInteger(stack[0]) ? stack[0] : parseFloat(stack[0].toFixed(10));
  return out;
}