
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
module.exports = Connection;
