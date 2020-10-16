// Remember the last Graph/Family to avoid redundant import
var previousGraph;
var previousFamily;
function GraphToDTreeConverter(graphData, rootId) {
  console.log(rootId);
  var hFamily = previousFamily;
  if (graphData !== previousGraph) {
    hFamily = importGraph(graphData);
    previousGraph = graphData;
    previousFamily = hFamily;
  }
  //console.log(hFamily.members[rootId]);
  return convert(hFamily, rootId);
}
function convert(family, rootId) {
  // Handelt es sich bei der Id schon um den "höchsten" Root?
  // Solange die Eltern-Beziehungen "hochlaufen" bis es keine Eltern mehr gibt
  var hRootId = rootId;
  var hRootIdIsTopRoot = false;
  var hCurrentPerson = family.members[rootId];
  while (!hRootIdIsTopRoot) {
    if (hCurrentPerson.parentConnection !== undefined) {
      hCurrentPerson = getAParent(hCurrentPerson);//Todo
    } else {
      hRootIdIsTopRoot = true;
      hRootId = hCurrentPerson.id;
    }
  }
  //console.log(family.members[hRootId]);
  
  var hPersonStructure = generateDTreeRecursive(family.members[hRootId]);
  return [hPersonStructure];
}
function getAParent(familyMember) {
  // Es ist egal welches Elternteil gewählt wird, da es nur wichtig ist, dass der Stammbaum nach oben der ausgewählten Person erscheint.
  return familyMember.parentConnection.partner1;
}
function generateDTreeRecursive(familyMember) {
  //console.log(familyMember);
  var hD3TreePerson = createFamilyMemberDTreeFormat(familyMember);
  //console.log(familyMember.connection);
  // Hat die Person eine Verbindung?
  if (familyMember.connection !== undefined) {
    //console.log("NOT NULL",familyMember.connection);
    hD3TreePerson["marriages"] = [];
    //var hPartner = getPartnerOfFamilyMember(familyMember);
    //console.log(hPartner);
    /*var hPartnerObject = createPartnerDTreeFormat(hPartner);
    // Kinder ermitteln
    var hChildren = [];
    familyMember.connection.children.forEach(child => {
      // Nun wird das jeweilige Kind und dessen Daten und Beziehungen analysiert (rekursiv)
      // Das Ergebnis des resultierenden Teilbaums wird hier in die Datenstruktur hinzugefügt.
      var hChildData = generateDTreeRecursive(child);
      hChildren.push(hChildData);
    });*/
    
    familyMember.connections.forEach(person => {
      var spouse = person.getPartner(familyMember);
      var hPartnerObject = createPartnerDTreeFormat(spouse);
      var hChildren = [];
      person.children.forEach(child => {
        var hChildData = generateDTreeRecursive(child);
        hChildren.push(hChildData);
      });

      insertFamilyInfoToDTreePerson(hD3TreePerson, hPartnerObject, hChildren);
    });


    //console.log(hD3TreePerson, hPartnerObject, hChildren);
    //insertFamilyInfoToDTreePerson(hD3TreePerson, hPartnerObject, hChildren);
  }
  return hD3TreePerson;
}
function createFamilyMemberDTreeFormat(familyMember) {
  return {
    name: familyMember.name,
    class: familyMember.gender,
    extra: {
      id: familyMember.id
    }
  };
}
function createPartnerDTreeFormat(partner) {
  // Hat der Partner auch noch parent Informationen? Dann ist dort noch ein alternativer Root möglich und soll visuell markiert werden
  var genderClass = getGenderClassOfPartner(partner);
  return {
    name: partner.name,
    class: genderClass,
    extra: {
      id: partner.id
    }
  };
}
function getPartnerOfFamilyMember(familyMember) {
  return familyMember.connection.getPartner(familyMember);
}
// Falls der Partner noch Elterninformationen hinterlegt hat, werden diese nicht als Baum dargestellt.
// Das Vorhandensein eines weiteren Wurzelzweigs (Eltern) wird aber visuell hervorgehoben.
// Für den Transport dieser Information wird die Gender-Eigentschaft zweckentfremdet.
function getGenderClassOfPartner(partner) {
  var hGender = partner.gender;
  if (partner.parentConnection !== undefined) {
    hGender += "-alternativeRoot";
  }
  return hGender;
}
function insertFamilyInfoToDTreePerson(d3TreePerson, partnerObject, children) {
  // Im aktuellen Familienmitglied noch diese Verbindungsinformmationen hinterlegen
  /*d3TreePerson["marriages"] = [
    {
      spouse: partnerObject,
      children: children
    }
  ];*/
  d3TreePerson["marriages"].push({
    spouse: partnerObject,
    children: children
  });

}

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
    hPartner1.addConnection(hNewConnection); 
    hPartner2.connection = hNewConnection;
    hPartner2.addConnection(hNewConnection); 

    var hChildrenOfConnection = [];
    connection.childrenIds.forEach(childrenId => {
      var hCurrentChild = family.members[childrenId];      
      hCurrentChild.setParentConnection(hNewConnection);
      hChildrenOfConnection.push(hCurrentChild);
    });
    hNewConnection.children = hChildrenOfConnection;
    family.addConnection(hNewConnection);
  });
}

class Connection {
  constructor(partner1, partner2) {
    this.partner1 = partner1;
    this.partner2 = partner2;
  }

  getPartner(person) {
    if (this.partner1 === person) {
      return this.partner2;
    }
    return this.partner1;
  }
}

class Family {
  constructor() {
    this.members = [];
    this.connections = [];
    this.marriageNodeIds = [];
  }

  addFamilyMember(member) {
    this.members.push(member);
  }

  setFamilyMembers(members) {
    this.members = members;
  }

  addConnection(connection) {
    this.connections.push(connection);
  }  
}

class FamilyMember {
  constructor(id, name, gender) {
    this.connection = undefined;
    this.connections = [];
    this.parentConnection = undefined;
    this.id = id;
    this.name = name;
    this.gender = gender;
  }

  setConnection(newConnection) {
    this.connection = newConnection;
  }
  addConnection(newConnection) {
    this.connections.push(newConnection);
  }

  setParentConnection(newParentConnection) {
    this.parentConnection = newParentConnection;
  }
}




