import 'dotenv/config';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;

export const createToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    },
    secretKey,
    // {
    //   expiresIn: '3h'
    // }
  );
};

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authorization token required' 
      });
    }

    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};