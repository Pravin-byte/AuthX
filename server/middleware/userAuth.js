import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
    }

    req.userId = decoded.id;

    // --- Sliding Session Logic ---
    const currentTime = Math.floor(Date.now() / 1000); 
    const expiresIn = decoded.exp - currentTime;

    // If token is going to expire in less than 6 minutes, refresh it
    if (expiresIn < 6 * 60) {
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 15 * 60 * 1000,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
  }
};

export default userAuth;
