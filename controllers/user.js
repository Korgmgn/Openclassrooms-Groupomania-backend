const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { sequelize, user } = require('../models/index');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const newUser =  { username: req.body.username, email: req.body.email, password: hash }
            user.create(newUser)
                .then((newUser) => res.json(newUser))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

exports.login = (req, res, next) => {
    user.findOne({ where: { username: req.body.username } })
        .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ error: 'Mot de passe incorrect !' });
                }
                res.status(200).json({
                    userUuid: user.uuid,
                    isAdmin: user.admin,
                    token: jwt.sign(
                        { userUuid: user.uuid, isAdmin: user.admin },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.modifyUser = (req, res, next) => {
    user.findOne({ where: { uuid: req.body.userUuid }})
        .then((user) => {
            if(req.body.password) {
                bcrypt.hash(req.body.password, 10)
                    .then((hash) => {
                        user.username = req.body.username
                        user.email = req.body.email
                        user.password = hash
                        
                        user.save()
                            .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                            .catch(error => res.status(400).json({ error }));
                    })
            } else {
                return res.status(400).json({ error })
            }
        })
        .catch(error => res.status(400).json({ error }))
}

 exports.delete = (req, res, next) => {
    user.findOne({ where: { uuid: req.body.userUuid }, include: [{ all: true }] })
        .then((user) => {
            const postHasImage = user.posts.filter(post => post.image != '')
            for(let i = 0; i < postHasImage.length; i++) {
                const post = postHasImage[i];
                const filename = post.image.split('/images/')[1];
                fs.unlinkSync(`images/${filename}`, () => {
                    console.log('Image supprimée!')
                })
            }
            user.destroy()
                .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                .catch(error => res.status(400).json({ error }))
            })
        .catch(error => res.status(403).json({ error: 'Unauthorized request !' }))
}


exports.userAccount = (req, res, next) => {
    user.findOne({ where: { uuid: req.body.userUuid }})
        .then((user) => res.json(user))
        .catch(error => res.status(400).json({ error }))
}
