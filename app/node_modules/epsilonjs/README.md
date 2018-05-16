epsilon
---

A lightweight Node.js module that implements the most common Approximate String Matching algorithms.

Install
---
```bash
npm install epsilonjs
```
Use
---
Import epsilon as follow:

```js
var epsilon = require('epsilonjs');
```
then, you can call every method with the standard Javascript notation. In this example, the Levenshtein Distance function:

```js
epsilon.leven("teststring","anotherstring")
```
that will return 6, as we expected. You can check the example file for a better explanation.

What are we talking about?
---
Basically, approximate string matching or fuzzy string searching is a technique / method in text processing to find strings that match a certain pattern, considering that one or more of them can suffered some kind of error. Most algorithms will return an integer as a closeness measurement of a match, in terms of the number of operations necessary to convert the target string into an exact match. Approximate string matching is used in several worlds, not only in Computer Science as spam filtering and spell checking software but also in biology and music. So you have to choose which is the best algorithm, considering temporal complexity, memory complexity and the form of your strings set, because maybe it could be the wrong approach for your goal.

Features
---
Currently, epsilon includes the following algorithms list
* Standard Levenshtein distance
* A dynamic programming implementation of LD
* Optimal String Alignment distance
* Damerau Levenshtein distance
* Hamming Distance
* Cosin Similarity of two strings

