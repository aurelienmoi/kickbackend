const joi = require('@hapi/joi');
const post = require('../Models/postsModels');
const user = require('../Models/userModels');
module.exports = {
    addPost(req, res) {
        console.log(req.body)
        //add joi schema validation with new joi npm package

        const body = {
            user: req.decoded.id,
            username: req.body.username,
            post: req.body.postForm,
            create: new Date()
        };

        post.create(body).then(async (post) => {
            await user.updateOne({
                _id :req.decoded.id
            },
            {
                $push : {
                    posts: {
                        postId: post._id,
                        post: req.body.content,
                        created : new Date()
                    }
                }
            })
                res.status(200).json({ message: 'post created', post });
        })
            .catch(err => {
                res.status(500).json({ msg: 'error posting' })
            })

    },
    async getAllPosts(req,res){
        try {
            const posts= await post.find({}).populate('user').sort({created :-1})
            return res.status(200).json({message : "all posts", posts})
        }
        catch(err){
            return res.status(500).json({message :"error occured during getAllposts"})
        }
    },
    async addLike(req,res){
        console.log(req.body)
        const postId =req.body._id;
        await post.findOneAndUpdate({
            _id : postId,
            "likes.username": {$ne : req.body.user.username}
        },
        {
            $push: {likes : {
                username:req.body.user.username
            }},
            $inc: {totalLikes: 1},
        },{
            new :true
        })
        .then((result)=> {
            res.status(200).json({updatedPost : result})
        })
        .catch(err => {
            return res.status(500).json({message : "like increment unsuccessfull", err : err});
        })
    },
    async addComment(req,res){
        console.log(req.body)

        const postId =req.body.postId;
        await post.updateOne({
            _id : postId
        },
        {
            $push: {comments : {
                userId: req.decoded.id,
                username:req.body.username,
                comment : req.body.comment,
                createdAt : new Date()
            }}
        })
        .then(()=> {
            res.status(200).json({message : "commentaire ok"});
        })
        .catch(err => {
            return res.status(500).json({message : "commentaire post unsuccessfull", err : err});
        })
    },
    async getPost(req,res){
        await post.findOne({_id : req.params.id}).populate('user')
        .populate('comments.userId')
        .then((post) =>{
            res.status(200).json({post})

        })
        .catch(err => {
            res.status(400).json({message : 'post not found'})
        })
    }
}