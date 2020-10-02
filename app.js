//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-konstantinos:Sharingan12@cluster0.wum2m.mongodb.net/todolistDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const itemsSchema = {
	name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
	name: 'Buy milk'
});

const item2 = new Item({
	name: 'Go to bank'
});

const item3 = new Item({
	name: 'Study'
});

const defaultItems = [ item1, item2, item3 ];

const listSchema = {
	name: String,
	items: [ itemsSchema ]
};

const List = mongoose.model('List', listSchema);

app.get('/', function(req, res) {
	// const day = date.getDate();
	Item.find(function(err, founditems) {
		if (founditems.length === 0) {
			Item.insertMany(defaultItems, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('Succesfully inserted!');
				}
			});
			res.redirect('/');
		} else {
			res.render('list', { listTitle: 'Today', newListItems: founditems });
		}
	});
});

app.get('/:customListName', function(req, res) {
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({ name: customListName }, function(err, foundList) {
		if (!err) {
			if (!foundList) {
				const list = new List({
					name: customListName,
					items: defaultItems
				});
				list.save();
				res.redirect('/' + customListName);
			} else {
				res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
			}
		}
	});
});

app.post('/', function(req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName
	});

	if (listName === 'Today') {
		item.save();
		res.redirect('/');
	} else {
		List.findOne({ name: listName }, function(err, foundList) {
			foundList.items.push(item);
			foundList.save();
			res.redirect('/' + listName);
		});
	}
});

app.post('/delete', function(req, res) {
	const checkedItem = req.body.checkbox;
	const listName = req.body.listName;
	// console.log(checkedItem);
	if (listName === 'Today') {
		Item.deleteOne({ _id: checkedItem }, function(err) {
			if (!err) {
				console.log('all good');
				res.redirect('/');
			}
		});
	} else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItem } } }, function(err, foundList) {
			if (!err) {
				res.redirect('/' + listName);
			}
		});
	}
});

app.get('/about', function(req, res) {
	res.render('about');
});

app.listen(3000, function() {
	console.log('Server started on port 3000');
});
