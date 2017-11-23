const express = require('express')
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('assets'));



app.get('/', function(req, res) {

	

	res.render('video');
	
});

app.listen(9090, () => console.log('Example app listening on port 3000!'))
