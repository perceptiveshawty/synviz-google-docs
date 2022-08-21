// Getters
function getSynTreeDataStuct() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty("synTreeDS"));
}

function getSynArray() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty("synArray"));
}

function getContextArray() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty("contextArray"));
}

function getIndicesArray() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty("indicesArray"));
}

function getWordToReplace() {
  return PropertiesService.getScriptProperties().getProperty("wordToReplace");
}

function getReplacementsArray() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty("replacementsArray"));
}


// Setters
function setSynTreeDataStruct(synTreeStruct) {
  PropertiesService.getScriptProperties().setProperty("synTreeDS", JSON.stringify(synTreeStruct));
}

function setSynArray(synArray) {
  PropertiesService.getScriptProperties().setProperty("synArray", JSON.stringify(synArray));
}

function setContextArray(contextArray) {
  PropertiesService.getScriptProperties().setProperty("contextArray", JSON.stringify(contextArray));
}

function setIndicesArray(indicesArray) {
  PropertiesService.getScriptProperties().setProperty("indicesArray", JSON.stringify(indicesArray));
}

function setReplacementsArray(replacementsArray) {
  PropertiesService.getScriptProperties().setProperty("replacementsArray", JSON.stringify(replacementsArray));
}

function setWordToReplace(newWord) {
  PropertiesService.getScriptProperties().setProperty("wordToReplace", newWord);
}
