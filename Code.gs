function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar') //What the user will see our add-on as
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

// appends the sidebar to the DocumentApp
function showSidebar() {
  var sidebarHTML = HtmlService.createTemplateFromFile('sidebar_h').evaluate()
  sidebarHTML.setTitle("Diction Helper")
  DocumentApp.getUi().showSidebar(sidebarHTML);
}

// displays a dialog box with the word replacing wizard
function startDialog(word) {

  var word2data = getWordLocationsAndSentence(word);

  // three global arrays
  var synonyms = getFlattenedSyns(word);
  var contexts = word2data.map(x => x.sentence);
  var indices = word2data.map(x => x.idx);
  var replacements = new Array(word2data.length).fill(null);

  // remove original word as an option to replace
  synonyms.shift();

  // set global array values
  setSynArray(synonyms);
  setContextArray(contexts);
  setIndicesArray(indices);
  setReplacementsArray(replacements);

  var htmlOutput = HtmlService.createHtmlOutputFromFile('dialog').setWidth(800).setHeight(300);
  DocumentApp.getUi().showModalDialog(htmlOutput, 'Replace words with suggestions');
}

// displays a dialog box with a larger version of the synonym tree
function displayExpandedTreeDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('expandedsynonymtree').setWidth(800).setHeight(300);
  DocumentApp.getUi().showModalDialog(htmlOutput, 'Synonym Tree');
}

function include(File) {
  return HtmlService.createHtmlOutputFromFile(File).getContent();
};

function getSyn(word) {

  var urlSyn = 'https://wordsapiv1.p.rapidapi.com/words/' + word + '/synonyms';
  var urlPos = 'https://wordsapiv1.p.rapidapi.com/words/' + word + '/partOfSpeech';
  var params = {
  "method" : "GET",
      "headers" : {
        'x-rapidapi-host' : 'wordsapiv1.p.rapidapi.com',
        'x-rapidapi-key' : '26a5d256cdmshffcffa6a5e449d9p1b3773jsn526256ef7632'
      }
  };

  var responseSyn = UrlFetchApp.fetch(urlSyn, params);
  var responsePos = UrlFetchApp.fetch(urlPos, params);

  var arSyn = JSON.parse(responseSyn);
  var arPos = JSON.parse(responsePos);

  const mainUses = [];
  var mainSyn = arSyn['synonyms'];
  const POS = arPos['partOfSpeech'][0]; // part of speech of word being tested

  const ht = [word]; // stores words in the format: [inputted word, inputted word syn1, inputted word syn2, []]
  const comp = [word];

  var p = 0;
  var t = 0;

  // look at all synonyms of inputted word and add them to ht and comp if they have the same part of speech,
  // up to a max of two synonyms
  while (p < mainSyn.length && t < 2) {
    if (!comp.includes(mainSyn[p])) {
      var urlPos = 'https://wordsapiv1.p.rapidapi.com/words/' + mainSyn[p] + '/partOfSpeech';
      var responseUrl = UrlFetchApp.fetch(urlPos, params);
      var arUrl = JSON.parse(responseUrl);
      //Logger.log(arUrl);
      var testPos = arUrl['partOfSpeech'][0];
      if (testPos == POS) {
        ht.push(mainSyn[p]);
        comp.push(mainSyn[p]);
        t++;
      }
    }
    p++;
  }

  for (let r = 0; r < 2; r++) {
    p = 0;
    t = 0;
    //Logger.log("Child synonym: " + ht[r]);
    var childSyn = 'https://wordsapiv1.p.rapidapi.com/words/' + ht[r] + '/synonyms';
    var responseChild = UrlFetchApp.fetch(childSyn, params);
    var arChild = JSON.parse(responseChild);
    var childSyn = arChild['synonyms'];

    var retAr = [] // stores synonyms of synonyms

    while (p < childSyn.length && t < 4) {
      if (!comp.includes(childSyn[p])) {
        var urlPos = 'https://wordsapiv1.p.rapidapi.com/words/' + childSyn[p] + '/partOfSpeech';
        var responseUrl = UrlFetchApp.fetch(urlPos, params);
        var arUrl = JSON.parse(responseUrl);
        var testPos = arUrl['partOfSpeech'][0];
        if (testPos == POS) {
          retAr.push(childSyn[p]);
          comp.push(childSyn[p]);
          t++;
        }
      }
      p++;
    }
    ht.push(retAr);
  }

  return ht;
}

function getFlattenedSyns(word) {
  return getSyn(word).flat();
}

function getSynsTreeObject(word) {
  var syns = getSyn(word);
  var synTreeStruct = { "name": syns[0] }; // root of tree

  // first level of tree
  var firstLvl = [];
  if(syns.length > 1 && syns[1] != "") {
    firstLvl.push({"name": syns[1]}); // append left child of root if it exists
    if(syns[2] != "") {
      firstLvl.push({"name": syns[2]}); // append right child of root if it exists (can only exist if left child exists)
    }
  } else {
    return synTreeStruct; // if index 1 is empty, then there is only a root node
  }
  Object.assign(synTreeStruct, {"children":firstLvl});

  // second level of tree
  var secondLvlLeftBranch = [];
  for(let i = 0; i < syns[3].length; i++) {
    secondLvlLeftBranch.push({"name":syns[3][i]}); // construct array of children of left child of root
  }
  var secondLvlRightBranch = [];
  if(syns.length > 4) {
    for(let i = 0; i < syns[4].length; i++) {
      secondLvlRightBranch.push({"name":syns[4][i]}); // construct array of children of right child of root
    }
  }

  // append children of first level nodes
  if(secondLvlLeftBranch.length > 0) {
    Object.assign(synTreeStruct["children"][0], { "children": secondLvlLeftBranch });
    if(secondLvlRightBranch.length > 0) {
      Object.assign(synTreeStruct["children"][1], { "children": secondLvlRightBranch });
    }
  }
  return synTreeStruct;
}


function getDefLinks (word) {
  var words = getFlattenedSyns(word);
  var defLinks = [];
  for (let i = 0; i < words.length; i++) {
    var wordDef = [words[i]];
    words[i] = words[i].split(' ').join('-');
    wordDef.push('https://www.dictionary.com/browse/'+words[i]);
    defLinks.push(wordDef);
  }
  return defLinks;
}
