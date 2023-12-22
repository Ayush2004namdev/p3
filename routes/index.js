var express = require('express');
const users = require('./users');
var router = express.Router();
var userModel = require("./users");
var postModel = require("./post");
const passport = require('passport');
const localStragety = require('passport-local');
const upload = require('./multer');

passport.use(new localStragety(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav:false});
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/register', function(req, res, next) {
  res.render("register", {nav:false})
});

router.get('/add',isLoggedIn, function(req, res, next) {
  res.render("add",{nav:true});
});

router.post('/createpost',isLoggedIn,upload.single("postimage"),async function(req, res, next) {

  const user =await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user:user._id,
    tittle:req.body.tittle,
    description:req.body.description,
    image:req.file.filename
  })
  user.posts.push(post._id),
  await user.save(),
  res.redirect("/profile")

});

router.post('/upload',isLoggedIn,upload.single("image"),async function(req, res, next) {

  const user =await userModel.findOne({username:req.session.passport.user})
  user.Image = req.file.filename;
  await user.save();
  res.redirect("/profile")
});

router.get('/show/posts',isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")

  res.render("show",{user, nav:true})
});
router.get('/profile',isLoggedIn,async function(req, res, next) {
   const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")
   console.log(user)
   res.render("profile",{user, nav:true})
});


router.get('/feed',isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")
  res.render("feed",{user,posts, nav:true})
});
router.post('/login',passport.authenticate("local",{
  failureRedirect:"/",
  successRedirect:"profile"
}), function(req, res, next) {
});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username:req.body.username,
    email:req.body.email,
    number:req.body.number
  })
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })

});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/")
}


module.exports = router;
