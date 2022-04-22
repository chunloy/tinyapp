const { assert } = require('chai');
const { findUserByID, getUserByEmail, checkUserEmail, getPasswordByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$QlG/Qqq/wSrwG0yEFNkTCeGNvNYYYAJWnVuffO7nIs4rPve9ZRlHm" //purple-monkey-dinosaur
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$cuGIYm1RMSfY5YvYNbzuf.CaK3CQoL6GjLB8/k2IwBEdG8iMsbyYy" //dishwasher-funk
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

describe('#findUserByID', () => {
  it('should return a valid user as an object', () => {
    const user = findUserByID('userRandomID', testUsers);
    const expectedUserID = {
      id: "userRandomID",
      email: "user@example.com",
      password: "$2a$10$QlG/Qqq/wSrwG0yEFNkTCeGNvNYYYAJWnVuffO7nIs4rPve9ZRlHm"
    };

    assert.deepEqual(user, expectedUserID);
  });

  it('should return undefined if no user found', () => {
    const user = findUserByID('user3RandomID', testUsers);

    assert.strictEqual(user, undefined);
  });
});

describe('#getUserByEmail', () => {

  it('should return a user with a valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';

    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined if no ID matches email', () => {
    const user = getUserByEmail('user3@example.com', testUsers);

    assert.strictEqual(user, undefined);
  });
});

describe('#checkUserEmail', () => {
  it('should return true if email exists in database', () => {
    const userEmail = checkUserEmail('user@example.com', testUsers);

    assert.strictEqual(userEmail, true);
  });

  it('should return false if email does not exist in database', () => {
    const userEmail = checkUserEmail('user3@example.com', testUsers);

    assert.strictEqual(userEmail, false);
  });
});

describe('#getPasswordByEmail', () => {
  it('should return a user\'s password with valid email', () => {
    const userPassword = getPasswordByEmail('user@example.com', testUsers);
    const expectedPassword = "$2a$10$QlG/Qqq/wSrwG0yEFNkTCeGNvNYYYAJWnVuffO7nIs4rPve9ZRlHm";

    assert.strictEqual(userPassword, expectedPassword);
  });

  it("should return 'noPasswordFound' no password is found", () => {
    const userPassword = getPasswordByEmail('user3@example.com', testUsers);
    const expectedPassword = 'noPasswordFound';
    assert.strictEqual(userPassword, expectedPassword);
  });
});

describe('#urlsForUser', () => {
  it('should return a url object owned by the user', () => {
    const urlPair = urlsForUser('userRandomID', testUrlDatabase);
    const expected = { b6UTxQ: "https://www.tsn.ca" };

    assert.deepEqual(urlPair, expected);
  });

  it('should return an empty object if no urls are owned by user', () => {
    const urlPair = urlsForUser('user3RandomID', testUrlDatabase);

    assert.deepEqual(urlPair, {});
  });
});
