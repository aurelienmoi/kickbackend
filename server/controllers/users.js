const user = require('../Models/userModels.js');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const EMAIL_SECRET = 'secretKeyTestTokenEmailVerification';
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const getPasswordResetURL = require('../helpers/mailHelper');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const multer = require('multer');
const { Readable } = require('stream');
const resetPasswordTemplate = require('../helpers/mailHelper');
const transporter = nodemailer.createTransport({ // THIS NEEDS TO MOVE INTO CONFIG, USED HERE TO TEST DONT PUSH IT
    service: "Gmail",
    auth: {
        user: "kickfrancepro@gmail.com",
        pass: "nkqryyzyegicffwr"

    }
});
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

    async getAllUsers(req, res) {
        await user.find({})
            .populate('following.userFollowed')
            .populate('followers.follower')
            .then(result => {
                res.status(200).json({ message: 'all user', result });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error Occured' });
            });


    },
    async getUser(req, res) {
        await user.findOne({ _id: req.params.id })
            .populate('following.userFollowed')
            .populate('followers.follower')
            .then(result => {
                res.status(200).json({ message: 'User by id', result });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error Occured finding user by id' });
            });


    },
    async getUserByName(req, res) {
        await user.findOne({ username: req.params.username })
            .populate('following.userFollowed')
            .populate('followers.follower')
            .then(result => {
                res.status(200).json({ message: 'User by username', result });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error Occured finding user by name' });
            });


    },
    async getUserMusics(req, res) {
        await user.findById({ _id: req.params.id }).then(result => {

            res.status(200).json({ musics: result.musics })
        }).catch(err => {
            res.status(500).json({ message: "error finding musics" });
        });

    },
    async getUserPlaylist(req, res) {

        await user.findById({ _id: req.body.data._id }).then(result => {

            res.status(200).json({ playlist: result.playlist })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ message: "error finding playlist" });
        });

    },
    async changeBio(req, res) {

        await user.updateOne({ _id: req.body.userId }, {
            $set: { 'bio': req.body.bioForm }
        }).then(result => {
            console.log(result);
            user.findOne({ _id: req.body.userId }).then(user => {
                if (!user) {
                    return res.status(500).json({ message: "username not found" });
                }
                else {
                    const newToken = jwt.sign({ id: user.id, username: user.username, isArtist: user.isArtist, isBeatmaker: user.isBeatmaker, bio: user.bio, registrationDate: user.registrationDate, following: user.following.length, followers: user.followers.length, pseudo: user.pseudo, roles: user.roles }, config.secret);
                    req.newToken = newToken;
                    res.status(200).json({ message: "bio changed ok", token: req.newToken })
                }
            })

        }).catch(err => {
            res.status(500).json({ message: "error changing bio" }, req.newToken);

        });

    },
    async changePseudo(req, res) {
        let pseudoForm = req.body.pseudoForm
        await user.updateOne({ _id: req.body.userId }, {
            $set:
                { 'geoJson.features.properties.pseudo': req.body.pseudoForm, 'pseudo': req.body.pseudoForm }
        }).then(result => {
            console.log(result);
            user.findOne({ _id: req.body.userId }).then(user => {
                if (!user) {
                    return res.status(500).json({ message: "username not found" });
                }
                else {
                    const newToken = jwt.sign({ id: user.id, username: user.username, isArtist: user.isArtist, isBeatmaker: user.isBeatmaker, bio: user.bio, registrationDate: user.registrationDate, following: user.following.length, followers: user.followers.length, pseudo: user.pseudo, roles: user.roles }, config.secret);
                    req.newToken = newToken;
                    res.status(200).json({ message: "pseudo changed ok", token: req.newToken })
                }
            })
        }).catch(err => {
            res.status(500).json({ message: "error changing bio", token: req.newToken });

        });
    },
    async confirmEmail(req, res) {
        console.log("email en c ours de confirm");
        try {
            const data = jwt.verify(req.params.token, EMAIL_SECRET);
            console.log(data.id);
            await user.findOneAndUpdate({ _id: data.id }, { emailConfirmed: true });
            return res.redirect('http://localhost:8080/chatApp/emailConfirmed');

        }
        catch (e) {
            res.send("error");
        }

    },
    emailConfirmed(req, res) {
        res.end('email confirmed');
    },

    async resetPassword(req, res) {
        const email = req.body.email;
        //  console.log(req.body);
        await user.findOne({ email: email }).then(result => {
            if (!result) {
                return res.status(500).json({ message: "email not found" });
            }
            else {
                // console.log(result);
                userId = result._id;
                passwordHash = result.password;
                createdAt = result.registrationDate;
                console.log(createdAt);
                const secret = result.password + createdAt;
                const token = jwt.sign({ userId }, secret, {
                    expiresIn: 3600 // 1 hour

                })
                const url = getPasswordResetURL.getPasswordResetURL(result, token);  //ye thats funny "mistake" ^^
                const emailTemplate = resetPasswordTemplate.resetPasswordTemplate(result, url); // haha twice

                transporter.sendMail(emailTemplate, (err, info) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ message: "Error sending email", err })
                    }
                    if (info) {
                        console.log(`** Email sent **`, info.response)
                    }
                })
            }
        });
    },



    async receiveNewPassword(req, res) {
        const { userId, token } = req.params
        const { password } = req.body
        // highlight-start
        user.findOne({ _id: userId })
            .then(result => {
                // console.log(result);
                passwordHash = result.password;
                createdAt = result.registrationDate;
                const secret = result.password + createdAt;

                jwt.verify(token, secret, function (err, decoded) {

                    if (err) {
                        return res.status(500).json({ message: "error verifying your" });
                    }
                    else {
                        if (decoded.userId === result.id) {
                            bcrypt.genSalt(10, function (err, salt) {
                                // Call error-handling middleware:
                                if (err) return
                                bcrypt.hash(password, salt, function (err, hash) {
                                    // Call error-handling middleware:
                                    if (err) return
                                    user.findOneAndUpdate({ _id: userId }, { password: hash })
                                        .then(() => res.status(202).json("Password changed accepted"))
                                        .catch(err => res.status(500).json(err))
                                })
                            })
                        }
                    }
                });



            })
            // highlight-end
            .catch(() => {
                res.status(500).json({ message: "Invalid token" })
            })
    },
    async changeEmail(req, res) {
        const userId = req.decoded;
        user.findOneAndUpdate({ _id: userId, email: req.body.email }, { $pull: { email: email } }, { new: true }).then(result => {
            res.status(200).json({ message: "email updated" }, result)
        }
        ).catch(err => {
            res.status(500).json({ message: "invalid email" });
        })
    },
    async changeAvatar(req, res) {
        console.log("change avatar road");
        const storage = multer.memoryStorage()
        const upload = multer({ storage: storage, limits: { fields: 3, fileSize: 10000000, files: 1, parts: 3 } });
        upload.single('avatar')(req, res, (err) => {
            req.body.name = req.get('avatarName');
            req.body.userId = req.decoded.id;
            if (err) {
                console.log("validation failed");
                return res.status(400).json({ message: "Upload Request Validation Failed" });
            } else if (!req.body.name) {
                console.log("no avatar name");
                return res.status(400).json({ message: "No avatar name in request body" });
            }

            let avatarName = req.body.name;
            const readableTrackStream = new Readable();
            readableTrackStream.push(req.file.buffer);
            readableTrackStream.push(null);
            let bucket = new mongodb.GridFSBucket(db, {
                bucketName: 'images'
            });
            let uploadStream = bucket.openUploadStream(avatarName);
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

                user.updateOne({ _id: req.body.userId }, {avatarId: id}, function (error, success) {

                    if (error) {
                        console.log(error);

                    }
                    else {
                        console.log(success);
                    }
                });

            }
        })

    },// dessous créer get avatar

    async getUserAvatar(req, res) {

        let userId = req.params.userId
        console.log(userId)
        await user.findOne({ _id: userId})

            .then(result => {

                let length = 0
                try {
        
                    var avatarId =  new ObjectID(result.avatarId)
        
                } catch (err) {
                    return res.status(400).json({ message: "Invalid avatarID" });
                }
                db.collection('images.files').findOne({ _id: avatarId }, function (err, item) {
                    if (item) {
                        length = item.length;
        
                    }
        
                    if (err) {
                        return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
                    }
        
                    res.set('content-type', 'image/jpeg');
                    res.set('accept-ranges', 'bytes');
                    res.set('content-length', JSON.stringify(length));
        
                    let bucket = new mongodb.GridFSBucket(db, {
                        bucketName: 'images'
                    });
        
    
                    let downloadStream = bucket.openDownloadStream(avatarId);
        
                    downloadStream.on('data', (chunk) => {
                        res.write(chunk);
        
                    });
        
        
                    downloadStream.on('error', () => {
                        res.sendStatus(404);
                    });
        
                    downloadStream.on('end', () => {
                        res.end();
                    });
                });

            })
            .catch(err => {
                res.status(500).json({ message: 'Error Occured finding user by id' });
            });
       
    },
};
