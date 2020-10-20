// Remember the last Graph/Family to avoid redundant import
var previousGraph;
var previousFamily;
function GraphToDTreeConverter(graphData, rootId) {
  
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
  
  var hPersonStructure = generateDTreeRecursive(family.members[hRootId]);
  return [hPersonStructure];
}
function getAParent(familyMember) {
  return familyMember.parentConnection.partner1;
}
function generateDTreeRecursive(familyMember) {
  
  var hD3TreePerson = createFamilyMemberDTreeFormat(familyMember);
  
  if (familyMember.connection !== undefined) {
    
    hD3TreePerson["marriages"] = [];
        
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

  }
  return hD3TreePerson;
}
function createFamilyMemberDTreeFormat(familyMember) {
  console.log(familyMember.age);
  var age = familyMember.age ? familyMember.age : '-';
  var nickname = familyMember.nickname ? familyMember.nickname : false;
  return {
    name: familyMember.name,
    class: familyMember.gender + " node",
    extra: {
      id: familyMember.id,
      age: age,
      nickname: nickname
    }
  };
}
function createPartnerDTreeFormat(partner) {
  var genderClass = getGenderClassOfPartner(partner);
  var age = partner.age ? partner.age : '-';
  var nickname = partner.nickname ? partner.nickname : false;
  return {
    name: partner.name,
    class: genderClass,
    extra: {
      id: partner.id,
      age: age,
      nickname: nickname
    }
  };
}
function getPartnerOfFamilyMember(familyMember) {
  return familyMember.connection.getPartner(familyMember);
}

function getGenderClassOfPartner(partner) {
  var hGender = partner.gender;
  if (partner.parentConnection !== undefined) {
    hGender += "-alternativeRoot";
  }
  hGender += " node";
  return hGender;
}
function insertFamilyInfoToDTreePerson(d3TreePerson, partnerObject, children) {
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
  var hFamilyMember = familyMember.sort(comparePersonsByIdAsc);
  var hFamilyMembers = [];
  hFamilyMember.forEach(member => {
    hFamilyMembers.push(new FamilyMember(member.id, member.name, member.gender, member.age, member.nickname));
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
  constructor(id, name, gender, age, nickname) {
    this.connection = undefined;
    this.connections = [];
    this.parentConnection = undefined;
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.age = age;
    this.nickname = nickname;
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




