const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{ title: 'Standard', price: '5.00', rand: 'R90.00', coins: '100c', desc: 'Essential learning credits' },",
  "{ title: 'Standard', price: '5.00', rand: 'R90.00', coins: '90', desc: '90 credits' },"
);
code = code.replace(
  "{ title: 'Scholar', price: '9.99', rand: 'R180.00', coins: '150c', desc: 'Popular for research' },",
  "{ title: 'Scholar', price: '10.00', rand: 'R180.00', coins: '180', desc: '180 credits' },"
);
code = code.replace(
  "{ title: 'Elite', price: '15.99', rand: 'R290.00', coins: '200c', desc: 'Unlimited academic potential' },",
  "{ title: 'Elite', price: '15.00', rand: 'R270.00', coins: '270', desc: '270 credits' },"
);

code = code.replace(
  "You've run out of coins. Each question costs 5c. Choose a plan to unlock the full potential of your educational companion.",
  "You've run out of coins. It's 5c per question and voice notes in $ and 10c when paid in Rands. Choose a plan to unlock the full potential of your educational companion."
);

code = code.replace(/coinBalance < 5/g, "coinBalance < 10");
code = code.replace(/coinBalance >= 5/g, "coinBalance >= 10");
code = code.replace(/setCoinBalance\(prev => prev - 5\)/g, "setCoinBalance(prev => prev - 10)");

fs.writeFileSync('src/App.tsx', code);
