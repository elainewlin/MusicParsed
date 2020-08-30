import { SignupBody, validateUserInput } from "../../services/signup";
import { assert } from "chai";

const checkValidateError = (signupBody: SignupBody, expectedMsg: string) => {
  try {
    validateUserInput(signupBody);
    throw new Error();
  } catch (err) {
    assert.equal(err.message, expectedMsg);
  }
}

const checkValidateErrors = (signupBodyList: SignupBody[], expectedMsg: string) => {
  signupBodyList.forEach(signupBody => {
    checkValidateError(signupBody, expectedMsg);
  })
}

/**
 * Generates an alphanumeric string of a given length
 * @type {number} length
 */
const generateString = (length: number) => {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += "a";
  }
  return str;
};

const createSignupBody = (opts: {
  username?: string,
  password?: string,
} = {}): SignupBody => {
  const { username, password } = opts;
  return {
    username: username || "mockUsername",
    password: password || "mockPassword",
    signupToken: "mockToken",
  }
}

describe("validateUserInput", () => {
  it("should check if signup body has all fields", () => {
    const signupBodyList = [
      {},
      { username: "" },
      { username: "", password: "" },
      { password: "", signupToken: "" },
    ]
    const expectedMsg = "Missing required field"
    checkValidateErrors(signupBodyList, expectedMsg)
  });

  it("should check if username if alphanumeric", () => {
    const invalidUsernames = [ "!!!!", "a_bc" ];
    const signupBodyList = invalidUsernames.map(username => {
      return createSignupBody({ username });
    });
    const expectedMsg = "Username must only contain letters and numbers";
    checkValidateErrors(signupBodyList, expectedMsg);
  });

  it("should check if username length is valid", () => {
    const tooLongName = generateString(21);
    const invalidUsernames = ["a", tooLongName];
    const signupBodyList = invalidUsernames.map(username => {
      return createSignupBody({ username });
    });
    const expectedMsg = "Username must be between 2-20 characters";
    checkValidateErrors(signupBodyList, expectedMsg);
  });

  it("should check if password length is valid", () => {
    const tooLongPassword = generateString(31);
    const tooShortPassword = generateString(3);
    const invalidPasswords = [tooShortPassword, tooLongPassword];
    const signupBodyList = invalidPasswords.map(password => {
      return createSignupBody({ password });
    });
    const expectedMsg = "Password must be between 4-30 characters"
    checkValidateErrors(signupBodyList, expectedMsg)
  });

  it("should accept valid input", () => {
    const signupBody = createSignupBody();
    try {
      validateUserInput(signupBody);
      throw new Error("Expected no error");
    } catch (err) {
      assert.equal(err.message, "Expected no error");
    }
  });
})