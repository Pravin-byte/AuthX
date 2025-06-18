import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';


export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing details' });
  }

  try {
    let user = await userModel.findOne({ email });

    if (user && user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login or use Forgot Password if needed.',
      });
    }

    if (user && !user.isAccountVerified) {
      const now = Date.now();

      if (user.verifyOtp && user.verifyOtpExpiredAt > now) {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: 'Email Verification Pending',
          text: `You have already started registration. Please use the OTP sent earlier to verify your email. If you forgot your password, use the 'Forgot Password' option.`,
        });

        return res.status(200).json({
          success: false,
          message: `You have already started registration. Please check your email for the OTP. `,
          otpAllowed: true,
        });
      }

      
      await userModel.deleteOne({ email });
    }

  
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      verifyOtp: otp,
      verifyOtpExpiredAt: otpExpiry,
      isAccountVerified: false,
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Verify Your Email - OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email for verification',
      resent: false,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and Password are required' });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'User does not exist' });
    }

     // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password' });
    }
    
    // Check if account is verified

    if (!user.isAccountVerified) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));

      user.verifyOtp = otp;
      user.verifyOtpExpiredAt = Date.now() + 10 * 60 * 1000;
      await user.save();

      try {

        const info ={
          from: process.env.MAIL_USER,
          to: user.email,
          subject: "Account Verification OTP",
          text: `your OTP is ${otp}. Verify your account using this OTP.`,
        };

        await transporter.sendMail(info);

        return res.status(200).json({
          success: false,
          requiresVerification: true,
          message: 'You already started registration but haven’t verified your email. A new OTP has been sent.',
        });
      } catch (err) {
        console.error('Error sending OTP email:', err);
        return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      }
    }


    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ success: true, data: user });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async(req,res)=>{
  try {
    res.clearCookie('token',{
      httpOnly:true,
      secure:process.env.NODE_ENV == 'production',
      sameSite:process.env.NODE_ENV == 'production'?'none':'strict',
    })
    return res.json({success:true,message:'Logged out'});
  } catch (error) {
     res.json({success:false ,message:error.message})
  }
}

/*
export const sendOTP =async(req,res)=>{
  try {
    const {userId}=req.body;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified){
      return res.json({success:false,message:"Account Already verified"})
    }
    const otp = String(Math.floor(100000 + Math.random()*900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24*60*60*1000 

    await user.save();

     //sending welcome email
    const info ={
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Account Verification OTP",
        text: `your OTP is ${otp}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(info);

    return res.json({success:true});

  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export const verifyOTP =async (req,res)=>{
  const {userId,otp}=req.body;

  if(!userId || !otp){
    return res.json({success:false,message:'Missing Details'});
  }
  try {
    const user = await userModel.findById(userId);
    if(!user){
      return res.json({success:false,message:'User not found'});
    }

    if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.json({success:false,message:'Invalid Otp'})
    }
    if(user.verifyOtpExpiredAt < Date.now()){
      return res.json({success:false,message:'OTP expired'})
    }

    user.isAccountVerified = true;
    user.verifyOtp='';
    user.verifyOtpExpiredAt=0;

    await user.save();

    return res.json({success:true,message:'Verification succesfull'})
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
}

*/

export const sendOTP =async(req,res)=>{
  try {
    const {email}=req.body;
    const user = await userModel.findOne({email});

    const otp = String(Math.floor(100000 + Math.random()*900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24*60*60*1000 

    await user.save();

     //sending welcome email
    const info ={
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Account Verification OTP",
        text: `your OTP is ${otp}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(info);

    return res.json({success:true});

  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export const verifyOTP =async (req,res)=>{
  const {email,otp}=req.body;

  if(!email || !otp){
    return res.json({success:false,message:'Missing Details'});
  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:'User not found'});
    }

    if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.json({success:false,message:'Invalid Otp'})
    }
    if(user.verifyOtpExpiredAt < Date.now()){
      return res.json({success:false,message:'OTP expired'})
    }

    user.isAccountVerified=true;

    user.verifyOtp='';
    user.verifyOtpExpiredAt=0;

    await user.save();

    return res.json({success:true,message:'Verification succesfull'})
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
}

export const verifyResetOTP =async (req,res)=>{
  const {email,otp}=req.body;

  if(!email || !otp){
    return res.json({success:false,message:'Missing Details'});
  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:'User not found'});
    }

    if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.json({success:false,message:'Invalid Otp'})
    }
    if(user.verifyOtpExpiredAt < Date.now()){
      return res.json({success:false,message:'OTP expired'})
    }

    user.isAccountVerified=true;

    await user.save();

    return res.json({success:true,message:'Verification succesfull'})
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
}

export const isAuthenticated = async(req,res)=>{
  try {
    return res.json({success:true});
  } catch (error) {
    res.json({success:false,message:error.message});
  }
}

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    if (user.verifyOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP data
    user.verifyOtp = '';
    user.verifyOtpExpiredAt = 0;

    await user.save();

    return res.json({ success: true, message: 'Password reset successful' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendResetOTP = async (req, res) => {
  const { email } = req.body;

  if(!email){
    return res.json({ success: false, message: 'Email id is required' });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    if(!user.isAccountVerified){
      return res.json({ success: false, message: 'Account is not verified yet!' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    await user.save();

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Reset Password OTP',
      text: `Your OTP for resetting password is: ${otp} , valid for 15 mins`,
    });

    return res.json({ success: true, message: 'OTP sent to email' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const checkEmail = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await userModel.findOne({ email });
    return res.json({ 
      success: true, 
      exists: !!user,
      message: user ? 'Email already registered' : 'Email available'
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
