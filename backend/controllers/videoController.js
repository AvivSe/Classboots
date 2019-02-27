const Video = require('../models/video');
const History = require('../models/history');
const errorsController = require('./errorsController');
const YoutubeScraper = require('../utils/yt-scraper');
const createCountMinSketch = require("count-min-sketch");

var Sketch = (function () {
    var instance;

    async function createInstance() {
        let sketch = createCountMinSketch();
        let videos = await VideoController.getVideoCollection();
        videos.forEach(v=> {
            sketch.update(v.lectureid, v.views);
        });
        return sketch;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

class VideoController {

    static async getVideoCollection() {
        var result;
        var invalid = {};
        result = await Video.find(err => {
            if (err) {
                invalid = {error: true, description: err};
                errorsController.logger({error: 'getInstitutionCollection', description: err});
            }
        });
        return invalid.error === undefined ? result : invalid;
    };

    static async createVideo(body) {
        var result = {};
        var video = new Video(body);
        YoutubeScraper.getCommentsAsync(body.reference, result => {
            Video.findByIdAndUpdate(
                video._id,
                {$push: {"ytcomment": result}},
                {upsert: true, new: true}).then(x => {
            });
        });
        await video.save(err => {
            if (err) {
                result = {error: true, description: err};
                errorsController.logger({error: 'createVideo', description: err});
            }
        });
        return result.error === undefined ? institution : result;
    };

    static async getVideo(id, userid) {
        let result = null;
        await Video.findById(id).then(async video => {

            Sketch.getInstance().then(sketch=> {
                sketch.update(video.lectureid, 1);
            });

            result = video;
            if (userid != null) {
                await History.findOne({user: userid}).then(async history => {
                    if(history) {
                        await History.findOne({user: userid}, function (err, history) {
                            for (var i = 0; i < history.watches.length; i++)
                                if (history.watches[i].video == id)
                                    break;
                            if (i < history.watches.length) {
                                let lastdate = history.watches[i].date;
                                history.watches[i].date = Date.now();
                                let secondeswatchAgo = (history.watches[i].date - lastdate) / 1000;
                                if (secondeswatchAgo > 60) {
                                    VideoController.updateVideo({_id: video._id, views: ++video.views});
                                }
                            } else history.watches[i] = {video: id, date: Date.now()};
                            history.save();
                        });
                    } else {
                        //TODO: Nir have to complote this case
                    }
                });
            }
            let secondesAgo = (new Date() - video.lastscrape) / 1000;
            if (secondesAgo > 60) {
                Video.findByIdAndUpdate(
                    video._id,
                    {lastscrape: new Date()},
                    {upsert: true, new: true}).then(vid => {
                    //TODO: duplicate code
                    YoutubeScraper.getCommentsAsync(vid.reference, result => {
                        if (!vid.ytcomment.find(c => {
                            return (c.content === result.content && c.author === result.author);
                        })) {
                            Video.findByIdAndUpdate(
                                vid._id,
                                {$push: {"ytcomment": result}, lastscrape: new Date()},
                                {upsert: true, new: true}).then(ignore => {
                            });
                        } else {
                            console.log("already exist");
                        }

                    });
                });
            } else {
                console.log("dont wanna update because so young :" + secondesAgo);
            }
        }).catch(err => {
            result = {error: true, description: err + "-cannot find"};
            errorsController.logger({error: 'getVideo', description: err});
        });
        return result;
    };

    static async deleteVideo(id) {
        let result = null;
        await Video.findByIdAndDelete(id).catch(err => {
            result = {error: true, description: err};
            errorsController.logger({error: 'deleteVideo', description: err});
        });
        return result;
    };

    static async updateVideo(body) {
        var invalid = {};
        await Video.findByIdAndUpdate(body._id, body, {}).catch(err => {
            invalid = {error: true, description: err};
            errorsController.logger({error: 'updateVideo', description: err});
        });
        return invalid;
    }

    static async addComment(body,userid) {
        var invalid = {};
        body.user = userid;
        var result = await Video.findByIdAndUpdate(
            body.videoid,
            {$addToSet: {"comments": body}},
            {upsert: true},
            (err => {
                if (err) {
                    invalid = {error: true, description: err};
                    errorsController.logger({error: 'addComment', description: err});
                }
            }));
        return invalid.error === undefined ? result : invalid;
    };

    static async deleteComment(body) {
        var result = await Video.findByIdAndUpdate(
            body.videoid,
            {$pull: {"comments": {_id: body.commentid}}},
            {upsert: true, new: true});
        return result;
    };

}


module.exports = { VideoController, Sketch };