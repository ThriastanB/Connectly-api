// userFactory.js
class User {
  constructor(name) {
    this.name = name;
  }
}

class AdminUser extends User {
  constructor(name) {
    super(name);
    this.permissions = 'all';
  }
}

class RegularUser extends User {
  constructor(name) {
    super(name);
    this.permissions = 'limited';
  }
}

const createUser = (type, name) => {
  if (type === 'admin') {
    return new AdminUser(name);
  }
  return new RegularUser(name);
};

module.exports = { createUser };
