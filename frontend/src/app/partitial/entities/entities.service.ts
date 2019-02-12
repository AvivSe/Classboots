import {EventEmitter, Injectable, OnInit, Output} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import { Socket } from 'ngx-socket-io';

@Injectable({providedIn:"root"})
export class entitiesService implements OnInit{
    itemList;
    constructor(private http: HttpClient){}
    ngOnInit(): void {}

    //GET ALL (EVENT EMITTERS)
    @Output() itemListEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() videoListEmitter: EventEmitter<any> = new EventEmitter<any>();

    //GET SINGLE (EVENT EMITTERS)
    @Output() institutionEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() schoolEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() subjectEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() lectureEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() videoEmitter: EventEmitter<any> = new EventEmitter<any>();

    //GET ALL (FUNCTIONS)
    public getInstitutions(){this.apiRequest(environment.baseUrl + 'api/' + "institution","schools","Institution","Institution");}
    public getSchools(_id){this.apiRequest(environment.baseUrl + 'api/' + "institution/getschools/"+_id,"subjects","School",_id);}
    public getSubjects(_id){this.apiRequest(environment.baseUrl + 'api/' + "school/getsubjects/"+_id,"lectures","Subject",_id);}
    public getLectures(_id){this.apiRequest(environment.baseUrl + 'api/' + "subject/getlectures/"+_id,"Video","Lecture",_id);}

    //API REQUEST FUNCTIONS
    apiRequest(request,nextPath,title,currentId){
        this.http.get(request).subscribe(data => {
            this.itemListEmitter.emit({title: title,_nextpath : nextPath, _data : data,currentId : currentId});
        });
    }

    //GET SINGLE FUNCTIONS
    public getInstitution(_id){
        this.http.get(environment.baseUrl+'api/institution/'+_id).subscribe(data => {
            this.institutionEmitter.emit(data);
        });
    }
    public getSchool(_id){
        this.http.get(environment.baseUrl+'api/school/'+_id).subscribe(data =>{
            this.schoolEmitter.emit(data);
        })
    }
    public getSubject(_id){
        this.http.get(environment.baseUrl+'api/subject/'+_id).subscribe(data =>{
            this.subjectEmitter.emit(data);
        })
    }
    public getLecture(_id){
        this.http.get(environment.baseUrl+'api/lecture/'+_id).subscribe(data =>{
            this.lectureEmitter.emit(data);
        })
    }
    public getVideo(_id){
        this.http.get(environment.baseUrl + 'api/video/'+_id).subscribe(data => {
            this.videoEmitter.emit(data);
            this.videoListEmitter.emit(data);
        });
    }


}