const jwt = require('jsonwebtoken');
const fs = require('fs');
const { sequelize, user, post, comment } = require('../models/index');
const { all } = require('sequelize/dist/lib/operators');

exports.createPost = (req, res, next) => {
    const postContent = req.body.content
    const postImage = req.file
    if(!postContent && !postImage) {
        return res.status(400).json({ error: 'Insérez du texte ou une image !'})
    } else {
        user.findOne({ where: { uuid: req.body.userUuid }})
            .then((user) => {
                    const newPost = req.file ? { content: req.body.content, userId: user.id, image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` } : { content: req.body.content, userId: user.id, image: '' }
                    
                    post.create(newPost)
                        .then((newPost) => res.status(200).json(newPost))
                        .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(400).json({ error: 'Errur dans le .findOne' }));
    }
}

exports.modifyPost = (req, res, next) => {
    post.findOne({ where: { uuid: req.params.postUuid }, include: user})
        .then((post) => {
            if(req.body.userUuid == post.user.uuid || req.body.isAdmin == 'admin') {
                const filename = post.image.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    if(req.body.content) { post.content = req.body.content }
                    if(req.file) { post.image = `${req.protocol}://${req.get('host')}/images/${req.file.filename}` }
                    post.save()
                        .then(() => res.status(200).json({ message: 'Message modifié !'}))
                        .catch(error => res.status(400).json({ error }));
                })
            } else {
                res.status(403).json({ message: 'Unauthorized request !' })
            }
        })
        .catch(error => res.status(400).json({ error }));
}

exports.deletePost = (req, res, next) => {
    post.findOne({ where: { uuid: req.params.postUuid }, include: user})
        .then((post) => {
            if(req.body.userUuid == post.user.uuid || req.body.isAdmin == 'admin'){
                const filename = post.image.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    post.destroy()
                        .then(() => res.status(200).json({ message: 'Message supprimé !'}))
                        .catch(error => res.status(400).json({ error }));
                })
            } else {
                res.status(403).json({ message: 'Unauthorized request !' })
            }
        })
        .catch(error => res.status(400).json({ error }));
}

exports.getAllPosts = (req, res, next) => {
    post.findAll({ include: [{ all: true }] })
        .then((posts) => res.json(posts))
        .catch(error => res.status(400).json({ error }));
}

exports.userPosts = (req, res, next) => {
    user.findOne({ where: { uuid: req.params.useruuid }, include: [{ all: true }] })
        .then((user) => res.json(user))
        .catch(error => res.status(400).json({ error }));
}

