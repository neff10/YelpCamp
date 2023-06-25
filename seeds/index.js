const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '64959c150e427153dbf8ac2e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione dignissimos, maiores quia quo beatae cum, hic, dolores impedit quos incidunt quibusdam vitae adipisci delectus voluptates accusantium ipsa. Eos, dolores in!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dv2xirfbz/image/upload/v1687560681/YelpCamp/pdhw8ep4islshwa1mshj.avif',
                    filename: 'YelpCamp/pdhw8ep4islshwa1mshj'
                },
                {
                    url: 'https://res.cloudinary.com/dv2xirfbz/image/upload/v1687560681/YelpCamp/qulk7jcbhhcpktbqcrp1.avif',
                    filename: 'YelpCamp/qulk7jcbhhcpktbqcrp1'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})