const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    if (!req.headers.cookie) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    const token = req.headers.cookie.split('=')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = { authenticateToken };