const User = require('../Models/userModels.js');


module.exports = {


    async putCoordinates(req, res) {
        console.log(req.body.coordinates);

        await User.findOne({ _id: req.decoded.id }).then(result => {
            let userpseudo = result.pseudo;

            User.updateOne({

                _id: req.decoded.id,
            },
                {
                    geoJson: {
                        "type": "FeatureCollection",
                        "features":
                        {
                            "type": "Feature",
                            "properties": { "userId": req.decoded.id, "pseudo": userpseudo },
                            "geometry": {
                                "type": "Point",
                                "coordinates": req.body.coordinates
                            }
                        }


                    }
                }).then(() => {
                    res.status(200).json({ message: "coordinates updated correctly" });
                }).catch(err => {
                    res.status(500).json({ message: 'Error updating coordinates' })
                })

        })
    },


    async getCoordinates(req, res) {

        console.log("request on good endpoint");

        User.find({ geoJson: { $exists: true, $not: { $size: 0 } } }).then(result => {

            let object1 = {
                "type": "FeatureCollection",
                "features": [
                    //     { "type": "Feature", "properties": { "description": "<p>myowndescription<p>" }, "geometry": { "type": "Point", "coordinates": [-0.4, 49] } } //initializing with a test point to check if the cluster works

                ]
            };
            for (let i = 0; i < result.length; i++) {
                object1.features.push(result[i].geoJson.features)

            }

            console.log(object1.features);

            if (object1.features[0]) {

                res.status(200).json({ result: result, object1: object1 });
            }

        })
            .catch(err => {

                res.status(500).json({ message: 'Error getting coordinates' })
            })





    },

    async getUserCoordinates(req, res) {
        console.log(req.params.userId);


        await User.findOne({ _id: req.params.userId }, { "_id": 0, "geoJson": 1 }).then(result => {
            res.send({ result })
        }).catch(err => {
            res.send('error getting user geoJson')
        })

    },

    async getRapperCoordinates(req, res) {


        User.find({ geoJson: { $exists: true, $not: { $size: 0 } }, 'roles.rapper': true }).then(result => {

            let object1 = {
                "type": "FeatureCollection",
                "features": [
                    //     { "type": "Feature", "properties": { "description": "<p>myowndescription<p>" }, "geometry": { "type": "Point", "coordinates": [-0.4, 49] } } //initializing with a test point to check if the cluster works

                ]
            };
            for (let i = 0; i < result.length; i++) {
                object1.features.push(result[i].geoJson.features)

            }

            console.log(object1.features);

            if (object1.features[0]) {

                res.status(200).json({ result: result, object1: object1 });
            }

        })
            .catch(err => {

                res.status(500).json({ message: 'Error getting coordinates' })
            })





    },
    async getBeatmakerCoordinates(req, res) {
        User.find({ geoJson: { $exists: true, $not: { $size: 0 } }, 'roles.beatmaker': true }).then(result => {

            let object1 = {
                "type": "FeatureCollection",
                "features": [
                    //     { "type": "Feature", "properties": { "description": "<p>myowndescription<p>" }, "geometry": { "type": "Point", "coordinates": [-0.4, 49] } } //initializing with a test point to check if the cluster works
                ]
            };
            for (let i = 0; i < result.length; i++) {
                object1.features.push(result[i].geoJson.features)
            }
            console.log(object1.features);
            if (object1.features[0]) {
                res.status(200).json({ result: result, object1: object1 });
            }
        })
            .catch(err => {
                res.status(500).json({ message: 'Error getting coordinates' })
            })
    },

    async getProducerCoordinates(req, res) {
        User.find({ geoJson: { $exists: true, $not: { $size: 0 } }, 'roles.producer': true }).then(result => {
            let object1 = {
                "type": "FeatureCollection",
                "features": [
                    //     { "type": "Feature", "properties": { "description": "<p>myowndescription<p>" }, "geometry": { "type": "Point", "coordinates": [-0.4, 49] } } //initializing with a test point to check if the cluster works
                ]
            };
            for (let i = 0; i < result.length; i++) {
                object1.features.push(result[i].geoJson.features)
            }
            console.log(object1.features);
            if (object1.features[0]) {
                res.status(200).json({ result: result, object1: object1 });
            }
        })
            .catch(err => {
                res.status(500).json({ message: 'Error getting coordinates' })
            })
    },
    async getClipmakerCoordinates(req, res) {
        User.find({ geoJson: { $exists: true, $not: { $size: 0 } }, 'roles.clipmaker': true }).then(result => {
            let object1 = {
                "type": "FeatureCollection",
                "features": [
                    //     { "type": "Feature", "properties": { "description": "<p>myowndescription<p>" }, "geometry": { "type": "Point", "coordinates": [-0.4, 49] } } //initializing with a test point to check if the cluster works
                ]
            };
            for (let i = 0; i < result.length; i++) {
                object1.features.push(result[i].geoJson.features)
            }
            console.log(object1.features);
            if (object1.features[0]) {
                res.status(200).json({ result: result, object1: object1 });
            }
        })
            .catch(err => {
                res.status(500).json({ message: 'Error getting coordinates' })
            })
    },
    async getWebradioCoordinates(req, res) {
        User.find({ geoJson: { $exists: true, $not: { $size: 0 } }, 'roles.webradio': true }).then(result => {
            let object1 = {
                "type": "FeatureCollection",
                "features": [
                    //     { "type": "Feature", "properties": { "description": "<p>myowndescription<p>" }, "geometry": { "type": "Point", "coordinates": [-0.4, 49] } } //initializing with a test point to check if the cluster works
                ]
            };
            for (let i = 0; i < result.length; i++) {
                object1.features.push(result[i].geoJson.features)
            }
            console.log(object1.features);
            if (object1.features[0]) {
                res.status(200).json({ result: result, object1: object1 });
            }
        })
            .catch(err => {
                res.status(500).json({ message: 'Error getting coordinates' })
            })
    },
}