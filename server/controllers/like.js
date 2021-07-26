
const musicInfos = require('../Models/musicInfosModels')
const like = require('../Models/likesModel');
module.exports = {


    async getUserLikes(req, res) {
        await like.findOne({ _id: req.params.id })
            .then(result => {
                res.status(200).json({ message: 'Likes by userId', result });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error Occured finding music by userId' });
            });
    },

    async likeMusic(req, res) {

      //  console.log("trying to like music")
        const musicId = await like.findOne({ _id: req.decoded.id });
      //  console.log('Like music process')
        if (musicId) {
            console.log("trying to like with musicId found")
            like.updateOne({

                _id: req.decoded.id,
                "musicId": { $ne: req.body.musicId }
            },
                {
                    $push: {
                        musicId: req.body.musicId
                    }
                },
            ).then(result => {
           //     console.log(result.n, result.nModified, result.ok)

                if (result.n && result.nModified && result.ok) {

                    musicInfos.updateOne({ _id: req.body.musicId }, { likes: { $add: 1 } })
                    return res.status(200).json({ message: "music liked successfully", musicLiked: true })
                }
                else {
                    return res.status(400).json({ message: "music already liked", musicLiked: false })
                }

            }).catch(err => {
                return res.status(500).json({ message: "error occured trying to like a music : ", err })
            })
        }
        else {
            console.log("trying to create a like", req.body.musicId)
            like.create({
                _id: req.decoded.id,
                musicId: req.body.musicId
            }
            ).then(like => {
                musicInfos.updateOne({ _id: req.body.musicId }, { likes: { $add: 1 } })
                return res.status(200).json({ message: "music liked successfully", musicLiked: true })

            }).catch(err => {
                return res.status(500).json({ message: "error occured trying to like a music : ", err })
            })


        }

    },

    async dislikeMusic(req, res) {

        console.log("trying to dislike music")
        const musicId = await like.findOne({ _id: req.decoded.id });

        if (musicId) {

            like.updateOne({

                _id: req.decoded.id,
                "musicId": { $in: req.body.musicId }
            },
                {
                    $pull: {
                        musicId: req.body.musicId
                    }
                },
            ).then(result => {

                if (result.n && result.nModified && result.ok) {

                    musicInfos.updateOne({ _id: req.body.musicId }, { likes: { $add: -1 } })
                    return res.status(200).json({ message: "music disliked successfully", musicDisliked: true })
                }
                else {
                    return res.status(400).json({ message: "cant dislike music, a bug is probably happening", musicDisliked: false })
                }

            }).catch(err => {
                return res.status(500).json({ message: "error occured trying to dislike a music : ", err })
            })
        }
        else {

            res.status(500).json({ message: "music not found" })


        }

    }

}