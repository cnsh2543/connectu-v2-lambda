const request = require("supertest");
const express = require("express");
const cors = require("cors");
const app = express();
const { pool } = require("../controllers/pools");
const bodyParser = require("body-parser");
const SignupRouter = require("../routers/signup");
const axios = require("axios");

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use("/signup", SignupRouter);

console.error = jest.fn(); // Mock console.error

jest.mock("axios");
jest.mock("../controllers/pools", () => ({
	pool: {
		query: jest.fn(),
	},
}));

describe("Fetching from db", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it("successfully fetches degrees, degree levels, and interests", async () => {
		const mockLevels = [{ id: 1, level: "Bachelor" }];
		require("../controllers/pools").pool.query.mockResolvedValueOnce([
			mockLevels,
			undefined,
		]);

		const response = await request(app).get("/signup/degreelevels");
		expect(response.statusCode).toBe(200);
		expect(response.body.degreeLevels).toEqual(mockLevels);
	});

	it("successfully fetches degrees", async () => {
		const mockDegrees = [{ id: 1, name: "Computer Science" }];
		require("../controllers/pools").pool.query.mockResolvedValueOnce([
			mockDegrees,
			undefined,
		]);

		const response = await request(app).get("/signup/degrees");
		expect(response.statusCode).toBe(200);
		expect(response.body.degrees).toEqual(mockDegrees);
	});

	it("successfully fetches interests", async () => {
		const mockInterests = [{ id: 1, name: "Flatmate" }];
		require("../controllers/pools").pool.query.mockResolvedValueOnce([
			mockInterests,
			undefined,
		]);

		const response = await request(app).get("/signup/interests");
		expect(response.statusCode).toBe(200);
		expect(response.body.interests).toEqual(mockInterests);
	});
});

describe("Password Validation", () => {
	it("should reject when password is less than 8 characters", async () => {
		const response = await request(app)
			.post("/signup/signup")
			.send({ password: "short", rePassword: "short" });

		expect(response.statusCode).toBe(400);
		expect(response.body.errors.password).toContain(
			"Password must be at least 8 characters long"
		);
	});

	it("should reject when password and rePassword do not match", async () => {
		const response = await request(app)
			.post("/signup/signup")
			.send({ password: "longenoughpassword", rePassword: "doesnotmatch" });

		expect(response.statusCode).toBe(400);
		expect(response.body.errors.rePassword).toContain(
			"Password confirmation does not match"
		);
	});

	it("should accept when password is valid and matches rePassword", async () => {
		const response = await request(app)
			.post("/signup/signup")
			.send({ password: "validPassword123", rePassword: "validPassword123" });

		expect(response.body.errors).not.toHaveProperty("password");
		expect(response.body.errors).not.toHaveProperty("rePassword");
	});
});

describe("Email validation", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	it("validates university email successfully", async () => {
		const mockResponse = {
			data: [
				{
					name: "University of Testing",
					domains: ["university.com", "uni.com"],
				},
			],
		};
		axios.get.mockResolvedValue(mockResponse); // Mock axios response
		const response = await request(app)
			.post("/signup/signup")
			.send({ email: "test@university.com" });
		expect(response.body.errors.email).not.toContain(
			"Email is not from a university"
		);
	});

	it("returns false for invalid university email", async () => {
		axios.get.mockResolvedValue({ data: [] }); // Mock an empty response
		const response = await request(app)
			.post("/signup/signup")
			.send({ email: "test@fakeuniversity.com" });
		expect(response.statusCode).toBe(400);
	});
});

describe("Username validation", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	it("rejects already taken usernames", async () => {
		// Mock the database response to simulate an existing user
		require("../controllers/pools").pool.query.mockResolvedValueOnce([
			[{ userid: "existingUser" }],
			undefined,
		]);

		const response = await request(app)
			.post("/signup/signup")
			.send({ username: "existingUser" });
		expect(response.statusCode).toBe(400);
		expect(response.body.errors.username).toContain(
			"Username has already been taken"
		);
	});
});

describe("Year validation", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	it("rejects start years in the future", async () => {
		const response = await request(app)
			.post("/signup/signup")
			.send({ startYear: new Date().getFullYear() + 11 });
		expect(response.statusCode).toBe(400);
		expect(response.body.errors.startYear).toContain(
			"Invalid start year selected"
		);
	});
});
