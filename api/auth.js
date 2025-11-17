// api/auth.js - Fichier à placer dans le dossier /api de votre projet

const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

// Configuration Steam
const STEAM_API_KEY = process.env.STEAM_API_KEY; // À configurer dans Vercel
const RETURN_URL = process.env.RETURN_URL || 'http://localhost:3000/auth/steam/return';
const REALM = process.env.REALM || 'http://localhost:3000/';

passport.use(new SteamStrategy({
    returnURL: RETURN_URL,
    realm: REALM,
    apiKey: STEAM_API_KEY
  },
  function(identifier, profile, done) {
    // L'utilisateur est authentifié
    return done(null, profile);
  }
));

module.exports = async (req, res) => {
  if (req.url === '/api/auth/steam') {
    // Redirection vers Steam pour l'authentification
    passport.authenticate('steam')(req, res);
  } 
  else if (req.url.startsWith('/api/auth/steam/return')) {
    // Callback après authentification Steam
    passport.authenticate('steam', { failureRedirect: '/' })(req, res, () => {
      // Succès : renvoyer les données utilisateur
      const user = {
        steamId: req.user.id,
        personaName: req.user.displayName,
        avatar: req.user.photos[2].value // Avatar grand format
      };
      
      // Rediriger vers le site avec les données utilisateur
      res.redirect(`/?user=${encodeURIComponent(JSON.stringify(user))}`);
    });
  }
  else {
    res.status(404).json({ error: 'Not found' });
  }
};
