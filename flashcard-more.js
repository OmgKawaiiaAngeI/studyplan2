(() => {
const more={
"Number Sets (N, W, Z, Q, Q', R)":[["Which set contains -7?","Z, Q and R — -7 is an integer, rational and real number."],["Is √10 rational or irrational?","Irrational — √10 cannot be written as a ratio of integers, so it belongs to Q' and R."]],
"Directed Numbers, Basic Operators, BODMAS":[["Evaluate −6 − (−9).","3 — subtracting a negative is the same as adding."],["Evaluate 18 − 2 × (3 + 4).","4 — brackets first: 3+4=7, then 2×7=14, then 18−14=4."]],
"Types of Numbers, Fractions, Calculator Use":[["Calculate 3/8 + 5/12.","19/24 — use common denominator 24: 9/24 + 10/24."],["Convert 0.72 to a fraction in simplest form.","18/25 — 72/100 simplifies by dividing by 4."]],
"Even, Composite, Prime, Approximations, Revision":[["Is 91 prime or composite?","Composite — 91 = 7 × 13."],["Round 0.007846 to 3 significant figures.","0.00785."]],
"Long Division, Scientific Notation, Ratios":[["Write 7,230,000 in scientific notation.","7.23 × 10⁶."],["Share $840 in the ratio 3:4:5.","$210, $280, $350 — 12 total parts, so each part is $70."]],
"Consumer Arithmetic 1":[["An item costs $480 and is sold for $600. Find the percentage profit.","25% — profit is $120, and 120/480 × 100 = 25%."],["Find the simple interest on $1800 at 7% per year for 4 years.","$504."]],
"Consumer Arithmetic 2":[["Find the amount on $2000 invested at 4% compound interest for 3 years.","$2249.73 approximately — 2000(1.04)³."],["A price before VAT is $640 and VAT is 12.5%. Find the total price.","$720."]],
"Consumer Arithmetic 3":[["A laptop costs $4200 cash or $700 deposit plus 14 payments of $280. Find the hire purchase price.","$4620."],["A machine worth $24,000 depreciates by 12% in one year. Find its new value.","$21,120."]],
"Wages and Salary":[["A worker earns $22 per hour for 40 hours and 1.5 times the rate for 6 overtime hours. Find total pay.","$1078."],["Gross pay is $5200 and deductions are $735. Find net pay.","$4465."]],
"Utility Bills, Commission and Exchange Rate":[["A salesperson earns 6% commission on $18,500 sales. Find the commission.","$1110."],["Convert TT$1350 to US dollars at US$1 = TT$6.75.","US$200."]],
"Algebra 1":[["Simplify 9x − 4 + 3x + 7.","12x + 3."],["Evaluate 2a² + 3a when a = 5.","65."]],
"Algebra 2":[["Factorise x² + 9x + 20.","(x + 4)(x + 5)."],["Expand (2x + 3)(x − 4).","2x² − 5x − 12."]],
"Algebra 3":[["Solve 5x − 9 = 31.","x = 8."],["Make h the subject of V = lwh.","h = V/(lw)."]],
"Simultaneous Equations and Algebraic Fractions":[["Simplify 3/x − 1/x.","2/x."],["Solve 4/x = 2/(x−3).","x = 6 — 4(x−3)=2x, so 2x=12."]],
"Solving Simultaneous Equations":[["Solve x+y=11 and x−y=5.","x = 8, y = 3."],["Solve 2x+y=13 and x−y=2.","x = 5, y = 3."]],
"Inequalities and Proportionality":[["Solve −2x < 8.","x > −4 — dividing by a negative reverses the sign."],["If y varies directly as x and y=20 when x=5, find x when y=36.","x = 9."]],
"Construction 1":[["Why must the compass radius be more than half the segment when constructing a perpendicular bisector?","So the arcs from the two endpoints intersect in two places."],["What construction divides a line segment into two equal parts at 90°?","The perpendicular bisector."]],
"Construction 2":[["What is the locus of points equidistant from two intersecting lines?","The angle bisectors of the angles formed by the lines."],["What is the locus of points a fixed distance from a straight line?","Two lines parallel to the original line, one on each side, at that fixed distance."]],
"Algebra Revision Questions":[["Solve x² − 7x + 12 = 0.","x = 3 or x = 4."],["Simplify (3x²y)(2xy²).","6x³y³."]],
"Matrices":[["Subtract [[1,2],[3,4]] from [[6,5],[8,9]].","[[5,3],[5,5]]."],["Multiply [[1,2],[0,3]] by [[2,1],[4,0]].","[[10,1],[12,0]]."]],
"Inverse Matrices":[["Find the determinant of [[5,2],[1,3]].","13."],["Does [[1,2],[2,4]] have an inverse?","No — its determinant is 0."]],
"Matrices – Simultaneous Equations and Matrix Transformation":[["What transformation matrix reflects points in the line y=x?","[[0,1],[1,0]]."],["Apply [[-1,0],[0,1]] to the point (3,−2).","(−3,−2) — reflection in the y-axis."]],
"Measurements 1":[["Find the circumference of a circle of diameter 14 cm using π=22/7.","44 cm."],["Find the area of a rectangle 12.5 cm by 8 cm.","100 cm²."]],
"Measurements 2":[["Find the volume of a sphere of radius 3 cm in terms of π.","36π cm³."],["Find the volume of a cone with radius 4 cm and height 6 cm in terms of π.","32π cm³."]],
"Series and Sequences":[["Find the 15th term of 5, 8, 11, 14, ...","47."],["Find the next term in 3, 6, 12, 24, ...","48."]],
"Statistics 1":[["Find the median of 3, 7, 8, 12, 15, 20.","10 — average the two middle values 8 and 12."],["Find the mean of 6, 9, 10, 11, 14.","10."]],
"Statistics 2":[["If Q1=18 and Q3=42, find the IQR.","24."],["A data set has a smaller standard deviation than another. What does that mean?","Its values are generally more tightly clustered around the mean."]],
"Relations and Functions":[["If f(x)=3x−4, find f(7).","17."],["If g(x)=x²+2, find g(−3).","11."]],
"Coordinate Geometry":[["Find the gradient of the line through (−2,1) and (4,13).","2."],["Find the midpoint of (−4,6) and (8,−2).","(2,2)."]],
"Quadratics – Completing the Square":[["Complete the square for x² + 8x + 3.","(x+4)² − 13."],["Find the turning point of y=(x−3)²+5.","(3,5)."]],
"Motion Graphs and Linear Programming":[["A speed-time graph is a rectangle 20 s wide and 8 m/s high. Find the distance travelled.","160 m."],["What does a horizontal section on a distance-time graph mean?","The object is stationary because its distance is not changing."]],
"Bearings":[["Find the back bearing of 215°.","035°."],["A bearing is 009°. In which general direction is this?","Almost due North, slightly east of North."]],
"Circle Geometry":[["An angle at the circumference is 38°. Find the angle at the centre standing on the same arc.","76°."],["Opposite angles of a cyclic quadrilateral are 4x and 2x. Find x.","30° — they add to 180°."]],
"Vectors Class 1 Assignment":[["Find the magnitude of vector (5,12).","13."],["If a=(2,−1) and b=(4,3), find a+b.","(6,2)."]]
};
Object.entries(more).forEach(([topic,cards])=>{
  if(!flashcards[topic]) return;
  cards.forEach(card=>{if(!flashcards[topic].some(existing=>existing[0]===card[0]))flashcards[topic].push(card)});
});
// Refresh visible deck counts after expansion.
if(typeof renderCard==='function') renderCard();
})();