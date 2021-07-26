const mongoose = require('mongoose');
const { string } = require('@hapi/joi');

const userSchema = mongoose.Schema({

  username: { type: String },
  email: { type: String },
  password: { type: String },
  isArtist: { type: Boolean },
  pseudo: { type: String },
  phoneNumber: { type: String },
  isBeatmaker: { type: Boolean },
  inseeCode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  bio: { type: String },
  registrationDate: { type: Date },
  registrationDateTime: { type: Date },
  emailConfirmed : {type : Boolean, default : false},
  geoJson : {type : JSON},

  chatList: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      msgId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }
    }
  ],
  following: [
    { userFollowed: { type: String, ref: 'User' } }
  ],
  followers: [
    { follower: { type: String, ref: 'User' } }
  ],
  notifications: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String },
      viewProfile: { type: Boolean, default: false },
      created: { type: Date, default: Date.now() },
      read: { type: Boolean, default: false },
      date: { type: String, default: '' }
    }
  ],
  musics: [   //Musics the user uploaded
    {
      musicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String }
    }
  ],
  playlist: [
    {
      musicId : {type : mongoose.Schema.Types.ObjectId},
      name : {type : String}
    }
  ],
  roles :  
    {
      rapper : {type : Boolean, default : false},
      beatmaker : {type : Boolean, default: false},
      clipmaker : {type : Boolean, default: false},
      webradio : {type : Boolean, default : false},
      producer: {type : Boolean, default: false},
      listener : {type : Boolean, default : true},
      rapperNotoriety : {type : String, default : 0},
      beatmakerNotoriety : {type : String, default: 0},
      clipmakerNotoriety : {type : String, default: 0},
      webradioNotoriety : {type : String, default : 0},
      producerNotoriety: {type : String, default: 0},
      listenerNotoriety : {type : String, default : 0}
    }
  ,  

  favoris : [
    {
      musicId : {type : mongoose.Schema.Types.ObjectId},
      name : {type : String}
    }
  ],

  snapInfos : {
    userId : {type : String},
    avatarUrl : {type : String},
    avatarId : {type :  String},
    pseudo : {type : String}
  },
  avatarId :{type : mongoose.Schema.Types.ObjectId,ref :'User'},
  posts: [
    {
      postId: {type : mongoose.Schema.Types.ObjectId, ref :'Post'},
      post: {type : String},
      created: {type : Date, default : Date.now()}
    }
  ]

});

module.exports = mongoose.model('User', userSchema);