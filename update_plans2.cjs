const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldArray = `                {[
                  { title: 'Standard', price: '5.00', rand: 'R90.00', coins: '90', desc: '90 credits' },
                  { title: 'Scholar', price: '10.00', rand: 'R180.00', coins: '180', desc: '180 credits' },
                  { title: 'Elite', price: '15.00', rand: 'R270.00', coins: '270', desc: '270 credits' },
                ].map((plan) => (`;

const newArray = `                {[
                  { title: 'Starter', price: '1.99', rand: 'R35.00', coins: '100', desc: '100 credits' },
                  { title: 'Basic', price: '3.99', rand: 'R75.00', coins: '400', desc: '400 credits' },
                  { title: 'Standard', price: '5.99', rand: 'R110.00', coins: '600', desc: '600 credits' },
                  { title: 'Pro', price: '9.99', rand: 'R180.00', coins: '1000', desc: '1000 credits' },
                  { title: 'Elite', price: '12.99', rand: 'R235.00', coins: '3000', desc: '3000 credits' },
                ].map((plan) => (`;

code = code.replace(oldArray, newArray);

const oldText = "You've run out of coins. It's 5c per question and voice notes in $ and 10c when paid in Rands. Choose a plan to unlock the full potential of your educational companion.";
const newText = "You've run out of coins. It's 10c per question and voice note. Choose a plan to unlock the full potential of your educational companion.";

code = code.replace(oldText, newText);

fs.writeFileSync('src/App.tsx', code);
