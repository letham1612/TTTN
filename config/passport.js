const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/UserModel"); // Đảm bảo đúng đường dẫn đến model User

// 🟢 GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || "http://localhost:3000/api/users/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
         console.log("Google Profile:", profile);
        const email = profile.emails?.[0]?.value;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email,
            googleId: profile.id,
            isVerified: true, // Xác nhận tài khoản từ Google
          });
          await user.save();
        } else if (!user.googleId) {
          // Nếu user đã có email nhưng chưa liên kết Google, cập nhật Google ID
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// 🟢 FACEBOOK STRATEGY
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || "";

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email,
            facebookId: profile.id,
            isVerified: true, // Xác nhận tài khoản từ Facebook
          });
          await user.save();
        } else if (!user.facebookId) {
          // Nếu user đã có email nhưng chưa liên kết Facebook, cập nhật Facebook ID
          user.facebookId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// 🟢 SESSION HANDLING
passport.serializeUser((user, done) => {
  console.log("Serialize User:", user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   //console.log("Deserialize User:", id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;


