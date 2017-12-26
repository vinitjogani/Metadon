Router.route('/', function () {
    this.render('home');
});

Router.route('/game/:_id', function () {
    this.render('game');
});