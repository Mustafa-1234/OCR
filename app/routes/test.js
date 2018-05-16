var express = require('express');
var csv = require('fast-csv');
var d3 = require("d3");
var fs = require('fs');
var stream = require('stream');

const lodash = require('lodash');
const linksObject = require('../links.js');
const resultsObject = require('../results.js');
const resultsTemp = resultsObject.resultArray;
const characterRepresentation = resultsObject.characterMap;
const colorGroups = resultsObject.colorGroups;

var router = express.Router();
var jsdom = require("jsdom");
var document = jsdom.jsdom();
var epsilon = require('epsilonjs');
var iconv = require('iconv-lite');
var jsonfile = require('jsonfile');
var file = 'data/test.json';
var jsonf = jsonfile.readFileSync(file);
var data = jsonf.nodes;
var chars = jsonf.Links;
var links = [];
var matrixArray = [];

for (var k = 0; k < chars.length; k++) {
    matrixArray.push({
        name: chars[k].Source,
        group: 2
    });
}

var abc;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('mainview', {
        title: 'String Comparison',
        nodes: matrixArray,
        graph: [],
        maxNum: '',
        epochs: '-1',
        totalCharac: '0',
        filters: ''
    });
});

/*POST request to compare given characters occuerence with all other characters
Parameters
filter: characters to compare
Redirects to a new page with the spiral character view */
router.post('/alphabetSpiral', (req, res) => {
    let charactersResult = Object.assign({}, characterRepresentation);
    let characterMap = JSON.parse(JSON.stringify(matrixArray));
    let resultsOut = JSON.parse(JSON.stringify(resultsTemp));

    var results = [];
    var MResult = [];
    var SResult = [];
    // checks if parameters are set
    if (req.session.groundTruths && req.session.currentEpochs && req.body.filter && req.body.filter.length > 0) {
        characterMap = [];
        console.log(req.body.filter);
        console.log(req.body.filter.length);
        let alphabets = req.body.filter.split("");

        // filter out unique characters from the input
        let uniqueAlphabets = lodash.uniq(alphabets);
        let groundTruths = req.session.groundTruths;
        let epochs = req.session.currentEpochs;
        const epochMin = req.body.epochMin ? parseInt(req.body.epochMin, 10) : 1;
        const epochMax = req.body.epochMax ? parseInt(req.body.epochMax, 10) : -1;
        let counter = epochMin - 1;

        // iterate over the whole data to combine results
        while (epochMax !== -1 ? (counter + 1 <= epochMax && counter < epochs.length) : counter < epochs.length) {
            epochs[counter].map((prediction, index) => {
                var trimmedPrediction = prediction.replace(/\s/g, '');
                var loopLength = groundTruths[index].length;
                if (trimmedPrediction.length < groundTruths[index].length) {
                    loopLength = trimmedPrediction.length;
                }

                // calculate the count of a single character from the input with all other characters
                for (var i = 0; i < loopLength; i++) {
                    if (uniqueAlphabets.includes(groundTruths[index][i])) {
                        charactersResult[trimmedPrediction[i]]++;
                    }
                }
            });
            counter++;
        }

        // assign colors accordingly
        lodash.forOwn(charactersResult, (sourceObject, sourceKey) => {
            let color = 'black'; // Exceptional
            if (colorGroups[0].includes(sourceKey)) {
                color = 'red'; // Numeric
            } else if (colorGroups[1].includes(sourceKey)) {
                color = 'green'; //Symbols
            } else if (colorGroups[2].includes(sourceKey)) {
                color = 'blue'; // Lower Case
            } else if (colorGroups[3].includes(sourceKey)) {
                color = 'orange'; // Upper Case
            }

            // arrange the data in a proper format for frontend
            SResult.push({
                character: sourceKey,
                value: sourceObject,
                color
            });
        });
        console.log(SResult);

        // return the view
        return res.render('spiralCharacter', {
            title: 'String Comparison',
            nodes: characterMap,
            totalCharac: req.body.filter.length,
            graph: SResult,
            maxNum: Math.max(resultsOut['char']),
            epochs: epochs.length,
            minEpochs: req.body.epochMin || 1,
            maxEpochs: req.body.epochMax || epochs.length,
            filters: req.body.filter
        });

    }
});


/*POST request to process given data to generate matching characters for each epoch to generate epoch view
Parameters
filter: only compare specific characters with all others
epochMin: OPTIONAL, default 1, initial epoch to start the comparison from
epochMax: OPTIONAL, default -1, final epoch to end the comparison

Redirects to a new page with the spiral epoch view */
router.post('/spiral', (req, res) => {
    let characterMap = JSON.parse(JSON.stringify(matrixArray));
    let resultsOut = JSON.parse(JSON.stringify(resultsTemp));
    var results = [];
    var MResult = [];

    // check if the data is present in session for comparison
    if (req.session.groundTruths && req.session.currentEpochs) {

    	// check if filter is not empty
        if (req.body.filter && req.body.filter.length > 0) {
            characterMap = [];
            console.log(req.body.filter);
            console.log(req.body.filter.length);
            let alphabets = req.body.filter.split("");
            let uniqueAlphabets = lodash.uniq(alphabets);
            let alphabetData = {};

            // create the results object to store the comparison values in a proper format

            let chars = uniqueAlphabets.reduce((prev, current) => {
                return Object.assign({}, prev, {
                    [current]: 0
                });
            }, {});
            resultsOut = uniqueAlphabets.reduce((prev, current, index) => {
                return Object.assign({}, prev, {
                    [current]: {
                        chars: Object.assign({}, chars),
                        index
                    }
                })
            }, {});
            characterMap = uniqueAlphabets.map((alphabet) => {
                return {
                    name: alphabet,
                    group: 2
                };
            });
        }
        let groundTruths = req.session.groundTruths;
        let epochs = req.session.currentEpochs;

        // set default or provided values
        const epochMin = req.body.epochMin ? parseInt(req.body.epochMin, 10) : 1;
        const epochMax = req.body.epochMax ? parseInt(req.body.epochMax, 10) : -1;
        let counter = epochMin - 1;
        let spiralResults = [];

        // iterate over the whole data to combine results
        while (epochMax !== -1 ? (counter + 1 <= epochMax && counter < epochs.length) : counter < epochs.length) {
            let currentEpochResult = {
                epoch: counter + 1,
                count: 0
            };
            epochs[counter].map((prediction, index) => {
                var trimmedPrediction = prediction.replace(/\s/g, '');
                var loopLength = groundTruths[index].length;
                if (trimmedPrediction.length < groundTruths[index].length) {
                    loopLength = trimmedPrediction.length;
                }
                for (var i = 0; i < loopLength; i++) {
                    if (resultsOut[groundTruths[index][i]]) {
                        if (!isNaN(resultsOut[groundTruths[index][i]].chars[trimmedPrediction[i]])) {
                            currentEpochResult.count++;
                        }
                    }

                }
            });
            if (spiralResults.length > 0) {
                currentEpochResult.count += spiralResults[spiralResults.length - 1].count;
            }
            spiralResults.push(currentEpochResult);
            counter++;
        }

        console.log(JSON.stringify(spiralResults));


        // return the epoch view with the frontend data
        return res.render('spiral', {
            title: 'String Comparison',
            nodes: characterMap,
            graph: spiralResults,
            totalCharac: req.body.filter.length,
            maxNum: Math.max(resultsOut['char']),
            epochs: epochs.length,
            minEpochs: req.body.epochMin || 1,
            maxEpochs: req.body.epochMax || epochs.length,
            filters: req.body.filter
        });

    }
});


/*POST request to process given data to generate matching characters for each epoch to generate a matrix
Parameters
filter: only compare specific characters with all others
epochMin: OPTIONAL, default 1, initial epoch to start the comparison from
epochMax: OPTIONAL, default -1, final epoch to end the comparison

Redirects to a new page with the Matrix view */
router.post('/epochValues', (req, res) => {
    let characterMap = JSON.parse(JSON.stringify(matrixArray));
    let resultsOut = JSON.parse(JSON.stringify(resultsTemp));
    var results = [];
    var MResult = [];

    // check if the data is present in session for comparison
    if (req.session.groundTruths && req.session.currentEpochs) {

    	// check if filter is not empty
        if (req.body.filter && req.body.filter.length > 0) {
            characterMap = [];
            console.log(req.body.filter);
            console.log(req.body.filter.length);
            let alphabets = req.body.filter.split("");
            let uniqueAlphabets = lodash.uniq(alphabets);
            let alphabetData = {};

            // create the results object to store the comparison values in a proper format
            let chars = uniqueAlphabets.reduce((prev, current) => {
                return Object.assign({}, prev, {
                    [current]: 0
                });
            }, {});
            resultsOut = uniqueAlphabets.reduce((prev, current, index) => {
                return Object.assign({}, prev, {
                    [current]: {
                        chars: Object.assign({}, chars),
                        index
                    }
                })
            }, {});
            characterMap = uniqueAlphabets.map((alphabet) => {
                return {
                    name: alphabet,
                    group: 2
                };
            });
        }
        let groundTruths = req.session.groundTruths;
        let epochs = req.session.currentEpochs;

        // set default or provided values
        const epochMin = req.body.epochMin ? parseInt(req.body.epochMin, 10) : 1;
        const epochMax = req.body.epochMax ? parseInt(req.body.epochMax, 10) : -1;
        let counter = epochMin - 1;
        while (epochMax !== -1 ? (counter + 1 <= epochMax && counter < epochs.length) : counter < epochs.length) {
            console.log(counter);
            console.log(epochs[counter]);
            console.log(epochs.length);

            // compare every character with all the characters in the filter and update the result object
            epochs[counter].map((prediction, index) => {
                var trimmedPrediction = prediction.replace(/\s/g, '');
                var loopLength = groundTruths[index].length;
                if (trimmedPrediction.length < groundTruths[index].length) {
                    loopLength = trimmedPrediction.length;
                }
                for (var i = 0; i < loopLength; i++) {
                    if (resultsOut[groundTruths[index][i]]) {
                        if (!isNaN(resultsOut[groundTruths[index][i]].chars[trimmedPrediction[i]])) {
                            resultsOut[groundTruths[index][i]].chars[trimmedPrediction[i]]++;
                        }
                    }

                }
            });
            counter++;
        }

        // generate data object for frontend
        lodash.forOwn(resultsOut, (sourceObject, sourceKey) => {
            lodash.forOwn(sourceObject.chars, (targetValue, targetKey) => {
                if (targetValue !== 0) {
                    MResult.push({
                        source: sourceObject.index,
                        target: resultsOut[targetKey].index,
                        value: targetValue
                    });
                }
            });
        });

        // return the matrix view with the results
        return res.render('test', {
            title: 'String Comparison',
            nodes: characterMap,
            graph: MResult,
            totalCharac: req.body.filter.length,
            maxNum: Math.max(resultsOut['char']),
            epochs: epochs.length,
            minEpochs: req.body.epochMin || 1,
            maxEpochs: req.body.epochMax || epochs.length,
            filters: req.body.filter
        });

    }
});

/* POST request for the main page to upload the csv file for processing and return the matrix view
PARAMETERS
fileToUpload: the csv file for parsing data
epochMin: OPTIONAL, default 1, initial epoch to start the comparison from
epochMax: OPTIONAL, default -1, final epoch to end the comparison
*/
router.post('/', (req, res) => {
    const resultsOut = JSON.parse(JSON.stringify(resultsTemp));
    var results = [];
    var MResult = [];
    const epochs = [];

    // check if file is present
    if (req.files.fileToUpload) {

    	// parse only the given epochs from the csv file
        const epochMin = req.body.epochMin ? parseInt(req.body.epochMin, 10) : 1;
        const epochMax = req.body.epochMax ? parseInt(req.body.epochMax, 10) : -1;
        var bufferStream = new stream.PassThrough();
        bufferStream.end(req.files.fileToUpload.data);
        var groundTruths = null;
        var result = [];
        var counter = 0;

        // create a csv parser to read the file stream
        var csvStream = csv({
                delimiter: '	'
            })
            .on("data", function(data) { // parser event handler for data (single line of a csv file)
            	// skip the first line as it contains header related data
                if (counter > 1) {
                    epochs.push(data);
                }

                if (counter++ === 1) {
                    //console.log(data);
                    groundTruths = data.map((row) => {
                        return row.replace(/\s/g, '');
                    });
                    console.log(groundTruths);
                    // check if the epoch is under the given limit
                } else if (counter > 1 && counter - 1 >= epochMin && (epochMax !== -1 ? counter - 1 <= epochMax : true)) {
                   
                    //map the csv line into an object
                    data.map((prediction, index) => {
                        var trimmedPrediction = prediction.replace(/\s/g, '');
                        var loopLength = groundTruths[index].length;
                        if (trimmedPrediction.length < groundTruths[index].length) {
                            loopLength = trimmedPrediction.length;
                        }
                        for (var i = 0; i < loopLength; i++) {
                            if (resultsOut[groundTruths[index][i]]) {
                                resultsOut[groundTruths[index][i]].chars[trimmedPrediction[i]]++;
                            }
                        }
                    });
                }
            })
            .on("error", (err) => { // Error handler for csv parser
                console.log(err);
                console.log('ERROR');
            })
            .on("end", function() { // Event handler when a file is fully read
                req.session.currentEpochs = epochs;
                req.session.groundTruths = groundTruths;
                lodash.forOwn(resultsOut, (sourceObject, sourceKey) => {
                    lodash.forOwn(sourceObject.chars, (targetValue, targetKey) => {
                        if (targetValue !== 0) {
                            MResult.push({
                                source: sourceObject.index,
                                target: resultsOut[targetKey].index,
                                value: targetValue
                            });
                        }
                    });
                });
                console.log(MResult);
                console.log('rendering');

                // Return the matrix view with the data
                return res.render('test', {
                    title: 'String Comparison',
                    nodes: matrixArray,
                    graph: MResult,
                    totalCharac: '',
                    maxNum: Math.max(resultsOut['char']),
                    epochs: epochs.length,
                    minEpochs: 1,
                    maxEpochs: epochs.length,
                    filters: req.body.filter
                });

            });
        bufferStream.pipe(csvStream);
    }
});

module.exports = router;