import 'dotenv/config';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;

// Token creation
export const createToken = (user) => {
  return jwt.sign(
    {
      id: user.name, 
      email: user.email, 
    },
    secretKey,
    {
      expiresIn: '3h'
    }
  );
};

// Token verification middleware
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) {
      return res.status(401).json({ 
        status: 401,
        msg: 'Authorization token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, secretKey);
    
    req.user = decoded;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 401,
        msg: 'Token expired' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        status: 403,
        msg: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      status: 500,
      msg: 'Authentication failed' 
    });
  }
};