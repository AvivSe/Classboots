var mongoose = require('mongoose');
var Lecture = require('./lecture');

var subjectSchema = mongoose.Schema({
    name:       { type:String, required:true },
    description:{ type:String, required:true },
    lectures:   [{type:mongoose.Schema.Types.ObjectId, ref:'Lecture'}]

});

module.exports = mongoose.model('Subject',subjectSchema); // subjects