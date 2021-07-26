const Message = require('../Models/messageModels');
const Conversation = require('../Models/conversationModels');
const user = require('../Models/userModels');





module.exports = {

    async getAllMessages(req, res) {

        const { sender_Id, receiver_Id } = req.params;
        const conversation = await Conversation.findOne({
            $or: [
                {
                    $and: [
                        { 'participants.senderId': sender_Id },
                        { 'participants.receiverId': receiver_Id }
                    ]
                },
                {
                    $and: [
                        { 'participants.senderId': receiver_Id },
                        { 'participants.receiverId': sender_Id }
                    ]
                }
            ]
        }).select('_id')

        if (conversation) {
            const messages = await Message.findOne({ conversationId: conversation._id });
            res.status(200).json({ message: 'messages returned', messages });
        }



    },

    sendMessage(req, res) {

        const { sender_Id, receiver_Id } = req.params;
        console.log(sender_Id);
        console.log(receiver_Id);
        Conversation.find({
            $or: [
                {
                    participants: {
                        $elemMatch: { senderId: sender_Id, receiverId: receiver_Id }
                    }
                },
                {
                    participants: {
                        $elemMatch: { senderId: receiver_Id, receiverId: sender_Id }
                    }
                }
            ]
        },
            async (err, result) => {
                console.log(Date.now())
                if (result.length > 0) {

                    await Message.update({
                        conversationId: result[0]._id
                    },
                        {
                            $push: {
                                message: {
                                    senderId: req.params.sender_Id,
                                    receiverId: req.params.receiver_Id,
                                    senderName: req.body.user.username,
                                    receivername: req.body.receiverName,
                                    body: req.body.message,
                                    createdAt : Date.now()
                                }
                            }
                        }).then(() => res.status(200).json({ message: 'message sent and added in conv' })
                        ).catch(err => res.status(500).json({ message: 'error occured sending the message' }));

                }
                else {

                    const newConversation = new Conversation();
                    newConversation.participants.push({
                        senderId: req.params.sender_Id,
                        receiverId: req.params.receiver_Id
                    });
                    const saveConversation = await newConversation.save();
                    const newMessage = new Message();
                    newMessage.conversationId = saveConversation._id;

                    newMessage.sender = req.params.sender_Id;
                    newMessage.sender = req.body.receiverName;
                    newMessage.message.push({
                        senderId: req.params.sender_Id,
                        receiverId: req.params.receiver_Id,
                        senderName: req.body.user.username,
                        receivername: req.body.receiverName,
                        body: req.body.message,
                        createdAt : Date.now()
                    });

                    await user.update(
                        {
                            _id: req.params.senderId
                        },
                        {
                            $push: {
                                chatList: {
                                    $each: [
                                        {
                                            receiverId: req.params.receiver_Id,
                                            msgId: newMessage._id
                                        }
                                    ],
                                    $position: 0
                                }
                            }
                        });
                    await user.update(
                        {
                            _id: req.params.receiverId
                        },
                        {
                            $push: {
                                chatList: {
                                    $each: [
                                        {
                                            receiverId: req.params.senderId,
                                            msgId: newMessage._id
                                        }
                                    ],
                                    $position: 0
                                }
                            }
                        })

                    await newMessage
                        .save().then(() => res.status(200).json({ message: 'message sent' })
                        ).catch(err => res.status(500).json({ message: 'error occured sending the message' }));
                    console.log(saveConversation);
                }

            });

    },

    async getUserConversations(req, res) {

        await Conversation.find({
            $or: [
                {
                    "participants.senderId": req.decoded.id
                },
                {
                    "participants.receiverId": req.decoded.id
                }]
        }, { "participants.senderId": 1, "participants.receiverId": 1 }).then((result) => {
            let element = [];
            for (let i = 0; i < result.length; i++) {
                element.indexOf(result[i].participants[0].receiverId) === -1 && element.push(result[i].participants[0].receiverId);
                element.indexOf(result[i].participants[0].senderId) === -1 && element.push(result[i].participants[0].senderId);
            }

            var convId = [];

            for (let o = 0; o < result.length; o++) {
                convId.push(result[o]._id);

            }

            //user.find({ "_id": { $in: element, $ne: req.decoded.id }, }, { "pseudo": 1 }).then(result =>

           user.find({ "_id": { $in: element, $ne: req.decoded.id } }, { "pseudo": 1 }).then(result => {


                var pseudoId = result;


                Message.find({ "conversationId": { $in: convId } }, { "message.body": 1, "_id": 0 }).then(result => {


                    var lastMessage = []
                    for (let k = 0; k < result.length; k++) {
                        let indexMessage = result[k].message.length - 1;
                        lastMessage.push(result[k].message[indexMessage].body)
                    }
                    return res.status(200).json({ result: pseudoId, lastMessage: lastMessage })
                })

            })




        }

        ).catch(err => res.status(500).json({ message: 'error occured getting the conversation' }));


    }
};