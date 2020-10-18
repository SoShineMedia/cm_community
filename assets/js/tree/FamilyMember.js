class FamilyMember {
    constructor(id, name, gender) {
      this.connection = undefined;
      this.parentConnection = undefined;
      this.id = id;
      this.name = name;
      this.gender = gender;
    }
  
    setConnection(newConnection) {
      this.connection = newConnection;
    }
  
    setParentConnection(newParentConnection) {
      this.parentConnection = newParentConnection;
    }
  }
module.exports = FamilyMember;
