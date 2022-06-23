	
'use strict';

const uuid = require('uuid');
const axios = require('axios');

const externalUrl = 'https://anime-facts-rest-api.herokuapp.com/api/v1';

let animes = [
    {
        "anime_id": "a4203f70-f2d7-11ec-98d0-79b23d833a7e",
        "fullname": "One-Piece",
        "email": "N/A",
        "submittedAt": 1655976852711,
        "updatedAt": 1655976852711
    }
]

module.exports.getAll = (event, context, callback) => {
    try {
        const config = {
            method: 'get',
            url: `${externalUrl}`,
            headers: {}
        };
        axios(config)
        .then(res => {
            console.log("Successfully Retreived all information")
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(res.data)
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: err.response ? err.respose.status ? err.response.status : 400 : 400,
                body: JSON.stringify({
                    message: `Unable to retreive the list : ${err}`
                })
            })
        });   
    } catch(e) {
        console.log(e);
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: `Bad Request : ${e}`
            })
        });
        return;
    }

};

module.exports.getByName = (event, context, callback) => {
    try { 
        const config = {
            method: 'get',
            url: `${externalUrl}/${event.pathParameters.name}`,
            headers: {}
        };
        
        axios(config)
        .then(res => {
            console.log(`Successfully Retreived information for ${event.pathParameters.name}`);
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(res.data)
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: err.response ? err.respose.status ? err.response.status : 400 : 400,
                body: JSON.stringify({
                    message: `Unable to retreive for ${event.pathParameters.name} : ${err}`
                })
            })
        });   
    } catch(e) {
        console.log(e);
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: `Bad Request : ${e}`
            })
        });
        return;
    }

};
 
module.exports.submit = (event, context, callback) => {

    try {
        if(!event.body) {
            console.error(`Request Body can't be empty`);
            callback(null, {
                statusCode: 400,
                body: JSON.stringify({
                    message: `Request Body can't be empty`
                })
            });
            return;
        } else {
            const request_body = JSON.parse(event.body);
            const anime_name = request_body.anime_name;
            const anime_img = request_body.anime_img;
            
            if(typeof anime_name !== 'string') {
                console.error(`${anime_name} is invalid. Please provide Proper details`);
                callback(null, {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: `Couldn\'t submit anime because of validation errors : ${anime_name} is invalid. Please provide Proper details`
                    })
                });
                return;
            }

            submitAnime(animeInfo(anime_name, anime_img))
                .then(res => {
                callback(null, {
                    statusCode: 201,
                    body: JSON.stringify({
                    message: `Sucessfully submitted anime with name ${anime_name}`,
                    data: res
                    })
                });
                })
                .catch(err => {
                console.log(err);
                callback(null, {
                    statusCode: 400,
                    body: JSON.stringify({
                    message: `Unable to submit anime with name ${anime_name} : ${err}`
                    })
                })
                });
        }

    } catch(e) {
        console.log(e);
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: `Bad Request : ${e}`
            })
        });
        return;
    }

 
};

module.exports.update = (event, context, callback) => {

    try{
        const request_body = JSON.parse(event.body);
        if(!request_body) {
            console.error(`Request Body can't be empty`);
            callback(null, {
                statusCode: 400,
                body: JSON.stringify({
                  message: `Request Body can't be empty`
                })
              });
            return;
        } else {
            //Find the anime to be updated
            const anime = animes.find((anime) => anime.anime_id === event.pathParameters.id);
    
            if(!anime) {
                callback(null, {
                    statusCode: 400,
                    body: JSON.stringify({
                      message: `Not found for id : ${event.pathParameters.id}`
                    })
                  });
                return;
            } else {
    
                if(request_body.anime_name && typeof request_body.anime_name !== 'string') {
                    console.error(`${request_body.anime_name} is invalid. Please provide Proper details`);
                    callback(null, {
                        statusCode: 400,
                        body: JSON.stringify({
                          message: `Couldn\'t submit anime because of validation errors : ${request_body.anime_name} is invalid. Please provide Proper details`
                        })
                      });
                    return;
                }
                    
                anime.anime_name = request_body.anime_name ?  request_body.anime_name : anime.anime_name;
                anime.anime_img = request_body.anime_img ? request_body.anime_img : anime.anime_img;
            
                console.log(`Details are updated for ${anime.anime_id}`);
    
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify({message:`Successfully Updated details for ${event.pathParameters.id}`})
                });
                return;
            }
        } 
    } catch(e) {
        console.log(e);
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({message:`Bad Request for ${event.pathParameters.id} : ${e}`})
        });
        return;
    }

  
};

module.exports.delete = (event, context, callback) => {
    try {
        console.log(`Anime with id ${event.pathParameters.anime_id} has been deleted`);        
        //Filter out the Anime fromid
        animes = animes.filter((anime) => anime.anime_id !== event.pathParameters.anime_id);
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({message:`Successfully deleted details for ${event.pathParameters.anime_id}`})
        });
    } catch(e) {
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({message:`Bad Request for ${event.pathParameters.anime_id} : ${e}`})
        });
        return;
    }
};

	
const submitAnime = anime => {
    console.log('Submitting Anime');
    let addPromise = new Promise(function(myResolve,myReject){
        let animeLength = animes.length
        animes.push(anime);
        if(animes.length > animeLength) {
            myResolve("OK");
        } else {
            myReject("Error");
        }
    });

    return addPromise.then(res => anime);
  };
   
const animeInfo = (anime_name, anime_img) => {
    const timestamp = new Date().getTime();
    return {
      anime_id: uuid.v1(),
      anime_name: anime_name,
      anime_img: anime_img,
      submitted_at: timestamp,
      updated_at: timestamp,
    };
};