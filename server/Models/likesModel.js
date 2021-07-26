const mongoose = require('mongoose');


const likes = mongoose.Schema({

    musicId: [
        { type: mongoose.Schema.Types.ObjectId }
    ]

});

module.exports = mongoose.model('likes', likes);