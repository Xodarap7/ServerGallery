const { Router } = require("express");
const router = Router();

//Reset password
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const async = require("async");
const crypto = require("crypto");

const passport = require("passport");

const { validationResult, check } = require("express-validator");

const User = require("../models/User");

router.get("/", (req, res) => {
  res.render("pages/authorization", {
    title: "Вход/регистрация",
  });
});

// router.post("/login", (req, res) => {
//   console.log(req.body);
//   return;
// });
router.post(
  "/register",
  [
    check("name", "Поле Имя обязательно").not().isEmpty(),
    check("email", "Введите валидный email").isEmail(),
    check("password", "Длина пароля должна быть не менее 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const errors_array = errors.array();
    if (!errors.isEmpty()) {
      res.render("pages/authorization", {
        error_msg: errors_array,
      });
    }
    console.log(req.bogy);
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.render("pages/authorization", {
          error_msg: [{ msg: "Пользователь уже зарегистрирован" }],
        });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      await res.render("pages/authorization", {
        success_msg: [{ msg: "Вы зарегистрированы и можете войти" }],
      });
    } catch (err) {}
  }
);

//reset password
router.get("/reset-password", (req, res) => {
  res.render("pages/reset-password", {
    title: "Reset pasword",
  });
});

router.post("/reset-password", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            return res.render("pages/reset-password", {
              error_msg: [{ msg: "Пользователь не найден" }],
            });
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 465,

          auth: {
            user: "slavik228krasava228@gmail.com",
            pass: "xodarap1999",
          },
        });
        var mailOptions = {
          to: user.email,
          from: "slavik228krasava228@gmail.com",
          subject: "Node.js Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/change-password/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          return res.render("pages/authorization", {
            success_msg: [
              {
                msg:
                  "E-mail был отправлен на адрес " +
                  user.email +
                  " с дальнейшими инструкциями.",
              },
            ],
          });
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/reset-password");
    }
  );
});

router.get("/change-password/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).lean();
  if (!user) {
    return res.render("pages/reset-password", {
      error_msg: [
        { msg: "Неправильная или просроченная ссылка сброса пароля." },
      ],
    });
  }
  res.render("./pages/change-password", {
    user: user,
  });
});
router.post("/change-password/:token", function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          async function (err, user) {
            if (!user) {
              return res.render("pages/reset-password", {
                error_msg: [
                  {
                    msg: "Неправильная или просроченная ссылка сброса пароля.",
                  },
                ],
              });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save(() => {
              res.redirect("/gallery");
              done(err, user);
            });
          }
        );
      },
      function (user, done) {
        console.log("Отправляю email");
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 465,

          auth: {
            user: "slavik228krasava228@gmail.com",
            pass: "xodarap1999",
          },
        });
        var mailOptions = {
          to: user.email,
          from: "slavik228krasava228@gmail.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          done(err);
        });
      },
    ],
    function (err) {
      console.log(err);

      return res.render("pages/authorization", {
        success_msg: [{ msg: "Поздравляем, пароль успешно изменен." }],
      });
    }
  );
});

//login
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/gallery",
    failureRedirect: "/",
  })(req, res, next);
});

// @route   GET /users/logout
// @desc    Return current user
// @access  Public
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
