import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 [PASSPORT] Initializing Google OAuth Strategy...');
console.log('🔧 [PASSPORT] Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('🔧 [PASSPORT] Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('🔧 [PASSPORT] Redirect URI:', process.env.GOOGLE_REDIRECT_URI || '/api/auth/google/callback');

passport.use(
    new GoogleStrategy(
        {
            // clientID: "527442118680-mj937n439e2oj6v3eep1a7is5ujumsuu.apps.googleusercontent.com",
            // clientSecret: "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",
            // callbackURL: "http://localhost:8000/api/auth/google/callback",
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_REDIRECT_URI,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('\n🔐 [PASSPORT] Google OAuth callback received');
                console.log('🔐 [PASSPORT] User email:', profile.emails[0].value);
                console.log('🔐 [PASSPORT] User name:', profile.displayName);
                console.log('🔐 [PASSPORT] Google ID:', profile.id);

                // Check if user exists
                console.log('🔍 [PASSPORT] Searching for existing user in database...');
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    console.log('✅ [PASSPORT] User found in database:', user._id);
                    // If user exists but no googleId (e.g. registered with email/password), add it
                    if (!user.googleId) {
                        console.log('🔗 [PASSPORT] Linking Google account to existing user...');
                        user.googleId = profile.id;
                        // Also update avatar if missing
                        if (!user.avatar && profile.photos && profile.photos[0]) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save({ validateBeforeSave: false });
                        console.log('✅ [PASSPORT] Google account linked successfully');
                    }
                    console.log('🎉 [PASSPORT] Returning existing user');
                    return done(null, user);
                }

                // If user doesn't exist, create new user
                console.log('📝 [PASSPORT] User not found, creating new user...');
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                    role: 'student', // Default role
                    isProfileComplete: false,
                });
                console.log('✅ [PASSPORT] New user created:', user._id);

                console.log('🎉 [PASSPORT] Returning new user');
                return done(null, user);
            } catch (error) {
                console.error('❌ [PASSPORT] Error in OAuth callback:', error.message);
                return done(error, null);
            }
        }
    )
);

export default passport;
