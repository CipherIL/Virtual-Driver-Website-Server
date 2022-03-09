import app from './app';
require('./db/mongoose');

const port = process.env.PORT;

app.listen(port,() => {
    console.log('App running on port ' + port);
})