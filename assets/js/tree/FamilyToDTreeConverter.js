function convert(family, rootId) {
    // Handelt es sich bei der Id schon um den "höchsten" Root?
    // Solange die Eltern-Beziehungen "hochlaufen" bis es keine Eltern mehr gibt
    var hRootId = rootId;
    var hRootIdIsTopRoot = false;
    var hCurrentPerson = family.members[rootId];
    while (!hRootIdIsTopRoot) {
      if (hCurrentPerson.parentConnection !== undefined) {
        hCurrentPerson = getAParent(hCurrentPerson);
      } else {
        hRootIdIsTopRoot = true;
        hRootId = hCurrentPerson.id;
      }
    }
    var hPeronStructure = generateDTreeRecursive(family.members[hRootId]);
    return [hPeronStructure];
  }
  function getAParent(familyMember) {
    // Es ist egal welches Elternteil gewählt wird, da es nur wichtig ist, dass der Stammbaum nach oben der ausgewählten Person erscheint.
    return familyMember.parentConnection.partner1;
  }
  function generateDTreeRecursive(familyMember) {
    var hD3TreePerson = createFamilyMemberDTreeFormat(familyMember);
    // Hat die Person eine Verbindung?
    if (familyMember.connection !== undefined) {
      var hPartner = getPartnerOfFamilyMember(familyMember);
      var hPartnerObject = createPartnerDTreeFormat(hPartner);
      // Kinder ermitteln
      var hChildren = [];
      familyMember.connection.children.forEach(child => {
        // Nun wird das jeweilige Kind und dessen Daten und Beziehungen analysiert (rekursiv)
        // Das Ergebnis des resultierenden Teilbaums wird hier in die Datenstruktur hinzugefügt.
        var hChildData = generateDTreeRecursive(child);
        hChildren.push(hChildData);
      });
      insertFamilyInfoToDTreePerson(hD3TreePerson, hPartnerObject, hChildren);
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
    d3TreePerson["marriages"] = [
      {
        spouse: partnerObject,
        children: children
      }
    ];
  }
  module.exports = convert;
  