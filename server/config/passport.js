const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, update googleId if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user from Google profile
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
          designation: 'Employee', // Default value, can be updated later
          role: 'Employee',
          profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          // Note: department should be assigned by admin later
        });

        done(null, user);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).populate('department');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
