const db = require('../config/database');

class UserRepository {
  static async findById(id) {
    return db('users').where({ id }).first();
  }

  static async findByEmail(email) {
    return db('users').where({ email: email.toLowerCase().trim() }).first();
  }

  static async getFirstAdmin() {
    return db('users').where({ role: 'admin' }).first();
  }

  static async updatePassword(id, passwordHash) {
    return db('users').where({ id }).update({
      password_hash: passwordHash,
      updated_at: db.fn.now()
    });
  }
}

module.exports = UserRepository;
