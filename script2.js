/* ---------------- Flashcards ---------------- */
const flashcards = {
"Number Sets (N, W, Z, Q, Q', R)":[
  ["What does N represent?","Natural numbers — the counting numbers: 1, 2, 3, 4, ... (0 is NOT included)."],
  ["What does W represent?","Whole numbers — natural numbers plus 0: 0, 1, 2, 3, ..."],
  ["What does Z represent?","Integers — all whole numbers and their negatives: ..., -2, -1, 0, 1, 2, ..."],
  ["What does Q represent?","Rational numbers — any number writable as a fraction a/b (b≠0), including terminating and repeating decimals."],
  ["What does Q' represent?","Irrational numbers — CANNOT be written as a fraction, like π or √2 (non-terminating, non-repeating decimals)."],
  ["What does R represent?","Real numbers — every rational AND irrational number; essentially all numbers on the number line."],
  ["Is √81 rational or irrational? Why?","Rational — √81 = 9, a whole number, so it belongs to N, W, Z, Q, and R (not Q')."],
  ["Is 1.2 a whole number?","No — it has a decimal part, but it IS rational (= 6/5) and real."],
  ["Is 0 a natural number?","No, by CSEC convention — but it IS in W, Z, Q, and R."],
  ["What does Z⁻ stand for?","The set of negative integers: -1, -2, -3, ..."]],
"Directed Numbers, Basic Operators, BODMAS":[
  ["What does BODMAS stand for?","Brackets, Of, Division, Multiplication, Addition, Subtraction — the order to solve expressions."],
  ["What is the rule for multiplying two negative numbers?","A negative × a negative = a positive."],
  ["Evaluate: −8 + 3 × (−2)","−8 + (−6) = −14 (multiply before adding, per BODMAS)."],
  ["Evaluate 15 ÷ 3 + 2 × 4 using BODMAS.","15÷3=5, 2×4=8, so 5+8=13."],
  ["A submarine is at -240m. It rises 85m. What is its new depth?","-240 + 85 = -155m."]],
"Types of Numbers, Fractions, Calculator Use":[
  ["What is a rational number?","A number that can be written as a fraction a/b, where a and b are integers and b ≠ 0."],
  ["How do you add two fractions with different denominators?","Find a common denominator, convert both fractions, then add the numerators."],
  ["What is the reciprocal of 3/4?","4/3 — flip the numerator and denominator."],
  ["Simplify 5/6 − 1/4.","LCD = 12: 10/12 − 3/12 = 7/12."],
  ["Convert 0.375 to a fraction in simplest form.","375/1000 = 3/8."]],
"Even, Composite, Prime, Approximations, Revision":[
  ["What is a prime number?","A number greater than 1 with exactly two factors: 1 and itself (e.g. 2, 3, 5, 7)."],
  ["What is a composite number?","A number greater than 1 with more than two factors (e.g. 4, 6, 8, 9)."],
  ["Round 3.14159 to 2 decimal places.","3.14."],
  ["Express 60 as a product of prime factors.","60 = 2² × 3 × 5."],
  ["Round 4.6789 to 3 significant figures.","4.68."]],
"Long Division, Scientific Notation, Ratios":[
  ["Write 0.00042 in scientific notation.","4.2 × 10⁻⁴"],
  ["What form does scientific notation take?","a × 10ⁿ, where 1 ≤ a < 10 and n is an integer."],
  ["Simplify the ratio 12:18.","2:3 (divide both by their HCF, 6)."],
  ["Divide 3.6×10⁵ by 4×10², in scientific notation.","0.9×10³ = 9×10²."],
  ["Share $450 in the ratio 2:3:4.","Total parts = 9; one part = $50; shares = $100, $150, $200."]],
"Consumer Arithmetic 1":[
  ["Formula for Simple Interest?","I = PRT/100, where P=principal, R=rate %, T=time in years."],
  ["Formula for percentage profit?","(Profit ÷ Cost Price) × 100."],
  ["A $200 item is discounted 15%. What's the sale price?","$200 − (0.15×$200) = $170."],
  ["Calculate the simple interest on $2500 at 6% per annum for 3 years.","I = 2500×6×3/100 = $450."],
  ["An item marked $80 is sold at a 20% discount. Find the discounted price.","80 − (0.20×80) = $64."]],
"Consumer Arithmetic 2":[
  ["Formula for Compound Interest?","A = P(1 + R/100)ⁿ, where n = number of periods."],
  ["Difference between simple and compound interest?","Simple interest is calculated only on the principal; compound interest is calculated on principal + accumulated interest."],
  ["What is Value Added Tax (VAT)?","A consumption tax added to the price of goods/services, usually a percentage of the sale price."],
  ["Find the amount when $1000 is invested at 5% compound interest for 2 years.","A = 1000(1.05)² = $1102.50."],
  ["A shop charges 12.5% VAT on a $240 item. Find the total price including VAT.","240×1.125 = $270."]],
"Consumer Arithmetic 3":[
  ["What is hire purchase?","A way to buy goods by paying a deposit then fixed installments, usually with added interest."],
  ["How do you calculate the total hire purchase price?","Deposit + (installment amount × number of installments)."],
  ["What is depreciation?","The reduction in value of an asset over time."],
  ["A TV costs $3000 cash, or $500 deposit plus 12 monthly payments of $250. Find the extra cost of hire purchase over the cash price.","Total HP = 500+(12×250) = $3500; extra = $3500−$3000 = $500."],
  ["A car valued at $40,000 depreciates by 15% in the first year. Find its value after one year.","40000×0.85 = $34,000."]],
"Wages and Salary":[
  ["Formula for overtime pay (time-and-a-half)?","Overtime rate = normal hourly rate × 1.5."],
  ["Difference between wages and salary?","Wages are usually paid hourly/based on hours worked; salary is a fixed regular payment regardless of hours."],
  ["What is gross pay vs net pay?","Gross pay is total earnings before deductions; net pay is what's left after taxes/deductions."],
  ["A worker earns $18/hour and works 45 hours in a week, with overtime (time-and-a-half) after 40 hours. Find total weekly pay.","40×18=720; 5×27=135; total = $855."],
  ["An employee's gross pay is $3200 and deductions total $480. Find the net pay.","3200−480 = $2720."]],
"Utility Bills, Commission and Exchange Rate":[
  ["How is commission usually calculated?","Commission = (rate %) × (value of sales)."],
  ["How do you convert currency using an exchange rate?","Multiply the amount by the exchange rate (units of new currency per unit of original)."],
  ["What is a unit rate on a utility bill (e.g. electricity)?","The cost charged per unit of consumption (e.g. $ per kWh)."],
  ["A salesperson earns 8% commission on sales of $6,250. Calculate the commission earned.","6250×0.08 = $500."],
  ["Convert US$150 to TT dollars at a rate of US$1 = TT$6.75.","150×6.75 = TT$1012.50."]],
"Algebra 1":[
  ["What does it mean to \"simplify\" an expression?","Combine like terms and reduce the expression to its simplest form."],
  ["Expand 3(x + 4).","3x + 12."],
  ["What are \"like terms\"?","Terms with the exact same variable(s) raised to the same power(s), e.g. 3x and 7x."],
  ["Simplify 4x + 3y − 2x + 5y.","2x + 8y."],
  ["Evaluate 3a² − 2a when a = 4.","3(16)−2(4) = 48−8 = 40."]],
"Algebra 2":[
  ["Factorise 6x + 9.","3(2x + 3)."],
  ["Expand (x + 3)(x + 2).","x² + 5x + 6."],
  ["Difference of two squares formula?","a² − b² = (a + b)(a − b)."],
  ["Factorise x² − 9.","(x+3)(x−3) — difference of two squares."],
  ["Factorise 2x² + 7x + 3.","(2x+1)(x+3)."]],
"Algebra 3":[
  ["How do you solve 2x + 5 = 11?","Subtract 5 from both sides, then divide by 2: x = 3."],
  ["What is the subject of a formula?","The variable that is isolated/alone on one side of an equation."],
  ["Make x the subject of y = 2x + 3.","x = (y − 3)/2."],
  ["Solve 3(x − 2) = 15.","3x−6=15, 3x=21, x=7."],
  ["Make r the subject of A = πr².","r = √(A/π)."]],
"Simultaneous Equations and Algebraic Fractions":[
  ["Name two methods for solving simultaneous equations.","Substitution and elimination."],
  ["Simplify (2/x) + (3/x).","5/x (same denominator, add numerators)."],
  ["Add 1/x + 1/y.","(y + x)/(xy) — use a common denominator."],
  ["Simplify x/(x+2) + 3/(x+2).","(x+3)/(x+2)."],
  ["Solve for x: 2/x = 3/(x+1).","2(x+1)=3x → 2x+2=3x → x=2."]],
"Solving Simultaneous Equations":[
  ["Elimination method — first step?","Make the coefficients of one variable equal (or opposite) in both equations, then add or subtract."],
  ["Substitution method — first step?","Rearrange one equation to make a variable the subject, then substitute into the other equation."],
  ["Solve: x + y = 10, x − y = 2.","Add the equations: 2x=12, x=6; then y=4."],
  ["Solve by substitution: y = x + 3 and 2x + y = 12.","2x+(x+3)=12 → 3x=9 → x=3, y=6."],
  ["Solve by elimination: 3x+2y=16, x−2y=0.","Add: 4x=16, x=4; y=2."]],
"Inequalities and Proportionality":[
  ["What happens to an inequality sign when multiplying/dividing by a negative?","The inequality sign flips/reverses."],
  ["What is direct proportion?","When one quantity increases, the other increases at the same rate (y = kx)."],
  ["What is inverse proportion?","When one quantity increases, the other decreases proportionally (y = k/x)."],
  ["Solve the inequality 3x − 5 ≤ 10.","3x≤15 → x≤5."],
  ["If y varies directly as x and y=12 when x=3, find y when x=7.","k=4, y=4×7=28."]],
"Construction 1":[
  ["What tools are used for geometric constructions?","A ruler (straight edge) and a pair of compasses — no protractor for true constructions."],
  ["How do you construct a perpendicular bisector?","Draw equal-radius arcs from both endpoints (radius > half the segment) above and below the line; join the intersection points."],
  ["How do you bisect an angle?","Draw an arc across both arms from the vertex, then from each intersection draw equal arcs that cross; join the vertex to that crossing point."],
  ["How do you construct a perpendicular to a line from a point ON the line?","Draw equal arcs on both sides of the point along the line, then from those two points draw intersecting arcs above; join to the original point."],
  ["First step to construct a triangle given three side lengths (SSS)?","Draw one side to scale, then use a compass set to each remaining length to draw arcs from the endpoints that intersect at the third vertex."]],
"Construction 2":[
  ["How do you construct a 60° angle?","Draw a line, arc through it from one end; without changing radius, arc from where it crosses — the intersection gives 60°."],
  ["What is a locus?","The set of all points that satisfy a given condition (e.g. equidistant from a point or line)."],
  ["Locus of points equidistant from two points?","The perpendicular bisector of the line joining the two points."],
  ["How do you construct a 90° angle at a point on a line?","Construct equal arcs from the point along the line, then bisect the straight angle formed at that point."],
  ["What is the locus of points a fixed distance from a given point?","A circle centred at that point with radius equal to the fixed distance."]],
"Algebra Revision Questions":[
  ["Quickest way to check a solution to an equation?","Substitute it back into the original equation and confirm both sides are equal."],
  ["How do you solve a quadratic by factorising?","Set the equation to 0, factorise into two brackets, then set each bracket to 0 and solve."],
  ["Standard form of a quadratic equation?","ax² + bx + c = 0."],
  ["Solve x² − 5x + 6 = 0 by factorising.","(x−2)(x−3)=0 → x=2 or x=3."],
  ["Simplify (2x²y)(3xy³).","6x³y⁴."]],
"Matrices":[
  ["What defines the order of a matrix?","Rows × columns, e.g. a 2×3 matrix has 2 rows and 3 columns."],
  ["Can you add two matrices of different orders?","No — matrices must have the same order to be added or subtracted."],
  ["How do you multiply two matrices?","Multiply rows of the first by columns of the second, summing products (columns of first must equal rows of second)."],
  ["Add matrices [[1,2],[3,4]] and [[5,6],[7,8]].","[[6,8],[10,12]]."],
  ["Multiply matrix [[2,0],[1,3]] by scalar 4.","[[8,0],[4,12]]."]],
"Inverse Matrices":[
  ["Determinant of a 2×2 matrix [[a,b],[c,d]]?","ad − bc."],
  ["What makes a matrix have no inverse?","Its determinant is 0 (it's called singular)."],
  ["Formula for the inverse of a 2×2 matrix?","(1/det) × [[d,−b],[−c,a]]."],
  ["Find the determinant of [[3,4],[2,5]].","3×5−4×2 = 15−8 = 7."],
  ["Is [[2,4],[1,2]] singular? Why?","Yes — determinant = (2×2)−(4×1) = 0, so it has no inverse."]],
"Matrices – Simultaneous Equations and Matrix Transformation":[
  ["How can matrices solve simultaneous equations?","Write the system as AX = B, then X = A⁻¹B."],
  ["Matrix for a reflection in the x-axis?","[[1,0],[0,−1]]."],
  ["Matrix for a 90° anticlockwise rotation about the origin?","[[0,−1],[1,0]]."],
  ["Write 2x+y=7, x−y=2 in matrix form AX=B.","[[2,1],[1,-1]] × [[x],[y]] = [[7],[2]]."],
  ["What transformation does [[-1,0],[0,1]] represent?","Reflection in the y-axis."]],
"Measurements 1":[
  ["Formula for the area of a circle?","A = πr²."],
  ["Formula for the circumference of a circle?","C = 2πr (or πd)."],
  ["Formula for the volume of a cylinder?","V = πr²h."],
  ["Find the area of a circle with radius 7cm (π=22/7).","A = 22/7×7² = 154cm²."],
  ["Find the volume of a cylinder with radius 3cm and height 10cm (π=3.14).","V = 3.14×9×10 = 282.6cm³."]],
"Measurements 2":[
  ["Formula for the surface area of a cylinder?","2πr² + 2πrh (two circles + curved surface)."],
  ["Formula for the volume of a cone?","V = (1/3)πr²h."],
  ["Formula for the volume of a sphere?","V = (4/3)πr³."],
  ["Find the volume of a cone with radius 6cm and height 9cm (π=3.14).","V = (1/3)×3.14×36×9 = 339.12cm³."],
  ["Find the surface area of a sphere with radius 5cm (π=3.14). Formula: 4πr².","4×3.14×25 = 314cm²."]],
"Series and Sequences":[
  ["nth term of an arithmetic sequence?","aₙ = a + (n−1)d, where a=first term, d=common difference."],
  ["nth term of a geometric sequence?","aₙ = ar^(n−1), where r=common ratio."],
  ["Sum of the first n terms of an arithmetic series?","Sₙ = n/2 × (2a + (n−1)d)."],
  ["Find the 10th term of the sequence 4, 7, 10, 13, ...","a=4, d=3; a₁₀ = 4+9(3) = 31."],
  ["Find the sum of the first 8 terms of 2, 6, 18, ... (geometric).","r=3; S₈ = 2(3⁸−1)/(3−1) = 6560."]],
"Statistics 1":[
  ["How do you find the mean?","Sum of all values ÷ number of values."],
  ["What is the median?","The middle value when data is arranged in order (average of two middle values if even count)."],
  ["What is the mode?","The value that occurs most frequently in a data set."],
  ["Find the mean of 4, 8, 6, 10, 12.","(4+8+6+10+12)/5 = 40/5 = 8."],
  ["Find the range of 15, 22, 9, 30, 18.","30−9 = 21."]],
"Statistics 2":[
  ["What does a cumulative frequency curve (ogive) help find?","The median and quartiles of grouped data."],
  ["Formula for the interquartile range (IQR)?","Q3 − Q1 (upper quartile minus lower quartile)."],
  ["What does standard deviation measure?","How spread out the data values are from the mean."],
  ["A cumulative frequency curve shows 40 students. What rank represents the median?","The 20th value (n/2, since n=40)."],
  ["If Q1=12 and Q3=28, find the interquartile range.","28−12 = 16."]],
"Relations and Functions":[
  ["What is a function?","A relation where every input (x) maps to exactly one output (y)."],
  ["What is the domain of a function?","The set of all possible input (x) values."],
  ["What is the range of a function?","The set of all possible output (y) values."],
  ["If f(x)=2x+3, find f(5).","f(5) = 2(5)+3 = 13."],
  ["If f(x)=x²−1, find f(−2).","f(−2) = 4−1 = 3."]],
"Coordinate Geometry":[
  ["Formula for the gradient between two points?","m = (y₂ − y₁)/(x₂ − x₁)."],
  ["Formula for the midpoint of a line segment?","((x₁+x₂)/2, (y₁+y₂)/2)."],
  ["Gradients of parallel vs perpendicular lines?","Parallel lines have equal gradients; perpendicular lines have gradients that multiply to −1."],
  ["Find the equation of the line through (2,3) with gradient 4.","y−3=4(x−2) → y=4x−5."],
  ["Find the distance between (1,2) and (4,6).","√((4−1)²+(6−2)²) = √(9+16) = √25 = 5."]],
"Quadratics – Completing the Square":[
  ["What is the goal of completing the square?","To rewrite ax² + bx + c in the form a(x + p)² + q."],
  ["For x² + bx, what do you add/subtract to complete the square?","Add and subtract (b/2)²."],
  ["Turning point from a(x+p)²+q?","The turning point is (−p, q)."],
  ["Complete the square for x² + 6x + 5.","(x+3)² − 4."],
  ["Find the minimum value of y = x² − 4x + 7 using completed square form.","(x−2)²+3, minimum value = 3 at x=2."]],
"Motion Graphs and Linear Programming":[
  ["On a distance-time graph, what does the gradient represent?","Speed (or velocity)."],
  ["On a speed-time graph, what does the area under the graph represent?","Distance traveled."],
  ["What is a \"feasible region\" in linear programming?","The area on a graph satisfying all the given inequality constraints."],
  ["A car travels 150km in 3 hours at constant speed. Find the speed.","150÷3 = 50km/h."],
  ["Write the inequality for the region below the line y=2x+1.","y ≤ 2x+1."]],
"Bearings":[
  ["How are bearings measured?","Clockwise from North, given as a 3-digit angle (e.g. 045°, 270°)."],
  ["What is the \"back bearing\" relationship?","Back bearing = bearing ± 180° (add if original < 180°, subtract if ≥ 180°)."],
  ["Bearing from A to B is 060°. What's the bearing from B to A?","060° + 180° = 240°."],
  ["A ship sails on a bearing of 130°. What bearing takes it directly back?","130°+180° = 310°."],
  ["Town B is on a bearing of 072° from Town A. Find the bearing of A from B.","072°+180° = 252°."]],
"Circle Geometry":[
  ["What angle does a tangent make with the radius at the point of contact?","90° (a right angle)."],
  ["What is the angle in a semicircle?","Always 90° (angle in a semicircle theorem)."],
  ["Relationship between angle at centre and angle at circumference (same arc)?","The angle at the centre is twice the angle at the circumference."],
  ["A cyclic quadrilateral has one angle of 110°. Find its opposite angle.","180°−110° = 70° (opposite angles in a cyclic quadrilateral are supplementary)."],
  ["What's true about angles in the same segment of a circle, standing on the same arc?","They are equal."]],
"Vectors Class 1 Assignment":[
  ["How do you find the magnitude of a vector (x, y)?","|v| = √(x² + y²)."],
  ["How do you add two vectors?","Add corresponding components: (a,b) + (c,d) = (a+c, b+d)."],
  ["What does it mean for two vectors to be parallel?","One is a scalar multiple of the other (e.g. b = ka)."],
  ["Given a=(3,-4), find a unit vector in the same direction.","|a|=5, unit vector = (3/5, -4/5)."],
  ["Find vector AB given A(2,5) and B(6,1).","AB = B−A = (4,−4)."]],
};

const topicNames = Object.keys(flashcards);
let currentTopic = topicNames[0];
let currentIndex = 0;
let isFlipped = false;
let cardMastery = {};

function fcCardKey(topic, idx){ return topic+'|'+idx; }
function fcLoadMastery(){
  try{ const raw = localStorage.getItem('cardMastery'); if(raw) cardMastery = JSON.parse(raw); }catch(e){}
}
function fcSaveMastery(){ try{ localStorage.setItem('cardMastery', JSON.stringify(cardMastery)); }catch(e){} }
function fcPickWeightedIndex(){
  const deck = flashcards[currentTopic];
  const weights = deck.map((_,i)=>{
    const m = cardMastery[fcCardKey(currentTopic,i)] || 0;
    return m===2 ? 1 : (m===1 ? 3 : 5);
  });
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<weights.length;i++){
    r -= weights[i];
    if(r<=0) return i;
  }
  return Math.floor(Math.random()*deck.length);
}

function populateTopicSelect(){
  const sel=document.getElementById('topicSelect');
  sel.innerHTML='';
  topicNames.forEach(name=>{
    const opt=document.createElement('option');
    opt.value=name; opt.textContent=name;
    sel.appendChild(opt);
  });
  sel.value=currentTopic;
}
function renderCard(){
  const deck=flashcards[currentTopic];
  const [front,back]=deck[currentIndex];
  document.getElementById('fcFront').innerHTML = front+'<span class="fc-hint">tap to flip</span>';
  document.getElementById('fcBack').innerHTML = back+'<span class="fc-hint">tap to flip</span>';
  document.getElementById('fcCard').classList.remove('flipped');
  document.getElementById('fcExplain').value = '';
  isFlipped=false;
  document.getElementById('fcProgress').textContent = (currentIndex+1)+' / '+deck.length+' · '+currentTopic;
}
document.getElementById('topicSelect').addEventListener('change',(e)=>{
  currentTopic=e.target.value; currentIndex=0; renderCard();
});
document.getElementById('fcCard').addEventListener('click',()=>{
  isFlipped=!isFlipped;
  document.getElementById('fcCard').classList.toggle('flipped',isFlipped);
});
document.getElementById('fcFlip').addEventListener('click',()=>{
  isFlipped=!isFlipped;
  document.getElementById('fcCard').classList.toggle('flipped',isFlipped);
});
document.getElementById('fcNext').addEventListener('click',()=>{
  const deck=flashcards[currentTopic];
  currentIndex=(currentIndex+1)%deck.length;
  renderCard();
});
document.getElementById('fcPrev').addEventListener('click',()=>{
  const deck=flashcards[currentTopic];
  currentIndex=(currentIndex-1+deck.length)%deck.length;
  renderCard();
});
document.getElementById('fcShuffle').addEventListener('click',()=>{
  currentIndex=Math.floor(Math.random()*flashcards[currentTopic].length);
  renderCard();
});
document.getElementById('fcKnowIt').addEventListener('click',()=>{
  cardMastery[fcCardKey(currentTopic,currentIndex)] = 2;
  fcSaveMastery();
  totalCorrect++;
  addXP(1);
  updateMascot('correct');
  maybeShowTip();
  currentIndex = fcPickWeightedIndex();
  renderCard();
});
document.getElementById('fcStillLearning').addEventListener('click',()=>{
  cardMastery[fcCardKey(currentTopic,currentIndex)] = 1;
  fcSaveMastery();
  updateMascot('wrong');
  maybeShowTip();
  currentIndex = fcPickWeightedIndex();
  renderCard();
});

fcLoadMastery();
populateTopicSelect();
renderCard();
loadState();
