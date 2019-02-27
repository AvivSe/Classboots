const Lecture = require('../models/lecture');
const Video = require('../models/video');
const {VideoController, Sketch} = require('./videoController');
const errorsController = require('./errorsController');
const YoutubeScraper = require('../utils/yt-scraper');

class LectureController {

    static addYTPlaylistToLectureByYTPLID(lectureID, ytplID) {
        try {
            YoutubeScraper.getPlaylistAsync(ytplID, (playlist)=>{
                var x = 0;
                Lecture.findById(lectureID).then(lecture => {
                    if (lecture) {
                        playlist.forEach((v)=>{
                            //TODO: If there is already some video with same reference, dont add the video.
                            let newVideo = new Video({ name: v.name, reference: v.id, lectureid: lectureID, position:  x++ });
                            console.log(newVideo);
                            VideoController.createVideo(newVideo);
                            LectureController.addVideo({ lectureid: lectureID, videoid: newVideo._id });
                        });
                    }
                }).catch(err => {
                    errorsController.logger({error:'addYTPlaylistToLectureByYTPLID',description:err});
                });
            });
        }
        catch (e) {
            errorsController.logger({error:true,description:'addYTPlaylistToLectureByYTPLID: '+e});
        }

    }

    static async getLectureCollection() {
        var result;
        var invalid = {};
        try {
            result = await Lecture.find(err => {
                if (err) {
                    invalid = {error:true,description:err};
                    errorsController.logger({error:'getLectureCollection',description:err});
                }
            });
            return invalid.error===undefined?result:invalid;
        }
        catch (e) {
            errorsController.logger({error:true,description:'getLectureCollection: '+e});
        }

    };

    static async createLecture(body) {
        var result = {};
        var lecture = new Lecture(body);
        try {
            await lecture.save(err => {
                if (err) {
                    result = {error:true,description:err};
                    errorsController.logger({error:'createLecture',description:err});
                }
            });
            return result.error===undefined?lecture:result;
        }
        catch (e) {
            errorsController.logger({error:true,description:'createLecture: '+e});
        }

    }

    static async getLecture(id) {
        var result = null;
        try {
            await Lecture.findById(id).then(lecture => {
                if (lecture)
                    result = lecture;
                else
                    result = {error:true,description:'lecture not found'};
            }).catch(err => {
                result = {error:true,description:err};
                errorsController.logger({error:'getLecture',description:err});
            });
            return result;
        }
        catch (e) {
            errorsController.logger({error:true,description:'getLecture: '+e});
        }

    };

    static async getVideos(id) {
        let result = [];
        try {
            await this.getLecture(id).then(async lecture=>{
                for (let i = 0; i < lecture.videos.length; i++) {
                    await VideoController.getVideo(lecture.videos[i],null).then(async video=>{
                        if(video.error !== undefined)
                            this.deleteVideo({lectureid:id,videoid:lecture.videos[i]});
                        else result.push(video);
                    });
                }
            }).catch(async err=>{
                result = {error:true,description:'lecture not found'};
                // TODO: need to fix
            });
            return result;
        }
        catch (e) {
            errorsController.logger({error:true,description:'getVideos: '+e});
        }

    };

    /**
     * delete lecture and call to remove all videos of this lecture
     * @param id of lecture to be removed.
     * @returns {Promise<*>}
     */
    static async deleteLecture(id) {
        let result = null;
        try {
            await Lecture.findByIdAndDelete(id).then(obj=>{
                obj.videos.forEach(async videoid => {
                    result = await VideoController.deleteVideo(videoid);
                });
            }).catch(err => {
                result = {error:true,description:err};
                errorsController.logger({error:'deleteLecture',description:err});
            });
            return result;
        }
        catch (e) {
            errorsController.logger({error:true,description:'deleteLecture: '+e});
        }

    };

    static async updateLecture(body) {
        var invalid = {};
        try {
            await Lecture.findByIdAndUpdate(body._id, body, {}).catch(err => {
                invalid = {error:true,description:err};
                errorsController.logger({error:'updateLecture',description:err});
            });
            return invalid;
        }
        catch (e) {
            errorsController.logger({error:true,description:'updateLecture: '+e});
        }

    }

    static async addVideo(body) {
        var invalid = {};
        try {
            var lecture = await this.getLecture(body.lectureid);
            if(lecture.error)
                return lecture;
            var video = await VideoController.getVideo(body.videoid);
            if(video.error)
                return video;
            var result = await Lecture.findByIdAndUpdate(
                body.lectureid,
                { $addToSet: {"videos": body.videoid}},
                { upsert: true},(err,lecture)=>{
                    if(err){
                        invalid = {error:true,description:err};
                        errorsController.logger({error:'addVideo',description:err});
                    }
                    if(lecture){
                        VideoController.updateVideo({_id:body.videoid,lectureid:lecture._id});
                    }
                });
            return invalid.error===undefined?result:invalid;
        }
        catch (e) {
            errorsController.logger({error:true,description:'addVideo: '+e});
        }

    };

    // TODO: don't need now! but need to fix
    static async deleteVideo(body) {
        try {
            Lecture.findByIdAndUpdate(
                body.lectureid,
                { $pull: {"videos": body.videoid }},
                { upsert: true, new: true },
                err=>{
                    if(err) errorsController.logger("Delete Video from Lecture",err);
                });
        }
        catch (e) {
            errorsController.logger({error:true,description:'deleteVideo: '+e});
        }

    };

    static async cms(lectureID) {
        let result = "";
        await Sketch.getInstance().then(sketch=> {
            result = sketch.query(lectureID);
        });

        return {total: result};
    }

    static async stats() {
        let lectures = await LectureController.getLectureCollection();

        let totalVideos = lectures.map(lec=>lec.videos.length).reduce((sum, current)=>sum+current);

        return { totalVideos:  totalVideos };
    }
}

module.exports =  LectureController;