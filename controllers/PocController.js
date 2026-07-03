function index(req, res) {
  res.render('poc-mvp1', {
    title: 'POC MVP1'
  });
}

module.exports = {
  index
};
