const dateTime = require('date-time');
const express = require("express");
var musicInfos = require('../Models/musicInfosModels');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
var User = require('../Models/userModels');
const multer = require('multer');
/**
 * NodeJS Module dependencies.
 */
const { Readable } = require('stream');

let db;
MongoClient.connect('mongodb://localhost/socialapp', (err, client) => {
    if (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
    }

    db = client.db('socialapp');
    console.log("database ready to listen ");
});
module.exports = {

    uploadMusic(req, res) {
        console.log("good route ");
        const storage = multer.memoryStorage()
        const upload = multer({ storage: storage, limits: { fields: 3, fileSize: 10000000, files: 1, parts: 3 } });

   

        upload.single('track')(req, res, (err) => {
            req.body.name =  req.get('musicName');
            req.body.userId = req.decoded.id;
            if (err) {
                console.log("validation failed");
                return res.status(400).json({ message: "Upload Request Validation Failed" });
            } else if (!req.body.name) {
                console.log("no track name");
                return res.status(400).json({ message: "No track name in request body" });
            }

            let trackName = req.body.name;

            // Covert buffer to Readable Stream
            const readableTrackStream = new Readable();
            readableTrackStream.push(req.file.buffer);
            readableTrackStream.push(null);

            let bucket = new mongodb.GridFSBucket(db, {
                bucketName: 'tracks'
            });

            let uploadStream = bucket.openUploadStream(trackName);
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on('error', (error) => {
                console.log(error);
                return res.status(500).json({ message: "Error uploading file" });
            });

            uploadStream.on('finish', () => {

                console.log('yes');

                // add here the code to save in US ER SCHEMA THE ID OF THEIR TRACK
                console.log("upload ok ?", id);

                return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
            });
            if (id) {

                User.updateOne({ _id: req.body.userId }, {
                    $push: {
                        musics: [{
                            musicId: id,
                            name: req.body.name
                        }]
                    }
                }, function (error, success) {
                    if (error) {
                        console.log(error);

                    }
                    else {
                        console.log(success);
                    }
                });
                now = dateTime();
                musicInfos.create({_id : id, artist: req.body.userId , createdAt : now}).then(result => {
                    console.log(result);
                    console.log("musicInfoCreatedSuccessfully");
                }).catch(err => {
                    console.log("musicInfoBugged")
                })
            }
        });
    },

    async getMusic(req, res) {
        //   let MESFICHIERSEMERDE =db.messages.find({})



        let length = 0
        try {
            var trackID = new ObjectID(req.params.trackID);


        } catch (err) {
            return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
        }
        db.collection('tracks.files').findOne({ _id: trackID }, function (err, item) {
            if (item) {
                length = item.length;

            }

            if (err) {
                return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
            }

            res.set('content-type', 'audio/mpeg');
            res.set('accept-ranges', 'bytes');
            res.set('content-length', JSON.stringify(length));

            let bucket = new mongodb.GridFSBucket(db, {
                bucketName: 'tracks'
            });



            let downloadStream = bucket.openDownloadStream(trackID);

            downloadStream.on('data', (chunk) => {
                // const length = Buffer.byteLength(chunk);
                // const type = (length)
                res.write(chunk);

            });


            downloadStream.on('error', () => {
                res.sendStatus(404);
            });

            downloadStream.on('end', () => {
                res.end();
            });
        });
    },
    
    async addToPlaylist(req, res) {
        console.log(req.body.musicId, "lid de la musique");
        let musicId = req.body.musicId;  // req.body.musicID working

        await User.find({ "musics.musicId": musicId }).then(result => {
            // console.log("query result of music", result[0].musics[0]);
            let musicData = result[0].musics.find(element => element.musicId == musicId);
            //  console.log("name of the required music",musicData.name);
            musicName = musicData.name;
            return musicName
        }
        );
        try {
            const userId = req.decoded.id
            //     console.log(musicName);
            await User.findOne({ _id: userId }).then(result => {
                if (result.playlist) {
                    User.findOne({ _id: userId, "playlist.musicId": musicId }).then(result => {
                        if (result) {
                            let userPlaylist = result.playlist;

                            return res.status(200).json({ musicId, musicName, userPlaylist });;
                        }
                        else {
                            let name = musicName;
                            User.findOneAndUpdate({ _id: userId }, { $push: { playlist: [{ musicId, name }] } }, { new: true }).then(result => {
                                let userPlaylist = result.playlist;
                                return res.status(200).json({ musicId, musicName, userPlaylist });


                            })


                        }
                    });
                }
            })

        }
        catch (e) {
            res.send("error");
        }

    },
    async deleteFromPlaylist(req, res) {
        // CHANGE PLAYLIST MODEL, ADD MUSIC NAME AND ARTIST?
        const musicName = req.body.musicName || (req.body.data && req.body.data.musicName);
        const userId = req.body.userId || (req.body.data && req.body.data.userId) ||req.decoded.id;

        if (!musicName || !userId) {

            return res.status(400).send("no musicname or ID provided")

        }
        else { console.log("NAME OF THE MUSIC", musicName); }

        try {
            await User.findOneAndUpdate({ _id: userId }, { $pull: { playlist: { name: musicName } } }, { new: true }).then(result => {

                let userPlaylist = result.playlist;

                return res.status(200).json({ userPlaylist })

            })

        }
        catch (e) {
            console.log(e);
            res.send("error");
        }
    },

    async deleteFromLibrary(req,res){
        const musicName = req.body.musicName || (req.body.data && req.body.data.musicName) ||req.decoded.id;
        const userId = req.body.userId || (req.body.data && req.body.data.userId) ||req.decoded.id;
        console.log(req.body.data);
        if (!musicName || !userId) {

            return res.status(400).send("no musicname or ID provided")

        }

        
        try {
            await User.findOneAndUpdate({ _id: userId }, { $pull: { musics: { name: musicName } } }, { new: true }).then(result => {

                let userMusics = result.musics;

                return res.status(200).json({ userMusics })

            })

        }
        catch (e) {
            console.log(e);
            res.send("error");
        }




    }


}