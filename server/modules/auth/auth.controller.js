const { db } = require("../../db/drizzle");
const { users } = require("../users/users.schema");
const { eq } = require("drizzle-orm");
const utils = require("../../utils");
const bcrypt = require("bcryptjs");

/**
 * 🔐 Auth Controller (Senior Architect Pattern)
 */

exports.login = (req, res) => {
    const token = utils.signToken(req.user);
    return res.json({
        message: "Login successful",
        token,
        user: {
            email: req.user.email,
            role: req.user.role,
        }
    });
};

exports.getMe = (req, res) => {
    return res.json({
        email: req.user.email,
        role: req.user.role,
        verified: req.user.verified,
        domains: 0,  // TODO: Count user's custom domains
        links: 0,    // TODO: Count user's links
        apikey: req.user.apikey || undefined,
    });
};

exports.signup = async (req, res) => {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await db.insert(users).values({
        email,
        password: hashedPassword,
    }).returning();

    const token = utils.signToken(newUser);
    return res.status(201).json({
        message: "Account created",
        token,
        user: { email: newUser.email, role: newUser.role }
    });
};

exports.logout = (req, res) => {
    utils.deleteCurrentToken(res);
    return res.json({ message: "Logged out" });
};
