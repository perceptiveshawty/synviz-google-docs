// Retrieves information about all instances of the word being replaced
// Returns an array of objects with the structure:
/* [{
      loc: a reference to a specific instance of the word
      sentence: the context surrounding the word (TODO: To be implemented)
  }]
*/
// TODO: Filter out word instances which are inside other words (check first instance of word in context to see if not followed by a-zA-Z)
function getWordLocationsAndSentence(word) {

    var body = DocumentApp.getActiveDocument().getBody();
    var wordLoc = body.findText(word);

    if(wordLoc == null) {
      return [];
    }

    var wordData = [];
    var prevContext = "";
    var ctxCounter = -1;
    while (wordLoc) {

      var context = wordLoc.getElement().asText().getText();

      if (context == prevContext) {
        wordData.push({loc: wordLoc, sentence: "..."+context+"...", idx: ++ctxCounter});
      } else {
        ctxCounter = -1;
        wordData.push({loc: wordLoc, sentence: "..."+context+"...", idx: ++ctxCounter});
      }

      prevContext = context;
      wordLoc = body.findText(word, wordLoc); // find next instance of word in document
    }

    Logger.log(wordData);

    return wordData;
}

// Replaces all instances of word with their corresponding replacement
function replaceAllWords(word) {

    var res = getWordLocationsAndSentence(word);
    var replacements = getReplacementsArray();

    for(let i = 0; i < replacements.length; i++) {
      if(replacements[i] != null) {
        var wordInstance = (res[i].loc).getElement().asText();
        wordInstance.deleteText((res[i].loc).getStartOffset(), (res[i].loc).getEndOffsetInclusive());
        wordInstance.insertText((res[i].loc).getStartOffset(), replacements[i]);
      }
    }
}

function sortDictByValue(dict) {
  var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  return items;
}

function getMostCommonWordsAndFreqs() {
  const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"]

  var vocabulary = DocumentApp.getActiveDocument().getBody()
                              .getText().replace(/[.]/g, '').split(/\s/);
  var word2freq = {};
  vocabulary.forEach(function(w) {
    if (!stopwords.includes(w) && !/[^a-zA-Z]/.test(w) && w.length != 0) {
      if (!word2freq[w]) {
        word2freq[w] = 0;
      }
      word2freq[w] += 1;
    }
  });
  return sortDictByValue(word2freq);
}
