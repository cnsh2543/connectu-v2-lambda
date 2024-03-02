const request = require("supertest");
const express = require("express");
const cors = require("cors");
const app = express();
const LoginRouter = require("../routers/login");
const { pool } = require("../controllers/pools");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());
app.use("/login", LoginRouter);

console.error = jest.fn(); // Mock console.error

jest.mock("../controllers/pools", () => ({
  pool: {
    query: jest.fn(),
  },
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 if password is wrong", async () => {
    const mockResult = [
      [
        {
          passwordhash:
            "$2b$10$wSh9j/R.pFIQNQAuOX.acOho5EuzbTN/E4rZdfaFVgYqpYCbOCD5G",
          university: "Imperial College London",
        },
      ],
      [],
    ];
    pool.query.mockResolvedValueOnce(mockResult);

    const req = {
      username: "username",
      password: "wrongpassword",
    };
    const res = await request(app).post("/login").send(req);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("User credentials are wrong");
  });

  test("should return 401 if username is wrong", async () => {
    const mockResult = [[], []];
    pool.query.mockResolvedValueOnce(mockResult);

    const req = {
      username: "wrongusername",
      password: "rightpassword",
    };
    const res = await request(app).post("/login").send(req);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("User credentials are wrong");
  });

  test("should return 200 if username and password are right", async () => {
    const mockResult = [
      [
        {
          passwordhash:
            "$2b$10$wSh9j/R.pFIQNQAuOX.acOho5EuzbTN/E4rZdfaFVgYqpYCbOCD5G",
          university: "Imperial College London",
        },
      ],
      [],
    ];
    pool.query.mockResolvedValueOnce(mockResult);
    const mockToken = "mockedToken";
    require("jsonwebtoken").sign.mockReturnValueOnce(mockToken);

    const req = {
      username: "rightusername",
      password: "itisarainyday",
    };
    const res = await request(app).post("/login").send(req);
    expect(res.status).toBe(200);
  });
});
