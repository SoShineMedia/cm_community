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
module.exports = Family;
