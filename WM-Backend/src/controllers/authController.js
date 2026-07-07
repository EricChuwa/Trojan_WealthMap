const bcrypt = require("bcrypt");
const users = require("../data/users");

const register = async (req, res) => {
    const { name, email, password, country, field, age } = req.body;

    // Check that all required fields are provided
    if (!name || !email || !password || !country) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields."
        });
    }

    // Check if the email is already registered
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already exists."
        });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = {
        id: users.length + 1,
        name,
        email,
        passwordHash,
        country,
        field,
        age
    };

    // Save the user
    users.push(newUser);

    // Send a response (don't send the password hash)
    res.status(201).json({
        success: true,
        message: "User registered successfully.",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            country: newUser.country,
            field: newUser.field,
            age: newUser.age
        }
    });
};

module.exports = {
    register
};