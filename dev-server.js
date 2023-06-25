if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  const express = require('express');
  const path = require('path');
  const mongoose = require('mongoose');
  const ejsMate = require('ejs-mate');
  const session = require('express-session');
  const flash = require('connect-flash');
  const ExpressError = require('./utils/ExpressError');
  const methodOverride = require('method-override');
  const passport = require('passport');
  const LocalStrategy = require('passport-local');
  const User = require('./models/user');
  
  const userRoutes = require('./routes/users.js');
  const campgroundRoutes = require('./routes/campgrounds.js');
  const reviewRoutes = require('./routes/reviews.js');
  
  mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  const app = express();
  
  app.engine('ejs', ejsMate);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));
  app.use(express.static(path.join(__dirname, 'public')));
  
  const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  };
  app.use(session(sessionConfig));
  app.use(flash());
  
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  });
  
  app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'bestteachedasr@gmail.com', username: 'sula a' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
  });
  
  app.use('/', userRoutes);
  app.use('/campgrounds', campgroundRoutes);
  app.use('/campgrounds/:id/reviews', reviewRoutes);
  
  app.get('/', (req, res) => {
    res.render('home');
  });
  
  app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
  });
  
  app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
  });
  
  const server = app.listen(3000, () => {
    console.log('Serving on port 3000');
  });
  
  // Livereload setup
  const livereload = require('livereload');
  const livereloadServer = livereload.createServer();
  livereloadServer.watch(path.join(__dirname, 'views'));
  
  // BrowserSync setup
  const browserSync = require('browser-sync');
  browserSync({
    proxy: 'http://localhost:3000', // Replace with your server's URL
    files: ['./views/**/*'], // Replace with the glob pattern matching your EJS templates
    ignore: ['node_modules'], // Ignore node_modules directory
    open: false, // Prevent BrowserSync from automatically opening a new browser window
  });
  