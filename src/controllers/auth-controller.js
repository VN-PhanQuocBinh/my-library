const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

const DocGia = require("../models/DocGia");

const signUser = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await DocGia.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const ok = await user.comparePassword(password);

      if (!ok) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signUser(user);

      const userResponse = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json({
        message: "Login successful",
        token,
        user: userResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { password, ...payload } = req.body;

      // Check email exists
      const isExist = await DocGia.findOne({ email: payload.email });

      if (isExist) {
        return res.status(400).json({
          message: "Email already exist",
          email: payload.email,
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await DocGia.create({ ...payload, passwordHash });
      const token = signUser(user);

      const userResponse = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(201).json({
        message: "Registration successful",
        token,
        user: userResponse,
      });
    } catch (error) {
      res.json({ error });
      next(error);
    }
  }

  async logout(req, res, next) {}
}

module.exports = new AuthController();
