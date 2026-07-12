const bcrypt = require("bcryptjs");
const users = require("../data/users");

const register = async (req, res) => {
    const { name, email, password, country, field, age } = req.body;

    if (!name || !email || !password || !country) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields."
        });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already exists."
        });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        passwordHash,
        country,
        field,
        age
    };

    users.push(newUser);

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