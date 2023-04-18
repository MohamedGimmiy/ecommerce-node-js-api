const { expressjwt } = require("express-jwt");

function authJwt(){
        //return next;
    const secret = process.env.secret
    return expressjwt({
        secret,
        algorithms: ['HS256'],
/*         isRevoked: isRevoked
 */    }).unless({
        path:[
            {url: '/api/v1/products', method: ['GET','OPTIONS']},
            {url: '/api/v1/categories', method: ['GET','OPTIONS']},
            {url: /\/api\/v1\/products(.*)/, method: ['GET','OPTIONS']},
            {url: /\/public\/uploads(.*)/, method: ['GET','OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, method: ['GET','OPTIONS']},
            '/api/v1/users/login',
            '/api/v1/users/register',
            '/api/v1/orders',
            '/api/v1/users/get/count'
        ]
    })
}

async function isRevoked(req, payload, done) { 
    if(!payload.isAdmin){
        done(null, true)
    }
    done();
 }

module.exports = authJwt;