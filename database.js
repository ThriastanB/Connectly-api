// database.js
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    // Simulate a database connection (replace with real connection code)
    this.connection = 'Connected to the database';
    Database.instance = this;
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();
