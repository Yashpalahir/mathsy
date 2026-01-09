import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  console.log('🔑 [TOKEN] Generating JWT for user ID:', id);
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  console.log('🔑 [TOKEN] JWT generated successfully');
  return token;
};

export default generateToken;

