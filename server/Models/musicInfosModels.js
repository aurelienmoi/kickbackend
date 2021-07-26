const mongoose = require('mongoose');


const musicInfos = mongoose.Schema({

    likes : {type : mongoose.Schema.Types.Number},
    artist : {type : mongoose.Schema.Types.String},
    beatMaker : {type : mongoose.Schema.Types.String},
    musicCover : {type: mongoose.Schema.Types.String},
    createdAt : { type: String, default: '' }

});

module.exports = mongoose.model('musicInfos', musicInfos);