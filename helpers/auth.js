module.exports = {
  ensureAdmin: function (req, res, next) {
    if (req.user && req.user.isAdmin === true) {
      return next();
    } else {
      res.redirect("/authorization");
    }
  },
  ensureGuest: function (req, res, next) {
    if (req.user && req.user.isGuest === true) {
      return next();
    } else {
      res.redirect("/authorization");
    }
  },
};
