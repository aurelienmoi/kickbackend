var User = require('../Models/userModels');
var ObjectId = require('mongodb').ObjectID;
const dateTime = require('date-time'); // use this date instead of new Date() in notification component mby?
module.exports = {
    followUser(req, res) {
        console.log(req.body.userFollowed);
        console.log(req.decoded.id);
        const followUser = async () => {
            await User.update({
                _id: req.decoded.id,
                "following.userFollowed": { $ne: req.body.userFollowed }
            },
                {
                    $push: {
                        following: {
                            userFollowed: req.body.userFollowed
                        }
                    }

                });

            await User.update(

                {
                    _id: req.body.userFollowed,
                    'following.follower': { $ne: req.decoded.id } // following.follower doesnt exist inn mongodb, mby followers.follower instead? 
                },
                {
                    $push: {
                        followers: {
                            follower: req.decoded.id
                        },
                        notifications: [{
                            senderId: req.decoded.id,
                            message: `${req.decoded.pseudo} a commencé à vous suivre`,
                            created: new Date(),
                            viewProfile: false,

                        }
                        ]
                    }
                }



            );
        };
        followUser().then(() => {
            res.status(200).json({ message: 'following user successful' });
        })
            .catch(err => {
                console.log(err);
                res.status(500).json({ message: "error occured in friends.js" });
            });

    },
    unfollowUser(req, res) {
        console.log(req.body.userFollowed);
        console.log(req.decoded.id);
        const unfollowUser = async () => {
            await User.update({
                _id: req.decoded.id,

            },
                {
                    $pull: {
                        following: {
                            userFollowed: req.body.userFollowed
                        }
                    }

                });

            await User.update(

                {
                    _id: req.body.userFollowed,

                },
                {
                    $pull: {
                        followers: {
                            follower: req.decoded.id
                        }

                    }
                }



            );
        };
        unfollowUser().then(() => {
            res.status(200).json({ message: 'unfollowing user successful' });
        })
            .catch(err => {
                console.log(err);
                res.status(500).json({ message: "error occured in friends.js" });
            });

    },
    async markNotification(req, res) {
        if (!req.body.deleteValue) {
            await User.updateOne({
                _id: req.decoded.id,
                'notifications._id': req.params.id
            },
                {
                    $set: { 'notifications.$.read': true }
                }).then(() => {
                    res.status(200).json({ message: 'Marked as read' });
                }).catch(err => {
                    res.status(500).json({ message: 'Error ocurred marking the notification' })
                })
        }
        else {
            await User.update({
                _id: req.decoded.id,
                'notifications._id': req.params.id
            },
                {
                    $pull: {
                        notifications: { _id: req.params.id }
                    }
                }).then(() => {
                    res.status(200).json({ message: 'deleted successuflly' });
                }).catch(err => {
                    res.status(500).json({ message: 'Error ocurred deleting the notification' })
                })
        }
    },

    async getUserFollowers(req, res) {

        await User.find({ "_id": req.decoded.id }, { "followers": 1, "_id": 0 }) // ObjectId.req.decoded.id ?
            .then((result) => {
                let element = [];
                for (let i = 0; i < result[0].followers.length; i++) {
                    element[i] = result[0].followers[i].follower;
                }
                if (element.length == result[0].followers.length) {
                    User.find({ "_id": { $in: element } }, {"pseudo":1, "username" :1}).then((result) => {
                        console.log(result);

                        return res.status(200).json({ followers: result });
                    })
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: "error getting followers" })
            })
    },
    async getUserFollowing(req, res) {

        await User.find({ "_id": ObjectId(req.decoded.id) }, { "following": 1, "_id": 0 })
            .then((result) => {

                let element = [];
                for (let i = 0; i < result[0].following.length; i++) {
                    element[i] = result[0].following[i].userFollowed;
                }
                if (element.length == result[0].following.length) {
                    User.find({ "_id": { $in: element } }, {"pseudo":1, "username" :1}).then((result) => {
                        console.log(result);

                        return res.status(200).json({ following: result });
                    })
                }

            }).catch(err => {
                res.status(500).json({ message: "error getting followings" })
            })
    }
};