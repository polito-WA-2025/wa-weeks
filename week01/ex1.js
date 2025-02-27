"use strict";

const v = [-12, -3, 18, 10, 4, -1, 0, 16];

const v2 = [...v];

v2.sort( (a, b) => a - b );

console.log(v2);

let NN = v2.findIndex( el => el >=0 );

console.log(NN);
v2.splice(0, NN);
v2.shift();
v2.shift();

let avg = 0;
for (const val of v2)
    avg += val;
avg = Math.round( avg / v2.length );
console.log(avg);

const addedArray = Array(NN+2).fill(avg);

v2.splice(v2.length, 0, ...addedArray );

console.log(v2);
