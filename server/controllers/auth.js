const joi = require('@hapi/joi');
const user = require('../Models/userModels');
const helpers = require('../helpers/helpers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const dateTime = require('date-time');
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({ // THIS NEEDS TO MOVE INTO CONFIG, USED HERE TO TEST DONT PUSH IT
    service: "Gmail",
    auth: {
        user: "kickfrancepro@gmail.com",
        pass: "rysgoqpzlhuwyyyr"

    }
});
const EMAIL_SECRET = 'secretKeyTestTokenEmailVerification'

module.exports = {

    async createUser(req, res) {
        console.log("working", req.body.username);  // TODO : ADD in the schema below REGEX for USERNAME AND PASSWORD (joi.regex)
        const schema = joi.object().keys({

            username: joi.string().min(5).max(20).required(),
            email: joi.string().email().required(),
            password: joi.string().required(),
            snapUserId : joi.string().allow('').optional(),
            snapAvatarId : joi.string().allow('').optional(),
            snapAvatarUrl : joi.string().allow('').optional(),
            snapPseudo: joi.string().allow('').optional(),
            pseudo : joi.string().min(2).max(25).required()
        });

        if (req.body.snapUserId && req.body.snapAvatarId && req.body.snapAvatarUrl && req.body.snapPseudo) {
            var snapUserId = req.body.snapUserId;
            var snapAvatarId = req.body.snapAvatarId;
            var snapAvatarUrl = req.body.snapAvatarUrl;
            var snapPseudo = req.body.snapPseudo;
        }
        else {
            var snapUserId = null;
            var snapAvatarId = null;
            var snapAvatarUrl = null;
            var snapPseudo = null;
        }

        const { error, value } = schema.validate(req.body);
        if (error && error.details) {
           console.log(error, error.details)
            return res.status(400).json({ message: error.details })
        }
        const userEmail = await user.findOne({ email: helpers.lowerCase(req.body.email) });
        if (userEmail) {

            return res.send({ message: 'Email already exists', emailAlreadyExisting: true });
        }
        const usernameRegister = await user.findOne({ username: helpers.lowerCase(req.body.username) });

        if (usernameRegister) {
            return res.send({ message: 'Username already exists', usernameAlreadyExisting: true });
        }

        return bcrypt.hash(value.password, 10, (err, hash) => {

            if (err) {
                return res.status(500).json({ message: 'error hashing password' });

            }
            now = dateTime();
            const body = {
                username: helpers.lowerCase(value.username),
                email: helpers.lowerCase(value.email),
                password: hash,
                isArtist: 0,
                pseudo: value.pseudo,
                phoneNumber: null,
                isBeatmaker: 0,
                inseeCode: null,
                latitude: null,
                longitude: null,
                bio: "Ta biographie, touche pour modifier !",
                registrationDate: now.slice(0, 10),
                registrationDateTime: now,
                snapUserId: snapUserId,
                snapAvatarId: snapAvatarId,
                snapAvatarUrl: snapAvatarUrl,
                snapPseudo: snapPseudo,
            }

            user.create(body).then(user => {
                let userId = user.id;
                console.log("user created");
                // async email
                jwt.sign({ id: userId },
                    EMAIL_SECRET,
                    (err, emailToken) => {
                        const url = `http://localhost:8080/chatApp/confirmEmail/${emailToken}`;

                        console.log(emailToken, "ici le tokenemail");
                        transporter.sendMail({
                            to: user.email,
                            subject: 'Confirm Email',
                            html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                        });
                    },
                );

                res.status(200).json({ message: "user successfully created", registeredIn: true }); // send smthing like user?
            }).catch(err => {
                res.status(500).json({ message: 'error creating user' });
            })
        });

    },
    async loginUser(req, res) {
        console.log(req.body);
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ message: "no empty fields allowed" })
        }
        const schema = joi.object().keys({

            username: joi.string().min(5).max(20).required(),
            password: joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error && error.details) {
            return res.status(400).json({ message: error.details })
        }
        await user.findOne({ username: value.username }).then(user => {
            if (!user) {
                return res.status(400).json({ message: "username not found" });
            }
            console.log(user);
            return bcrypt.compare(req.body.password, user.password).then((result) => {
                console.log(result);
                if (!result) {
                    return res.status(500).json({ message: "inccorect password" })
                }
                console.log(user.followers, user.following);
                const token = jwt.sign({ id: user.id, username: user.username, isArtist: user.isArtist, isBeatmaker: user.isBeatmaker, bio: user.bio, registrationDate: user.registrationDate, following: user.following.length, followers: user.followers.length, pseudo: user.pseudo, roles: user.roles }, config.secret);
                return res.send({ message: 'loggin successfull', token, loggedIn: true, id: user.id, username: user.username, isArtist: user.isArtist, isBeatmaker: user.isBeatmaker, bio: user.bio, registrationDate: user.registrationDate, following: user.following.length, followers: user.followers.length, pseudo: user.pseudo ,roles: user.roles});
            })
        })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ message: "Error occured" });
            })
    },
    testRegister(req, res) {
        res.send({ message: "request to auth with / withotu snap ended up good endpoint" })
    }
};