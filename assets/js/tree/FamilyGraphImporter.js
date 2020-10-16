const Family = require("./Family");
const FamilyMember = require("./FamilyMember");
const Connection = require("./Connection");
function importGraph(graphData) {
  var hNewFamily = new Family();
  var hFamilyData = graphData;
  var hFamilyMembers = getFamilyMembers(hFamilyData.persons);
  hNewFamily.setFamilyMembers(hFamilyMembers);
  createConnectionsBetweenMembers(hNewFamily, hFamilyData.connections);
  return hNewFamily;
}
function getFamilyMembers(familyMember) {
  // Sortiert damit ich über den ArrayIndex zugreifen kann. Hier wäre ein Dictionary wesentlich schöner
  var hFamilyMember = familyMember.sort(comparePersonsByIdAsc);
  var hFamilyMembers = [];
  hFamilyMember.forEach(member => {
    hFamilyMembers.push(new FamilyMember(member.id, member.name, member.gender));
  });
  return hFamilyMembers;
}
function comparePersonsByIdAsc(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}
function createConnectionsBetweenMembers(family, connections) {
  // Die Familienmitglieder wurden eingelesen
  // Jetzt müssen die Verbindungen erstellt werden und mit Infos gefüllt werden
  // In diesem Zuge bekommen auf die jeweiligen Mitglieder einen Verweis auf die Verbindung gesetzt
  connections.forEach(connection => {
    var hPartner1 = family.members[connection.partner1Id];
    var hPartner2 = family.members[connection.partner2Id];
    var hNewConnection = new Connection(hPartner1, hPartner2);
    hPartner1.connection = hNewConnection;
    hPartner2.connection = hNewConnection;
    var hChildrenOfConnection = [];
    connection.childrenIds.forEach(childrenId => {
      var hCurrentChild = family.members[childrenId];
      hChildrenOfConnection.push(hCurrentChild);
      // Kind bekommt direkt einen Verweis auf die elterliche Verbindung
      hCurrentChild.setParentConnection(hNewConnection);
    });
    hNewConnection.children = hChildrenOfConnection;
    family.addConnection(hNewConnection);
  });
}
module.exports = importGraph;
