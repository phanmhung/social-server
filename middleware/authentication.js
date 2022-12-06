import jwt from 'jsonwebtoken';

const requireSignin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res
      .status(400)
      .json({ message: 'Authorization invalid with bearer!' });
  }

  const token = authHeader.split(' ')[1];
  if(!token){
    return res.status(400).json({message:"Authorization invalid without token!"});
  }

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {userId: payload._id};
    next();
  } catch (err){
    console.log(`uthorization invalid with ${err}`);
    return res.status(400).json({message:"Authorization invalid with error!"});
  }
};

export default requireSignin;