// api/auth.js
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

// Configuration Steam - Les variables d'environnement sont définies dans Vercel
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const RETURN_URL = process.env.RETURN_URL || 'http://localhost:3000/api/auth/steam/return';
const REALM = process.env.REALM || 'http://localhost:3000/';

// Configuration de la stratégie Steam
passport.use(new SteamStrategy({
    returnURL: RETURN_URL,
    realm: REALM,
    apiKey: STEAM_API_KEY
  },
  function(identifier, profile, done) {
    // L'utilisateur est authentifié avec succès
    return done(null, profile);
  }
));

// Sérialisation de l'utilisateur pour la session
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Handler principal pour les routes d'authentification
module.exports = async (req, res) => {
  // Route 1 : Initier l'authentification Steam
  if (req.url === '/api/auth/steam') {
    return passport.authenticate('steam')(req, res);
  } 
  
  // Route 2 : Callback après authentification Steam
  else if (req.url.startsWith('/api/auth/steam/return')) {
    return passport.authenticate('steam', { 
      failureRedirect: '/?error=auth_failed' 
    })(req, res, () => {
      // Authentification réussie
      if (req.user) {
        const user = {
          steamId: req.user.id,
          personaName: req.user.displayName,
          avatar: req.user.photos && req.user.photos[2] ? req.user.photos[2].value : req.user.photos[0].value
        };
        
        // Rediriger vers la page d'accueil avec les données utilisateur
        const userParam = encodeURIComponent(JSON.stringify(user));
        res.redirect(`/?user=${userParam}`);
      } else {
        res.redirect('/?error=no_user');
      }
    });
  }
  
  // Route 3 : Déconnexion
  else if (req.url === '/api/auth/logout') {
    req.logout(() => {
      res.redirect('/');
    });
  }
  
  // Route non trouvée
  else {
    res.status(404).json({ error: 'Not found' });
  }
};
